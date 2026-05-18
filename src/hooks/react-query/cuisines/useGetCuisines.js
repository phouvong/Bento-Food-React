import MainApi from '../../../api/MainApi'
import { useQuery } from 'react-query'
import { onSingleErrorResponse } from '@/components/ErrorResponse'

export const getData = async (searchKey) => {
    if (searchKey && searchKey !== '') {
        const encodedSearchKey = encodeURIComponent(searchKey)
        const { data } = await MainApi.get(
            `/api/v1/cuisine?name=${encodedSearchKey}`
        )
        return data
    }
    const { data } = await MainApi.get('/api/v1/cuisine')
    return data
}

export const useGetCuisines = (params = {}) => {
    const normalizedParams =
        typeof params === 'function' ? { handleSuccess: params } : params
    const { searchKey = '', handleSuccess } = normalizedParams

    return useQuery(['cuisines-list', searchKey], () => getData(searchKey), {
        enabled: false,
        onError: onSingleErrorResponse,
        onSuccess: handleSuccess,
        staleTime: 1000 * 60 * 8,
        cacheTime: 8 * 60 * 1000,
    })
}
