import MainApi from '../../../api/MainApi'
import { useQuery } from 'react-query'
import { onSingleErrorResponse } from '@/components/ErrorResponse'

export const getData = async (params) => {
    const { id, campaign, page_limit, offset } = params
    const tempUrl = campaign
        ? `/api/v1/products/details/${id}?campaign=${campaign}`
        : `/api/v1/products/details/${id}`
    const { data } = await MainApi.get(`${tempUrl}`)
    return data
}

export const useGetFoodDetails = (params, itemSuccess,productUpdate) => {
    // Create a query key that includes the relevant parameters
    const queryKey = ['food-Details', params.id, params.campaign]

    return useQuery(queryKey, () => getData(params), {
        enabled: !productUpdate,
        onSuccess: itemSuccess,
        onError: onSingleErrorResponse,
        retry: false,
        cacheTime: 30000,
        staleTime: 30000,
        // This forces React Query to respect the cache duration even with refetch
        // refetchOnMount: false,
        // refetchOnWindowFocus: false,
        // refetchOnReconnect: false,
    })
}