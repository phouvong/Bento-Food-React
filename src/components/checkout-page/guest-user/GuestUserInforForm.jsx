import React, { useEffect } from 'react'
import { useFormik } from 'formik'
import { Grid } from '@mui/material'
import { t } from 'i18next'

import { useDispatch, useSelector } from 'react-redux'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CustomTextFieldWithFormik from '@/components/form-fields/CustomTextFieldWithFormik'
import { setGuestUserInfo } from '@/redux/slices/guestUserInfo'
import CustomPhoneInput from '@/components/CustomPhoneInput'
import FormSubmitButton from './FormSubmitButton'
import { DeliveryTitle } from '@/components/checkout-page/CheckOut.style'
import { ACTIONS } from '@/components/checkout-page/states/additionalInformationStates'

const GuestUserInforForm = ({
    configData,
    editAddress,
    setEditAddress,
    handleClose,
    dine_in,
    additionalInformationDispatch,
    customerData,
}) => {
    const { guestUserInfo } = useSelector((state) => state.guestUserInfo)
    const dispatch = useDispatch()

    let languageDirection = undefined
    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }

    const addAddressFormik = useFormik({
        initialValues: {
            contact_person_name: customerData
                ? customerData?.data?.f_name
                : guestUserInfo
                ? guestUserInfo?.contact_person_name
                : '',
            contact_person_number: customerData
                ? customerData?.data?.phone
                : guestUserInfo
                ? guestUserInfo?.contact_person_number
                : '',
            contact_person_email: customerData
                ? customerData?.data?.email
                : guestUserInfo
                ? guestUserInfo?.contact_person_email
                : '',
        },
        onSubmit: async (values, helpers) => {
            try {
                dispatch(setGuestUserInfo(values)) // Save to Redux
                handleClose?.() // Close the form or modal
            } catch (err) {
                console.error('Error submitting form:', err)
            }
        },
    })

    const nameHandler = (value) => {
        addAddressFormik.setFieldValue('contact_person_name', value)
    }

    const numberHandler = (value) => {
        if(dine_in){
            additionalInformationDispatch({
                type: ACTIONS.setDineInPhone,
                payload: value,
            })
        }
        addAddressFormik.setFieldValue('contact_person_number', value)
    }

    const emailHandler = (value) => {
        addAddressFormik.setFieldValue('contact_person_email', value)
    }

    const handleReset = () => {
        addAddressFormik.resetForm()
    }

    useEffect(() => {
        if (dine_in) {
            if (addAddressFormik?.values?.contact_person_name) {
                additionalInformationDispatch({
                    type: ACTIONS.setDineInName,
                    payload: addAddressFormik?.values?.contact_person_name,
                })
            }
            if (addAddressFormik?.values?.contact_person_email) {
                additionalInformationDispatch({
                    type: ACTIONS.setDineInEmail,
                    payload: addAddressFormik?.values?.contact_person_email,
                })
            }
            if (addAddressFormik?.values?.contact_person_number) {
                additionalInformationDispatch({
                    type: ACTIONS.setDineInPhone,
                    payload: addAddressFormik?.values?.contact_person_number,
                })
            }
        }
    }, [
        addAddressFormik?.values?.contact_person_name,
        addAddressFormik?.values?.contact_person_email,
        addAddressFormik?.values?.contact_person_number,
    ])
    return (
        <CustomStackFullWidth
            p={dine_in ? '1.5rem' : '2rem'}
            minHeight={dine_in ? '100%' : '300px'}
            alignItems={dine_in ? 'start' : 'center'}
            justifyContent={dine_in ? 'start' : 'center'}
        >
            {dine_in && (
                <DeliveryTitle sx={{ textAlign: 'left' }}>
                    {t('Contact Info')}
                </DeliveryTitle>
            )}
            <form noValidate onSubmit={addAddressFormik.handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12}>
                        <CustomTextFieldWithFormik
                            required
                            type="text"
                            label={t('Contact Person Name')}
                            touched={
                                addAddressFormik.touched.contact_person_name
                            }
                            errors={addAddressFormik.errors.contact_person_name}
                            fieldProps={addAddressFormik.getFieldProps(
                                'contact_person_name'
                            )}
                            onChangeHandler={nameHandler}
                            value={addAddressFormik.values.contact_person_name}
                        />
                    </Grid>
                    <Grid item xs={12} md={dine_in ? 6 : 12}>
                        <CustomPhoneInput
                            value={
                                addAddressFormik.values.contact_person_number
                            }
                            onHandleChange={numberHandler}
                            initCountry={configData?.country}
                            touched={
                                addAddressFormik.touched.contact_person_number
                            }
                            errors={
                                addAddressFormik.errors.contact_person_number
                            }
                            rtlChange="true"
                            lanDirection={languageDirection}
                            height="45px"
                        />
                    </Grid>
                    <Grid item xs={12} md={dine_in ? 6 : 12}>
                        <CustomTextFieldWithFormik
                            required
                            type="text"
                            label={t('Contact Person Email')}
                            value={addAddressFormik.values.contact_person_email}
                            onChangeHandler={emailHandler}
                            touched={
                                addAddressFormik.touched.contact_person_email
                            }
                            errors={
                                addAddressFormik.errors.contact_person_email
                            }
                        />
                    </Grid>
                    {!dine_in && (
                        <Grid item xs={12} md={12} align="end">
                            <FormSubmitButton
                                handleReset={handleReset}
                                reset={t('Reset')}
                                submit={editAddress ? t('Save') : t('Save')}
                            />
                        </Grid>
                    )}
                </Grid>
            </form>
        </CustomStackFullWidth>
    )
}

export default GuestUserInforForm