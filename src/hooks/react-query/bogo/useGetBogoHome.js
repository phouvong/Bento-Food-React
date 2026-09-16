import { useQuery } from 'react-query'

import MainApi from '../../../api/MainApi'
import { onErrorResponse } from '@/components/ErrorResponse'
import { getGuestId } from '@/components/checkout-page/functions/getGuestUserId'

const getData = async ({ limit = 6, order_type } = {}) => {
    const { data } = await MainApi.get('/api/v1/bogo/home', {
        params: { limit, order_type, guest_id: getGuestId() },
    })
    return data
}

export const useGetBogoHome = (pageParams) => {
    return useQuery(
        ['bogo-home', pageParams],
        () => getData(pageParams),
        {
            onError: onErrorResponse,
            // Campaign liveness changes rarely — don't re-fire this on
            // every page that gates its BOGO section with it.
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
        }
    )
}
