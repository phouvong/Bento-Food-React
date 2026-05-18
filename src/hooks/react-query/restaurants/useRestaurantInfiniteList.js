import { useInfiniteQuery } from 'react-query'

import MainApi from '../../../api/MainApi'
import { onErrorResponse } from '@/components/ErrorResponse'

const fetchRestaurantsPage = async ({
    offset,
    pageLimit,
    filterType,
    searchKey,
    filterByData,
}) => {
    const url =
        `/api/v1/restaurants/get-restaurants/all` +
        `?offset=${offset}` +
        `&limit=${pageLimit}` +
        `&filter_data=${filterType}` +
        `&name=${searchKey}` +
        `&veg=${filterByData?.veg ? 1 : 0}` +
        `&discount=${filterByData?.discount ? 1 : 0}` +
        `&non_veg=${filterByData?.non_veg ? 1 : 0}` +
        `&top_rated=${filterByData?.top_rated ? 1 : 0}`
    const { data } = await MainApi.get(url)
    return data
}

export const useRestaurantInfiniteList = ({
    filterByData,
    filterType,
    searchKey,
    pageLimit = 20,
}) => {
    return useInfiniteQuery(
        [
            'restaurant-infinite-list',
            filterType,
            searchKey,
            filterByData,
            pageLimit,
        ],
        ({ pageParam = 1 }) =>
            fetchRestaurantsPage({
                offset: pageParam,
                pageLimit,
                filterType,
                searchKey,
                filterByData,
            }),
        {
            getNextPageParam: (lastPage, allPages) => {
                const totalSize = lastPage?.total_size ?? 0
                const loadedCount = allPages.reduce(
                    (sum, page) => sum + (page?.restaurants?.length || 0),
                    0
                )
                if (
                    !lastPage?.restaurants?.length ||
                    loadedCount >= totalSize
                ) {
                    return undefined
                }
                return allPages.length + 1
            },
            staleTime: 0,
            retry: 1,
            refetchOnWindowFocus: false,
            keepPreviousData: false,
            onError: onErrorResponse,
        }
    )
}
