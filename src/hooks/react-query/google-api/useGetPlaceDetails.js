import MainApi from '@/api/MainApi'
import { onSingleErrorResponse } from '@/components/ErrorResponse'
import { useQuery } from 'react-query'

const getPlaceDetails = async (placeId) => {
    if (placeId) {
        const { data } = await MainApi.get(
            `/api/v1/config/place-api-details?placeid=${placeId}`
        )
        return data
    }
}

export default function useGetPlaceDetails(
    placeId,
    placeDetailsEnabled,
    successHandler
) {
    return useQuery(['placeDetails', placeId], () => getPlaceDetails(placeId), {
        enabled: placeDetailsEnabled,
        onSuccess: successHandler,
        onError: onSingleErrorResponse,
    })
}
