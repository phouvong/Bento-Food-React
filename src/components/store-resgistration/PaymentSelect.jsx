import React, { useEffect, useState } from 'react'
import { alpha, Typography, useTheme } from '@mui/material'
import { t } from 'i18next'
import { Stack } from '@mui/system'
import {
    CustomButton,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import StoreRegPaymentCard from './StoreRegPaymentCard'
import { useSelector } from 'react-redux'
// import { ResetButton } from 'components/profile/basic-information/BasicInformationForm'
// import { SaveButton } from 'components/profile/basic-information/Profile.style'

const PaymentSelect = ({ submitBusiness, resData, isLoading, configData }) => {
    const [selectType, setSelectType] = useState('pay_now')
    const [selectedMethod, setSelectedMethod] = useState(null)
    const { allData } = useSelector((state) => state.storeRegData)
    const theme = useTheme()

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth', // Adds a smooth scrolling effect
        })
    }

    useEffect(() => {
        scrollToTop()
    }, [])

    const submitPayment = () => {
        submitBusiness({
            // restaurant_id: allData.res.restaurant_id,
            business_plan: resData?.type ?? allData?.values?.business_plan,
            restaurant_id:
                resData?.restaurant_id ?? allData?.values?.restaurant_id,
            package_id: resData?.package_id ?? allData?.values?.package_id,
            payment: selectedMethod ?? selectType,
            payment_gateway: selectedMethod ?? selectType,
            callback:
                selectType === 'free_trial'
                    ? null
                    : `${window.location.origin}/restaurant-registration`,
            payment_platform: 'web',
            type: 'new_join',
        })
    }
    return (
        <CustomStackFullWidth
            sx={{
                border: `1px solid ${alpha(theme.palette.neutral[400], 0.4)}`,
                marginTop: '2rem',
                borderRadius: '8px',
                padding: { xs: '1rem', md: '30px' },
            }}
        >
            <Stack
                sx={{
                    // backgroundColor: (theme) => alpha(theme.palette.neutral[400], 0.1),
                    padding: '.6rem',
                    borderRadius: '8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Typography
                    fontSize="18px"
                    fontWeight="500"
                    textAlign="center"
                    sx={{ color: theme.palette.neutral[1000] }}
                >
                    {t('Choose Your Payment Option')}
                </Typography>
            </Stack>
            <CustomStackFullWidth
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                mt="1rem"
            >
                <Stack
                    width="100%"
                    padding="20px"
                    sx={{
                        cursor: 'pointer',
                        borderRadius: '10px',
                        border: '1px solid',
                        backgroundColor:
                            selectType === 'pay_now'
                                ? (theme) =>
                                      alpha(theme.palette.primary.main, 0.1)
                                : theme.palette.neutral[100],
                        borderColor:
                            selectType === 'pay_now'
                                ? (theme) => theme.palette.primary.main
                                : (theme) =>
                                      alpha(theme.palette.neutral[400], 0.4),
                    }}
                    spacing={1}
                    onClick={() => setSelectType('pay_now')}
                >
                    <Stack direction="row" justifyContent="space-between">
                        <Typography
                            fontSize="16px"
                            fontWeight="700"
                            color={
                                selectType === 'pay_now'
                                    ? theme.palette.primary.main
                                    : theme.palette.neutral[1000]
                            }
                        >
                            {t('Pay Now')}
                        </Typography>
                        {selectType === 'pay_now' && (
                            <CheckCircleIcon
                                sx={{
                                    fontSize: '24px',
                                    color: (theme) =>
                                        theme.palette.primary.main,
                                }}
                            />
                        )}
                    </Stack>
                    <Typography
                        fontSize="13px"
                        color={theme.palette.neutral[400]}
                    >
                        {t('Manage your payment manually')}
                    </Typography>
                </Stack>
                <Stack
                    width="100%"
                    padding="20px"
                    sx={{
                        cursor: 'pointer',
                        borderRadius: '10px',
                        border: '1px solid',
                        backgroundColor:
                            selectType === 'free_trial'
                                ? (theme) =>
                                      alpha(theme.palette.primary.main, 0.1)
                                : theme.palette.neutral[100],
                        borderColor:
                            selectType === 'free_trial'
                                ? (theme) => theme.palette.primary.main
                                : (theme) =>
                                      alpha(theme.palette.neutral[400], 0.4),
                    }}
                    spacing={1}
                    onClick={() => {
                        setSelectType('free_trial')
                        setSelectedMethod(null)
                    }}
                >
                    <Stack direction="row" justifyContent="space-between">
                        <Typography
                            fontSize="16px"
                            fontWeight="700"
                            color={
                                selectType === 'free_trial'
                                    ? theme.palette.primary.main
                                    : theme.palette.neutral[1000]
                            }
                        >
                            {t(
                                `${configData?.subscription_free_trial_days} Days free trial`
                            )}
                        </Typography>
                        {selectType === 'free_trial' && (
                            <CheckCircleIcon
                                sx={{
                                    fontSize: '24px',
                                    color: (theme) =>
                                        theme.palette.primary.main,
                                }}
                            />
                        )}
                    </Stack>
                    <Typography
                        fontSize="13px"
                        color={theme.palette.neutral[400]}
                    >
                        {t(
                            `Enjoy ${configData?.subscription_free_trial_days} Days free trial and pay your subscription fee within these trial period.`
                        )}
                    </Typography>
                </Stack>
            </CustomStackFullWidth>
            {selectType === 'pay_now' && (
                <>
                    <Typography
                        component="span"
                        mt="30px"
                        mb="1rem"
                        fontSize="16px"
                        fontWeight="700"
                        sx={{ color: theme.palette.neutral[1000] }}
                    >
                        {t('Pay Via Online')}
                        <Typography component="span" ml="5px">
                            {t('(Faster & secure way to pay bill)')}
                        </Typography>
                    </Typography>
                    <Stack direction="row" gap="1rem" flexWrap="wrap">
                        {configData?.active_payment_method_list?.map(
                            (method) => (
                                <StoreRegPaymentCard
                                    setSelectedMethod={setSelectedMethod}
                                    selectedMethod={selectedMethod}
                                    key={method}
                                    method={method}
                                />
                            )
                        )}
                    </Stack>
                </>
            )}

            <CustomStackFullWidth
                justifyContent="flex-end"
                direction="row"
                spacing={2}
                mt="2rem"
            >
                <CustomButton
                    type="submit"
                    onClick={submitPayment}
                    // Fixing the syntax for applying marginTop on xs breakpoint
                    variant="contained"
                    loading={isLoading}
                    disabled={!selectedMethod && selectType === 'pay_now'}
                    sx={{
                        background: (theme) => theme.palette.primary.main,
                        minWidth: '100px',
                        color: (theme) =>
                            `${theme.palette.neutral[100]}!important`,
                        px: '30px',
                        borderRadius: '5px',
                        fontWeight: '500',
                        fontSize: '14px',
                        cursor: 'pointer',
                    }}
                >
                    {t('Confirm')}
                </CustomButton>
                {/* <SaveButton
                    onClick={submitPayment}
                    // Fixing the syntax for applying marginTop on xs breakpoint
                    variant="contained"
                    loading={isLoading}
                    disabled={!selectedMethod && selectType === 'pay_now'}
                >
                    {t('Confirm')}
                </SaveButton> */}
            </CustomStackFullWidth>
        </CustomStackFullWidth>
    )
}

export default PaymentSelect
