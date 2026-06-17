import { useMutation, UseMutationResult } from 'react-query'
import MainApi from '../../../api/MainApi'

// POST /api/v1/customer/pro-customer/subscribe/cancel
// No request body — the endpoint operates on the authenticated user's
// current subscription.
const cancelProPlan = async <TResponse>(): Promise<TResponse> => {
    const { data } = await MainApi.post<TResponse>(
        `/api/v1/customer/pro-customer/cancel`
    )
    return data
}

// TResponse is generic so callers can narrow the success payload to their
// expected shape without locking the hook into one variant. Backend responses
// in this repo are sometimes wrapped (`{ data: … }`) and sometimes flat, so a
// permissive default avoids forcing casts at every call site.
export default function useCancelProPlan<
    TResponse = Record<string, unknown>
>(): UseMutationResult<TResponse, unknown, void> {
    return useMutation<TResponse, unknown, void>(() =>
        cancelProPlan<TResponse>()
    )
}
