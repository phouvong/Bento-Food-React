import MainApi from '@/api/MainApi'
import { useQuery } from 'react-query'

const getGeoCode = async (location) => {
    if (location) {
        const { data } = await MainApi.get(
            `/api/v1/config/geocode-api?lat=${location.lat}&lng=${location.lng}`
        )
        return data
    }
}

export default function useGetGeoCode(location, geoLocationEnable) {
    return useQuery(['geo-code', location], () => getGeoCode(location), {
        enabled: true,
        //onError: onSingleErrorResponse,
    })
}
