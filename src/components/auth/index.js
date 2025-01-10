import { Modal, Box, IconButton, Stack } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '@/redux/slices/customer'
import { useMutation, useQuery } from 'react-query'
import { ProfileApi } from '@/hooks/react-query/config/profileApi'
import { onErrorResponse, onSingleErrorResponse } from '../ErrorResponse'
import { setWishList } from '@/redux/slices/wishList'
import { useWishListGet } from '@/hooks/react-query/config/wish-list/useWishListGet'
import { loginSuccessFull } from '@/utils/ToasterMessages'
import { setToken } from '@/redux/slices/userToken'
import PhoneInputForm from './sign-in/social-login/PhoneInputForm'
import ForgotPassword from './forgot-password/ForgotPassword'
import CloseIcon from '@mui/icons-material/Close'
import { CustomBoxForModal } from './auth.style'
import { CustomToaster } from '../custom-toaster/CustomToaster'
import AddUserInfo from '@/components/auth/AddUserInfo'
import { useUpdateUserInfo } from '@/hooks/react-query/social-login/useUpdateUserInfo'
import ExitingUser from '@/components/auth/ExitingUser'
import { AuthApi } from '@/hooks/react-query/config/authApi'
import { getGuestId } from '@/components/checkout-page/functions/getGuestUserId'
import { auth } from '@/firebase'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { useRouter } from 'next/router'

const SignInPage = dynamic(() => import('./sign-in'))

const SignUpPage = dynamic(() => import('./sign-up'))

