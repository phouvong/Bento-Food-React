import { useQuery } from 'react-query'

import { onSingleErrorResponse } from '@/components/ErrorResponse'
import MainApi from '@/api/MainApi'

const getZoneList = async () => {
    const { data } = await MainApi.get(`/api/v1/zone/list`)
    return data
}

export default function useGetZoneList() {
    return useQuery(['zone-list-data'], () => getZoneList(), {
        enabled: false,
        onError: onSingleErrorResponse,
    })
}
