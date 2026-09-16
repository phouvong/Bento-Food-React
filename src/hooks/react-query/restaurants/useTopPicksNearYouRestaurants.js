import { useQuery } from 'react-query'
import MainApi from '../../../api/MainApi'
import { onErrorResponse } from '@/components/ErrorResponse'

const TOP_PICKS_LIMIT = 20

const fetchTopPicksNearYouRestaurants = async () => {
    const params = new URLSearchParams()
    params.set('filter_data', 'near_by_restaurants')
    params.append('filter_by[]', 'popular')
    params.set('offset', 1)
    params.set('limit', TOP_PICKS_LIMIT)

    const { data } = await MainApi.get(
        `/api/v1/restaurants/get-restaurants/all?${params.toString()}`
    )
    return data
}

export const useTopPicksNearYouRestaurants = () => {
    return useQuery(
        ['top-picks-near-you-restaurants'],
        fetchTopPicksNearYouRestaurants,
        {
            refetchOnMount: 'always',
            refetchOnWindowFocus: false,
            onError: onErrorResponse,
        }
    )
}
