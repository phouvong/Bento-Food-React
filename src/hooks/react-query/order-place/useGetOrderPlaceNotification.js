import MainApi from '../../../api/MainApi'
import { useQuery } from 'react-query'
import {
    getGuestId,
    getToken,
} from '@/components/checkout-page/functions/getGuestUserId'

export const getData = async (orderId) => {
    if (orderId) {
        const params = !getToken() ? `?guest_id=${getGuestId()}` : ''
        const { data } = await MainApi.get(
            `/api/v1/customer/order/send-notification/${orderId}${params}`
        )
        return data
    }
}
export const useGetOrderPlaceNotification = (orderId) => {
    return useQuery('api-for-notification-count', () => getData(orderId), {})
}
