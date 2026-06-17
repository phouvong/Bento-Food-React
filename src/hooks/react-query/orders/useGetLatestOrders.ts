import { useQuery, UseQueryResult } from 'react-query'
import MainApi from '@/api/MainApi'
import { onSingleErrorResponse } from '@/components/ErrorResponse'

export interface LatestOrderRestaurant {
    id: number
    name?: string
    slug?: string
    logo_full_url?: string | null
    // Backend may surface verification under either name; accept both.
    verified?: boolean | number
    verified_seller?: boolean | number
}

export interface LatestOrder {
    id: number
    created_at?: string
    order_amount?: number | string
    total_item_count?: number
    item_images?: string[]
    restaurant?: LatestOrderRestaurant
    // The list endpoint doesn't return zone_id directly; the reorder flow
    // pulls it from the order details fetch. Kept optional in case the
    // backend starts surfacing it on the summary.
    zone_id?: number | string
    // True when the order was placed from a time-limited campaign item.
    // Reorder is hidden in that case because the underlying campaign may
    // no longer be active. `boolean | number` mirrors the backend's
    // 0/1 vs true/false inconsistency seen on `verified`.
    campaign?: boolean | number
}

export interface LatestOrdersResponse {
    total_size?: number
    limit?: string | number
    offset?: string | number
    orders?: LatestOrder[]
}

export interface LatestOrdersParams {
    limit?: number
    offset?: number
    // When provided, the backend filters orders to this restaurant only.
    // Used by the restaurant details page; the home section omits it.
    restaurantId?: number | string
    enabled?: boolean
}

const getLatestOrders = async ({
    limit = 20,
    offset = 1,
    restaurantId,
}: Omit<LatestOrdersParams, 'enabled'>): Promise<LatestOrdersResponse> => {
    const restaurantParam =
        restaurantId != null ? `&restaurant_id=${restaurantId}` : ''
    const { data } = await MainApi.get<LatestOrdersResponse>(
        `/api/v1/customer/order/get-latest-list?limit=${limit}&offset=${offset}${restaurantParam}`
    )
    return data
}

export default function useGetLatestOrders({
    limit = 20,
    offset = 1,
    restaurantId,
    enabled = true,
}: LatestOrdersParams = {}): UseQueryResult<LatestOrdersResponse> {
    return useQuery<LatestOrdersResponse>(
        // restaurantId is part of the key so per-restaurant results don't
        // collide with the home-page query in the cache.
        ['latest-orders', limit, offset, restaurantId ?? null],
        () => getLatestOrders({ limit, offset, restaurantId }),
        {
            enabled,
            onError: onSingleErrorResponse,
            staleTime: 60 * 1000,
        }
    )
}
