import { useQuery } from 'react-query'
import MainApi from '../../../api/MainApi'
import { onSingleErrorResponse } from '@/components/ErrorResponse'

export const useGetTrendingSearches = () => {
    return useQuery(
        'trending-searches',
        () => MainApi.get('/api/v1/trending-searches'),
        {
            staleTime: 5 * 60 * 1000,
            onError: onSingleErrorResponse,
        }
    )
}
