import { useQuery } from 'react-query'

import MainApi from '../../../api/MainApi'
import { onErrorResponse } from '@/components/ErrorResponse'
import { getGuestId } from '@/components/checkout-page/functions/getGuestUserId'

const getData = async (id, { limit = 10, offset = 1 } = {}) => {
    const { data } = await MainApi.get(`/api/v1/bogo/offers/${id}`, {
        params: { limit, offset, guest_id: getGuestId() },
    })
    return data
}

export const useGetBogoOfferDetails = (id, pageParams) => {
    return useQuery(
        ['bogo-offer-details', id, pageParams],
        () => getData(id, pageParams),
        {
            enabled: Boolean(id),
            onError: onErrorResponse,
            staleTime: 30000,
            cacheTime: 30000,
        }
    )
}
