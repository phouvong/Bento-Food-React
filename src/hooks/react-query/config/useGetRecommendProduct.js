import { useQuery } from 'react-query'

import MainApi from '../../../api/MainApi'
import { onSingleErrorResponse } from '@/components/ErrorResponse'

export const getData = async (pageParams) => {
    const { restaurantId, page_limit, offset, searchKey, filterByData, price: priceRange } = pageParams

    const ratingValue = Number(filterByData?.rating || 0)
    const filterByValues = Array.from(new Set([
        filterByData?.veg ? 'veg' : null,
        filterByData?.non_veg ? 'non_veg' : null,
        filterByData?.popular ? 'popular' : null,
        filterByData?.free_delivery ? 'free_delivery' : null,
        filterByData?.discounted ? 'discounted' : null,
        filterByData?.new ? 'new_arrivals' : null,
        filterByData?.halal ? 'halal' : null,
        filterByData?.currently_available ? 'currently_available' : null,
    ].filter(Boolean)))

    const params = new URLSearchParams()
    params.set('restaurant_id', restaurantId)
    params.set('name', searchKey || '')
    params.set('limit', page_limit)
    params.set('offset', offset)
    params.set('sort_by', filterByData?.sort_by || '')
    params.set('rating_1_plus', ratingValue === 1 ? 1 : 0)
    params.set('rating_2_plus', ratingValue === 2 ? 1 : 0)
    params.set('rating_3_plus', ratingValue === 3 ? 1 : 0)
    params.set('rating_4_plus', ratingValue === 4 ? 1 : 0)
    params.set('rating_5', ratingValue === 5 ? 1 : 0)
    params.set('price', JSON.stringify(Array.isArray(priceRange) ? priceRange : []))
    filterByValues.forEach((value) => params.append('filter_by[]', value))

    const { data } = await MainApi.get(`api/v1/products/recommended?${params.toString()}`)
    return data
}
export const useGetRecommendProducts = (pageParams) => {
    return useQuery('recommend-products', () => getData(pageParams), {
        enabled: false,
        onError: onSingleErrorResponse,
    })
}
