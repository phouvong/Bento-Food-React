import React, { useEffect, useReducer, useState } from 'react'
import Typography from '@mui/material/Typography'

import OutlinedInput from '@mui/material/OutlinedInput'
import { useDispatch, useSelector } from 'react-redux'
import { useQuery } from 'react-query'
import { useWishListGet } from '@/hooks/react-query/config/wish-list/useWishListGet'
import 'react-phone-input-2/lib/material.css'
import { useTranslation } from 'react-i18next'
import {
    CustomLink,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useRouter } from 'next/router'
import { setWishList } from '@/redux/slices/wishList'
import CustomImageContainer from '../../CustomImageContainer'
import { CustomTypography } from '../../custom-tables/Tables.style'
import { LoginWrapper } from '../auth.style'
import { ProfileApi } from '@/hooks/react-query/config/profileApi'
import { setUser } from '@/redux/slices/customer'
import { RTL } from '../../RTL/RTL'
import { loginSuccessFull } from '@/utils/ToasterMessages'
import { onErrorResponse, onSingleErrorResponse } from '../../ErrorResponse'
import CustomModal from '../../custom-modal/CustomModal'
import OtpForm from '../forgot-password/OtpForm'
import { useVerifyPhone } from '@/hooks/react-query/otp/useVerifyPhone'
import { setToken } from '@/redux/slices/userToken'
import { getGuestId } from '../../checkout-page/functions/getGuestUserId'
import { Stack, alpha, styled } from '@mui/material'
import { CustomToaster } from '@/components/custom-toaster/CustomToaster'
import OtpLogin from '@/components/auth/OtpLogin'
import ManualLogin from '@/components/auth/ManualLogin'
import SocialLogin from '@/components/auth/SocialLogin'
import Line from '@/components/auth/Line'
import googleLatest from '../../../../public/static/fi_6993593.png'
import { CustomGoogleButton } from '@/components/auth/sign-in/social-login/GoogleLoginComp'

import {
    loginInitialState,
    loginReducer,
    ACTIONS,
} from '@/components/auth/states'
import {
    getActiveLoginStatus,
    getLoginUserCheck,
} from '@/components/auth/loginHelper'
import { checkInput, formatPhoneNumber } from '@/utils/customFunctions'
import { useFireBaseOtpVerify } from '@/hooks/react-query/useFireBaseVerfify'

export const CustomSigninOutLine = styled(OutlinedInput)(
    ({ theme, width, borderradius }) => ({
        width: width || '355px',
        borderRadius: borderradius ?? '4px',
        '&.MuiOutlinedInput-root': {
            '& .MuiOutlinedInput-input': {
                padding: '12.5px 0px !important',
                fontSize: '14px',
                fontWeight: '400',
                alignItems: 'center',
                '&::placeholder': {
                    color: alpha(theme.palette.neutral[400], 0.7), // Set placeholder color to red
                },
            },
            '& fieldset': {
                borderColor: alpha(theme.palette.neutral[400], 0.5),
                borderWidth: '1px',
            },
            '&:hover fieldset': {
                borderColor: alpha(theme.palette.neutral[600], 0.7),
            },
            '&.Mui-focused fieldset': {
                borderColor: alpha(theme.palette.primary.main, 0.7),
                borderWidth: '1px',
            },
        },

        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
    })
)

