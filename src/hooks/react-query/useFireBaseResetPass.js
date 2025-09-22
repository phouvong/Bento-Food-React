import { useMutation } from 'react-query'
import MainApi from '@/api/MainApi'

const sendOtp = async (otpData) => {
    const { data } = await MainApi.put(
        '/api/v1/auth/firebase-reset-password',
        otpData
    )
    return data
}
export const useFireBaseResetPass = () => {
    return useMutation('firebase_otp_reset', sendOtp)
}
