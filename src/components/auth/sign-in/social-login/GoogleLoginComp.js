import React, { useEffect, useState } from 'react'
import jwt_decode from 'jwt-decode'
import CustomModal from '../../../custom-modal/CustomModal'
import OtpForm from '../../forgot-password/OtpForm'
import { toast } from 'react-hot-toast'
import { useVerifyPhone } from '@/hooks/react-query/otp/useVerifyPhone'
import { onErrorResponse } from '../../../ErrorResponse'
import { googleClientId } from '@/utils/staticCredentials'
import { styled, Typography, Stack } from '@mui/material'
import { t } from 'i18next'
import CustomImageContainer from '../../../CustomImageContainer'
import googleLatest from '../../../../../public/static/Google Logo.png'
import { getGuestId } from '@/components/checkout-page/functions/getGuestUserId'

export const CustomGoogleButton = styled(Stack)(({ theme, width }) => ({
    width: '100%',
    backgroundColor: theme.palette.neutral[100],
    height: '45px',
    justifyContent: 'center',
    borderRadius: '10px',
    padding: '10px',
    color: theme.palette.neutral[600],
    boxShadow: `0px 2px 3px 0px rgba(0, 0, 0, 0.17), 0px 0px 3px 0px rgba(0, 0, 0, 0.08)`,
    transition: 'box-shadow 0.3s',
    '&:hover': {
        boxShadow: `0px 5px 10px 0px rgba(0, 0, 0, 0.3), 0px 2px 5px 0px rgba(0, 0, 0, 0.15)`,
    },
}))

const GoogleLoginComp = (props) => {
    const {
        handleSuccess,
        handleParentModalClose,
        setJwtToken,
        setUserInfo,
        setModalFor,
        setMedium,
        loginMutation,
        setLoginInfo,
        setForWidth,
        all,
    } = props
    const [loginValue, setLoginValue] = useState(null)
    const [openModal, setOpenModal] = useState(false)
    const [openOtpModal, setOpenOtpModal] = useState(false)
    const [otpData, setOtpData] = useState({ phone: '' })
    const [mainToken, setMainToken] = useState(null)

    const clientId = googleClientId
    const handleToken = (response) => {
        if (response?.token) {
            handleSuccess(response.token)
        } else {
            setMedium('google')
            setModalFor('phone_modal')
            setOpenModal(true)
        }
    }

    useEffect(() => {
        if (otpData?.phone !== '') {
            setOpenOtpModal(true)
        }
    }, [otpData])

    const handlePostRequestOnSuccess = (response) => {
        const res = response?.data
        if (
            response?.data?.is_exist_user === null &&
            response?.data?.is_personal_info === 1
        ) {
            handleToken(response?.data)
        } else if (response?.data?.is_personal_info === 0) {
            setLoginInfo({ ...res, email: response?.email, is_email: true })
            setForWidth(false)
            setModalFor('user_info')
        } else {
            setForWidth(false)
            setMedium('google')
            setLoginInfo({ ...res, email: response?.email, is_email: true })
            setModalFor('is_exist_user')
        }
    }
    const handleCallBackResponse = (res) => {
        const userObj = jwt_decode(res.credential)

        setJwtToken(res)
        setUserInfo(userObj)
        const tempValue = {
            email: res?.email ?? userObj.email,
            token: res?.token ?? res.credential,
            unique_id: res?.unique_id ?? res?.clientId,
            medium: res?.medium ?? 'google',
            login_type: res?.login_type ?? 'social',
            guest_id: loginValue?.guest_id ?? getGuestId(),
        }
        setLoginValue(tempValue)
        loginMutation(tempValue, {
            onSuccess: (res) =>
                handlePostRequestOnSuccess({
                    ...res,
                    email: userObj.email,
                }),
            onError: (error) => {
                error?.response?.data?.errors?.forEach((item) =>
                    item.code === 'email'
                        ? handleToken()
                        : toast.error(item.message)
                )
            },
        })
    }

    const setButtonWidth = () => {
        const screenWidth = window.innerWidth
        return screenWidth <= 600 ? '236px' : all ? '267px' : '300px' // 600px is the breakpoint for 'xs' and 'md'
    }

    useEffect(() => {
        if (typeof window !== undefined) {
            window?.google?.accounts?.id?.initialize({
                client_id: clientId,
                callback: handleCallBackResponse,
            })
            window?.google?.accounts?.id?.renderButton(
                document.getElementById('signInDiv'),
                {
                    theme: 'outline',
                    size: 'large',
                    shape: 'rounded',
                    width: setButtonWidth(),
                    logo_alignment: 'left',
                }
            )
        }
    }, [])

    const onSuccessHandler = (res) => {
        toast.success(res?.message)
        setOpenOtpModal(false)
        handleToken(mainToken)
        handleParentModalClose()
    }
    const { mutate: signInMutate, isLoading } = useVerifyPhone()
    const formSubmitHandler = (values) => {
        signInMutate(values, {
            onSuccess: onSuccessHandler,
            onError: onErrorResponse,
        })
    }
    return (
        <Stack width={'100%'} maxWidth="355px">
            <div style={{ position: 'relative' }}>
                <div
                    style={{
                        position: 'absolute',
                        height: '100%',
                        width: '100%',
                        filter: 'opacity(0)',
                        zIndex: 999,
                    }}
                >
                    <div id="signInDiv"></div>
                </div>

                <CustomGoogleButton direction="row" spacing={1}>
                    <CustomImageContainer
                        src={googleLatest.src}
                        alt="facebook"
                        height="24px"
                        width="24px"
                        objectFit="cover"
                        borderRadius="50%"
                    />
                    <Typography fontSize="14px" fontWeight="600">
                        {t('Continue with Google')}
                    </Typography>
                </CustomGoogleButton>
            </div>

            <CustomModal
                openModal={openOtpModal}
                setModalOpen={setOpenOtpModal}
            >
                <OtpForm
                    data={otpData?.phone}
                    formSubmitHandler={formSubmitHandler}
                    isLoading={isLoading}
                    reSendOtp={handleCallBackResponse}
                    loginValue={loginValue}
                />
            </CustomModal>
        </Stack>
    )
}

GoogleLoginComp.propTypes = {}

export default GoogleLoginComp
