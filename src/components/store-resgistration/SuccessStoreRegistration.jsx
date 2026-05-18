import React, { useEffect } from 'react'
import { alpha, Stack, Typography, useTheme } from '@mui/material'
import {
    CustomButton,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import { t } from 'i18next'
import { useRouter } from 'next/router'
import { setActiveStep, setAllData } from '@/redux/slices/storeRegistrationData'
import { useDispatch } from 'react-redux'
import CustomImageContainer from '../CustomImageContainer'
import successGif from '../../assets/GIF 1.gif'
import failGif from '../../assets/GIF 2.gif'

const SuccessStoreRegistration = ({ flag }) => {
    const theme = useTheme()
    const router = useRouter()
    const dispatch = useDispatch()
    const tryAgain = () => {
        router.replace(
            {
                pathname: router.pathname,
            },
            undefined,
            { shallow: true }
        )
        dispatch(setActiveStep(2))
    }
    useEffect(() => {
        if (flag !== 'fail') {
            dispatch(setAllData(null))
        }
    }, [])
    return (
        <CustomStackFullWidth
            sx={{
                // border: `1px solid ${alpha(theme.palette.neutral[400], 0.6)}`,
                boxShadow:
                    '0px 8px 15px rgba(28, 30, 32, 0.03), 0px 0px 2px rgba(28, 30, 32, 0.08)',
                marginTop: '2rem',
                borderRadius: '1rem',
                padding: { xs: '1rem', md: '30px' },
                justifyContent: 'center',
                alignItems: 'center',
            }}
            spacing={2}
        >
            {flag === 'success' ? (
                <>
                    <CustomImageContainer
                        src={successGif.src}
                        alt="my gif"
                        height={100}
                        width={100}
                        objectFit="contain"
                    />
                    <Typography
                        fontSize="18px"
                        fontWeight="600"
                        maxWidth={568}
                        textAlign="center"
                        sx={{ color: theme.palette.neutral[1000] }}
                    >
                        {t('Registration Submitted Successfully')}!
                    </Typography>
                    <Stack
                        justifyContent="center"
                        alignItems="center"
                        width="100%"
                        maxWidth={568}
                    >
                        <Typography
                            // fontSize="16px"
                            textAlign="center"
                            sx={{ color: theme.palette.neutral[500] }}
                        >
                            {t(
                                'Your restaurant application has been successfully submitted to Stackfood. Please check your email — once the admin reviews your request, you’ll receive a panel access link to set up your restaurant and start serving hungry customers.'
                            )}
                        </Typography>
                    </Stack>

                    {/* the button on click go to home page */}
                    <Stack>
                        <CustomButton
                            sx={{
                                paddingInline: '2.5rem',
                                marginTop: '1rem !important',
                            }}
                            variant="contained"
                            onClick={() => router.push('/home')}
                        >
                            {t('Got it')}
                        </CustomButton>
                    </Stack>
                </>
            ) : (
                <>
                    <CustomImageContainer
                        src={failGif.src}
                        alt="my gif"
                        height={200}
                        width={200}
                        objectFit="contain"
                    />
                    <Typography
                        fontSize="22px"
                        fontWeight="600"
                        sx={{ color: theme.palette.neutral[1000] }}
                    >
                        {t('Payment Error !')}
                    </Typography>
                    <Stack justifyContent="center" alignItems="center">
                        <Typography
                            fontSize="16px"
                            textAlign="center"
                            sx={{ color: theme.palette.neutral[1000] }}
                        >
                            {t('Your Registration Could Not Completed .')}
                        </Typography>
                        <Typography
                            fontSize="13px"
                            component="span"
                            sx={{ color: theme.palette.neutral[1000] }}
                        >
                            {t(
                                'Due to payment transaction error your registration could not complete.'
                            )}
                            <Typography
                                textAlign="center"
                                onClick={tryAgain}
                                component="span"
                                fontSize="13px"
                                color={theme.palette.primary.main}
                                sx={{
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                }}
                            >
                                {t('Please Try Again')}
                            </Typography>
                        </Typography>
                    </Stack>
                </>
            )}
        </CustomStackFullWidth>
    )
}

export default SuccessStoreRegistration
