import { useMutation } from 'react-query'

import MainApi from '@/api/MainApi'

const postData = async (businessData) => {
    const { data: responseData } = await MainApi.post(
        `/api/v1/vendor/business_plan`,
        businessData
    )
    return responseData
}

export const usePostBusiness = () => {
    return useMutation('store-business', postData)
}
