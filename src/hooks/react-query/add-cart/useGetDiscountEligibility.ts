import { useQuery, UseQueryResult } from 'react-query'
import MainApi from '@/api/MainApi'
import {
    getGuestId,
    getToken,
} from '@/components/checkout-page/functions/getGuestUserId'

export interface DiscountEligibility {
    source: 'happy_hour' | 'restaurant_discount' | null
    percentage: number
    min_purchase: number
    max_discount: number | null
    qualifying_amount: number
    shortfall: number
    is_qualified: boolean
    discount_amount: number
}

const getDiscountEligibility = async (
    restaurantId: number | string
): Promise<DiscountEligibility> => {
    const guestParam = !getToken() ? `&guest_id=${getGuestId()}` : ''
    const { data } = await MainApi.get(
        `/api/v1/customer/cart/discount-eligibility?restaurant_id=${restaurantId}${guestParam}`
    )
    return data
}

export default function useGetDiscountEligibility(
    restaurantId?: number | string,
    cartSubtotal = 0
): UseQueryResult<DiscountEligibility> {
    return useQuery(
        ['cart-discount-eligibility', restaurantId, cartSubtotal],
        () => getDiscountEligibility(restaurantId as number | string),
        {
            enabled: Boolean(restaurantId) && Number(cartSubtotal) > 0,
            refetchOnWindowFocus: false,
            retry: false,
            onError: () => {},
        }
    )
}
