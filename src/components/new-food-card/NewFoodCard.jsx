import React, { memo, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useMutation } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import {
    Box,
    IconButton,
    Stack,
    Tooltip,
    Typography,
    alpha,
    styled,
    useTheme,
} from '@mui/material'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'

import { ProductsApi } from '@/hooks/react-query/config/productsApi'
import { useWishListDelete } from '@/hooks/react-query/config/wish-list/useWishListDelete'
import useAddCartItem from '@/hooks/react-query/add-cart/useAddCartItem'
import useDeleteAllCartItem from '@/hooks/react-query/add-cart/useDeleteAllCartItem'
import useCartItemUpdate from '@/hooks/react-query/add-cart/useCartItemUpdate'
import useDeleteCartItem from '@/hooks/react-query/add-cart/useDeleteCartItem'
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
    getConvertDiscount,
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
import CartClearModal from '@/components/foodDetail-modal/CartClearModal'
import LocationModalAlert from '@/components/food-card/LocationModalAlert'
import CustomImageContainer from '@/components/CustomImageContainer'
import VagSvg from '@/components/foodDetail-modal/VagSvg'
import HalalSvg from '@/components/food-card/HalalSvg'
import CircularLoader from '@/components/loader/CircularLoader'

const FoodDetailModal = dynamic(() =>
    import('@/components/foodDetail-modal/FoodDetailModal')
)

const CardRoot = styled(Box)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    width: '100%',
    transition: 'transform .2s ease',
    '&:hover': { transform: 'translateY(-2px)' },
    '&:hover .new-food-wish': {
        opacity: 1,
        transform: 'scale(1)',
    },
    '&:hover .new-food-media img': { transform: 'scale(1.04)' },
}))

const Media = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: 12,
    overflow: 'visible',
    backgroundColor: theme.palette.neutral[200],
    marginBottom: 10,
    '& img': {
        width: '100% !important',
        height: '100% !important',
        objectFit: 'cover',
        borderRadius: 12,
        transition: 'transform .45s ease',
    },
}))

const MediaInner = styled(Box)(() => ({
    position: 'absolute',
    inset: 0,
    borderRadius: 12,
    overflow: 'hidden',
}))

const UnavailableOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    inset: 0,
    borderRadius: 12,
    backgroundColor: alpha(theme.palette.common.black, 0.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
    pointerEvents: 'none',
}))

const UnavailableText = styled(Typography)(({ theme }) => ({
    color: theme.palette.common.white,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.02em',
    textAlign: 'center',
    padding: '4px 10px',
}))

const DiscountBadge = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: '3px 8px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 800,
    zIndex: 3,
    boxShadow: `0 2px 6px ${alpha(theme.palette.primary.main, 0.3)}`,
    letterSpacing: '0.02em',
}))

const RatingTile = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    position: 'absolute',
    bottom: 8,
    left: 8,
    padding: '2px 7px',
    borderRadius: 4,
    backgroundColor: alpha(theme.palette.background.paper, 0.96),
    color: theme.palette.text.primary,
    fontSize: 10.5,
    fontWeight: 700,
    zIndex: 3,
    '& svg': { fontSize: 11, color: theme.palette.warning.main },
}))

const VegWrap = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 8,
    left: 8,
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: alpha(theme.palette.background.paper, 0.96),
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: theme.shadows[1],
    zIndex: 3,
    '& svg': { fontSize: 12 },
}))

const HalalWrap = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 30,
    left: 8,
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: alpha(theme.palette.background.paper, 0.96),
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: theme.shadows[1],
    zIndex: 3,
    '& svg': { fontSize: 12 },
}))

