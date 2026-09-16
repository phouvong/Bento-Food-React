import { useQuery, UseQueryResult } from 'react-query'
import MainApi from '@/api/MainApi'
import {
    getGuestId,
    getToken,
} from '@/components/checkout-page/functions/getGuestUserId'
import type { RunningHappyHour } from './useGetRunningHappyHour'

// Meta the happy-hour stores endpoint adds on top of the standard restaurant
// object. The base restaurant is left as an index signature rather than
// re-typed here — consumers hand rows straight to the existing (untyped)
// restaurant cards, so pinning dozens of card-owned fields would only drift.
export interface HappyHourStore {
    id: number
    is_running_now?: boolean
    // What is actually in force via the central resolver.
    active_discount?: number
    // The one currently open, or null.
    happy_hour?: RunningHappyHour | null
    // Every approved Happy Hour for this store.
    happy_hours?: RunningHappyHour[]
    [key: string]: unknown
}

// Generic paginated envelope: the endpoint pins `restaurants` as its row
// array; the type parameter lets other zone-scoped lists reuse the shape.
export interface HappyHourStoresResponse<T = HappyHourStore> {
    total_size: number
    limit: number
    offset: number
    restaurants: T[]
}

interface UseGetHappyHourStoresOptions {
    limit?: number
    offset?: number
    // `running: true` asks the backend for only stores whose window is open
    // right now (`running=1`).
    running?: boolean
    enabled?: boolean
}

const getHappyHourStores = async (
    limit: number,
    offset: number,
    running: boolean
): Promise<HappyHourStoresResponse> => {
    const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
    })
    if (running) params.set('running', '1')
    // Same auth rule as the cart endpoints: guests identify via guest_id.
    if (!getToken()) params.set('guest_id', getGuestId())
    const { data } = await MainApi.get(
        `/api/v1/happy-hour/stores?${params.toString()}`
    )
    return data
}

export default function useGetHappyHourStores({
    limit = 10,
    offset = 1,
    running = false,
    enabled = true,
}: UseGetHappyHourStoresOptions = {}): UseQueryResult<HappyHourStoresResponse> {
    return useQuery(
        ['happy-hour-stores', limit, offset, running],
        () => getHappyHourStores(limit, offset, running),
        {
            enabled,
            refetchOnWindowFocus: false,
            retry: false,
            onError: () => {},
        }
    )
}
