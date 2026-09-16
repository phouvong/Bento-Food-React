import {
    CustomPaperBigCard,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import { CircularProgress, Grid, NoSsr, Typography } from '@mui/material'
import { t } from 'i18next'
import CustomTextFieldWithFormik from '../form-fields/CustomTextFieldWithFormik'
import CustomPhoneInput from '../CustomPhoneInput'
import { useFormik } from 'formik'
import { CustomButtonPrimary } from '@/styled-components/CustomButtons.style'
import TrackOrderDetails from './TrackOrderDetails'
import { getGuestId } from '../checkout-page/functions/getGuestUserId'
import useGetTrackOrderData from '../../hooks/react-query/useGetTrackOrderData'
import { useEffect, useState } from 'react'
import { setTrackOrderStoreData } from '@/redux/slices/utils'
import { useDispatch, useSelector } from 'react-redux'
import { formatPhoneNumber } from '@/utils/customFunctions'
import { useRouter } from 'next/router'

const TrackOrderInput = ({ configData }) => {
    const dispatch = useDispatch()
    const router = useRouter()
    const { trackOrderStoreData } = useSelector((state) => state.utilsData)
    const trackOrderFormik = useFormik({
        initialValues: {
            order_id: trackOrderStoreData?.id ? trackOrderStoreData?.id : '',
            contact_person_number: trackOrderStoreData?.delivery_address
                ?.contact_person_number
                ? formatPhoneNumber(
                      trackOrderStoreData?.delivery_address
                          ?.contact_person_number
                  )
                : '',
        },
        onSubmit: async () => {
            try {
                refetchTrackOrder()
            } catch (err) {}
        },
    })
    const nameHandler = (value) => {
        trackOrderFormik.setFieldValue('order_id', value)
    }
    const numberHandler = (value) => {
        trackOrderFormik.setFieldValue('contact_person_number', value)
    }

    const guestId = getGuestId()
    const {
        refetch: refetchTrackOrder,
        data: trackOrderData,
        isFetching: trackOrderIsFetching,
    } = useGetTrackOrderData(
        trackOrderFormik?.values?.order_id,
        trackOrderFormik?.values?.contact_person_number,
        guestId
    )

    // Prefill from the order-success page's "View your order" link
    // (?orderId=&phone=) once the query string is available.
    const [autoSearchArmed, setAutoSearchArmed] = useState(false)
    useEffect(() => {
        if (!router.isReady) return
        const { orderId, phone } = router.query
        if (orderId) trackOrderFormik.setFieldValue('order_id', orderId)
        if (phone)
            trackOrderFormik.setFieldValue(
                'contact_person_number',
                formatPhoneNumber(phone)
            )
        if (orderId && phone) setAutoSearchArmed(true)
    }, [router.isReady])

    // Formik's setFieldValue above doesn't apply synchronously, so wait for
    // the fields to actually reflect the prefilled values before searching
    // — otherwise this would fire with the stale, empty values.
    useEffect(() => {
        if (!autoSearchArmed) return
        if (
            trackOrderFormik.values.order_id &&
            trackOrderFormik.values.contact_person_number
        ) {
            setAutoSearchArmed(false)
            refetchTrackOrder()
        }
    }, [
        autoSearchArmed,
        trackOrderFormik.values.order_id,
        trackOrderFormik.values.contact_person_number,
    ])

    useEffect(() => {
        if (trackOrderData) {
            dispatch(setTrackOrderStoreData(trackOrderData))
            if (trackOrderData?.order_type === 'dine_in') {
                router.push(
                    `/order-history/${trackOrderData?.id}?phone=${btoa(
                        formatPhoneNumber(
                            trackOrderFormik?.values?.contact_person_number
                        )
                    )}&orderId=${trackOrderData?.id}`
                )
            }
        }
    }, [trackOrderData])

    return (
        <NoSsr>
            <CustomStackFullWidth
                spacing={2}
                pt={{ xs: '16px', md: '24px' }}
                pb="50px"
            >
                <CustomPaperBigCard sx={{ p: { xs: '1rem', md: '1.875rem' } }}>
                    <Typography
                        align="center"
                        paddingBottom="30px"
                        fontSize="20px"
                        fontWeight="600"
                    >
                        {t('Track Your Order')}
                    </Typography>
                    <form noValidate onSubmit={trackOrderFormik.handleSubmit}>
                        <Grid
                            container
                            spacing={2}
                            paddingX={{ xs: 0, md: '2rem' }}
                        >
                            <Grid item xs={12} md={5}>
                                <CustomTextFieldWithFormik
                                    placeholder={t('Enter your order id')}
                                    required="true"
                                    type="text"
                                    label={t('Order Id')}
                                    touched={trackOrderFormik.touched.order_id}
                                    errors={trackOrderFormik.errors.order_id}
                                    fieldProps={trackOrderFormik.getFieldProps(
                                        'order_id'
                                    )}
                                    onChangeHandler={nameHandler}
                                    value={trackOrderFormik.values.order_id}
                                />
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <CustomPhoneInput
                                    value={
                                        trackOrderFormik.values
                                            .contact_person_number
                                    }
                                    onHandleChange={numberHandler}
                                    initCountry={configData?.country}
                                    touched={
                                        trackOrderFormik.touched
                                            .contact_person_number
                                    }
                                    errors={
                                        trackOrderFormik.errors
                                            .contact_person_number
                                    }
                                    rtlChange="true"
                                    //lanDirection={lanDirection}
                                    height="45px"
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <CustomButtonPrimary
                                    paddingTop="12px"
                                    paddingBottom="8px"
                                    type="submit"
                                    disabled={trackOrderIsFetching}
                                    startIcon={
                                        trackOrderIsFetching ? (
                                            <CircularProgress
                                                size={16}
                                                thickness={5}
                                                color="inherit"
                                            />
                                        ) : null
                                    }
                                >
                                    {t('Search Order')}
                                </CustomButtonPrimary>
                            </Grid>
                        </Grid>
                    </form>
                    {trackOrderStoreData &&
                        trackOrderStoreData?.order_type !== 'dine_in' && (
                            <TrackOrderDetails
                                trackOrderFormik={trackOrderFormik}
                                trackOrderData={trackOrderStoreData}
                            />
                        )}
                </CustomPaperBigCard>
            </CustomStackFullWidth>
        </NoSsr>
    )
}

export default TrackOrderInput