const SignInPage = ({
    handleClose,
    setModalFor,
    cartListRefetch,
    setJwtToken,
    setUserInfo,
    handleSuccess,
    setMedium,
    zoneid,
    setForWidth,
    setLoginInfo,
    loginMutation,
    loginIsLoading,
    verificationId,
    sendOTP,
    fireBaseId,
}) => {
    const [showPassword, setShowPassword] = useState(false)
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const { global } = useSelector((state) => state.globalSettings)
    const router = useRouter()
    const guestId = getGuestId()
    const [isRemember, setIsRemember] = useState(false)
    const [openOtpModal, setOpenOtpModal] = useState(false)
    const [otpData, setOtpData] = useState({ type: '' })
    const [mainToken, setMainToken] = useState(null)
    const [loginValue, setLoginValue] = useState(null)
    const [state, loginDispatch] = useReducer(loginReducer, loginInitialState)
    let userDatafor = undefined
    if (typeof window !== 'undefined') {
        userDatafor = JSON.parse(localStorage.getItem('userDatafor'))
    }
    const loginFormik = useFormik({
        initialValues: {
            email_or_phone: userDatafor?.email_or_phone || '',
            password: userDatafor ? userDatafor.password : '',
            tandc: false,
        },
        validationSchema: Yup.object({
            email_or_phone: Yup.string()
                .required(t('Email or phone number is required'))
                .test(
                    'email-or-phone',
                    t('Must be a valid email or phone number'),
                    function (value) {
                        if (!value) return false;

                        // Basic email and E.164 phone regex
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        const phoneRegex = /^\+?[0-9]{6,15}$/; // Accepts 6-15 digits, optional +

                        if (emailRegex.test(value)) {
                            return true;
                        }

                        if (phoneRegex.test(value)) {
                            // Further check for minimum digits (example: minimum 8 digits excluding '+')
                            const digitsOnly = value.replace(/\D/g, ''); // Remove non-digit characters
                            return digitsOnly.length >= 10;
                        }

                        return false;
                    }
                ),
            password: Yup.string()
                .min(6, t('Password is too short - should be 6 chars minimum.'))
                .required(t('Password is required')),
        }),
        onSubmit: async (values, helpers) => {
            try {
                if (isRemember) {
                    localStorage.setItem('userDatafor', JSON.stringify(values))
                }
                formSubmitHandler({ ...values, login_type: 'manual' })
            } catch (err) {}
        },
    })
    const otpLoginFormik = useFormik({
        initialValues: {
            phone: '',
        },
        validationSchema: Yup.object({
            phone: Yup.string()
                .required('Please give a phone number')
                .min(10, 'Number must be 10 digits'),
        }),
        onSubmit: async (values, helpers) => {
            try {
                formSubmitHandler({ ...values, login_type: 'otp' })
            } catch (err) {}
        },
    })
    const otpHandleChange = (value) => {
        otpLoginFormik.setFieldValue('phone', `+${value}`)
    }

    const userOnSuccessHandler = (res) => {
        dispatch(setUser(res.data))
        handleClose?.()
    }
    const { refetch: profileRefatch } = useQuery(
        ['profile-info'],
        ProfileApi.profileInfo,
        {
            enabled: false,
            onSuccess: userOnSuccessHandler,
            onError: onSingleErrorResponse,
        }
    )
    const onSuccessHandler = (res) => {
        dispatch(setWishList(res))
    }

    const { refetch: wishlistRefetch } = useWishListGet(onSuccessHandler)
    useEffect(() => {
        if (otpData?.type !== '') {
            setOpenOtpModal(true)
        }
    }, [otpData])

    const handleTokenAfterSignIn = async (response) => {
        if (response) {
            localStorage.setItem('token', response?.token)
            zoneid && (await wishlistRefetch())
            await profileRefatch()
            await cartListRefetch()
            CustomToaster('success', loginSuccessFull)
            dispatch(setToken(response.token))
            if (
                router.pathname === `/order-history/[id]` ||
                router.pathname === '/forgot-password'
            ) {
                router.push('/home')
            }
        }
    }

    const formSubmitHandler = (values) => {
        const numberOrEmail = checkInput(values?.email_or_phone)
        let newValues = {}
        if (values?.login_type === 'otp') {
            newValues = {
                ...values,
                type: 'phone',
                guest_id: guestId,
            }
        } else {
            newValues = {
                ...values,
                guest_id: guestId,
                field_type: numberOrEmail,
                type: numberOrEmail,
            }
        }
        setLoginValue(newValues)
        loginMutation(newValues, {
            onSuccess: async (response) => {
                getLoginUserCheck(
                    response,
                    newValues,
                    handleTokenAfterSignIn,
                    setOtpData,
                    setMainToken,
                    sendOTP,
                    global
                )
            },
            onError: onErrorResponse,
        })
    }

    const handleOnChange = (value) => {
        const isPlusCheck = formatPhoneNumber(value)
        loginFormik.setFieldValue('email_or_phone', `${isPlusCheck}`)
    }

    const gotoForgotPassword = () => {
        router.push('/forgot-password')
        handleClose()
    }

    const rememberMeHandleChange = (e) => {
        setIsRemember(e.target.checked)
    }
    useEffect(() => {
        let userDatafor = undefined
        if (typeof window !== 'undefined') {
            userDatafor = JSON.parse(localStorage.getItem('userDatafor'))
        }
        if(userDatafor){
            setIsRemember(true)
        }
    }, [])

    const handleClick = () => {
        window.open('/terms-and-conditions')
    }
    const { mutate: otpVerifyMutate, isLoading: isLoadingOtpVerifiyAPi } =
        useVerifyPhone()

    const { mutate: fireBaseOtpMutation, isLoading: fireIsLoading } =
        useFireBaseOtpVerify()

    const handleLoginInfo = (res, values) => {
        setLoginInfo({
            ...res,
            phone: values.phone,
            otp: values?.reset_token,
        })

        // Determine which modal to show based on the response
        if (res?.is_personal_info === 0) {
            setModalFor('user_info')
        } else if (res?.is_exist_user !== null) {
            setModalFor('is_exist_user')
        } else {
            setOpenOtpModal(false)
            handleTokenAfterSignIn(res)
            handleClose()
        }
    }

    const otpFormSubmitHandler = (values) => {
        if (global?.firebase_otp_verification === 1) {
            const temValue = {
                session_info: verificationId,
                phone: values.phone,
                otp: values.reset_token,
                login_type: 'otp',
                guest_id: getGuestId(),
            }
            fireBaseOtpMutation(temValue, {
                onSuccess: (res) => {
                    if (res) {
                        handleLoginInfo(res, values)
                    }
                },
                onError: onErrorResponse,
            })
        } else {
            let tempValues = {
                phone: values.phone,
                otp: values.reset_token,
                login_type: otpData?.login_type,
                verification_type: otpData?.verification_type,
                guest_id: getGuestId(),
            }
            const onSuccessHandler = (res) => {
                if (res) {
                    handleLoginInfo(res, values)
                }
            }
            otpVerifyMutate(tempValues, {
                onSuccess: onSuccessHandler,
                onError: onSingleErrorResponse,
            })
        }
    }

    const selectedOtp = () => {
        loginDispatch({
            type: ACTIONS.setActiveLoginType,
            payload: {
                otp: true,
                manual: false,
                social: false,
            },
        })
    }

    const setInitialLoginType=() => {
        const { centralize_login } = global || {}

        if (centralize_login) {
            const {
                otp_login_status,
                manual_login_status,
                social_login_status,
            } = centralize_login

            loginDispatch({
                type: ACTIONS.setActiveLoginType,
                payload: {
                    otp: otp_login_status === 1,
                    manual: manual_login_status === 1,
                    social: social_login_status === 1,
                },
            })
        }
    }
    useEffect(() => {
        setInitialLoginType()
    }, [])

    useEffect(() => {
        getActiveLoginStatus(state, setForWidth, loginDispatch)
    }, [state.activeLoginType])

    const handleSignup = () => {
        setForWidth(true)
        setModalFor('sign-up')
    }
    const validStatuses = new Set([
        'all',
        'manual_social',
        'otp_manual',
        'otp',
        'manual',
        'social',
        'otp_social',
    ]);

    const loginView = () => {
        const sharedManualProps = {
            loginFormik,
            showPassword,
            setShowPassword,
            global,
            handleOnChange,
            isLoading: loginIsLoading,
            rememberMeHandleChange,
            handleClick,
            gotoForgotPassword,
            setModalFor,
            setForWidth,
            fireBaseId,
            isRemember
        };

        const sharedSocialProps = {
            global,
            socialLogins: global?.social_login,
            handleParentModalClose: handleClose,
            setJwtToken,
            setUserInfo,
            handleSuccess,
            setModalFor,
            setMedium,
            loginMutation,
            setLoginInfo,
            setForWidth,
        };

        const OtpBlock = (
            <OtpLogin
                otpHandleChange={otpHandleChange}
                otpLoginFormik={otpLoginFormik}
                global={global}
                isLoading={loginIsLoading}
                handleClick={handleClick}
                rememberMeHandleChange={rememberMeHandleChange}
                fireBaseId={fireBaseId}
                setInitialLoginType={setInitialLoginType}
                isRemember={isRemember}
            />
        );

        const OtpSignInButton = (
            <CustomGoogleButton
                direction="row"
                spacing={1}
                onClick={selectedOtp}
                sx={{ marginY: '10px', cursor: 'pointer' }}
            >
                <CustomImageContainer
                    src={googleLatest.src}
                    alt="facebook"
                    height="24px"
                    width="24px"
                    objectFit="cover"
                    borderRadius="50%"
                />
                <Typography fontSize="14px" fontWeight="600">
                    {t('OTP Sign in')}
                </Typography>
            </CustomGoogleButton>
        );

        const SignupLink = (
            <CustomStackFullWidth alignItems="center" spacing={0.5} sx={{ paddingTop: '10px !important' }}>
                <CustomStackFullWidth direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                    <CustomTypography fontSize="14px">{t("Don't have an account?")}</CustomTypography>
                    <CustomLink onClick={handleSignup} variant="body2">
                        {t('Sign Up')}
                    </CustomLink>
                </CustomStackFullWidth>
            </CustomStackFullWidth>
        );

        switch (state.status) {
            case 'all':
            case 'manual_social':
                return (
                    <LoginWrapper direction={{ xs: 'column', md: 'row' }}>
                        <Stack sx={{ flexGrow: { md: 1 }, width: { xs: '100%', md: 0 } }}>
                            <ManualLogin {...sharedManualProps} />
                        </Stack>
                        <Line />
                        <Stack flexGrow={{ md: 1 }} width={{ xs: '100%', md: '0' }} gap="20px">
                            <SocialLogin {...sharedSocialProps} all={state.status === 'all'} />
                            {state.status === 'all' && OtpSignInButton}
                            {SignupLink}
                        </Stack>
                    </LoginWrapper>
                );

            case 'otp_manual':
                return (
                    <Stack width="100%">
                        <ManualLogin {...sharedManualProps} setInitialLoginType={setInitialLoginType} />
                        {OtpSignInButton}
                        {SignupLink}
                    </Stack>
                );

            case 'otp':
                return OtpBlock;
            case 'social':
                return <SocialLogin {...sharedSocialProps} />;

            case 'otp_social':
                return (
                    <>
                        {OtpBlock}
                        <Typography fontSize="14px">or login with</Typography>
                        <SocialLogin {...sharedSocialProps} />
                    </>
                );
            case 'manual':
                return (
                    <Stack width="100%">
                        <ManualLogin {...sharedManualProps} />
                    </Stack>
                );
            default:

        }
    };

// Where this is used:
// {validStatuses.has(state.status) ? loginView() : <Skeleton height={300} />}  // Example of usage

    const languageDirection = localStorage.getItem('direction')
    return (
        <Stack minHeight="450px">
            <RTL direction={languageDirection}>
                <CustomStackFullWidth
                    alignItems="center"
                    spacing={{ xs: 0.5, md: 1 }}
                >
                    <CustomStackFullWidth spacing={{ xs: 1, md: 4 }}>
                        <CustomStackFullWidth alignItems="center">
                            <CustomImageContainer
                                src={global?.logo_full_url}
                                width="50%"
                                height="70px"
                                alt="Logo"
                            />
                        </CustomStackFullWidth>
                        {state.activeLoginType?.social &&
                        !state.activeLoginType?.manual &&
                        !state.activeLoginType?.otp ? (
                            <Typography textAlign="center">
                                {t(`Welcome to ${global?.business_name}`)}
                            </Typography>
                        ) : (
                            <Typography
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '18px',
                                    paddingBottom: '5px',
                                    color: (theme) =>
                                        theme.palette.neutral[1000],
                                }}
                                textAlign="left"
                            >
                                {t('Login')}
                            </Typography>
                        )}
                    </CustomStackFullWidth>
                    <CustomStackFullWidth
                        alignItems="center"
                        spacing={{ xs: 1, md: 2 }}
                    >
                        {loginView()}
                    </CustomStackFullWidth>
                    {state.status === 'manual' && (
                        <CustomStackFullWidth
                            alignItems="center"
                            spacing={0.5}
                            sx={{ paddingTop: '10px !important' }}
                        >
                            <CustomStackFullWidth
                                direction="row"
                                alignItems="center"
                                justifyContent="center"
                                spacing={0.5}
                            >
                                <CustomTypography fontSize="14px">
                                    {t("Don't have an account?")}
                                </CustomTypography>
                                <CustomLink
                                    onClick={handleSignup}
                                    variant="body2"
                                >
                                    {t('Sign Up')}
                                </CustomLink>
                            </CustomStackFullWidth>
                        </CustomStackFullWidth>
                    )}
                </CustomStackFullWidth>
            </RTL>
            <CustomModal
                openModal={openOtpModal}
                setModalOpen={setOpenOtpModal}
            >
                <OtpForm
                    data={{ ...otpData, phone: otpData?.type }}
                    formSubmitHandler={otpFormSubmitHandler}
                    isLoading={isLoadingOtpVerifiyAPi || fireIsLoading}
                    handleClose={() => setOpenOtpModal(false)}
                    reSendOtp={formSubmitHandler}
                    loginValue={loginValue}
                />
            </CustomModal>
        </Stack>
    )
}

export default SignInPage
