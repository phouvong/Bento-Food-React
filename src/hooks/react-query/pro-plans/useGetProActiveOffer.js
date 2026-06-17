import { useQuery } from 'react-query'
import { useSelector } from 'react-redux'
import { onErrorResponse } from '@/components/ErrorResponse'
import MainApi from '../../../api/MainApi'

const getProActiveOffer = async () => {
    const { data } = await MainApi.get(
        `/api/v1/customer/pro-customer/active-offer`
    )
    return data
}

export default function useGetProActiveOffer({ enabled = true } = {}) {
    // Scope the cache to the auth token so each user gets their own
    // entry. Without this, switching users would return the previous
    // account's cached plan while the background refetch ran.
    const token = useSelector((s) => s?.userToken?.token) || 'anon'
    return useQuery(
        ['pro-customer-active-offer', token],
        getProActiveOffer,
        {
            enabled,
            onError: onErrorResponse,
            staleTime: 5 * 60 * 1000,
            cacheTime: Infinity,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        }
    )
}
