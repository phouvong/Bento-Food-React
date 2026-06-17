import { useMutation, UseMutationResult } from 'react-query'
import MainApi from '@/api/MainApi'

export interface ReelActionArgs {
    reelId: number
    guestId?: string | null
}

interface LikePayload {
    reel_id: number
    guest_id?: string
}

const postLike = async ({ reelId, guestId }: ReelActionArgs): Promise<unknown> => {
    const body: LikePayload = { reel_id: reelId }
    if (guestId) body.guest_id = guestId
    const { data } = await MainApi.post('/api/v1/customer/reels/like', body)
    return data
}

export default function usePostReelLike(): UseMutationResult<
    unknown,
    unknown,
    ReelActionArgs
> {
    return useMutation('reels-like', postLike)
}
