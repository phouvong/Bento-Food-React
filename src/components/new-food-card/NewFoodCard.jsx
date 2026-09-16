import React, { memo, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useMutation, useQueryClient } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'

import { ProductsApi } from '@/hooks/react-query/config/productsApi'
import { useWishListDelete } from '@/hooks/react-query/config/wish-list/useWishListDelete'
import useAddCartItem from '@/hooks/react-query/add-cart/useAddCartItem'
import useCartItemUpdate from '@/hooks/react-query/add-cart/useCartItemUpdate'
import useDeleteCartItem from '@/hooks/react-query/add-cart/useDeleteCartItem'
import { refreshCartGroups } from '@/hooks/react-query/add-cart/useGetAllCartList'
import {
    setCart,
    setClearCart,
    incrementProductQty,
    decrementProductQty,
    removeProduct,
} from '@/redux/slices/cart'
import { addWishList, removeWishListFood } from '@/redux/slices/wishList'
import {
    calculateItemBasePrice,
    getAmount,
    handleBadge,
    handleIncrementedTotal,
    isAvailable,
} from '@/utils/customFunctions'
import { getItemDataForAddToCart } from '@/components/floating-cart/helperFunction'
import { getSelectedAddons } from '@/components/navbar/second-navbar/SecondNavbar'
import { CustomToaster } from '@/components/custom-toaster/CustomToaster'
import { onErrorResponse } from '@/components/ErrorResponse'
import { RTL } from '@/components/RTL/RTL'
import { getGuestId } from '@/components/checkout-page/functions/getGuestUserId'
import CustomModal from '@/components/custom-modal/CustomModal'
import LocationModalAlert from '@/components/food-card/LocationModalAlert'
import NewFoodCardVertical from '@/components/new-food-card/NewFoodCardVertical'
import NewFoodCardHorizontal from '@/components/new-food-card/NewFoodCardHorizontal'
import NewFoodBogoCard from './NewFoodBogoCard'
import { rawFoodDataNormalize } from './rawFoodDataNormalize'

const FoodDetailModal = dynamic(() =>
    import('@/components/foodDetail-modal/FoodDetailModal')
)

