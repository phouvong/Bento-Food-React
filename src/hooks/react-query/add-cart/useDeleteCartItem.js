
import { useMutation } from "react-query";
import MainApi from "../../../api/MainApi";

// Bundle mode: pass `bogo_group_id` instead of `cart_id` — removes the
// whole bogo group in one call, per DELETE /customer/cart/remove-item's
// documented bundle mode.
const deleteItem = async (cartIdAndGuestId) => {
  const restaurantParam = cartIdAndGuestId?.restaurant_id
    ? `&restaurant_id=${cartIdAndGuestId.restaurant_id}`
    : '';
  const guestParam = cartIdAndGuestId?.guestId
    ? `guest_id=${cartIdAndGuestId.guestId}&`
    : '';
  const idParam = cartIdAndGuestId?.bogo_group_id
    ? `bogo_group_id=${cartIdAndGuestId.bogo_group_id}`
    : `cart_id=${cartIdAndGuestId?.cart_id}`;
  const { data } = await MainApi.delete(
    `api/v1/customer/cart/remove-item?${guestParam}${idParam}${restaurantParam}`
  );
  return data;
};

export default function useDeleteCartItem() {
  return useMutation("delete-all-cart-item", deleteItem);
}
