import { CustomToaster } from '@/components/custom-toaster/CustomToaster'
import { ProductsApi } from '@/hooks/react-query/config/productsApi'
import { useWishListDelete } from '@/hooks/react-query/config/wish-list/useWishListDelete'
import { setCart, setClearCart } from '@/redux/slices/cart'
import { addWishList, removeWishListFood } from '@/redux/slices/wishList'
import { getConvertDiscount, handleBadge } from '@/utils/customFunctions'
import React, { memo, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import useAddCartItem from '../../hooks/react-query/add-cart/useAddCartItem'
import { onErrorResponse } from '../ErrorResponse'
import { RTL } from '../RTL/RTL'
import { getGuestId } from '../checkout-page/functions/getGuestUserId'
import CustomModal from '../custom-modal/CustomModal'
import FoodVerticalCard from './FoodVerticalCard'
import HorizontalFoodCard from './HorizontalFoodCard'
import LocationModalAlert from './LocationModalAlert'
import dynamic from 'next/dynamic'
const FoodDetailModal = dynamic(() =>
    import('../foodDetail-modal/FoodDetailModal')
)

const FoodCard = ({
    product,
    horizontal,
    productImageUrl,
    hasBackGroundSection,
    isShop,
    isRestaurantDetails,
    inWishListPage,
    campaign,
}) => {
    const dispatch = useDispatch()
    const { image_full_url, available_time_ends, available_time_starts } =
        product

    const [openModal, setOpenModal] = React.useState(false)
    const [openAddressModalAlert, setOpenAddressModalAlert] = useState(false)
    const { t } = useTranslation()
    const { global } = useSelector((state) => state.globalSettings)
    const { token } = useSelector((state) => state.userToken)
    const imageUrl = image_full_url
    const [modalData, setModalData] = useState([])
    const [incrOpen, setIncrOpen] = useState(false)
    let location = undefined
    if (typeof window !== 'undefined') {
        location = localStorage.getItem('location')
    }
    const { wishLists } = useSelector((state) => state.wishList)
    const { cartList, cartGroups = [] } = useSelector((state) => state.cart)

    console.log({cartGroups,cartList});
    
    const { mutate: addToCartMutate, isLoading: addToCartLoading } =
        useAddCartItem()
    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint
console.log({cartList});

    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }

    const handleFoodDetailModal = (e) => {
        e.stopPropagation()
        setOpenModal(true)
    }
    const languageDirection = localStorage.getItem('direction')
    const handleModalClose = () => {
        setOpenModal(false)
    }

    const { mutate: addFavoriteMutation } = useMutation(
        'add-favourite',
        () => ProductsApi.addFavorite(product.id),
        {
            onSuccess: (response) => {
                if (response?.data) {
                    dispatch(addWishList(product))
                    toast.success(response.data.message)
                }
            },
            onError: (error) => {
                toast.error(error.response.data.message)
            },
        }
    )

    const addToFavorite = (e) => {
        e.stopPropagation()
        if (token) {
            addFavoriteMutation()
        } else toast.error(t('You are not logged in'))
    }

    const onSuccessHandlerForDelete = (res) => {
        dispatch(removeWishListFood(product.id))
        toast.success(res.message, {
            id: 'wishlist',
        })
    }
    const { mutate } = useWishListDelete()
    const deleteWishlistItem = (id, e) => {
        e.stopPropagation()
        mutate(id, {
            onSuccess: onSuccessHandlerForDelete,
            onError: (error) => {
                toast.error(error.response.data.message)
            },
        })
    }

    const isInList = (id) => {
        return !!wishLists?.food?.find((wishFood) => wishFood.id === id)
    }

    // Same merge pattern as NewFoodCard: cartList is scoped to the
    // last-visited restaurant once that restaurant's API returns, so items
    // from other restaurants must be picked up from cartGroups to keep the
    // "in cart" badge accurate across the multi-restaurant cart. cartList
    // wins on id conflicts because it reflects pending local +/- updates.
    const effectiveCart = useMemo(() => {
        const fromGroups = (cartGroups || [])
            .flatMap((g) => g?.carts || [])
            .map((c) => ({
                ...c?.item,
                cartItemId: c?.id,
                totalPrice: c?.price,
                quantity: c?.quantity,
                restaurant_id: c?.restaurant_id,
            }))
        const cartListIds = new Set((cartList || []).map((i) => i.id))
        return [
            ...(cartList || []),
            ...fromGroups.filter((g) => !cartListIds.has(g.id)),
        ]
    }, [cartList, cartGroups])

    const isInCart = effectiveCart?.find((things) => things.id === product?.id)

    useEffect(() => {
        if (product) {
            setModalData([product])
        }
    }, [product])

    const handleSuccess = (res) => {
        if (res) {
            let product = {}
            res?.forEach((item) => {
                product = {
                    ...item?.item,
                    cartItemId: item?.id,
                    totalPrice: getConvertDiscount(
                        item?.item?.discount,
                        item?.item?.discount_type,
                        item?.item?.price,
                        item?.item?.restaurant_discount,
                        item?.item?.quantity
                    ),
                    quantity: item?.quantity,
                    itemBasePrice: getConvertDiscount(
                        item?.item?.discount,
                        item?.item?.discount_type,
                        item?.item?.price,
                        item?.item?.restaurant_discount
                    ),
                }
            })
            dispatch(setCart(product))
            toast.success(t('Item added to cart'))
        }
    }
    const addToCartHandler = () => {
        if (isInCart) return
        const itemObject = {
            guest_id: getGuestId(),
            model: modalData[0]?.available_date_starts
                ? 'ItemCampaign'
                : 'Food',
            add_on_ids: [],
            add_on_qtys: [],
            item_id: modalData[0]?.id,
            price: modalData[0]?.price,
            quantity: modalData[0]?.quantity ?? 1,
            variations: [],
            restaurant_id: modalData[0]?.restaurant_id,
        }
        addToCartMutate(itemObject, {
            onSuccess: handleSuccess,
            onError: onErrorResponse,
        })
    }

    const addToCart = (e) => {
        if (location) {
            if (
                product?.variations.length > 0 ||
                product?.add_ons?.length > 0
            ) {
                setOpenModal(true)
            } else if (product?.available_date_ends) {
                setOpenModal(true)
            } else {
                if (
                    product?.item_stock === 0 &&
                    product.stock_type !== 'unlimited'
                ) {
                    e.stopPropagation()
                    CustomToaster('error', t('Out Of Stock'), product?.id)
                } else {
                    addToCartHandler()
                    e.stopPropagation()
                }
            }
        } else {
            e.stopPropagation()
            setOpenAddressModalAlert(true)
        }
    }
    const getQuantity = (id) => {
        const product = effectiveCart.filter((cartItem) => cartItem.id === id)

        if (product?.length > 1) {
            return product && product?.reduce((acc, curr) => acc + curr.quantity, 0)
        } else {
            return product && product[0].quantity ? product[0].quantity : 1
        }



    }
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setIncrOpen(false)
        }, 10000)

        return () => {
            clearTimeout(timeoutId)
        }
    }, [incrOpen])

    const handleClickQuantityButton = (e) => {
        e.stopPropagation()
        if (product?.variations?.length === 0) {
            setIncrOpen(true)
        } else {
            setOpenModal(true)
        }


    }

    return (
        <>
            {horizontal === 'true' ? (
                <HorizontalFoodCard
                    isInList={isInList}
                    product={product}
                    imageUrl={imageUrl}
                    addToFavorite={addToFavorite}
                    deleteWishlistItem={deleteWishlistItem}
                    setOpenModal={setOpenModal}
                    available_time_starts={available_time_starts}
                    available_time_ends={available_time_ends}
                    languageDirection={languageDirection}
                    handleFoodDetailModal={handleFoodDetailModal}
                    handleBadge={handleBadge}
                    addToCart={addToCart}
                    isInCart={isInCart}
                    getQuantity={getQuantity}
                    incrOpen={incrOpen}
                    setIncrOpen={setIncrOpen}
                    handleClickQuantityButton={handleClickQuantityButton}
                    hasBackGroundSection={hasBackGroundSection}
                    addToCartLoading={addToCartLoading}
                    isShop={isShop}
                    isRestaurantDetails={isRestaurantDetails}
                    inWishListPage={inWishListPage}
                    horizontal={horizontal}
                />
            ) : (
                <FoodVerticalCard
                    isInList={isInList}
                    product={product}
                    imageUrl={imageUrl}
                    productImageUrl={productImageUrl}
                    addToFavorite={addToFavorite}
                    deleteWishlistItem={deleteWishlistItem}
                    setOpenModal={setOpenModal}
                    available_time_starts={available_time_starts}
                    available_time_ends={available_time_ends}
                    languageDirection={languageDirection}
                    handleFoodDetailModal={handleFoodDetailModal}
                    handleBadge={handleBadge}
                    addToCart={addToCart}
                    isInCart={isInCart}
                    getQuantity={getQuantity}
                    incrOpen={incrOpen}
                    setIncrOpen={setIncrOpen}
                    handleClickQuantityButton={handleClickQuantityButton}
                    hasBackGroundSection={hasBackGroundSection}
                    addToCartLoading={addToCartLoading}
                    isRestaurantDetails={isRestaurantDetails}
                    horizontal={horizontal}
                    global={global}
                />
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
            {
                <CustomModal
                    openModal={openAddressModalAlert}
                    setModalOpen={setOpenAddressModalAlert}
                >
                    <LocationModalAlert
                        setOpenAddressModalAlert={setOpenAddressModalAlert}
                    />
                </CustomModal>
            }
        </>
    )
}

FoodCard.propTypes = {}

export default memo(FoodCard)
