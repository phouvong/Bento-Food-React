import MainApi from '@/api/MainApi';
import { useQuery } from 'react-query';
import { onErrorResponse } from '@/components/ErrorResponse';

const getZone = async (location, zoneId) => {
    if (location?.lat && zoneId) {
        const { data } = await MainApi.get(
            `api/v1/zone/check?lat=${location.lat}&lng=${location.lng}&zone_id=${zoneId}`
        );
        return data;
    }
};

export default function useGetCheckZone(location, zoneId, successHandler) {
    return useQuery(
        ['zoneIds', location?.lat, location?.lng,zoneId],
        () => getZone(location, zoneId),
        {
            enabled: !!location?.lat && !!zoneId, // avoids running the query when data is incomplete
            onSuccess: successHandler,
            onError: onErrorResponse,
        }
    );
}
