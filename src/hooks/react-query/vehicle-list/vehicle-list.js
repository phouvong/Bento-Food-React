import { useQuery } from "react-query";

import { onSingleErrorResponse } from "@/components/ErrorResponse";
import MainApi from "@/api/MainApi";

const getVehicleList = async () => {
	const { data } = await MainApi.get(`api/v1/get-vehicles`);
	return data;
};

export default function useGetVehicleList() {
	return useQuery(["vehicle-list-data"], () => getVehicleList(), {
		enabled: false,
		onError: onSingleErrorResponse,
	});
}
