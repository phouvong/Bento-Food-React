import React, { useEffect, useState } from 'react'
// import CustomContainer from 'components/container'
// import { CustomStackFullWidth } from 'styled-components/CustomStyles.style'
import { Box, NoSsr, Typography } from '@mui/material'
import { t } from 'i18next'

// import FormSubmitButton from 'components/profile/FormSubmitButton'
import { useDispatch, useSelector } from 'react-redux'

import { useRouter } from 'next/router'
import { setActiveStep, setAllData } from '@/redux/slices/storeRegistrationData'
import CustomContainer from '../container'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import StoreStepper from './StoreStepper'
import StoreRegistrationForm from './StoreRegistrationForm'
import BusinessPlan from './BusinessPlan'
import PaymentSelect from './PaymentSelect'
import SuccessStoreRegistration from './SuccessStoreRegistration'
import CustomMultiSelectTags from '../custom-multi-select-tags/CustomMultiSelectTags'
import { usePostStoreRegistration } from '@/hooks/react-query/store-registraion/usePostStoreRegistration'
import { usePostBusiness } from '@/hooks/react-query/store-registraion/usePostBusiness'
import { onErrorResponse } from '../ErrorResponse'

const StoreRegistration = ({ configData }) => {
    const dispatch = useDispatch()
    const router = useRouter()
    const [resData, setResData] = useState({})
    const { flag, active } = router.query
    const { allData, activeStep } = useSelector((state) => state.storeRegData)
    const [formValues, setFormValues] = useState({})
    const { mutate, isLoading: regIsloading } =
        usePostStoreRegistration(configData)
    const { mutate: businessMutate, isLoading } = usePostBusiness()

    const formSubmit = (value) => {
        const tempData = { ...formValues, value }

        // // Ensure additional_documents is initialized as an array
        // tempData.additional_documents = [
        //     ...(tempData.additional_documents || []),
        // ]
        // configData?.restaurant_additional_join_us_page_data?.data?.forEach(
        //     (item) => {
        //         const inputKey = item.input_data

        //         if (tempData[inputKey]) {
        //             if (item.field_type === 'file') {
        //                 if (item.media_data?.upload_multiple_files === 1) {
        //                     // Multiple files
        //                     tempData.additional_documents = [
        //                         ...tempData.additional_documents,
        //                         ...(Array.isArray(tempData[inputKey])
        //                             ? tempData[inputKey]
        //                             : [tempData[inputKey]]),
        //                     ]
        //                 } else {
        //                     // Single file
        //                     tempData.additional_documents = [
        //                         ...tempData.additional_documents,
        //                         tempData[inputKey],
        //                     ]
        //                 }

        //                 // Remove the key from tempData
        //                 delete tempData[inputKey]
        //             }
        //         }
        //     }
        // )

        mutate(
            { tempData, configData },
            {
                onSuccess: (res) => {
                    dispatch(setAllData({ ...allData, res }))
                    setResData(res)
                    if (res?.type === 'commission') {
                        const currentQuery = router.query
                        const updatedQuery = {
                            ...currentQuery,
                            flag: 'success',
                            active: '',
                        }

                        router.replace(
                            {
                                pathname: router.pathname,
                                query: updatedQuery,
                            },
                            undefined,
                            { shallow: true }
                        )
                        dispatch(setAllData(null))
                    } else {
                        dispatch(setActiveStep(2))
                    }
                },
                onError: onErrorResponse,
            }
        )
    }

    const submitBusiness = (values) => {
        dispatch(setAllData({ ...allData, values }))
        businessMutate(values, {
            onSuccess: (res) => {
                if (res) {
                    if (res?.redirect_link && res?.payment !== 'free_trial') {
                        const redirect_url = `${res?.redirect_link}`
                        dispatch(setActiveStep(3))
                        router.push(redirect_url)
                    } else {
                        const currentQuery = router.query
                        const updatedQuery = {
                            ...currentQuery,
                            flag: 'success',
                            active: '',
                        }
                        router.replace(
                            {
                                pathname: router.pathname,
                                query: updatedQuery,
                            },
                            undefined,
                            { shallow: true }
                        )
                        dispatch(setActiveStep(3))
                        dispatch(setAllData(null))
                    }
                }
            },
            onError: onErrorResponse,
        })
    }
    useEffect(() => {
        if (flag === 'success') {
            dispatch(setActiveStep(3))
        }
    }, [flag])
    useEffect(() => {
        if (active === 'active') {
            dispatch(setActiveStep(0))
            dispatch(setAllData(null))
        }
    }, [active])

    const handleActiveStep = () => {
        if (activeStep === 0) {
            return (
                <StoreRegistrationForm
                    setActiveStep={setActiveStep}
                    setFormValues={setFormValues}
                    configData={configData}
                />
            )
        } else if (activeStep === 1) {
            return (
                <BusinessPlan
                    setActiveStep={setActiveStep}
                    configData={configData}
                    formSubmit={formSubmit}
                    isLoading={regIsloading || isLoading}
                />
            )
        } else if (
            (activeStep === 3 && flag === 'success') ||
            (activeStep === 3 && flag === 'fail') ||
            (activeStep === 3 && flag === 'cancel')
        ) {
            return <SuccessStoreRegistration flag={flag} />
        } else if (activeStep === 2) {
            return (
                <PaymentSelect
                    isLoading={isLoading}
                    resData={resData}
                    configData={configData}
                    submitBusiness={submitBusiness}
                />
            )
        }
    }

    return (
        <NoSsr>
            <CustomContainer>
                <CustomStackFullWidth
                    justify="center"
                    mt={{ xs: '4rem', md: '150px' }}
                >
                    <Typography
                        fontSize={{ xs: '18px', sm: '20px', md: '36px' }}
                        fontWeight="700"
                        textAlign="center"
                        sx={{
                            color: (theme) => theme.palette.neutral[1000],
                        }}
                    >
                        {t('Restaurant Registration Application')}
                    </Typography>

                    <StoreStepper flag={flag} activeStep={activeStep} />
                    <Box sx={{ mb: '35px' }}>{handleActiveStep()}</Box>
                </CustomStackFullWidth>
            </CustomContainer>
        </NoSsr>
    )
}

export default StoreRegistration
