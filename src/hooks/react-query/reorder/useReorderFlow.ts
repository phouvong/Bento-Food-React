import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation } from 'react-query'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

import MainApi from '@/api/MainApi'
import { OrderApi } from '@/hooks/react-query/config/orderApi'
import useReorderAddToCart from '@/hooks/react-query/reorder/useReorderAddToCart'
import useDeleteAllCartItem from '@/hooks/react-query/add-cart/useDeleteAllCartItem'
import { onErrorResponse } from '@/components/ErrorResponse'
import {
    cart,
    removeCartGroupByRestaurantId,
    setCartGroups,
    setClearCart,
    setReorderCartItemByDispatch,
} from '@/redux/slices/cart'
import { setOpenMapDrawer } from '@/redux/slices/global'
import {
    calculateItemBasePrice,
    getConvertDiscount,
    handleProductValueWithOutDiscount,
} from '@/utils/customFunctions'
import {
    getGuestId,
    getToken,
} from '@/components/checkout-page/functions/getGuestUserId'
import { handleValuesFromCartItems } from '@/components/checkout-page/CheckoutPage'
import {
    getSelectedAddons,
    getSelectedVariations,
} from '@/components/navbar/second-navbar/SecondNavbar'
import { t as tStatic } from 'i18next'

// The reorder builder operates on loosely-typed legacy payloads (food list,
// order line items). Modeling the full shape would dwarf the implementation,
// so we accept `any` at the boundary and document each function's contract.
type AnyRecord = Record<string, unknown>

interface TriggerArgs {
    orderData: any[]
    onComplete?: () => void
}

// ── Matcher helpers (verbatim from Reorder.js) ──────────────────────────────
// Whether two variation arrays have the same number of `required: 'on'` slots.
const isSame = (itemVariation: any[], orderItemVariation: any[]): boolean => {
    let orderItemVariationRequiredCount = 0
    let itemVariationRequiredCount = 0
    if (orderItemVariation?.length > 0 && itemVariation?.length > 0) {
        orderItemVariation?.forEach((item: any) => {
            if (item?.required === 'on') orderItemVariationRequiredCount++
        })
        itemVariation?.forEach((item: any) => {
            if (item?.required === 'on') itemVariationRequiredCount++
        })
    }
    return orderItemVariationRequiredCount === itemVariationRequiredCount
}

const isVariationValuesSame = (
    itemVariationValues: any[],
    orderItemVariationValues: any[]
): boolean => {
    let count = 0
    orderItemVariationValues?.forEach((value: any) => {
        if (
            itemVariationValues?.find(
                (item: any) => item?.label === value?.label
            )
        ) {
            count++
        }
    })
    return orderItemVariationValues.length === count
}

// Filters the current food list against the past order, keeping only items
// whose variation layouts still match.
const getReorderAbleItems = (
    apiData: any[],
    orderDetailsData: any[]
): any[] => {
    const items: any[] = []
    const isDuplicate = (id: number) => items.some((i) => i.id === id)

    apiData?.forEach((item: any) => {
        if (item?.variations.length > 0) {
            item?.variations?.forEach((itemVariation: any) => {
                orderDetailsData?.forEach((orderData: any) => {
                    if (orderData?.food_id !== item?.id) return
                    if (orderData?.variation?.length > 0) {
                        if (isSame(item?.variations, orderData?.variation)) {
                            orderData?.variation?.forEach(
                                (orderVariation: any) => {
                                    if (orderVariation?.values?.length > 0) {
                                        if (
                                            itemVariation?.name ===
                                            orderVariation?.name
                                        ) {
                                            const isSameValues =
                                                isVariationValuesSame(
                                                    itemVariation?.values,
                                                    orderVariation?.values
                                                )
                                            if (
                                                isSameValues &&
                                                !isDuplicate(item.id)
                                            ) {
                                                const filterAddon =
                                                    orderDetailsData.find(
                                                        (oItem: any) =>
                                                            oItem.food_id ===
                                                            item.id
                                                    )?.add_ons || []
                                                items.push({
                                                    ...item,
                                                    add_on: filterAddon,
                                                })
                                            }
                                        }
                                    } else {
                                        if (
                                            itemVariation?.name ===
                                                orderVariation?.name &&
                                            !isDuplicate(item.id)
                                        ) {
                                            items.push({
                                                ...item,
                                                add_on: orderData?.add_ons,
                                            })
                                        }
                                    }
                                }
                            )
                        }
                    } else if (!isDuplicate(item.id)) {
                        const filterAddon =
                            orderDetailsData.find(
                                (oItem: any) => oItem.food_id === item.id
                            )?.add_ons || []
                        items.push({ ...item, add_on: filterAddon })
                    }
                })
            })
        } else {
            const matchedOrder = orderDetailsData.find(
                (oItem: any) => oItem.food_id === item.id
            )
            if (matchedOrder && !isDuplicate(item.id)) {
                items.push({ ...item, add_on: matchedOrder.add_ons ?? [] })
            }
        }
    })
    return items
}

