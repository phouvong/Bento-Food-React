import React, { useState } from 'react'
import { Stack } from '@mui/material'
import ForgotPasswordNumberForm from './ForgotPasswordNumberForm'
import OtpForm from './OtpForm'
import NewPassword from './NewPassword'
import { useOtp } from '@/hooks/react-query/config/forgot-password/useOtp'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '@/firebase'
import { onErrorResponse } from '@/components/ErrorResponse'
import { useSelector } from 'react-redux'
import { useFireBaseResetPass } from '@/hooks/react-query/useFireBaseResetPass'
import { getGuestId } from '@/components/checkout-page/functions/getGuestUserId'
import {useForgotPassword} from "@/hooks/react-query/config/forgot-password/useForgotPassword";
import toast from "react-hot-toast";

const ForgotPassword = ({ setModalFor }) => {
    const [page, setPage] = useState(0)
    const { global } = useSelector((state) => state.globalSettings)
    const [verificationId, setVerificationId] = useState(null)
    const [hasVerificationMethod, setHasVerificationMethod] = useState(false);
    const [phoneOrEmail, setPhoneOrEmail] = useState('')
    const [data, setData] = useState({
        phone: "",
        email:"",
        otp: "",
    });
    const [loginValue, setLoginValue] = useState(null)
    const [isResend, setIsResend] = useState(false)
    const { mutate: fireBaseOtpMutation, isLoading: fireIsLoading } =
        useFireBaseResetPass()
    const goNext = () => {
        setPage((currPage) => currPage + 1)
    }
    const goBack = () => {
        setPage((currPage) => currPage - 1)
    }

    const handleFirstForm = (values) => {
        setData({
            phone: values.phone,
            email:values?.email,
            reset_token: values.reset_token,
            verification_method:values?.verification_method
        })
    }
    const setUpRecaptcha = () => {
        if (!auth) {
            console.error('Firebase Auth not initialized');
            return;
        }

        if (document.getElementById('recaptcha-container')) {
            if (!window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier = new RecaptchaVerifier(
                        auth,
                        'recaptcha-container',
                        {
                            size: 'invisible',
                            callback: (response) => {
                                console.log('Recaptcha verified', response)
                            },
                            'expired-callback': () => {
                                window.recaptchaVerifier?.reset()
                            },
                        }
                    )
                } catch (error) {
                    console.error('Error creating RecaptchaVerifier:', error);
                }
            } else {
                window.recaptchaVerifier.clear()
                window.recaptchaVerifier = null
            }
        }
    }

    const sendOTP = (phone) => {
        setUpRecaptcha()

        const phoneNumber = phone
        // country code
        const appVerifier = window.recaptchaVerifier
        signInWithPhoneNumber(auth, phoneNumber, appVerifier)
            .then((confirmationResult) => {
                setVerificationId(confirmationResult.verificationId)
                setData({ ...data, phone: phoneNumber })
                goNext()
            })
            .catch((error) => {
                console.log('Error in sending OTP', error)
            })
    }

    const onSuccessHandler = (res) => {
        if (res) {
                goNext()

        }
    }
    const { mutate, isLoading } = useOtp(onSuccessHandler)
    const formSubmitHandler = (values) => {
        handleFirstForm(values)
        if (global?.firebase_otp_verification === 1) {
            const tempValues = {
                phoneNumber: values?.phone,
                sessionInfo: verificationId,
                code: values?.reset_token,
                is_reset_token: 1,
                guest_id: loginValue?.guest_id ?? getGuestId(),
            }
            setLoginValue(tempValues)
            fireBaseOtpMutation(tempValues, {
                onSuccess: onSuccessHandler,
                onError: onErrorResponse,
            })
        } else {
            setLoginValue(values)
            mutate(values, {
                onSuccess: onSuccessHandler,
                onError: onErrorResponse,
            })
        }
    }
    const onSuccessHandlerSendOtp = (res) => {
        if (res) {
            if(!isResend){
                if(page=== 0){
                    goNext()
                    toast.success(res.message)
                }

            }

        }
    }

    const { mutate:sendOtpMutate, isLoading:sendOtpLoading } = useForgotPassword({
        onSuccessHandlerSendOtp,
        onError: (errors) => {
            onErrorResponse(errors)
        },
    })
    const formSubmitHandlerSendOtp = (values,) => {
        //setIsResend(true)

        handleFirstForm(values)
        if (global?.firebase_otp_verification === 1) {
            sendOTP(values?.phone)
        } else {
            sendOtpMutate(values, {
                onSuccess: onSuccessHandlerSendOtp,
                onError: onErrorResponse,
            })
        }
    }
    const pageShow = () => {
        if (page === 0) {
            return (
                <ForgotPasswordNumberForm
                    goNext={goNext}
                    handleFirstForm={handleFirstForm}
                    data={data}
                    setModalFor={setModalFor}
                    sendOTP={sendOTP}
                    id="recaptcha-container"
                    formSubmitHandlerSendOtp={formSubmitHandlerSendOtp}
                    isLoading={sendOtpLoading}
                    setHasVerificationMethod={setHasVerificationMethod}
                    setPhoneOrEmail={setPhoneOrEmail}
                    phoneOrEmail={phoneOrEmail}
                    hasVerificationMethod={hasVerificationMethod}
                    // sendOtpHandler={sendOtpHandler}
                />
            )
        } else if (page === 1) {
            return (
                <OtpForm
                    setResend={setIsResend}
                    data={ data}
                    goBack={goBack}
                    formSubmitHandler={formSubmitHandler}
                    isLoading={isLoading || fireIsLoading}
                    isForgot
                    reSendOtp={formSubmitHandlerSendOtp}
                    loginValue={loginValue}
                    phoneOrEmail={phoneOrEmail}
                />
            )
        } else if (page === 2 || page === 3) {
            return (
                <NewPassword
                    data={data}
                    handleFirstForm={handleFirstForm}
                    goBack={goBack}
                    setModalFor={setModalFor}
                    phoneOrEmail={phoneOrEmail}
                />
            )
        }
    }

    return <Stack>{pageShow()}</Stack>
}

export default ForgotPassword
