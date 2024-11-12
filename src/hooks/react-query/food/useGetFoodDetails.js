import MainApi from '../../../api/MainApi'
import { useQuery } from 'react-query'
import {onSingleErrorResponse} from "../../../components/ErrorResponse";

export const getData = async (params) => {
    const {id,campaign,page_limit,offset}=params
    const tempUrl=campaign ? `/api/v1/products/details/${id}?campaign=${campaign}`:`/api/v1/products/details/${id}`
    const { data } = await MainApi.get(`${tempUrl}`)
    return data
}
export const useGetFoodDetails = (params,itemSuccess) => {
    return useQuery('food-Details', () => getData(params), {

        enabled:false,
        onSuccess:itemSuccess,
        onError:onSingleErrorResponse
    })
}