import { useMutation } from 'react-query'
import MainApi from '../../../api/MainApi'

// POST /api/v1/customer/pro-customer/subscribe
// Body: { plan_id, payment_type, payment_method }
const subscribeProPlan = async (payload) => {
    const { data } = await MainApi.post(
        `/api/v1/customer/pro-customer/subscribe`,
        payload
    )
    return data
}

export default function useSubscribeProPlan() {
    return useMutation(subscribeProPlan)
}
