import MainApi from '../../../../api/MainApi'
import { useQuery } from 'react-query'

const getSearched = async (searchedString, useType) => {
    const { data } = await MainApi.get(
        `/api/v1/customer/message/search-list?name=${searchedString}&limit=20& offset=1&type=${useType}`
    )
    return data
}
export const useSearchList = (
    searchedString,
    useType,
    handleSearchFetchOnSuccess
) => {
    return useQuery(
        'get_search_list',
        () => getSearched(searchedString, useType),
        {
            enabled: false,
            onSuccess: handleSearchFetchOnSuccess,
        }
    )
}
