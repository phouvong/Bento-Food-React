import { useQuery, UseQueryResult } from 'react-query'
import moment from 'moment'
import MainApi from '@/api/MainApi'
import {
    getGuestId,
    getToken,
} from '@/components/checkout-page/functions/getGuestUserId'

// Backend surge object. Only the fields the checkout reads are typed; the
// index signature keeps extra backend fields accessible without widening
// every consumer to `any`.
export interface SurgePrice {
    // Flat amount, or percent of the delivery fee when price_type is
    // 'percentage'. Backend may serialize numbers as strings.
    price: number
    // `(string & {})` keeps the union open for backend-added types while
    // preserving autocomplete on the known ones.
    price_type?: 'amount' | 'percentage' | (string & {})
    // Admin-given label (e.g. "Rainy day surge") surfaced in the tooltip.
    name?: string
    [key: string]: unknown
}

// The endpoint's envelope isn't finalized (`{...}` vs `{ surge_price: {...} }`),
// so consumers go through this normalizer: it unwraps either shape, coerces
// price to a number, and collapses "no active surge" to null.
export const normalizeSurgePrice = (data: unknown): SurgePrice | null => {
    const raw = (data as { surge_price?: unknown })?.surge_price ?? data
    if (!raw || typeof raw !== 'object') return null
    const record = raw as Record<string, unknown>
    const price = Number(record.price ?? record.amount ?? 0) || 0
    if (price <= 0) return null
    return { ...record, price } as SurgePrice
}

const getSurgePrice = async (scheduleAt: string) => {
    const dateTime =
        scheduleAt === 'now'
            ? moment().format('YYYY-MM-DD HH:mm:ss')
            : moment(scheduleAt).format('YYYY-MM-DD HH:mm:ss')
    const payload: Record<string, string> = { date_time: dateTime }
    // Same auth rule as the cart endpoints: guests identify via guest_id.
    if (!getToken()) payload.guest_id = getGuestId()
    const { data } = await MainApi.post(
        '/api/v1/customer/order/get-surge-price',
        payload
    )
    return data
}

export default function useGetSurgePrice(
    scheduleAt: string,
    enabled: boolean = true
): UseQueryResult<unknown> {
    return useQuery(
        ['surge-price', scheduleAt],
        () => getSurgePrice(scheduleAt),
        {
            enabled,
            refetchOnWindowFocus: false,
            // Surge is a price *addition*; if the endpoint errors the order
            // must still be placeable at the base fee, so fail silently.
            retry: false,
            onError: () => {},
        }
    )
}
