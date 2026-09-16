import { useInfiniteQuery } from 'react-query'
import { ProductsApi } from '@/hooks/react-query/config/productsApi'
import { onSingleErrorResponse } from '@/components/ErrorResponse'

// productSearch caps every non-product search type at 20 server-side, so the
// page size is pinned here to keep the offset maths honest for both types.
export const SEARCH_PAGE_LIMIT = 20

// Each page is normalised to { items, totalSize } so callers don't have to care
// that products come back as `{ products }` while restaurants arrive either as
// `{ restaurants }` or as a bare array.
const fetchSearchPage = async ({
    searchType,
    searchValue,
    offset,
    pageLimit,
    filterData,
}) => {
    const res = await ProductsApi.productSearch(
        searchType,
        searchValue,
        offset,
        pageLimit,
        filterData
    )
    const payload = res?.data
    const items = Array.isArray(payload)
        ? payload
        : payload?.[searchType === 'products' ? 'products' : 'restaurants'] ??
          []

    return { items, totalSize: Number(payload?.total_size ?? 0) }
}

// searchType is the API path segment: 'products' for foods, 'restaurants' for
// stores. The query key deliberately excludes the active tab so the All tab and
// the Foods/Restaurants tabs share one cache entry — switching tabs reuses the
// already-fetched first page instead of refetching.
export const useProductSearch = ({
    searchType,
    searchValue,
    pageLimit = SEARCH_PAGE_LIMIT,
    filterData,
    enabled = true,
}) => {
    const effectiveLimit =
        searchType === 'products' ? pageLimit : SEARCH_PAGE_LIMIT

    return useInfiniteQuery(
        ['product-search', searchType, searchValue, pageLimit, filterData],
        ({ pageParam = 1 }) =>
            fetchSearchPage({
                searchType,
                searchValue,
                offset: pageParam,
                pageLimit,
                filterData,
            }),
        {
            getNextPageParam: (lastPage, allPages) => {
                if (!lastPage?.items?.length) return undefined
                // A short page means the server has nothing left to give —
                // the only reliable signal when total_size is absent.
                if (lastPage.items.length < effectiveLimit) return undefined
                const loaded = allPages.reduce(
                    (sum, page) => sum + (page?.items?.length || 0),
                    0
                )
                if (lastPage.totalSize && loaded >= lastPage.totalSize) {
                    return undefined
                }
                return allPages.length + 1
            },
            enabled: enabled && Boolean(searchValue),
            // Tab switches flip `enabled` back on for a query that already ran
            // on the All tab; without a stale window that would refire the
            // identical request, which is exactly what sharing the cache key is
            // meant to avoid.
            staleTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
            onError: onSingleErrorResponse,
        }
    )
}
