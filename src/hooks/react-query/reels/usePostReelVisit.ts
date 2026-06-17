import { useMutation, UseMutationResult } from 'react-query'
import MainApi from '@/api/MainApi'
import type { ReelActionArgs } from './usePostReelLike'

interface VisitPayload {
    reel_id: number
    guest_id?: string
}

const postVisit = async ({
    reelId,
    guestId,
}: ReelActionArgs): Promise<unknown> => {
    const body: VisitPayload = { reel_id: reelId }
    if (guestId) body.guest_id = guestId
    const { data } = await MainApi.post('/api/v1/customer/reels/visit', body)
    return data
}

export default function usePostReelVisit(): UseMutationResult<
    unknown,
    unknown,
    ReelActionArgs
> {
    return useMutation('reels-visit', postVisit)
}
