import { useQuery } from 'react-query'
import { useDispatch } from 'react-redux'
import MainApi from '../../../api/MainApi'
import { onErrorResponse } from '@/components/ErrorResponse'
import {
    getToken,
    getGuestId,
} from '@/components/checkout-page/functions/getGuestUserId'
import { setCartGroups } from '@/redux/slices/cart'
import { calculateItemBasePrice } from '@/utils/customFunctions'
import { rawFoodDataNormalize } from '@/components/new-food-card/rawFoodDataNormalize'
import {
    getSelectedAddons,
    getSelectedVariations,
} from '@/components/navbar/second-navbar/SecondNavbar'

// guest_id is only ever sent for a guest — an authenticated request is
// identified by the Bearer token MainApi already attaches. Resolved fresh
// on every call (not passed in from a render) so it can never go stale.
const buildGuestParam = () => {
    const token = getToken()
    const guestId = getGuestId()
    return !token && guestId ? `guest_id=${guestId}` : ''
}

const fetchCartData = async (restaurantId) => {
    const guestParam = buildGuestParam()
    const url = restaurantId
        ? `api/v1/customer/cart/list?${
              guestParam ? `${guestParam}&` : ''
          }restaurant_id=${restaurantId}`
        : `api/v1/customer/cart/get-all${guestParam ? `?${guestParam}` : ''}`
    const { data } = await MainApi.get(url)
    return data
}

// One-off fetch + redux sync for the grouped cart summary — the single
// place every "just mutated the cart, now refresh the bubble/drawer" call
// site should call, instead of each re-implementing the fetch URL and the
// dispatch (and risking the guest_id gating drifting between copies).
// `onSuccess`/`onError` are optional extras layered on top (a toast, etc.).
export const refreshCartGroups = (dispatch, { onSuccess, onError } = {}) =>
    fetchCartData()
        .then((data) => {
            if (Array.isArray(data)) {
                dispatch(setCartGroups(data))
                onSuccess?.(data)
            }
            return data
        })
        .catch((error) => {
            onErrorResponse(error)
            onError?.(error)
        })

export const mapRestaurantCartRows = (rows = []) =>
    rows.map((entry) => ({
        ...entry?.item,
        cartItemId: entry?.id,
        totalPrice: entry?.bogo_details
            ? entry?.bogo_details?.total_price
            : entry?.price,
        selectedAddons: getSelectedAddons(entry?.item?.addons),
        quantity: entry?.quantity,
        variations: entry?.item?.variations,
        itemBasePrice: rawFoodDataNormalize({
            price: calculateItemBasePrice(
                entry?.item,
                entry?.item?.variations
            ),
            discount: entry?.item?.discount,
            discount_type: entry?.item?.discount_type,
        }).discountedPrice,
        selectedOptions: getSelectedVariations(entry?.item?.variations),
        restaurant_id: entry?.restaurant_id,
        bogoGroupId: entry?.bogo_group_id,
        bogoDetails: entry?.bogo_details,
    }))

/**
 * Dual-mode cart fetcher:
 *  - restaurantId provided → GET cart/list?guest_id=X&restaurant_id=Y
 *    (individual items for that restaurant)
 *  - restaurantId absent   → GET cart/get-all?guest_id=X (grouped summary
 *    for all restaurants), auto-dispatched into redux `cartGroups` — the
 *    caller doesn't need to dispatch it itself.
 *
 * `onSuccess`/`onError` are extra callbacks layered on top of that built-in
 * behavior for whatever a specific screen still needs on top — mapping the
 * individual-item response into `cartList`, a toast, etc.
 */
export default function useGetAllCartList(
    restaurantId,
    { enabled = true, onSuccess, onError } = {}
) {
    const dispatch = useDispatch()
    const isRestaurantMode = Boolean(restaurantId)

    return useQuery(
        isRestaurantMode ? ['cart-item-restaurant', restaurantId] : 'cart-item',
        () => fetchCartData(restaurantId),
        {
            // A first-time visitor has neither a token nor a guest id yet
            // (guest auth runs in the background after mount) — firing then
            // is a guaranteed 401 + retry that wastes a connection slot on
            // page load. The auth/cart flows refetch once identity exists.
            enabled: enabled && Boolean(getToken() || getGuestId()),
            refetchOnWindowFocus: false,
            onSuccess: (data) => {
                if (!isRestaurantMode && Array.isArray(data)) {
                    dispatch(setCartGroups(data))
                }
                onSuccess?.(data)
            },
            onError: (error) => {
                onErrorResponse(error)
                onError?.(error)
            },
        }
    )
}
