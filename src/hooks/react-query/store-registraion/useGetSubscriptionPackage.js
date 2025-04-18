import { useQuery } from 'react-query'
import { onSingleErrorResponse } from '@/components/ErrorResponse'
import MainApi from '@/api/MainApi'

const getData = async (selectedPlan) => {
    const { data } = await MainApi.get(`/api/v1/vendor/package-view`)
    return data
}

export default function useGetSubscriptionPackage(selectedPlan) {
    return useQuery(['store-details'], () => getData(), {
        onError: onSingleErrorResponse,
    })
}
