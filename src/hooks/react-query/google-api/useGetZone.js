import MainApi from '@/api/MainApi'
import { onErrorResponse } from '@/components/ErrorResponse'
import { useQuery } from 'react-query'

const getZoneId = async (location, zoneIdEnabled) => {
    if (location?.lat && location?.lng) {
        const { data } = await MainApi.get(
            `/api/v1/config/get-zone-id?lat=${location?.lat}&lng=${location?.lng}`
        )
        return data
    }
}

export default function useGetZoneId(location, zoneIdEnabled) {
    return useQuery(['zoneId', location], () => getZoneId(location), {
        enabled: zoneIdEnabled,
        onError: onErrorResponse,
    })
}