const WishBtn = styled(IconButton)(({ theme, hasbadge }) => ({
    position: 'absolute',
    top: hasbadge === 'true' ? 34 : 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: '50%',
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
    color: theme.palette.text.secondary,
    boxShadow: theme.shadows[2],
    fontSize: 11,
    opacity: 0,
    transform: 'scale(0.85)',
    transition: 'opacity .18s ease, transform .18s ease, color .18s ease',
    zIndex: 3,
    '& svg': { fontSize: 13 },
    '&:hover': {
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        color: theme.palette.error.main,
    },
    [theme.breakpoints.down('sm')]: {
        opacity: 1,
        transform: 'scale(1)',
    },
}))

const AddFab = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[2],
    zIndex: 4,
    transition: 'all .18s ease',
    '& svg': { fontSize: 16 },
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderColor: theme.palette.primary.main,
    },
}))

const TitleText = styled(Typography)(({ theme }) => ({
    margin: 0,
    fontWeight: 700,
    fontSize: 13,
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}))

const SubText = styled(Typography)(({ theme }) => ({
    color: theme.palette.neutral[400],
    fontSize: 11,
    fontWeight: 500,
    margin: '1px 0 4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}))

const PriceRow = styled(Stack)(() => ({
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'wrap',
}))

const PriceNow = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontWeight: 800,
    fontSize: 13,
}))

const PriceOld = styled(Typography)(({ theme }) => ({
    color: theme.palette.neutral[400],
    fontSize: 10.5,
    textDecoration: 'line-through',
}))

