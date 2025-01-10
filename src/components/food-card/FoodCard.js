import { CustomToaster } from '@/components/custom-toaster/CustomToaster'
import { ProductsApi } from '@/hooks/react-query/config/productsApi'
import { useWishListDelete } from '@/hooks/react-query/config/wish-list/useWishListDelete'
import { setCart, setClearCart } from '@/redux/slices/cart'
import { addWishList, removeWishListFood } from '@/redux/slices/wishList'
import { getConvertDiscount, handleBadge } from '@/utils/customFunctions'
import React, { memo, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import useAddCartItem from '../../hooks/react-query/add-cart/useAddCartItem'
import { onErrorResponse } from '../ErrorResponse'
import { RTL } from '../RTL/RTL'
import { getGuestId } from '../checkout-page/functions/getGuestUserId'
import CustomModal from '../custom-modal/CustomModal'
import CartClearModal from '../foodDetail-modal/CartClearModal'
import FoodVerticalCard from './FoodVerticalCard'
import HorizontalFoodCard from './HorizontalFoodCard'
import LocationModalAlert from './LocationModalAlert'
import useDeleteAllCartItem from '@/hooks/react-query/add-cart/useDeleteAllCartItem'
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
    const [clearCartModal, setClearCartModal] = React.useState(false)
    const handleClearCartModalOpen = () => setClearCartModal(true)
    const { wishLists } = useSelector((state) => state.wishList)
    const { cartList } = useSelector((state) => state.cart)
    const { mutate: addToCartMutate, isLoading: addToCartLoading } =
        useAddCartItem()
    const { mutate: deleteCartItemMutate } = useDeleteAllCartItem()
    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint

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
    const isInCart = cartList?.find((things) => things.id === product?.id)

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
            setClearCartModal(false)
        }
    }
    const addToCartHandler = () => {
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
        }
        if (cartList.length > 0) {
            const isRestaurantExist = cartList.find(
                (item) => item.restaurant_id === product.restaurant_id
            )
            if (isRestaurantExist) {
                addToCartMutate(itemObject, {
                    onSuccess: handleSuccess,
                    onError: onErrorResponse,
                })
            } else {
                if (cartList.length !== 0) {
                    handleClearCartModalOpen()
                }
            }
        } else {
            if (!isInCart) {
                addToCartMutate(itemObject, {
                    onSuccess: handleSuccess,
                    onError: onErrorResponse,
                })
            }
        }
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
        const product = cartList.find((cartItem) => cartItem.id === id)
        return product && product.quantity ? product.quantity : 1
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
        setIncrOpen(true)
    }
    const clearCartAlert = () => {
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
        }
        deleteCartItemMutate(getGuestId(), {
            onError: onErrorResponse,
        })
        dispatch(setClearCart())
        addToCartMutate(itemObject, {
            onSuccess: handleSuccess,
            onError: onErrorResponse,
        })

        toast.success(
            t(
                'Previously added restaurant foods have been removed from cart and the selected one added'
            ),
            {
                duration: 6000,
            }
        )
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
            <CartClearModal
                clearCartModal={clearCartModal}
                setClearCartModal={setClearCartModal}
                clearCartAlert={clearCartAlert}
                addToCard={addToCart}
            />
        </>
    )
}

FoodCard.propTypes = {}

export default memo(FoodCard)
