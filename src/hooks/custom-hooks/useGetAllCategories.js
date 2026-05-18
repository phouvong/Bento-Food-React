import { useQuery } from 'react-query'
import { CategoryApi } from '../react-query/config/categoryApi'
import { onErrorResponse } from '@/components/ErrorResponse'
import { useEffect } from 'react'

export const useGetAllCategories = (searchKey) => {
    const normalizedSearchKey = searchKey ?? ''
    const { data, refetch } = useQuery(
        ['category', normalizedSearchKey],
        () => CategoryApi.categories(normalizedSearchKey),
        {
            onError: onErrorResponse,
        }
    )
    const handleApiCall = async () => await refetch()
    useEffect(() => {
        handleApiCall()
    }, [])
    return data?.data
}