export const setUpRecaptcha = () => {
    if (document.getElementById('recaptcha-container')) {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(
                'recaptcha-container',
                {
                    size: 'invisible',
                    callback: (response) => {
                        console.log('Recaptcha verified', response)
                    },
                    'expired-callback': () => {
                        window.recaptchaVerifier?.reset()
                    },
                },
                auth
            )
        } else {
            window.recaptchaVerifier.clear()
            window.recaptchaVerifier = null
        }
    }
}
const AuthModal = ({
    open,
    handleClose,
    signInSuccess,
    modalFor,
    setModalFor,
    cartListRefetch,
}) => {
    const { global } = useSelector((state) => state.globalSettings)

    const { userInfo: fbUserInfo, jwtToken: fbJwtToken } = useSelector(
        (state) => state.fbCredentialsStore
    )
    const router = useRouter()
    const [forWidth, setForWidth] = useState(false)
    const [loginInfo, setLoginInfo] = useState({})
    const [signInPage, setSignInPage] = useState(true)
    const [userInfo, setUserInfo] = useState(null)
    const [jwtToken, setJwtToken] = useState(null)
    const [medium, setMedium] = useState('')
    const [verificationId, setVerificationId] = useState(null)
    const user = medium === 'google' ? userInfo : fbUserInfo
    const jwt = medium === 'google' ? jwtToken : fbJwtToken
    const dispatch = useDispatch()
    const recaptchaWrapperRef = useRef(null)
    const { mutate, isLoading } = useUpdateUserInfo()
    const { mutate: loginMutation, isLoading: loginIsLoading } = useMutation(
        'sign-in',
        AuthApi.signIn
    )
    const userOnSuccessHandler = (res) => {
        dispatch(setUser(res?.data))
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
    let zoneid = undefined
    if (typeof window !== 'undefined') {
        zoneid = localStorage.getItem('zoneid')
    }
    const onSuccessHandler = (res) => {
        dispatch(setWishList(res))
    }
    const { refetch } = useWishListGet(onSuccessHandler)
    const handleSuccess = async (value) => {
        localStorage.setItem('token', value)
        CustomToaster('success', loginSuccessFull)
        if (zoneid) {
            await refetch()
        }
        await profileRefatch()
        dispatch(setToken(value))
        if (
            router.pathname === `/order-history/[id]` ||
            router.pathname === '/forgot-password'
        ) {
            router.push('/home')
        }
        handleClose?.()
    }
    const handleRegistrationOnSuccess = (token) => {
        handleSuccess(token)
        handleClose()
    }

    const handleUpdateUserInfo = (values) => {
        mutate(values, {
            onSuccess: (res) => {
                handleSuccess(res?.token)
            },
            onError: onErrorResponse,
        })
    }
    const handleSubmitExistingUser = (value) => {
        let tempValues
        if (loginInfo?.is_email) {
            tempValues = {
                verified: value,
                login_type: loginInfo?.login_type,
                email: userInfo?.email,
                guest_id: getGuestId(),
                token: jwtToken?.credential,
                unique_id: jwtToken?.clientId,
                medium: medium,
            }
        } else {
            tempValues = {
                verified: value,
                login_type: loginInfo?.login_type,
                phone: loginInfo?.phone,
                otp: loginInfo?.otp,
                guest_id: getGuestId(),
            }
        }

        loginMutation(tempValues, {
            onSuccess: (res) => {
                if (res?.data?.is_personal_info === 0) {
                    setModalFor('user_info')
                } else {
                    handleSuccess(res?.data?.token)
                }
            },
            onError: onErrorResponse,
        })
    }

    useEffect(() => {
        setUpRecaptcha()
        return () => {
            if (recaptchaWrapperRef.current) {
                recaptchaWrapperRef.current.clear() // Clear Recaptcha when component unmounts
                recaptchaWrapperRef.current = null
            }
        }
    }, [])

    const sendOTP = (response, setOtpData, setMainToken, phone) => {
        const phoneNumber = phone
        if (!phoneNumber) {
            console.error('Invalid phone number')
            return
        }
        if (!window.recaptchaVerifier) {
            setUpRecaptcha()
        }
        // country code
        const appVerifier = window.recaptchaVerifier
        signInWithPhoneNumber(auth, phoneNumber, appVerifier)
            .then((confirmationResult) => {
                setVerificationId(confirmationResult.verificationId)
                setOtpData({ type: phone })
                setMainToken(response)
            })
            .catch((error) => {
                console.log('Error in sending OTP', error)
            })
    }
    const handleModal = () => {
        if (modalFor === 'sign-in') {
            return (
                <SignInPage
                    signInSuccess={signInSuccess}
                    handleClose={handleClose}
                    setModalFor={setModalFor}
                    setSignInPage={setSignInPage}
                    cartListRefetch={cartListRefetch}
                    setJwtToken={setJwtToken}
                    setUserInfo={setUserInfo}
                    handleSuccess={handleSuccess}
                    setMedium={setMedium}
                    zoneid={zoneid}
                    setForWidth={setForWidth}
                    setLoginInfo={setLoginInfo}
                    loginMutation={loginMutation}
                    loginIsLoading={loginIsLoading}
                    verificationId={verificationId}
                    sendOTP={sendOTP}
                    fireBaseId="recaptcha-container"
                />
            )
        } else if (modalFor === 'phone_modal') {
            return (
                <>
                    {user && jwt?.clientId && (
                        <PhoneInputForm
                            userInfo={user}
                            jwtToken={jwt}
                            global={global}
                            medium={medium}
                            handleRegistrationOnSuccess={
                                handleRegistrationOnSuccess
                            }
                            setModalFor={setModalFor}
                            setForWidth={setForWidth}
                        />
                    )}
                </>
            )
        } else if (modalFor === 'forgot_password') {
            return <ForgotPassword setModalFor={setModalFor} />
        } else if (modalFor === 'user_info') {
            return (
                <AddUserInfo
                    global={global}
                    loginInfo={loginInfo}
                    formSubmitHandler={handleUpdateUserInfo}
                    isLoading={isLoading}
                    userInfo={user}
                />
            )
        } else if (modalFor === 'is_exist_user') {
            return (
                <ExitingUser
                    global={global}
                    loginInfo={loginInfo}
                    formSubmitHandler={handleSubmitExistingUser}
                    isLoading={isLoading}
                    setModalFor={setModalFor}
                    userInfo={user}
                    jwtToken={jwt}
                    medium={medium}
                    loginIsLoading={loginIsLoading}
                />
            )
        } else {
            return (
                <SignUpPage
                    handleClose={handleClose}
                    setSignInPage={setSignInPage}
                    setModalFor={setModalFor}
                    setJwtToken={setJwtToken}
                    setUserInfo={setUserInfo}
                    handleSuccess={handleSuccess}
                    setMedium={setMedium}
                    verificationId={verificationId}
                    sendOTP={sendOTP}
                />
            )
        }
    }

    return (
        <Box>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <CustomBoxForModal
                    maxWidth={forWidth ? '757px' : '428px'}
                    padding="30px 64px 43px 64px "
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="flex-end"
                        sx={{ position: 'relative' }}
                    >
                        <IconButton
                            onClick={handleClose}
                            sx={{
                                zIndex: '99',
                                position: 'Fixed',
                                top: 0,
                                right: 0,
                                backgroundColor: (theme) =>
                                    theme.palette.neutral[100],
                                borderRadius: '50%',
                            }}
                        >
                            <CloseIcon
                                sx={{
                                    fontSize: {
                                        xs: '16px',
                                        sm: '18px',
                                        md: '20px',
                                    },
                                    fontWeight: '500',
                                }}
                            />
                        </IconButton>
                    </Stack>
                    <div ref={recaptchaWrapperRef}>
                        <div id="recaptcha-container"></div>
                    </div>
                    {handleModal()}
                </CustomBoxForModal>
            </Modal>
        </Box>
    )
}

export default AuthModal
