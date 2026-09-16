import { useQuery } from 'react-query'

import MainApi from '../../../api/MainApi'
import { onErrorResponse } from '@/components/ErrorResponse'
import { getGuestId } from '@/components/checkout-page/functions/getGuestUserId'

const getData = async (restaurantId, { limit = 50, offset = 1 } = {}) => {
    const { data } = await MainApi.get('/api/v1/restaurants/bogo-offers', {
        params: {
            restaurant_id: restaurantId,
            limit,
            offset,
            guest_id: getGuestId(),
        },
    })
    return data
}

export const useGetRestaurantBogoOffers = (
    restaurantId,
    pageParams,
    { enabled = true } = {}
) => {
    return useQuery(
        ['restaurant-bogo-offers', restaurantId, pageParams],
        () => getData(restaurantId, pageParams),
        {
            enabled: Boolean(restaurantId) && enabled,
            onError: onErrorResponse,
        }
    )
}
