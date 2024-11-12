import { useQuery } from "react-query";
import MainApi from "@/api/MainApi";
import { onSingleErrorResponse } from "@/components/ErrorResponse";


const getData = async () => {
    const { data } = await MainApi.get(`/api/v1/most-tips`);
    return data;
};

export default function useGetMostTrips() {
    return useQuery("most-trips", () => getData(), {
        enabled: true,
        onError: onSingleErrorResponse,
    });
}
