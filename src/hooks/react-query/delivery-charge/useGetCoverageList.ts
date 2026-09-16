import { useQuery, UseQueryResult } from 'react-query'
import MainApi from '@/api/MainApi'

// GET /api/v1/delivery-charge/coverage-list — areas or zip codes covered by
// the caller's zone, per the zone's active delivery-charge rule. Zone comes
// from the zoneId header MainApi already injects; no auth required.
export interface CoverageArea {
    id: number
    zone_id?: number
    name: string
    delivery_charge?: number
}

export interface CoverageListResponse {
    // `(string & {})` keeps the union open for backend-added rule types
    // while preserving autocomplete on the documented one. Null when the
    // zone has no area/zip rule active — the UI hides the field then.
    delivery_charge_type: 'area_wise' | (string & {}) | null
    data: CoverageArea[]
}

const getCoverageList = async (
    restaurantId: number | string
): Promise<CoverageListResponse> => {
    const { data } = await MainApi.get(
        `/api/v1/delivery-charge/coverage-list?restaurant_id=${restaurantId}`
    )
    return data
}

export default function useGetCoverageList(
    enabled: boolean = true,
    restaurantId?: number | string | null
): UseQueryResult<CoverageListResponse> {
    return useQuery(
        ['delivery-charge-coverage-list', restaurantId],
        () => getCoverageList(restaurantId as number | string),
        {
            enabled: enabled && Boolean(restaurantId),
            refetchOnWindowFocus: false,
            retry: false,
            onError: () => {},
        }
    )
}
