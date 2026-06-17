import { useQuery, UseQueryResult } from 'react-query'

import MainApi from '../../../api/MainApi'
import { onSingleErrorResponse } from '@/components/ErrorResponse'

// FilterByData mirrors the shape used by the rest of the screen
// (RestaurantDetails builds this object from `checkedFilterKey`). Keeping it
// here as a local type avoids a project-wide refactor.
type FilterByData = {
    veg?: boolean
    non_veg?: boolean
    popular?: boolean
    free_delivery?: boolean
    discounted?: boolean
    new?: boolean
    halal?: boolean
    currently_available?: boolean
    sort_by?: string
    rating?: number
}

type Params = {
    restaurantId: number | string | undefined
    searchKey?: string
    filterByData?: FilterByData
    price?: number[]
}

// Category is a thin shape — id/name are all we use downstream. The backend
// returns more fields, so unknown extras are allowed via `[key: string]: unknown`.
type Category = { id: number | string; name: string; [key: string]: unknown }

// <T> is the food record type. It defaults to `unknown` so JS callers don't
// have to specify it, but TS callers can pass their food shape for inference
// on `category_wise_foods[id]`.
export type RestaurantCategoriesFoodsResponse<T = unknown> = {
    total_size: number
    limit: number
    offset: number
    categories: Category[]
    category_wise_foods: Record<string, T[]>
}

const buildQuery = ({ restaurantId, searchKey, filterByData, price }: Params): string => {
    const ratingValue = Number(filterByData?.rating || 0)
    const filterByValues = Array.from(
        new Set(
            [
                filterByData?.veg ? 'veg' : null,
                filterByData?.non_veg ? 'non_veg' : null,
                filterByData?.popular ? 'popular' : null,
                filterByData?.free_delivery ? 'free_delivery' : null,
                filterByData?.discounted ? 'discounted' : null,
                filterByData?.new ? 'new_arrivals' : null,
                filterByData?.halal ? 'halal' : null,
                filterByData?.currently_available ? 'currently_available' : null,
            ].filter(Boolean)
        )
    )

    const params = new URLSearchParams()
    params.set('restaurant_id', String(restaurantId ?? ''))
    params.set('name', searchKey || '')
    params.set('sort_by', filterByData?.sort_by || '')
    params.set('rating_1_plus', ratingValue === 1 ? '1' : '0')
    params.set('rating_2_plus', ratingValue === 2 ? '1' : '0')
    params.set('rating_3_plus', ratingValue === 3 ? '1' : '0')
    params.set('rating_4_plus', ratingValue === 4 ? '1' : '0')
    params.set('rating_5', ratingValue === 5 ? '1' : '0')
    params.set('price', JSON.stringify(Array.isArray(price) ? price : []))
    filterByValues.forEach((value) => params.append('filter_by[]', String(value)))

    return params.toString()
}

const fetchRestaurantCategoriesFoods = async <T,>(
    params: Params
): Promise<RestaurantCategoriesFoodsResponse<T>> => {
    const qs = buildQuery(params)
    const { data } = await MainApi.get(`api/v1/restaurant-categories/foods?${qs}`)
    return data as RestaurantCategoriesFoodsResponse<T>
}

// Generic <T> flows through to the returned `category_wise_foods` map so a
// caller that knows its food type can avoid `unknown` casts at the call site.
export const useRestaurantCategoriesFoods = <T = unknown>(
    params: Params
): UseQueryResult<RestaurantCategoriesFoodsResponse<T>> => {
    const { restaurantId, searchKey, filterByData, price } = params
    return useQuery<RestaurantCategoriesFoodsResponse<T>>(
        [
            'restaurant-categories-foods',
            restaurantId,
            searchKey,
            JSON.stringify(filterByData),
            (price || []).join('-'),
        ],
        () => fetchRestaurantCategoriesFoods<T>(params),
        {
            enabled: !!restaurantId,
            keepPreviousData: true,
            onError: onSingleErrorResponse,
        }
    )
}
