import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query'
import MainApi from '@/api/MainApi'
import { onSingleErrorResponse } from '@/components/ErrorResponse'

// Permissive shape — the modal reads several alternative field names so we
// just expose them all as optional rather than committing to one path.
export interface ReelDetailsResponse {
    stats?: {
        total_likes?: number
        total_views?: number
    }
    like_count?: number
}

const getData = async (
    reelId: number,
    guestId?: string | null
): Promise<ReelDetailsResponse> => {
    const guestParam = guestId ? `&guest_id=${guestId}` : ''
    const { data } = await MainApi.get<ReelDetailsResponse>(
        `/api/v1/customer/reels/details?reel_id=${reelId}&stream=1${guestParam}`,
        { headers: { Range: 'bytes=0-2097151' } }
    )
    return data
}

export default function useGetReelsDetails(
    reelId: number | null,
    options: Partial<UseQueryOptions<ReelDetailsResponse>> = {},
    guestId?: string | null
): UseQueryResult<ReelDetailsResponse> {
    return useQuery<ReelDetailsResponse>(
        ['reels-details', reelId, guestId],
        () => getData(reelId as number, guestId),
        {
            enabled: !!reelId,
            onError: onSingleErrorResponse,
            ...options,
        }
    )
}
