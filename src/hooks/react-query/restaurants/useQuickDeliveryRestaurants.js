import { useQuery } from 'react-query'
import MainApi from '../../../api/MainApi'
import { onErrorResponse } from '@/components/ErrorResponse'

const QUICK_DELIVERY_LIMIT = 10

const fetchQuickDeliveryRestaurants = async () => {
    const { data } = await MainApi.get(
        `/api/v1/restaurants/get-restaurants/all?offset=1&limit=${QUICK_DELIVERY_LIMIT}&sort_by=fast_delivery&order_type=delivery`
    )
    return data
}

export const useQuickDeliveryRestaurants = () => {
    return useQuery(
        ['quick-delivery-restaurants'],
        fetchQuickDeliveryRestaurants,
        { enabled: false, onError: onErrorResponse }
    )
}
