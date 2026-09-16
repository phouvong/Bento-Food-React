import { useQuery } from 'react-query'

import MainApi from '../../../api/MainApi'
import { onSingleErrorResponse } from '@/components/ErrorResponse'

export const getData = async (pageParams) => {
    const { restaurantId, searchKey, filterByData, price: priceRange } =
        pageParams

    const ratingValue = Number(filterByData?.rating || 0)
    // The endpoint takes veg/non_veg through `type` (not filter_by[]);
    // both or neither collapse to 'all'.
    const type =
        filterByData?.veg && !filterByData?.non_veg
            ? 'veg'
            : filterByData?.non_veg && !filterByData?.veg
              ? 'non_veg'
              : 'all'
    const priceList = Array.isArray(priceRange) ? priceRange : []
    const filterByValues = [
        filterByData?.popular ? 'popular' : null,
        filterByData?.free_delivery ? 'free_delivery' : null,
        filterByData?.discounted ? 'discounted' : null,
        filterByData?.new ? 'new_arrivals' : null,
        filterByData?.halal ? 'halal' : null,
        filterByData?.currently_available ? 'currently_available' : null,
    ].filter(Boolean)

    const params = new URLSearchParams()
    params.set('restaurant_id', restaurantId)
    params.set('type', type)
    params.set('name', searchKey || '')
    params.set('sort_by', filterByData?.sort_by || '')
    params.set('rating', ratingValue)
    params.set('rating_1_plus', ratingValue === 1 ? 1 : 0)
    params.set('rating_2_plus', ratingValue === 2 ? 1 : 0)
    params.set('rating_3_plus', ratingValue === 3 ? 1 : 0)
    params.set('rating_4_plus', ratingValue === 4 ? 1 : 0)
    params.set('rating_5', ratingValue === 5 ? 1 : 0)
    params.set('price', JSON.stringify(priceList))
    params.set('min_price', priceList[0] ?? '')
    params.set('max_price', priceList[1] ?? '')
    params.set('halal', filterByData?.halal ? 1 : 0)
    filterByValues.forEach((value) => params.append('filter_by[]', value))

    const { data } = await MainApi.get(
        `api/v1/products/restaurant-popular-products?${params.toString()}`
    )
    // The endpoint returns a bare array — normalize to the { products }
    // envelope every existing consumer reads.
    return { products: Array.isArray(data) ? data : data?.products ?? [] }
}
export const useGetRecommendProducts = (pageParams) => {
    return useQuery('restaurant-popular-products', () => getData(pageParams), {
        enabled: false,
        onError: onSingleErrorResponse,
    })
}
