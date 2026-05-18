import MainApi from '../../../api/MainApi'
import { useQuery } from 'react-query'
import { onSingleErrorResponse } from '@/components/ErrorResponse'

export const getData = async (params) => {
    const {
        id,
        page_limit,
        offset,
        filterByData = {},
        priceAndRating = {},
        filterBy = [],
        searchKey = '',
    } = params

    const urlParams = new URLSearchParams()
    const cuisineIds = Array.isArray(id) ? id : [id]
    cuisineIds.forEach((cuisineId) => urlParams.append('cuisine[]', cuisineId))
    urlParams.set('limit', page_limit)
    urlParams.set('offset', offset)

    if (searchKey) urlParams.set('name', searchKey)
    if (filterByData?.sort_by) urlParams.set('sort_by', filterByData.sort_by)
    if (filterByData?.veg) urlParams.set('veg', 1)
    if (filterByData?.non_veg) urlParams.set('non_veg', 1)
    if (filterByData?.delivery) urlParams.set('delivery', 1)
    if (filterByData?.take_away) urlParams.set('takeaway', 1)
    if (filterByData?.dine_in) urlParams.set('filter_data', 'dine_in')
    if (filterByData?.discount) urlParams.set('discounted', 1)
    if (filterByData?.popular) urlParams.set('popular', 1)
    if (filterByData?.new) urlParams.set('new', 1)
    if (filterByData?.free_delivery) urlParams.set('free_delivery', 1)
    const ratingValue = Number(filterByData?.rating || priceAndRating?.rating || 0)
    urlParams.set('rating_1_plus', ratingValue === 1 ? 1 : 0)
    urlParams.set('rating_2_plus', ratingValue === 2 ? 1 : 0)
    urlParams.set('rating_3_plus', ratingValue === 3 ? 1 : 0)
    urlParams.set('rating_4_plus', ratingValue === 4 ? 1 : 0)
    urlParams.set('rating_5', ratingValue === 5 ? 1 : 0)
    if (Array.isArray(filterBy)) {
        filterBy.forEach((item) => urlParams.append('filter_by[]', item))
    }

    const { data } = await MainApi.get(
        `/api/v1/cuisine/get_restaurants?${urlParams.toString()}`
    )
    return data
}

export const useGetCuisinesDetails = (params) => {
    const {
        id,
        page_limit,
        offset,
        filterByData,
        priceAndRating,
        filterBy,
        searchKey,
    } = params

    return useQuery(
        [
            'cuisines-Details',
            id,
            page_limit,
            offset,
            filterByData,
            priceAndRating?.rating,
            filterBy?.join(','),
            searchKey,
        ],
        () => getData(params),
        {
            enabled: !!id,
            onError: onSingleErrorResponse,
        }
    )
}
