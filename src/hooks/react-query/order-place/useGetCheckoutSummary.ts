import { useQuery, UseQueryResult } from 'react-query'
import MainApi from '@/api/MainApi'
import {
    getGuestId,
    getToken,
} from '@/components/checkout-page/functions/getGuestUserId'

// POST /api/v1/customer/order/checkout-summary — single source of truth for
// checkout-time charges: tax, delivery fee (surge already folded in),
// surge display info, and cashback.
export interface CheckoutSummaryTax {
    tax_amount?: number
    // `(string & {})` keeps unions open for backend-added values while
    // preserving autocomplete on the documented ones (applies below too).
    tax_status?: 'excluded' | 'included' | (string & {})
    tax_included?: number
}

export interface CheckoutSummaryDelivery {
    // Final payable fee — base_delivery_charge + surge_amount.
    delivery_charge?: number
    base_delivery_charge?: number
    surge_amount?: number
    original_delivery_charge?: number
    // What Pro took off this fee. `delivery_charge` is already net of it, so
    // it is for display only — never subtract it from the total again.
    pro_customer_savings?: number
    free_delivery_by?: string | null
    vehicle_id?: number
}

export interface CheckoutSummarySurge {
    title?: string
    customer_note?: string
    price?: number
    price_type?: 'percent' | 'amount' | (string & {})
    zone_id?: number
}

export interface CheckoutSummaryCashback {
    calculated_amount?: number
    cashback_amount?: number
    cashback_type?: 'percentage' | 'amount' | (string & {})
    id?: number
}

// Pro membership savings — the envelope isn't pinned by the backend yet,
// so the amount may arrive under any of the three keys and the object
// under `pro` or `pro_discount`; CheckoutPage normalizes.
export interface CheckoutSummaryPro {
    amount?: number
    discount_amount?: number
    calculated_amount?: number
    label?: string
    title?: string
    benefit_type?: string
    offer_type?: string
}

export interface CheckoutSummaryResponse {
    tax?: CheckoutSummaryTax
    delivery?: CheckoutSummaryDelivery
    surge?: CheckoutSummarySurge | null
    cashback?: CheckoutSummaryCashback | null
    pro?: CheckoutSummaryPro | null
    pro_discount?: CheckoutSummaryPro | null
}

interface UseGetCheckoutSummaryParams {
    restaurantId?: number | string
    orderAmount?: number
    orderType?: string
    // Kilometres, per the API contract.
    distanceKm?: number | null
    latitude?: number | string | null
    longitude?: number | string | null
    // Selected coverage row id when the zone's area/zip rule is active,
    // plus the rule type: zip_code_wise rows are sent as `zip_code_id`,
    // area_wise rows as `area_id`.
    coverageId?: number | null
    coverageType?: string | null
    enabled?: boolean
}

const getCheckoutSummary = async (
    params: UseGetCheckoutSummaryParams
): Promise<CheckoutSummaryResponse> => {
    const payload: Record<string, unknown> = {
        restaurant_id: params.restaurantId,
        order_amount: params.orderAmount,
        order_type: params.orderType,
        distance: params.distanceKm ?? 0,
        latitude: params.latitude != null ? String(params.latitude) : undefined,
        longitude:
            params.longitude != null ? String(params.longitude) : undefined,
    }
    if (params.coverageId != null) {
        payload[
            params.coverageType === 'zip_code_wise'
                ? 'zip_code_id'
                : 'area_id'
        ] = params.coverageId
    }
    // Same auth rule as the cart endpoints: guests identify via guest_id.
    if (!getToken()) payload.guest_id = getGuestId()
    const { data } = await MainApi.post(
        '/api/v1/customer/order/checkout-summary',
        payload
    )
    return data
}

export default function useGetCheckoutSummary(
    params: UseGetCheckoutSummaryParams
): UseQueryResult<CheckoutSummaryResponse> {
    const { enabled = true, ...rest } = params
    return useQuery(
        // Every request input is in the key, so changing the address
        // (lat/lng), the area/zip selection, the order amount, or the order
        // type recalls the API automatically.
        [
            'checkout-summary',
            rest.restaurantId,
            rest.orderAmount,
            rest.orderType,
            rest.distanceKm,
            rest.latitude,
            rest.longitude,
            rest.coverageId,
            rest.coverageType,
        ],
        () => getCheckoutSummary(rest),
        {
            enabled:
                enabled &&
                Boolean(rest.restaurantId) &&
                Boolean(rest.orderType) &&
                Number(rest.orderAmount) > 0,
            refetchOnWindowFocus: false,
            retry: false,
            // A key change (new address/area/amount) is a NEW query to
            // react-query — without this, data blips to undefined while the
            // recall is in flight and the delivery fee flickers to the
            // client-side fallback and back.
            keepPreviousData: true,
            // Checkout must stay usable on older backends without this
            // endpoint — consumers fall back to the client-side math.
            onError: () => {},
        }
    )
}
