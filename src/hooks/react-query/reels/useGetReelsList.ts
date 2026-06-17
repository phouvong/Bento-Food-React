import { useQuery, UseQueryResult } from 'react-query'
import MainApi from '@/api/MainApi'
import { onSingleErrorResponse } from '@/components/ErrorResponse'

// Loosely-typed Reel shape — the backend payload varies (stats may live at
// `stats.total_views` or `total_views`), so every numeric field is optional.
// Stackfood's backend uses `restaurant_*` field names (single-module, food
// only). The 6amMart source used `store_*` prefixes since it's multi-module.
export interface Reel {
    reel_id: number
    food_id?: number | string
    thumbnail_full_url?: string
    restaurant_logo_full_url?: string
    restaurant_name?: string
    restaurant_id?: number | string
    restaurant_slug?: string
    restaurant_verified?: boolean | number
    store_verified?: boolean | number
    verified_seller?: boolean | number
    description?: string
    stats?: {
        total_views?: number
        total_likes?: number
        is_liked?: boolean
    }
}

export interface ReelsListResponse {
    reels?: Reel[]
    total_size?: number | string
}

export interface ReelsListParams {
    limit?: number
    offset?: number
    guest_id?: string | null
}

const getData = async ({
    limit = 10,
    offset = 1,
    guest_id,
}: ReelsListParams = {}): Promise<ReelsListResponse> => {
    const guestParam = guest_id ? `&guest_id=${guest_id}` : ''
    const { data } = await MainApi.get<ReelsListResponse>(
        `/api/v1/customer/reels/list?limit=${limit}&offset=${offset}${guestParam}`
    )
    return data
}

export default function useGetReelsList(
    handleSuccess: (data: ReelsListResponse) => void,
    params: ReelsListParams
): UseQueryResult<ReelsListResponse> {
    return useQuery<ReelsListResponse>(
        ['reels-list', params],
        () => getData(params),
        {
            onSuccess: handleSuccess,
            enabled: false,
            onError: onSingleErrorResponse,
        }
    )
}
