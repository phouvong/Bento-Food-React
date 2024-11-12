import MainApi from '@/api/MainApi'
import { onSingleErrorResponse } from '@/components/ErrorResponse'
import { getToken } from '@/components/checkout-page/functions/getGuestUserId'
import { useQuery } from 'react-query'
//recently apies are static data
const getData = async (amount) => {
    const userToken = getToken()
    if (userToken) {
        const { data } = await MainApi.get(
            '/api/v1/cashback/getCashback' + '?amount=' + amount
        )
        return data
    }
}

export default function useGetCashBackAmount({ amount, handleSuccess }) {
    return useQuery('cashback', () => getData(amount), {
        enabled: false,
        onSuccess: handleSuccess,
        onError: onSingleErrorResponse,
    })
}
