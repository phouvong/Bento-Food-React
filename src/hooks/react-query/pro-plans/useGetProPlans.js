import { useQuery } from 'react-query'
import { onErrorResponse } from '@/components/ErrorResponse'
import MainApi from '../../../api/MainApi'

const getProPlans = async () => {
    const { data } = await MainApi.get(`/api/v1/pro-customer/plans`)
    return data
}

export default function useGetProPlans() {
    return useQuery('pro-customer-plans', getProPlans, {
        onError: onErrorResponse,
        staleTime: 5 * 60 * 1000,
    })
}
