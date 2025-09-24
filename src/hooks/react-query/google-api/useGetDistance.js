import MainApi from '@/api/MainApi'
import { onSingleErrorResponse } from '@/components/ErrorResponse'
import { useQuery } from 'react-query'

const getDistance = async (origin, destination) => {
    const { data } = await MainApi.get(
        `/api/v1/config/distance-api?origin_lat=${origin?.lat}&origin_lng=${
            origin?.lng
        }&destination_lat=${
            destination.lat ? destination.lat : destination?.latitude
        }&destination_lng=${
            destination.lng ? destination.lng : destination?.longitude
        }&mode=walking`
    )
    return data
}

export default function useGetDistance(origin, destination) {
    return useQuery(
        ['distance', origin, destination],
        () => getDistance(origin, destination),
        {
            enabled: false,
            onError: onSingleErrorResponse,
        }
    )
}
