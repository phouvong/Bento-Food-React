import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query'
import MainApi from '@/api/MainApi'
import { onSingleErrorResponse } from '@/components/ErrorResponse'

// All fields optional — backend exposes the like flag at any of `is_liked`,
// `liked`, or `stats.is_liked`, and likewise for view/like counts.
export interface ReelStatsResponse {
    is_liked?: boolean
    liked?: boolean
    total_likes?: number
    total_views?: number
    stats?: {
        is_liked?: boolean
        total_likes?: number
        total_views?: number
    }
}

const getData = async (
    reelId: number,
    guestId?: string | null
): Promise<ReelStatsResponse> => {
    const guestParam = guestId ? `&guest_id=${guestId}` : ''
    const { data } = await MainApi.get<ReelStatsResponse>(
        `/api/v1/customer/reels/stats?reel_id=${reelId}${guestParam}`
    )
    return data
}

export default function useGetReelsStats(
    reelId: number | null,
    options: Partial<UseQueryOptions<ReelStatsResponse>> = {},
    guestId?: string | null
): UseQueryResult<ReelStatsResponse> {
    return useQuery<ReelStatsResponse>(
        ['reels-stats', reelId, guestId],
        () => getData(reelId as number, guestId),
        {
            enabled: !!reelId,
            staleTime: 5 * 60 * 1000,
            onError: onSingleErrorResponse,
            ...options,
        }
    )
}
