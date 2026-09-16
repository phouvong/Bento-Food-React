import { useQuery } from 'react-query'

import MainApi from '../../../api/MainApi'
import { onErrorResponse } from '@/components/ErrorResponse'
import { getGuestId } from '@/components/checkout-page/functions/getGuestUserId'

const getData = async ({ limit = 10, offset = 1, order_type } = {}) => {
    const { data } = await MainApi.get('/api/v1/bogo/offers', {
        params: { limit, offset, order_type, guest_id: getGuestId() },
    })
    return data
}

export const useGetBogoOffers = (pageParams) => {
    return useQuery(
        ['bogo-offers', pageParams],
        () => getData(pageParams),
        { onError: onErrorResponse }
    )
}
