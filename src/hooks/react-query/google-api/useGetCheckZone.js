// check_zone
import MainApi from '@/api/MainApi'
import { onErrorResponse } from '@/components/ErrorResponse'
import { useQuery } from 'react-query'

const getZone = async (location, zoneId) => {
    if (location?.lat && zoneId) {
        const { data } = await MainApi.get(
            `api/v1/zone/check?lat=${location?.lat}&lng=${location?.lng}&zone_id=${zoneId}`
        )
        return data
    }
}

export default function useGetCheckZone(location, zoneId, successHandler) {
    return useQuery(
        ['zoneId', location?.lat, location?.lng],
        () => getZone(location, zoneId),
        {
            onSuccess: successHandler,
            onError: onErrorResponse,
        }
    )
}
