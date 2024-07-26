import MainApi from '@/api/MainApi'
import { onSingleErrorResponse } from '@/components/ErrorResponse'
import { useQuery } from 'react-query'

const getData = async () => {
    const { data } = await MainApi.get('/api/v1/cashback/list')
    return data
}

export default function useGetCashbackList(handleSuccess) {
    return useQuery('cashback', () => getData(), {
        enabled: false,
        staleTime: 10000,
        cacheTime: 5000,
        onSuccess: handleSuccess,
        onError: onSingleErrorResponse,
    })
}
