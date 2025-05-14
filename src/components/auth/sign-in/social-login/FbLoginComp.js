import React, { useEffect, useState } from 'react'
import CustomModal from '../../../custom-modal/CustomModal'
import CustomImageContainer from '../../../CustomImageContainer'
import FacebookLogin from '@greatsumini/react-facebook-login';
import { usePostEmail } from '@/hooks/react-query/social-login/usePostEmail'
import { onErrorResponse } from '../../../ErrorResponse'
import OtpForm from '../../forgot-password/OtpForm'
import { useVerifyPhone } from '@/hooks/react-query/otp/useVerifyPhone'
import { toast } from 'react-hot-toast'
import facebookLatest from '../../../../../public/static/Facebook.png'
import { Stack } from '@mui/material'
import {
    CustomColouredTypography,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import {
    setJwtTokenByDispatch,
    setUserInfoByDispatch,
} from '@/redux/slices/fbCredentials'
import { facebookAppId } from '@/utils/staticCredentials'
import { useTheme } from '@mui/styles'
import { getGuestId } from '@/components/checkout-page/functions/getGuestUserId'

const FbLoginComp = (props) => {
    const {
        handleSuccess,
        handleParentModalClose,
        setModalFor,
        setMedium,
        setLoginInfo,
    } = props
    const theme = useTheme()
    const [loginValue, setLoginValue] = useState(null)
    const [openModal, setOpenModal] = useState(false)
    const [openOtpModal, setOpenOtpModal] = useState(false)
    const [otpData, setOtpData] = useState({ phone: '' })
    const [mainToken, setMainToken] = useState(null)
    const dispatch = useDispatch()
    const appId = facebookAppId
    const { mutate } = usePostEmail()
    const handleToken = (response) => {
        if (response?.token) {
            handleSuccess(response.token)
        } else {
            setMedium('facebook')
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
            setLoginInfo({
                ...res,
                email: response?.data?.email,
                is_email: true,
            })
            setModalFor('user_info')
        } else {
            setMedium('google')
            setLoginInfo({
                ...res,
                email: response?.data?.email,
                is_email: true,
            })
            setModalFor('is_exist_user')
        }
    }
    const responseFacebook = async (res) => {
        dispatch(setUserInfoByDispatch(res))
        dispatch(setJwtTokenByDispatch(res))
        if (res?.status !== 'unknown') {
            const tempValue = {
                email: res?.email,
                token: res?.accessToken,
                unique_id: res?.id,
                medium: 'facebook',
                phone: res?.phone,
                login_type: 'social',
                guest_id: getGuestId(),
            }
            setLoginValue(tempValue)
            await mutate(tempValue, {
                onSuccess: (res) =>
                    handlePostRequestOnSuccess({
                        ...res,
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
    }

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
    const { t } = useTranslation()
    return (
        <Stack width={'100%'} maxWidth="355px" justifyContent="center">
            <FacebookLogin
                appId={appId}
                autoLoad={false}
                fields="name,email,picture"
                onSuccess={responseFacebook}
                render={(renderProps) => (
                    <div
                        style={{ cursor: 'pointer', width: '100%' }}
                        onClick={renderProps.onClick}
                    >
                        <Stack
                            alignItems="center"
                            sx={{
                                width: '100%',
                                backgroundColor: theme.palette.neutral[100],
                                height: '45px',
                                justifyContent: 'center',
                                borderRadius: '10px',
                                padding: '10px',
                                color: theme.palette.neutral[600],
                                boxShadow: `0px 2px 3px 0px rgba(0, 0, 0, 0.17), 0px 0px 3px 0px rgba(0, 0, 0, 0.08)`,
                                //maxWidth: '355px',

                                transition: 'box-shadow 0.3s',
                                '&:hover': {
                                    boxShadow: `0px 5px 10px 0px rgba(0, 0, 0, 0.3), 0px 2px 5px 0px rgba(0, 0, 0, 0.15)`,
                                },
                            }}
                        >
                            <CustomStackFullWidth
                                direction="row"
                                alignItems="center"
                                justifyContent="center"
                                spacing={2}
                            >
                                <CustomImageContainer
                                    src={facebookLatest.src}
                                    alt="facebook"
                                    height="24px"
                                    width="24px"
                                    objectFit="cover"
                                    borderRadius="50%"
                                />
                                <CustomColouredTypography
                                    sx={{
                                        color: theme.palette.neutral[600],
                                        fontWeight: '600',
                                        fontSize: '14px',
                                    }}
                                >
                                    {t('Continue with Facebook')}
                                </CustomColouredTypography>
                            </CustomStackFullWidth>
                        </Stack>
                    </div>
                )}
            />

            <CustomModal
                openModal={openOtpModal}
                setModalOpen={setOpenOtpModal}
            >
                <OtpForm
                    data={otpData?.phone}
                    formSubmitHandler={formSubmitHandler}
                    isLoading={isLoading}
                    reSendOtp={responseFacebook}
                    loginValue={loginValue}
                />
            </CustomModal>
        </Stack>
    )
}

FbLoginComp.propTypes = {}

export default FbLoginComp
