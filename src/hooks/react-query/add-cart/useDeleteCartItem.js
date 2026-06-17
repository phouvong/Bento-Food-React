
import { useMutation } from "react-query";
import MainApi from "../../../api/MainApi";

const deleteItem = async (cartIdAndGuestId) => {
  const restaurantParam = cartIdAndGuestId?.restaurant_id
    ? `&restaurant_id=${cartIdAndGuestId.restaurant_id}`
    : '';
  if (cartIdAndGuestId?.guestId) {
    const { data } = await MainApi.delete(
      `api/v1/customer/cart/remove-item?guest_id=${cartIdAndGuestId?.guestId}&cart_id=${cartIdAndGuestId?.cart_id}${restaurantParam}`
    );
    return data;
  } else {
    const { data } = await MainApi.delete(
      `api/v1/customer/cart/remove-item?cart_id=${cartIdAndGuestId?.cart_id}${restaurantParam}`
    );
    return data;
  }
};

export default function useDeleteCartItem() {
  return useMutation("delete-all-cart-item", deleteItem);
}
