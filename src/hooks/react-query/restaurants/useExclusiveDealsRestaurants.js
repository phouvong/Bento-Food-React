import { useQuery } from 'react-query'
import { RestaurantsApi } from '../config/restaurantApi'
import { onErrorResponse } from '@/components/ErrorResponse'

export const useExclusiveDealsRestaurants = ({ limit = 20, enabled = true } = {}) => {
    return useQuery(
        ['exclusive-deals-restaurants', limit],
        () => RestaurantsApi.exclusiveDeals({ limit }),
        {
            enabled,
            staleTime: 1000 * 60 * 5,
            retry: 1,
            refetchOnWindowFocus: false,
            select: (res) => res?.data?.restaurants ?? [],
            onError: onErrorResponse,
        }
    )
}
