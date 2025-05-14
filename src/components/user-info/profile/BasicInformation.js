import React, { useEffect, useRef, useState } from 'react'
import { Stack } from '@mui/material'
import { ProfileApi } from '@/hooks/react-query/config/profileApi'
import { useMutation } from 'react-query'
import { toast } from 'react-hot-toast'
import AccountInformation from './AccountInformation'
import BasicInformationForm from './BasicInformationForm'
import { onSingleErrorResponse } from '@/components/ErrorResponse'
import { useDispatch, useSelector } from 'react-redux'
import { setEditProfile } from '@/redux/slices/editProfile'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '@/firebase'
import { useFireBaseOtpVerify } from '@/hooks/react-query/useFireBaseVerfify'
const BasicInformation = ({ data, refetch, deleteUserHandler }) => {
    const dispatch = useDispatch()
    const [open, setOpen] = React.useState(false)
    const [openEmail, setOpenEmail] = React.useState(false)
    const [verificationId, setVerificationId] = useState(null)
    const [resData, setResData] = React.useState([])
    const { global } = useSelector((state) => state.globalSettings)
    const recaptchaWrapperRef = useRef(null)
    const { mutate: profileUpdateByMutate } = useMutation(
        'profileUpdate',
        ProfileApi.profileUpdate
    )

    const { mutate: fireBaseOtpMutation, isLoading: fireIsLoading } =
        useFireBaseOtpVerify()
    const setUpRecaptcha = () => {
        // Check if auth is available and we're in browser environment
        if (!auth || typeof window === 'undefined') return;

        try {
            // First, properly clean up any existing instances to avoid memory leaks or conflicts
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (e) {
                    console.error('Error clearing existing window verifier:', e);
                }
                window.recaptchaVerifier = null;
            }

            // Reset our ref as well to be safe
            recaptchaWrapperRef.current = null;

            // Create a new verifier
            const verifier = new RecaptchaVerifier(
                auth,
                'recaptcha-update', // Make sure this element exists in your DOM
                {
                    size: 'invisible',
                    callback: (response) => {
                        console.log('Recaptcha verified', response);
                    },
                    'expired-callback': () => {
                        console.log('Recaptcha expired');
                        // Access directly from window for reliability
                        if (window.recaptchaVerifier) {
                            window.recaptchaVerifier.reset();
                        }
                    },
                }
            );

            // Store references - make sure both are pointing to the same object
            window.recaptchaVerifier = verifier;
            recaptchaWrapperRef.current = verifier;

            // No need to call render() - it's done automatically by the constructor
        } catch (error) {
            console.error('Error setting up recaptcha:', error);
        }
    };

    useEffect(() => {
        setUpRecaptcha();

        // Cleanup function when component unmounts
        return () => {
            // Use window.recaptchaVerifier for cleanup as it's guaranteed to have the clear method
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                    window.recaptchaVerifier = null;
                    // Also reset our ref
                    recaptchaWrapperRef.current = null;
                } catch (error) {
                    console.error('Error clearing recaptcha:', error);
                }
            }
        };
    }, []);
    const sendOTP = (response, values) => {
        const phoneNumber = values?.phone
        if (!phoneNumber) {
            console.error('Invalid phone number')
            return
        }

        if (!window.recaptchaVerifier) {
            setUpRecaptcha()
        }
        const appVerifier = window.recaptchaVerifier

        signInWithPhoneNumber(auth, phoneNumber, appVerifier)
            .then((confirmationResult) => {
                setVerificationId(confirmationResult.verificationId)
                setOpen(true)
            })
            .catch((error) => {
                toast.error(error.message)
                console.log('Error in sending OTP', error)
            })
    }

    const formSubmitHandler = (values) => {
        const {
            name,
            phone,
            email,
            image,
            button_type,
            reset_token,
            password,
        } = values
        let formData = new FormData()
        if (reset_token) {
            formData.append('name', name ?? resData?.name)
            // formData.append('l_name', l_name ?? resData?.l_name)
            formData.append(
                'phone',
                resData?.verification_on === 'email'
                    ? resData?.phone
                    : phone ?? resData?.phone
            )
            formData.append('email', email ?? resData?.email)
            formData.append('image', image ?? resData?.image ?? resData?.image)
            formData.append('button_type', button_type ?? resData?.button_type)
            formData.append('otp', reset_token ? reset_token : null)
            formData.append(
                'verification_medium',
                reset_token ? resData?.verification_medium : null
            )
            formData.append(
                'verification_on',
                reset_token ? resData?.verification_on : null
            )
            formData.append('session_info', verificationId)
        } else {
            formData.append('name', name ?? resData?.name)
            formData.append('phone', phone ?? resData?.phone)
            formData.append('email', email ?? resData?.email)
            formData.append('image', image ?? resData?.image ?? resData?.image)
            //formData.append('button_type', button_type ?? resData?.button_type)
            formData.append('password', password ?? resData?.password)
        }

        const onSuccessHandler = (response) => {
            if (response) {
                setResData({
                    ...resData,
                    ...response?.data,
                    name: name,
                    // l_name: l_name,
                    phone: phone,
                    email: email,
                    image: image,
                    button_type: button_type,
                })
                if (response?.data?.otp_send) {
                    if (response?.data?.verification_on === 'phone') {
                        if (global?.firebase_otp_verification === 1) {
                            sendOTP(response, values)
                        } else {
                            setOpen(true)
                        }
                    } else {
                        setOpenEmail(true)
                    }
                } else {
                    toast.success(response.data.message)
                    //InfoSetByApi()
                    refetch().then()
                    dispatch(setEditProfile(false))
                }
            }
        }
        profileUpdateByMutate(formData, {
            onSuccess: onSuccessHandler,
            onError: onSingleErrorResponse,
        })
        // if (global?.firebase_otp_verification === 1) {
        //     console.log('call')
        //     sendOTP(values?.phone)
        // } else {
        //
        // }
    }

    const handleCloseEmail = () => {
        setOpenEmail(false)
    }
    const handleClosePhone = () => {
        setOpen(false)
    }
    return (
        <Stack
            gap="20px"
            sx={{
                borderRadius: '10px',
            }}
        >
            <div ref={recaptchaWrapperRef}>
                <div id="recaptcha-update"></div>
            </div>
            <BasicInformationForm
                handleCloseEmail={handleCloseEmail}
                handleClosePhone={handleClosePhone}
                data={data}
                formSubmit={formSubmitHandler}
                deleteUserHandler={deleteUserHandler}
                open={open}
                setOpen={setOpen}
                setOpenEmail={setOpenEmail}
                openEmail={openEmail}
                fireBaseId="recaptcha-containera"
                resData={resData}
            />
            <AccountInformation data={data} formSubmit={formSubmitHandler} />
        </Stack>
    )
}

export default BasicInformation
