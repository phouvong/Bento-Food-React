import { useQuery } from 'react-query'
import MainApi from '@/api/MainApi'
import { onSingleErrorResponse } from '@/components/ErrorResponse'
export const getData = async () => {
    const { data } = await MainApi.get('/api/v1/advertisement/list')
    return data
}
export const useGetAdds = (handleSuccess) => {
    return useQuery('getAdds', () => getData(), {
        enabled: false,
        onError: onSingleErrorResponse,
        retry: 1,
        onSuccess: handleSuccess,
        cacheTime: 400,
    })
}
