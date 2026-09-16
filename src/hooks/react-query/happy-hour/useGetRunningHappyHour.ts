import { useEffect } from 'react'
import { useQuery, useQueryClient, UseQueryResult } from 'react-query'
import MainApi from '@/api/MainApi'
import {
    getGuestId,
    getToken,
} from '@/components/checkout-page/functions/getGuestUserId'

// GET /api/v1/happy-hour/running — the one Happy Hour open in the caller's
// zone right now. Always one object or none, never a list.
export interface RunningHappyHour {
    id: number
    slug?: string
    title?: string
    short_description?: string | null
    cover_image_full_url?: string | null
    icon_full_url?: string | null
    discount?: number
    min_order_amount?: number
    // `(string & {})` keeps the union open for backend-added duration types
    // while preserving autocomplete on the documented ones.
    duration_type?: 'daily' | 'weekly' | 'custom' | (string & {})
    is_permanent?: boolean
    weekly_days?: string[]
    start_time?: string | null
    end_time?: string | null
    start_date?: string | null
    end_date?: string | null
    is_running_now?: boolean
    started_at?: string | null
    ends_at?: string | null
    // Authoritative countdown seed — server-computed, so it is immune to
    // client clock / timezone drift, unlike parsing `ends_at`.
    remaining_seconds?: number
    store_count?: number
}

export interface RunningHappyHourResponse {
    is_running: boolean
    happy_hour: RunningHappyHour | null
}

const getRunningHappyHour = async (): Promise<RunningHappyHourResponse> => {
    // Same auth rule as the cart endpoints: guests identify via guest_id.
    const guestParam = !getToken() ? `?guest_id=${getGuestId()}` : ''
    const { data } = await MainApi.get(
        `/api/v1/happy-hour/running${guestParam}`
    )
    return data
}

export default function useGetRunningHappyHour(): UseQueryResult<RunningHappyHourResponse> {
    const queryClient = useQueryClient()
    const query = useQuery('running-happy-hour', getRunningHappyHour, {
        refetchOnWindowFocus: false,
        // Decorative banner — a failed lookup must never surface an error
        // state, the banner just stays hidden.
        retry: false,
        onError: () => {},
    })

    const isRunning = query.data?.is_running
    const happyHourId = query.data?.happy_hour?.id
    const remainingSeconds = Number(query.data?.happy_hour?.remaining_seconds)

    useEffect(() => {
        if (!isRunning || !(remainingSeconds > 0)) return
        const timer = setTimeout(() => {
            queryClient.invalidateQueries('running-happy-hour')
            queryClient.invalidateQueries('happy-hour-stores')
        }, (remainingSeconds + 1) * 1000)
        return () => clearTimeout(timer)
    }, [isRunning, happyHourId, remainingSeconds, queryClient])

    return query
}