const NewFoodCard = ({ product, productImageUrl, campaign }) => {
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const theme = useTheme()
    const { global } = useSelector((state) => state.globalSettings)
    const { token } = useSelector((state) => state.userToken)
    const { wishLists } = useSelector((state) => state.wishList)
    const { cartList } = useSelector((state) => state.cart)

    const [openModal, setOpenModal] = useState(false)
    const [modalData, setModalData] = useState([])
    const [openAddressModalAlert, setOpenAddressModalAlert] = useState(false)
    const [clearCartModal, setClearCartModal] = useState(false)
    const [incrOpen, setIncrOpen] = useState(false)

    const { mutate: addToCartMutate, isLoading: addToCartLoading } =
        useAddCartItem()
    const { mutate: deleteCartItemMutate } = useDeleteAllCartItem()
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
    const isInCart = cartList?.find((i) => i.id === product?.id)

    const getQuantity = (id) => {
        const items = cartList?.filter((ci) => ci.id === id)
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
                        itemBasePrice: getConvertDiscount(
                            item?.item?.discount,
                            item?.item?.discount_type,
                            calculateItemBasePrice(
                                item,
                                item?.item?.variations
                            ),
                            item?.item?.restaurant_discount
                        ),
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
                        itemBasePrice: getConvertDiscount(
                            item?.item?.discount,
                            item?.item?.discount_type,
                            calculateItemBasePrice(
                                item,
                                item?.item?.variations
                            ),
                            item?.item?.restaurant_discount
                        ),
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
            dispatch(setCart(pr))
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
                (i) => i.restaurant_id === product.restaurant_id
            )
            if (isRestaurantExist) {
                addToCartMutate(itemObject, {
                    onSuccess: handleCartSuccess,
                    onError: onErrorResponse,
                })
            } else {
                setClearCartModal(true)
            }
        } else if (!isInCart) {
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
        deleteCartItemMutate(getGuestId(), { onError: onErrorResponse })
        dispatch(setClearCart())
        addToCartMutate(itemObject, {
            onSuccess: handleCartSuccess,
            onError: onErrorResponse,
        })
        toast.success(
            t(
                'Previously added restaurant foods have been removed from cart and the selected one added'
            ),
            { duration: 6000 }
        )
    }

    const discountedPrice = getConvertDiscount(
        product?.discount,
        product?.discount_type,
        product?.price,
        product?.restaurant_discount
    )
    const hasDiscount =
        (product?.discount > 0 || product?.restaurant_discount > 0) &&
        discountedPrice !== product?.price

    const discountBadgeText = (() => {
        if (product?.restaurant_discount > 0) {
            return `${Math.round(product.restaurant_discount)}% ${t('OFF')}`
        }
        if (product?.discount > 0) {
            if (product?.discount_type === 'percent') {
                return `${Math.round(product.discount)}% ${t('OFF')}`
            }
            return `${getAmount(
                product.discount,
                currencySymbolDirection,
                currencySymbol,
                digitAfterDecimalPoint
            )} ${t('OFF')}`
        }
        return null
    })()

    const categoryTags =
        (product?.category_ids?.length > 0 &&
            product.category_ids
                .slice(0, 2)
                .map((c) => c?.name || c?.id)
                .filter(Boolean)
                .join(' · ')) ||
        product?.restaurant_name ||
        ''

    const available_time_starts = product?.available_time_starts
    const available_time_ends = product?.available_time_ends
    const available = isAvailable(available_time_starts, available_time_ends)

    const showVegBadge = global?.toggle_veg_non_veg === true
    const showHalalBadge =
       product?.is_halal === 1

    const vegColor =
        product?.veg === 1 ? theme.palette.success.main : theme.palette.nonVeg

    return (
        <>
            <CardRoot onClick={handleFoodDetailModal}>
                <Media className="new-food-media">
                    <MediaInner>
                        <CustomImageContainer
                            src={imageUrl}
                            alt={product?.name}
                            width="100%"
                            height="100%"
                            objectFit="cover"
                            borderRadius="12px"
                        />
                        {showVegBadge && (
                            <VegWrap>
                                <VagSvg color={vegColor} />
                            </VegWrap>
                        )}
                        {showHalalBadge && (
                            <Tooltip title={t('This is a halal food')} arrow>
                                <HalalWrap>
                                    <HalalSvg />
                                </HalalWrap>
                            </Tooltip>
                        )}
                        {product?.avg_rating > 0 && (
                            <RatingTile>
                                <StarRoundedIcon />
                                <span>
                                    {Number(product.avg_rating).toFixed(1)}
                                </span>
                            </RatingTile>
                        )}
                        {!available && (
                            <UnavailableOverlay>
                                <UnavailableText>
                                    {t('Not Available Now')}
                                </UnavailableText>
                            </UnavailableOverlay>
                        )}
                    </MediaInner>

                    {discountBadgeText && (
                        <DiscountBadge>{discountBadgeText}</DiscountBadge>
                    )}

                    <WishBtn
                        className="new-food-wish"
                        onClick={isInList ? deleteWishlistItem : addToFavorite}
                        hasbadge={discountBadgeText ? 'true' : 'false'}
                        aria-label="wishlist"
                    >
                        {isInList ? (
                            <FavoriteIcon color="error" sx={{ fontSize: 13 }} />
                        ) : (
                            <FavoriteBorderIcon sx={{ fontSize: 13 }} />
                        )}
                    </WishBtn>

                    {available && !isInCart && (
                        <AddFab
                            onClick={addToCart}
                            disabled={addToCartLoading}
                            aria-label="add to cart"
                        >
                            <AddRoundedIcon />
                        </AddFab>
                    )}

                    {available &&
                        isInCart &&
                        (product?.variations?.length > 0 || !incrOpen ? (
                            <AddFab
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (product?.variations?.length > 0) {
                                        setOpenModal(true)
                                    } else {
                                        setIncrOpen(true)
                                    }
                                }}
                                aria-label="quantity"
                                sx={{
                                    backgroundColor: (theme) =>
                                        theme.palette.primary.main,
                                    color: (theme) =>
                                        theme.palette.primary.contrastText,
                                    borderColor: (theme) =>
                                        theme.palette.primary.main,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    '&:hover': {
                                        backgroundColor: (theme) =>
                                            theme.palette.primary.dark,
                                        color: (theme) =>
                                            theme.palette.primary.contrastText,
                                        borderColor: (theme) =>
                                            theme.palette.primary.dark,
                                    },
                                }}
                            >
                                {getQuantity(product?.id)}
                            </AddFab>
                        ) : (
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                onClick={(e) => e.stopPropagation()}
                                onMouseEnter={() => setIncrOpen(true)}
                                sx={{
                                    position: 'absolute',
                                    right: -6,
                                    bottom: -6,
                                    width: 'auto',
                                    padding: '3px 4px',
                                    borderRadius: '999px',
                                    backgroundColor: (theme) =>
                                        theme.palette.background.paper,
                                    border: (theme) =>
                                        `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                                    boxShadow: (theme) => theme.shadows[2],
                                    zIndex: 4,
                                    gap: '6px',
                                }}
                            >
                                {isInCart?.quantity === 1 ? (
                                    <IconButton
                                        disabled={removeIsLoading}
                                        size="small"
                                        aria-label="remove"
                                        onClick={handleRemove}
                                        sx={{
                                            width: 22,
                                            height: 22,
                                            padding: 0,
                                            color: (theme) =>
                                                theme.palette.error.main,
                                            '& svg': { fontSize: 14 },
                                        }}
                                    >
                                        <DeleteOutlineRoundedIcon />
                                    </IconButton>
                                ) : (
                                    <IconButton
                                        disabled={updatedLoading}
                                        size="small"
                                        aria-label="decrement"
                                        onClick={handleDecrement}
                                        sx={{
                                            width: 22,
                                            height: 22,
                                            padding: 0,
                                            backgroundColor: (theme) =>
                                                alpha(theme.palette.primary.main, 0.5),
                                            color: (theme) =>
                                                theme.palette.primary.contrastText,
                                            '&:hover': {
                                                backgroundColor: (theme) =>
                                                    theme.palette.primary.dark,
                                            },
                                            '& svg': { fontSize: 14 },
                                        }}
                                    >
                                        <RemoveRoundedIcon />
                                    </IconButton>
                                )}

                                {updatedLoading ? (
                                    <CircularLoader size="12px" />
                                ) : (
                                    <Typography
                                        sx={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: (theme) =>
                                                theme.palette.text.primary,
                                            lineHeight: 1,
                                            minWidth: 18,
                                            textAlign: 'center',
                                            fontVariantNumeric: 'tabular-nums',
                                            fontFeatureSettings: '"tnum"',
                                        }}
                                    >
                                        {getQuantity(product?.id)}
                                    </Typography>
                                )}

                                <IconButton
                                    disabled={updatedLoading}
                                    size="small"
                                    aria-label="increment"
                                    onClick={handleIncrement}
                                    sx={{
                                        width: 22,
                                        height: 22,
                                        padding: 0,
                                        backgroundColor: (theme) =>
                                            theme.palette.primary.main,
                                        color: (theme) =>
                                            theme.palette.primary.contrastText,
                                        '&:hover': {
                                            backgroundColor: (theme) =>
                                                theme.palette.primary.dark,
                                        },
                                        '& svg': { fontSize: 14 },
                                    }}
                                >
                                    <AddRoundedIcon />
                                </IconButton>
                            </Stack>
                        ))}
                </Media>

                <Box sx={{ px: '2px' }}>
                    <TitleText component="h5">{product?.name}</TitleText>
                    {/* {categoryTags && <SubText>{categoryTags}</SubText>} */}
                    <PriceRow>
                        <PriceNow>
                            {getAmount(
                                discountedPrice,
                                currencySymbolDirection,
                                currencySymbol,
                                digitAfterDecimalPoint
                            )}
                        </PriceNow>
                        {hasDiscount && (
                            <PriceOld>
                                {getAmount(
                                    product?.price,
                                    currencySymbolDirection,
                                    currencySymbol,
                                    digitAfterDecimalPoint
                                )}
                            </PriceOld>
                        )}
                    </PriceRow>
                </Box>
            </CardRoot>

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

            <CartClearModal
                clearCartModal={clearCartModal}
                setClearCartModal={setClearCartModal}
                clearCartAlert={clearCartAlert}
                addToCard={addToCart}
            />
        </>
    )
}

export default memo(NewFoodCard)
