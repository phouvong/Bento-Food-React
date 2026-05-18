import { useQuery } from 'react-query'

import { onSingleErrorResponse } from '@/components/ErrorResponse'
import MainApi from '@/api/MainApi'

const getDmShifts = async () => {
    const { data } = await MainApi.get('/api/v1/dm-shifts')
    return data
}

export default function useGetDmShifts() {
    return useQuery(['dm-shifts'], () => getDmShifts(), {
        enabled: false,
        onError: onSingleErrorResponse,
    })
}
