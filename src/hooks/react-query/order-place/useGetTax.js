import { useMutation } from "react-query";
import MainApi from '@/api/MainApi'


const getTax = async (orderData) => {
    const { data } = await MainApi.post(`api/v1/customer/order/get-Tax`, orderData);
    return data;
};
export const useGetTax = () => {
    return useMutation("get-t", getTax);
};