const getNewValues = (
    variationIndex: number,
    variationValues: any[],
    sVariationValues: any[],
    type: string
): any[] =>
    variationValues?.map((item: any, index: number) => {
        const isExist = sVariationValues?.find(
            (sItem: any) => sItem?.label === item?.label
        )
        if (isExist) {
            return {
                ...item,
                isSelected: true,
                choiceIndex: variationIndex,
                optionIndex: index,
                type: type === 'on' ? 'required' : 'optional',
            }
        }
        return item
    })

const getSimilarVariations = (variations: any[], sVariation: any[]): any[] => {
    if (sVariation?.length > 0) {
        return variations?.map((variation: any, index: number) => {
            const isExist = sVariation.find(
                (item: any) =>
                    item.max === variation.max &&
                    item.min === variation.min &&
                    item.name === variation.name &&
                    item.required === variation.required &&
                    item.type === variation.type
            )
            if (isExist) {
                return {
                    ...variation,
                    values: getNewValues(
                        index,
                        variation?.values,
                        isExist?.values,
                        isExist?.required
                    ),
                }
            }
            return variation
        })
    }
    return variations
}

// Build the success-side cart entry shape that Redux expects.
const buildSuccessCartItem = (item: any): AnyRecord => ({
    ...item?.item,
    cartItemId: item?.id,
    variations: item?.item?.variations,
    quantity: item?.quantity,
    totalPrice:
        getConvertDiscount(
            item?.item?.discount,
            item?.item?.discount_type,
            handleProductValueWithOutDiscount(item?.item),
            item?.item?.restaurant_discount
        ) * item?.quantity,
    selectedAddons: item?.item?.addons.filter(
        (addon: any) => addon.quantity > 0
    ),
    itemBasePrice: getConvertDiscount(
        item?.item?.discount,
        item?.item?.discount_type,
        calculateItemBasePrice(item?.item, item?.item?.variations),
        item?.item?.restaurant_discount
    ),
    selectedOptions: getSelectedVariations(item?.item?.variations),
})

// Build a single cart payload row from a current food item + the matched
// historical order entry.
const buildCartRow = (rItem: any, orderData: any[]): AnyRecord | undefined => {
    const similar: any[] = []
    orderData?.forEach((item: any) => {
        let count = 0
        item?.food_details?.variations?.forEach(
            (itemVari: any, index: number) => {
                if (itemVari?.name === rItem?.variations[index]?.name) count++
            }
        )
        if (count === rItem?.variations?.length) similar.push(item)
    })
    if (similar?.length === 0) return undefined

    let selectedOptions: any[] = []
    const similarVariations = getSimilarVariations(
        rItem.variations,
        similar?.[0]?.variation
    )
    similarVariations?.forEach((variation: any) => {
        variation?.values?.forEach((item: any) => {
            if (item?.isSelected) selectedOptions.push(item)
        })
    })

    const itemsBasePrice = getConvertDiscount(
        rItem?.discount,
        rItem?.discount_type,
        calculateItemBasePrice(rItem, selectedOptions),
        rItem?.restaurant_discount
    )

    let totalQty = 0
    return {
        restaurant_id: rItem?.restaurant_id,
        model: rItem.available_date_starts ? 'ItemCampaign' : 'Food',
        add_on_ids:
            rItem?.add_on?.length > 0
                ? rItem?.add_on?.map((add: any) => add.id)
                : [],
        add_on_qtys:
            rItem?.add_on?.length > 0
                ? rItem?.add_on?.map((add: any) => {
                      totalQty = add.quantity
                      return totalQty
                  })
                : [],
        item_id: rItem?.id,
        price: itemsBasePrice,
        quantity: similar?.[0]?.quantity,
        variation_options: ([] as number[]).concat(
            ...getSimilarVariations(
                rItem.variations,
                similar?.[0]?.variation
            )?.map((variation: any) =>
                variation.values
                    ?.filter((item: any) => item.isSelected)
                    ?.map((item: any) => item.option_id)
            )
        ),
        variations: getSimilarVariations(
            rItem.variations,
            similar?.[0]?.variation
        )?.map((variation: any) => ({
            name: variation.name,
            values: {
                label: handleValuesFromCartItems(variation.values),
            },
        })),
    }
}

interface UseReorderFlowReturn {
    triggerReorder: (args: TriggerArgs) => Promise<void>
    isWorking: boolean
}

