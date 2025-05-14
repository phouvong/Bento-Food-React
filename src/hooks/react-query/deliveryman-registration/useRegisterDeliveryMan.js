import MainApi from '@/api/MainApi'

import { useMutation } from 'react-query'

const postHandler = async (info) => {
    const { data } = await MainApi.post(`/api/v1/auth/delivery-man/store`, info)
    return data
}
export const usePostDeliveryManRegisterInfo = () => {
    return useMutation('deliveryman_post_request', postHandler)
}
