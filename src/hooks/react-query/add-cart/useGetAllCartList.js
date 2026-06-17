import { useQuery } from "react-query";
import MainApi from "../../../api/MainApi";
import { onErrorResponse } from "@/components/ErrorResponse";
import { getToken } from "@/components/checkout-page/functions/getGuestUserId";

/**
 * Dual-mode cart fetcher:
 *  - restaurantId provided  → GET cart/list?guest_id=X&restaurant_id=Y  (individual items for that restaurant)
 *  - restaurantId absent    → GET cart/get-all?guest_id=X               (grouped summary for all restaurants)
 */
export default function useGetAllCartList(guestId, cartListSuccessHandler, restaurantId) {
  const isRestaurantMode = Boolean(restaurantId);

  const getData = async () => {
    const token = getToken();
    try {
      let url;
      if (isRestaurantMode) {
        const guestParam = !token ? `guest_id=${guestId}&` : "";
        url = `api/v1/customer/cart/list?${guestParam}restaurant_id=${restaurantId}`;
      } else {
        const params = !token ? `?guest_id=${guestId}` : "";
        url = `api/v1/customer/cart/get-all${params}`;
      }
      const { data } = await MainApi.get(url);
      return data;
    } catch (error) {
      throw error;
    }
  };

  return useQuery(
    // Different query key per mode so React Query caches them independently
    isRestaurantMode ? ["cart-item-restaurant", restaurantId] : "cart-item",
    getData,
    {
      onSuccess: cartListSuccessHandler,
      enabled: typeof guestId !== "undefined",
      onError: onErrorResponse,
      refetchOnWindowFocus: false,
    }
  );
}
