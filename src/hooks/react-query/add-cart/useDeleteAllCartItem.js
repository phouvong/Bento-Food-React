import { useMutation } from "react-query";
import MainApi from "../../../api/MainApi";

// Accepts either a legacy string (guestId only) or an object form
// `{ guestId, restaurantId }`. When `restaurantId` is provided the request
// scopes deletion to that restaurant via `&restaurant_id=X`.
const deleteData = async (input) => {
  const isObject = input && typeof input === "object";
  const guestId = isObject ? input.guestId : input;
  const restaurantId = isObject ? input.restaurantId : undefined;

  const params = new URLSearchParams();
  if (guestId) params.set("guest_id", guestId);
  if (restaurantId != null) params.set("restaurant_id", String(restaurantId));
  const qs = params.toString();
  const url = `api/v1/customer/cart/remove${qs ? `?${qs}` : ""}`;

  const { data } = await MainApi.delete(url);
  return data;
};

export default function useDeleteAllCartItem() {
  return useMutation("delete-all-cart-item", deleteData);
}
