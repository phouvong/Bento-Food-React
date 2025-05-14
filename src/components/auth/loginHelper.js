import { ACTIONS } from '@/components/auth/states'

export const getActiveLoginStatus = (state, setForWidth, loginDispatch) => {
    const { otp, manual, social } = state.activeLoginType
    let newStatus

    switch (true) {
        case otp && manual && social:
            newStatus = 'all'
            setForWidth(true)
            break
        case otp && manual:
            newStatus = 'otp_manual'
            setForWidth(false)
            break
        case otp && social:
            newStatus = 'otp_social'
            setForWidth(false)
            break
        case manual && social:
            newStatus = 'manual_social'
            setForWidth(true)
            break
        case otp:
            newStatus = 'otp'
            setForWidth(false)
            break
        case manual:
            newStatus = 'manual'
            setForWidth(false)
            break
        case social:
            newStatus = 'social'
            setForWidth(false)
            break
        default:
            newStatus = 'manual'
    }
    loginDispatch({
        type: ACTIONS.setStatus,
        payload: newStatus,
    })
}

export const getLoginUserCheck = (
    response,
    data,
    handleTokenAfter,
    setOtpData,
    setMainToken,
    sendOTP,
    global
) => {
    const isPhoneVerified =
        Number.parseInt(response?.data?.is_phone_verified) === 1
    const isEmailVerified =
        Number.parseInt(response?.data?.is_email_verified) === 1

    if (isPhoneVerified && isEmailVerified) {
        handleTokenAfter(response?.data)
    } else {
        if (!isPhoneVerified && !isEmailVerified) {
            setOtpData({
                ...response?.data,
                type: data?.phone,
                verification_type: 'phone',
            })
        } else if (!isEmailVerified) {
            setOtpData({
                ...response?.data,
                type: data?.email,
                verification_type: 'email',
            })
        } else if (!isPhoneVerified) {
            if (global?.firebase_otp_verification === 1) {
                sendOTP(response, setOtpData, setMainToken, data?.phone)
            } else {
                setOtpData({
                    ...response?.data,
                    type: data?.phone,
                    verification_type: 'phone',
                })
            }
        }
        setMainToken(response)
    }
}