export default function useReorderFlow(): UseReorderFlowReturn {
    const dispatch = useDispatch()
    const router = useRouter()
    const isRestaurantPage = router.pathname === '/restaurants/[id]'
    const pageRestaurantId = isRestaurantPage
        ? (router.query.id as string | undefined)
        : undefined
    const { cartList } = useSelector(
        (state: { cart: { cartList: any[] } }) => state.cart
    )

    const { mutateAsync: removeCartAsync } = useDeleteAllCartItem() as {
        mutateAsync: (id: any) => Promise<void>
    }
    const { mutateAsync: fetchFoodList, isLoading: fetchingFoodList } =
        useMutation('food-lists', OrderApi.foodLists)
    const { mutate: reorderAddToCartMutate, isLoading: addingToCart } =
        useReorderAddToCart() as {
            mutate: (list: any, opts?: any) => void
            isLoading: boolean
        }

    const triggerReorder = useCallback(
        async ({ orderData, onComplete }: TriggerArgs) => {
            const location =
                typeof window !== 'undefined'
                    ? localStorage.getItem('location')
                    : null
            if (!location) {
                dispatch(setOpenMapDrawer(true))
                return
            }

            const reorderRestaurantId =
                orderData?.[0]?.food_details?.restaurant_id

            // Clear current cart (Redux + API) if present. Await the delete
            // before adding reorder items so the "already exists" race is
            // eliminated. If no cart exists, skip straight to the add step.
            if (cartList?.length > 0) {
                dispatch(setClearCart(undefined))
                if (reorderRestaurantId != null) {
                    dispatch(removeCartGroupByRestaurantId(reorderRestaurantId))
                }
                try {
                    await removeCartAsync({
                        guestId: getGuestId(),
                        restaurantId: reorderRestaurantId,
                    })
                } catch (err) {
                    onErrorResponse(err)
                    return
                }
            }

            // Fetch current food state for the historical food ids.
            const foodIds = JSON.stringify(
                orderData?.map((item: any) => item?.food_id) ?? []
            )
            let foodListResp: any
            try {
                foodListResp = await fetchFoodList(foodIds)
            } catch (err) {
                onErrorResponse(err)
                return
            }
            // here if order item length and food list response length are not equal
            // that means some of items are unavailable so we need to show error message

            const reorderAbleItem = getReorderAbleItems(
                foodListResp?.data,
                orderData
            )
            if (reorderAbleItem?.length === 0) {
                toast.error(
                    tStatic(
                        'Current orders can not be reordered as some changes occurred to the items.'
                    )
                )
                return
            }

            if (reorderAbleItem.length < orderData.length) {
                toast.error(
                    tStatic(
                        'This order can\'t be reordered — one or more items are unavailable.'
                    )
                )
                return
            }

            const item_list = reorderAbleItem.map((rItem) =>
                buildCartRow(rItem, orderData)
            )
            // Match existing Reorder.js semantics: only submit when every row
            // built successfully (otherwise the user would get a partial
            // reorder with no indication).
            if (!item_list.every((item) => item !== undefined)) return

            reorderAddToCartMutate(item_list, {
                onSuccess: (res: any) => {
                    if (res) {
                        const guestId = getGuestId()
                        const token = getToken()
                        const guestParam =
                            !token && guestId ? `guest_id=${guestId}` : ''

                        // Grouped view (used by FloatingCart on
                        // non-restaurant routes) — always refresh.
                        const groupedQs = guestParam ? `?${guestParam}` : ''
                        MainApi.get(`api/v1/customer/cart/get-all${groupedQs}`)
                            .then(({ data }) => {
                                if (Array.isArray(data))
                                    dispatch(setCartGroups(data))
                            })
                            .catch(onErrorResponse)

                        // Per-restaurant view (used by FloatingCart on
                        // /restaurants/[id]) — refresh cartList from the
                        // canonical server response, scoped to the page's
                        // restaurant_id (not the reorder's), since the
                        // FloatingCart filters its bubble/list by URL id.
                        if (isRestaurantPage && pageRestaurantId) {
                            const sep = guestParam ? '&' : ''
                            MainApi.get(
                                `api/v1/customer/cart/list?${guestParam}${sep}restaurant_id=${pageRestaurantId}`
                            )
                                .then(({ data }) => {
                                    if (!Array.isArray(data)) return
                                    const mapped = data.map((entry: any) => ({
                                        ...entry?.item,
                                        cartItemId: entry?.id,
                                        totalPrice: entry?.price,
                                        selectedAddons: getSelectedAddons(
                                            entry?.item?.addons
                                        ),
                                        quantity: entry?.quantity,
                                        variations: entry?.item?.variations,
                                        itemBasePrice: getConvertDiscount(
                                            entry?.item?.discount,
                                            entry?.item?.discount_type,
                                            calculateItemBasePrice(
                                                entry?.item,
                                                entry?.item?.variations
                                            ),
                                            entry?.item?.restaurant_discount
                                        ),
                                        selectedOptions: getSelectedVariations(
                                            entry?.item?.variations
                                        ),
                                    }))
                                    dispatch(cart(mapped))
                                })
                                .catch(onErrorResponse)
                        }

                        toast.success(
                            tStatic(
                                'Reorderable items added to the cart successfully.'
                            )
                        )
                        onComplete?.()
                    }
                },
                onError: onErrorResponse,
            })
        },
        [
            dispatch,
            isRestaurantPage,
            pageRestaurantId,
            cartList,
            removeCartAsync,
            fetchFoodList,
            reorderAddToCartMutate,
        ]
    )

    return {
        triggerReorder,
        isWorking: fetchingFoodList || addingToCart,
    }
}