// Owns all state, mutations, and business logic. The vertical/horizontal
// variants are pure presentational components — every value/handler they
// need is passed down as a prop, nothing is duplicated or recomputed there.
const NewFoodCard = ({
    product,
    productImageUrl,
    campaign,
    variant = 'vertical',
    mediaSize,
}) => {
    const dispatch = useDispatch()
    const queryClient = useQueryClient()
    const { t } = useTranslation()
    const { global } = useSelector((state) => state.globalSettings)
    const { token } = useSelector((state) => state.userToken)
    const { wishLists } = useSelector((state) => state.wishList)
    const { cartList, cartGroups = [] } = useSelector((state) => state.cart)
    const [openModal, setOpenModal] = useState(false)
    const [modalData, setModalData] = useState([])
    const [openAddressModalAlert, setOpenAddressModalAlert] = useState(false)
    const [incrOpen, setIncrOpen] = useState(false)

    const { mutate: addToCartMutate, isLoading: addToCartLoading } =
        useAddCartItem()
    const { mutate: updateMutate, isLoading: updatedLoading } =
        useCartItemUpdate()
    const { mutate: itemRemove, isLoading: removeIsLoading } =
        useDeleteCartItem()

    const imageUrl = product?.image_full_url
    const currencySymbol = global?.currency_symbol
    const currencySymbolDirection = global?.currency_symbol_direction
    const digitAfterDecimalPoint = global?.digit_after_decimal_point

    let location
    if (typeof window !== 'undefined') {
        location = localStorage.getItem('location')
    }
    const languageDirection =
        typeof window !== 'undefined'
            ? localStorage.getItem('direction')
            : 'ltr'

    useEffect(() => {
        if (product) setModalData([product])
    }, [product])

    useEffect(() => {
        if (!incrOpen) return
        const timeoutId = setTimeout(() => setIncrOpen(false), 10000)
        return () => clearTimeout(timeoutId)
    }, [incrOpen])

    const handleFoodDetailModal = (e) => {
        e.stopPropagation()
        setOpenModal(true)
    }
    const handleModalClose = () => setOpenModal(false)

    const { mutate: addFavoriteMutation } = useMutation(
        'new-food-card-fav',
        () => ProductsApi.addFavorite(product.id),
        {
            onSuccess: (response) => {
                if (response?.data) {
                    dispatch(addWishList(product))
                    toast.success(response.data.message)
                }
            },
            onError: (error) =>
                toast.error(error?.response?.data?.message || t('Error')),
        }
    )

    const addToFavorite = (e) => {
        e.stopPropagation()
        if (token) addFavoriteMutation()
        else toast.error(t('You are not logged in'))
    }

    const onSuccessHandlerForDelete = (res) => {
        dispatch(removeWishListFood(product.id))
        toast.success(res.message, { id: 'wishlist' })
    }
    const { mutate: wishDeleteMutate } = useWishListDelete()
    const deleteWishlistItem = (e) => {
        e.stopPropagation()
        wishDeleteMutate(product.id, {
            onSuccess: onSuccessHandlerForDelete,
            onError: (error) =>
                toast.error(error?.response?.data?.message || t('Error')),
        })
    }

    const isInList = !!wishLists?.food?.find((i) => i.id === product?.id)

    // Combine cartList (scoped to the last-visited restaurant after its API
    // returns a flat list) with the grouped cart payload that holds items
    // from every restaurant. Without this merge, an item added at one
    // restaurant disappears from "in cart" badges as soon as the user visits
    // a different restaurant. cartList entries win on id conflict because
    // they reflect local +/- dispatches that haven't synced yet.
    const effectiveCart = useMemo(() => {
        const fromGroups = (cartGroups || [])
            .flatMap((g) => g?.carts || [])
            .map((c) => ({
                ...c?.item,
                cartItemId: c?.id,
                totalPrice: c?.price,
                quantity: c?.quantity,
                variations: c?.item?.variations,
                selectedAddons: getSelectedAddons(c?.item?.addons),
                itemBasePrice: rawFoodDataNormalize({
                    price: calculateItemBasePrice(
                        c?.item,
                        c?.item?.variations
                    ),
                    discount: c?.item?.discount,
                    discount_type: c?.item?.discount_type,
                }).discountedPrice,
                restaurant_id: c?.restaurant_id,
            }))
        const cartListIds = new Set((cartList || []).map((i) => i.id))
        return [
            ...(cartList || []),
            ...fromGroups.filter((g) => !cartListIds.has(g.id)),
        ]
    }, [cartList, cartGroups])

    const isInCart = effectiveCart?.find(
        (i) =>
            i.id === product?.id &&
            (product?.restaurant_id == null ||
                i?.restaurant_id == null ||
                String(i.restaurant_id) === String(product.restaurant_id))
    )

    const getQuantity = (id) => {
        const items = effectiveCart?.filter(
            (ci) =>
                ci.id === id &&
                (product?.restaurant_id == null ||
                    ci?.restaurant_id == null ||
                    String(ci.restaurant_id) === String(product.restaurant_id))
        )
        if (items?.length > 1) {
            return items.reduce((acc, curr) => acc + curr.quantity, 0)
        }
        return items && items[0]?.quantity ? items[0].quantity : 1
    }

    const cartUpdateHandleSuccess = (res) => {
        if (res) {
            res?.forEach((item) => {
                if (isInCart?.cartItemId === item?.id) {
                    const updated = {
                        ...item?.item,
                        cartItemId: item?.id,
                        totalPrice: item?.price,
                        quantity: item?.quantity,
                        variations: item?.item?.variations,
                        selectedAddons: getSelectedAddons(item?.item?.addons),
                        itemBasePrice: rawFoodDataNormalize({
                            price: calculateItemBasePrice(
                                item,
                                item?.item?.variations
                            ),
                            discount: item?.item?.discount,
                            discount_type: item?.item?.discount_type,
                        }).discountedPrice,
                    }
                    dispatch(incrementProductQty(updated))
                }
            })
        }
    }

    const cartUpdateHandleSuccessDecrement = (res) => {
        if (res) {
            res?.forEach((item) => {
                if (isInCart?.cartItemId === item?.id) {
                    const updated = {
                        ...item?.item,
                        cartItemId: item?.id,
                        totalPrice: item?.price,
                        quantity: item?.quantity,
                        variations: item?.item?.variations,
                        selectedAddons: getSelectedAddons(item?.item?.addons),
                        itemBasePrice: rawFoodDataNormalize({
                            price: calculateItemBasePrice(
                                item,
                                item?.item?.variations
                            ),
                            discount: item?.item?.discount,
                            discount_type: item?.item?.discount_type,
                        }).discountedPrice,
                    }
                    dispatch(decrementProductQty(updated))
                }
            })
        }
    }

    const handleIncrement = (e) => {
        e.stopPropagation()
        if (
            getQuantity(product?.id) >= product?.item_stock &&
            product?.stock_type !== 'unlimited'
        ) {
            CustomToaster('error', t('Out Of Stock'))
            return
        }
        if (
            product?.maximum_cart_quantity &&
            product?.maximum_cart_quantity <= getQuantity(product?.id)
        ) {
            toast.error(t('Out Of Limits'))
            return
        }
        const updateQuantity = isInCart?.quantity + 1
        const totalPrice = handleIncrementedTotal(
            isInCart?.itemBasePrice,
            updateQuantity,
            isInCart?.discount,
            isInCart?.discount_type
        )
        const itemObject = getItemDataForAddToCart(
            isInCart,
            updateQuantity,
            totalPrice,
            getGuestId()
        )
        updateMutate(itemObject, {
            onSuccess: cartUpdateHandleSuccess,
            onError: onErrorResponse,
        })
    }

    const handleDecrement = (e) => {
        e.stopPropagation()
        const updateQuantity = isInCart?.quantity - 1
        const totalPrice = handleIncrementedTotal(
            isInCart?.itemBasePrice,
            updateQuantity,
            isInCart?.discount,
            isInCart?.discount_type
        )
        const itemObject = getItemDataForAddToCart(
            isInCart,
            updateQuantity,
            totalPrice,
            getGuestId()
        )
        updateMutate(itemObject, {
            onSuccess: cartUpdateHandleSuccessDecrement,
            onError: onErrorResponse,
        })
    }

    const handleRemove = (e) => {
        e.stopPropagation()
        const cartIdAndGuestId = {
            cart_id: isInCart?.cartItemId,
            guestId: getGuestId(),
            restaurant_id: isInCart?.restaurant_id,
        }
        itemRemove(cartIdAndGuestId, {
            onSuccess: () => dispatch(removeProduct(isInCart)),
            onError: onErrorResponse,
        })
    }

    const handleCartSuccess = (res) => {
        if (res) {
            let pr = {}
            res?.forEach((item) => {
                pr = {
                    ...item?.item,
                    cartItemId: item?.id,
                    totalPrice: rawFoodDataNormalize(
                        {
                            price: item?.item?.price,
                            discount: item?.item?.discount,
                            discount_type: item?.item?.discount_type,
                        },
                        item?.item?.quantity
                    ).discountedPrice,
                    quantity: item?.quantity,
                    itemBasePrice: rawFoodDataNormalize({
                        price: item?.item?.price,
                        discount: item?.item?.discount,
                        discount_type: item?.item?.discount_type,
                    }).discountedPrice,
                }
            })
            dispatch(setCart(pr))
            refreshCartGroups(dispatch)
            queryClient.refetchQueries('cart-item-restaurant')
            toast.success(t('Item added to cart'))
            //setClearCartModal?.(false)
        }
    }

    const addToCartHandler = () => {
        const addToCartQuantity = modalData[0]?.quantity ?? 1
        const itemObject = {
            guest_id: getGuestId(),
            model: modalData[0]?.available_date_starts
                ? 'ItemCampaign'
                : 'Food',
            add_on_ids: [],
            add_on_qtys: [],
            item_id: modalData[0]?.id,
            price: rawFoodDataNormalize(modalData[0], addToCartQuantity)
                .discountedPrice,
            quantity: addToCartQuantity,
            variations: [],
            restaurant_id: modalData[0]?.restaurant_id,
        }
        if (!isInCart) {
            addToCartMutate(itemObject, {
                onSuccess: handleCartSuccess,
                onError: onErrorResponse,
            })
        }
    }

    const addToCart = (e) => {
        e.stopPropagation()
        if (!location) {
            setOpenAddressModalAlert(true)
            return
        }
        if (product?.variations?.length > 0 || product?.add_ons?.length > 0) {
            setOpenModal(true)
        } else if (product?.available_date_ends) {
            setOpenModal(true)
        } else if (
            product?.item_stock === 0 &&
            product?.stock_type !== 'unlimited'
        ) {
            CustomToaster('error', t('Out Of Stock'), product?.id)
        } else {
            addToCartHandler()
        }
    }

    const { discount, discountType, discountedPrice, hasDiscount } =
        rawFoodDataNormalize(product)

    const discountBadgeText = (() => {
        if (discount > 0) {
            if (discountType === 'percent') {
                return `${Math.round(discount)}% ${t('OFF')}`
            }
            return `${getAmount(
                discount,
                currencySymbolDirection,
                currencySymbol,
                digitAfterDecimalPoint
            )} ${t('OFF')}`
        }
        return null
    })()

    const available_time_starts = product?.available_time_starts
    const available_time_ends = product?.available_time_ends
    const available = isAvailable(available_time_starts, available_time_ends)

    const showVegBadge = global?.toggle_veg_non_veg === true
    const showHalalBadge = product?.is_halal === 1

    // Provider (restaurant) verified/logo — the API shape isn't nailed down
    // for this card's product payload, so fall back across the field names
    // already used for the same concept elsewhere in the app (ReorderCard,
    // NewStoreCard use restaurant?.verified / restaurant?.logo_full_url).
    const providerVerified =
        product?.restaurant?.verified ??
        product?.restaurant?.verified_seller ??
        product?.restaurant_verified ??
        product?.verified_seller
    const providerLogoUrl =
        product?.restaurant?.logo_full_url ??
        product?.restaurant_logo_full_url ??
        product?.logo_full_url

    const isHorizontal = variant === 'horizontal'
    const isBogo = variant === 'bogo'

    const cardProps = {
        product,
        imageUrl,
        available,
        showVegBadge,
        showHalalBadge,
        providerVerified,
        providerLogoUrl,
        isInList,
        addToFavorite,
        deleteWishlistItem,
        isInCart,
        incrOpen,
        setIncrOpen,
        setOpenModal,
        addToCart,
        addToCartLoading,
        handleIncrement,
        handleDecrement,
        handleRemove,
        updatedLoading,
        removeIsLoading,
        getQuantity,
        discountedPrice,
        hasDiscount,
        discountBadgeText,
        currencySymbolDirection,
        currencySymbol,
        digitAfterDecimalPoint,
        onCardClick: handleFoodDetailModal,
    }

    return (
        <>
            {isBogo ? (
                <NewFoodBogoCard {...cardProps} />
            ) : isHorizontal ? (
                <NewFoodCardHorizontal {...cardProps} mediaSize={mediaSize} />
            ) : (
                <NewFoodCardVertical {...cardProps} />
            )}

            {openModal && (
                <RTL direction={languageDirection}>
                    <FoodDetailModal
                        product={product}
                        image={imageUrl}
                        open={openModal}
                        handleModalClose={handleModalClose}
                        setOpen={setOpenModal}
                        currencySymbolDirection={currencySymbolDirection}
                        currencySymbol={currencySymbol}
                        digitAfterDecimalPoint={digitAfterDecimalPoint}
                        handleBadge={handleBadge}
                        campaign={campaign}
                    />
                </RTL>
            )}

            <CustomModal
                openModal={openAddressModalAlert}
                setModalOpen={setOpenAddressModalAlert}
            >
                <LocationModalAlert
                    setOpenAddressModalAlert={setOpenAddressModalAlert}
                />
            </CustomModal>
        </>
    )
}

export default memo(NewFoodCard)
