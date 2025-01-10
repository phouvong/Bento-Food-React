import { useMutation } from 'react-query'
import MainApi from '@/api/MainApi'

const sendOtp = async (otpData) => {
    const { data } = await MainApi.post(
        '/api/v1/auth/firebase-verify-token',
        otpData
    )
    return data
}
export const useFireBaseOtpVerify = () => {
    return useMutation('firebase_otp', sendOtp)
}
