import { useQuery } from 'react-query'

import { onSingleErrorResponse } from '@/components/ErrorResponse'
import MainApi from '@/api/MainApi'
const getAutocompletePlace = async (searchKey) => {
    if (searchKey && searchKey !== '') {
        const { data } = await MainApi.get(
            `/api/v1/config/place-api-autocomplete?search_text=${searchKey}`
        )
        return data
    }
}

export default function useGetAutocompletePlace(searchKey, enabled) {
    return useQuery(
        ['places', searchKey],
        () => getAutocompletePlace(searchKey),
        {
            enabled: enabled,
            onError: onSingleErrorResponse,
        }
    )
}
