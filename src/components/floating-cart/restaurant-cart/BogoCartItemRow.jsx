import { useQueryClient } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { Stack } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import BogoCartItemCard from './BogoCartItemCard'
import useCartItemUpdate from '@/hooks/react-query/add-cart/useCartItemUpdate'
import useDeleteCartItem from '@/hooks/react-query/add-cart/useDeleteCartItem'
import { refreshCartGroups } from '@/hooks/react-query/add-cart/useGetAllCartList'
import { getGuestId } from '@/components/checkout-page/functions/getGuestUserId'
import { onErrorResponse } from '@/components/ErrorResponse'
import { getAmount } from '@/utils/customFunctions'

// A bogo bundle line has no cart_id of its own (its raw `id` is null — it
// isn't one row), so quantity changes and removal go through
// `bogo_group_id` instead of the ordinary cart_id endpoints CartItemCard
// uses. Driven entirely by `item.bogoDetails` (see FloatingCart's
// cartListSuccessHandler, which is what attaches it).
const BogoCartItemRow = ({ item, restaurantId }) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const { global } = useSelector((state) => state.globalSettings)
    const dispatch = useDispatch()
    const queryClient = useQueryClient()
    const { mutate: updateMutate, isLoading: updating } = useCartItemUpdate()
    const { mutate: removeMutate, isLoading: removing } = useDeleteCartItem()

    const details = item?.bogoDetails
    const bogoGroupId = item?.bogoGroupId
    const quantity = item?.quantity || 1

    // FloatingCart's own restaurant-mode query owns `cartList` — refetch it
    // (not just invalidate) so its onSuccess re-syncs redux immediately, and
    // refresh the grouped summary the navbar bubble/drawer reads.
    const refresh = () => {
        refreshCartGroups(dispatch)
        queryClient.refetchQueries('cart-item-restaurant')
    }

    const setQuantity = (nextQuantity) => {
        if (nextQuantity < 1) {
            removeMutate(
                {
                    bogo_group_id: bogoGroupId,
                    guestId: getGuestId(),
                    restaurant_id: restaurantId,
                },
                {
                    onSuccess: (res) => {
                        refresh()
                        toast.success(
                            res?.message || t('Item removed from cart')
                        )
                    },
                    onError: onErrorResponse,
                }
            )
            return
        }
        updateMutate(
            {
                bogo_group_id: bogoGroupId,
                quantity: nextQuantity,
                guest_id: getGuestId(),
            },
            { onSuccess: refresh, onError: onErrorResponse }
        )
    }

    const mapAvatarItems = (rows = []) =>
        rows.map((row) => ({
            id: row?.item_id,
            image: row?.item?.image_full_url,
        }))

    return (
        // Same row shell CartItemCard wraps itself in — otherwise a bogo
        // line sits flush against its neighbors with no padding/divider.
        <Stack
            sx={{
                px: 2,
                py: 1.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                '&:last-of-type': { borderBottom: 'none' },
            }}
        >
            <BogoCartItemCard
                name={details?.offer_title}
                price={getAmount(
                    details?.final_price ?? details?.bundle_price,
                    global?.currency_symbol_direction,
                    global?.currency_symbol,
                    global?.digit_after_decimal_point
                )}
                buyItems={mapAvatarItems(details?.buy_items)}
                freeItems={mapAvatarItems(details?.free_items)}
                quantity={quantity}
                updating={updating || removing}
                onIncrement={() =>
                    !updating && !removing && setQuantity(quantity + 1)
                }
                onDecrement={() =>
                    !updating && !removing && setQuantity(quantity - 1)
                }
            />
        </Stack>
    )
}

export default BogoCartItemRow
