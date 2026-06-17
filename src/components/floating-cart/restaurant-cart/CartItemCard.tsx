import React, { useState } from 'react'
import {
    Box,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import VisibleVariations from '@/components/floating-cart/VisibleVariations'
import {
    calculateItemBasePrice,
    getAmount,
    getConvertDiscount,
    getSelectedAddOn,
    getTotalVariationsPrice,
    handleTotalAmountWithAddonsFF,
} from '@/utils/customFunctions'
import { getSelectedAddons } from '@/components/navbar/second-navbar/SecondNavbar'
import {
    decrementProductQty,
    incrementProductQty,
    removeProduct,
} from '@/redux/slices/cart'
import { getItemDataForAddToCart } from '@/components/floating-cart/helperFunction'
import { onErrorResponse } from '@/components/ErrorResponse'
import useDeleteCartItem from '@/hooks/react-query/add-cart/useDeleteCartItem'
import useCartItemUpdate from '@/hooks/react-query/add-cart/useCartItemUpdate'
import { getGuestId } from '@/components/checkout-page/functions/getGuestUserId'
import HalalSvg from '@/components/food-card/HalalSvg'
import { CustomToaster } from '@/components/custom-toaster/CustomToaster'
import CustomNextImage from '@/components/CustomNextImage'
import CircularLoader from '@/components/loader/CircularLoader'

// Permissive cart-item shape: Redux's cart slice attaches runtime-only fields
// (cartItemId, totalPrice, selectedAddons …) on top of the API item, so we
// type the fields actually read here and intersect with Record<string, unknown>
// to tolerate extras without resorting to `any`.
type CartItem = {
    id?: number | string
    cartItemId?: number | string
    name?: string
    image_full_url?: string
    quantity?: number
    price?: number
    totalPrice?: number
    discount?: number | string
    discount_type?: string
    restaurant_discount?: number
    restaurant_id?: number | string
    maximum_cart_quantity?: number
    halal_tag_status?: number
    is_halal?: number
    variations?: Array<Record<string, unknown>>
    selectedAddons?: Array<Record<string, unknown>>
} & Record<string, unknown>

// API mutation responses for cart update arrive as an array of these entries.
type CartApiEntry = {
    id?: number | string
    price?: number
    quantity?: number
    item?: Record<string, unknown>
}

interface CartItemCardProps {
    item: CartItem
    handleProductUpdateModal: (item: CartItem) => void
    t: (key: string) => string
}

// `neutral` is a project-specific palette extension; cast at the use site
// instead of augmenting MUI's Theme globally.
type NeutralPalette = Record<string, Record<number, string>>
const neutralOf = (theme: { palette: unknown }): Record<number, string> =>
    (theme.palette as NeutralPalette).neutral

const CartItemCard: React.FC<CartItemCardProps> = ({
    item,
    handleProductUpdateModal,
    t,
}) => {
    const dispatch = useDispatch()
    const guestId = getGuestId()
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    const { global } = useSelector(
        (state: { globalSettings: { global: Record<string, unknown> } }) =>
            state.globalSettings
    )
    const [editingQuantity, setEditingQuantity] = useState(false)
    const [tempQuantity, setTempQuantity] = useState<number>(
        Number(item?.quantity) || 1
    )
    const { mutate: itemRemove, isLoading: removeIsLoading } =
        useDeleteCartItem()
    const { mutate: updateMutate, isLoading: updatedLoading } =
        useCartItemUpdate()

    const currencySymbol = global?.currency_symbol as string | undefined
    const currencySymbolDirection = global?.currency_symbol_direction as
        | string
        | undefined
    const digitAfterDecimalPoint = global?.digit_after_decimal_point as
        | number
        | undefined

    const mapApiEntryToProduct = (entry: CartApiEntry) => ({
        ...(entry?.item ?? {}),
        cartItemId: entry?.id,
        totalPrice: entry?.price,
        quantity: entry?.quantity,
        variations: (entry?.item as { variations?: unknown })?.variations,
        selectedAddons: getSelectedAddons(
            (entry?.item as { addons?: unknown[] })?.addons
        ),
        itemBasePrice: getConvertDiscount(
            (entry?.item as { discount?: unknown })?.discount,
            (entry?.item as { discount_type?: unknown })?.discount_type,
            calculateItemBasePrice(
                entry,
                (entry?.item as { variations?: unknown })?.variations
            ),
            (entry?.item as { restaurant_discount?: unknown })
                ?.restaurant_discount
        ),
    })

    const onIncrementSuccess = (res: CartApiEntry[]) => {
        if (!Array.isArray(res)) return
        res.forEach((entry) => {
            if (item?.cartItemId === entry?.id) {
                dispatch(incrementProductQty(mapApiEntryToProduct(entry)))
            }
        })
    }

    const onDecrementSuccess = (res: CartApiEntry[]) => {
        if (!Array.isArray(res)) return
        res.forEach((entry) => {
            if (item?.cartItemId === entry?.id) {
                dispatch(decrementProductQty(mapApiEntryToProduct(entry)))
            }
        })
    }

    const handleIncrement = () => {
        if (
            item?.maximum_cart_quantity &&
            item.maximum_cart_quantity <= (item?.quantity || 0)
        ) {
            toast.error(t(`Max Limits ${item.maximum_cart_quantity}`))
            return
        }
        const updateQuantity = (item?.quantity || 0) + 1
        const totalPrice =
            (item?.price || 0) + getTotalVariationsPrice(item?.variations)
        const priceAfterDiscount = getConvertDiscount(
            item?.discount,
            item?.discount_type,
            totalPrice,
            item?.restaurant_discount
        )
        const productPrice = priceAfterDiscount * updateQuantity
        const itemObject = getItemDataForAddToCart(
            item,
            updateQuantity,
            productPrice,
            guestId
        )
        updateMutate(itemObject, {
            onSuccess: onIncrementSuccess,
            onError: onErrorResponse,
        })
    }

    const handleDecrement = () => {
        const updateQuantity = (item?.quantity || 0) - 1
        const totalPrice =
            (item?.price || 0) + getTotalVariationsPrice(item?.variations)
        const priceAfterDiscount = getConvertDiscount(
            item?.discount,
            item?.discount_type,
            totalPrice,
            item?.restaurant_discount
        )
        const productPrice = priceAfterDiscount * updateQuantity
        const itemObject = getItemDataForAddToCart(
            item,
            updateQuantity,
            productPrice,
            guestId
        )
        updateMutate(itemObject, {
            onSuccess: onDecrementSuccess,
            onError: (
                error: {
                    response?: {
                        data?: { errors?: Array<{ message?: string; code?: string }> }
                    }
                }
            ) => {
                error?.response?.data?.errors?.forEach((items) => {
                    CustomToaster('error', items?.message)
                    if (items?.code === 'stock_out') {
                        handleProductUpdateModal(item)
                    }
                })
            },
        })
    }

    const handleRemove = () => {
        const cartIdAndGuestId = {
            cart_id: item?.cartItemId,
            guestId: getGuestId(),
            restaurant_id: item?.restaurant_id,
        }
        itemRemove(cartIdAndGuestId, {
            onSuccess: () => {
                dispatch(removeProduct(item))
            },
            onError: onErrorResponse,
        })
    }

    // The reference design never shows a delete icon — the minus button is
    // rendered consistently at every quantity. At qty=1, clicking it removes
    // the item; at qty>1, it decrements.
    const handleMinusClick = () => {
        if ((item?.quantity || 0) <= 1) {
            handleRemove()
        } else {
            handleDecrement()
        }
    }

    const handleQuantityEdit = () => {
        setEditingQuantity(true)
        setTempQuantity(Number(item?.quantity) || 1)
    }

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10)
        if (!Number.isNaN(value) && value >= 0) setTempQuantity(value)
        else if (e.target.value === '') setTempQuantity(0)
    }

    const handleQuantitySubmit = () => {
        const newQuantity = Math.max(1, tempQuantity || 1)
        if (newQuantity !== item?.quantity) {
            updateQuantityDirectly(newQuantity)
        }
        setEditingQuantity(false)
    }

    const handleQuantityKeyPress = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
            e.preventDefault()
            return
        }
        if (e.key === 'Enter') {
            handleQuantitySubmit()
        } else if (e.key === 'Escape') {
            setEditingQuantity(false)
            setTempQuantity(Number(item?.quantity) || 1)
        }
    }

    const updateQuantityDirectly = (newQuantity: number) => {
        if (
            item?.maximum_cart_quantity &&
            newQuantity > item.maximum_cart_quantity
        ) {
            toast.error(t('Out Of Limits'))
            setTempQuantity(Number(item?.quantity) || 1)
            return
        }
        const totalPrice =
            (item?.price || 0) + getTotalVariationsPrice(item?.variations)
        const priceAfterDiscount = getConvertDiscount(
            item?.discount,
            item?.discount_type,
            totalPrice,
            item?.restaurant_discount
        )
        const productPrice = priceAfterDiscount * newQuantity
        const itemObject = getItemDataForAddToCart(
            item,
            newQuantity,
            productPrice,
            guestId
        )
        updateMutate(itemObject, {
            onSuccess: onIncrementSuccess,
            onError: (
                error: {
                    response?: {
                        data?: { errors?: Array<{ message?: string }> }
                    }
                }
            ) => {
                error?.response?.data?.errors?.forEach((items) => {
                    CustomToaster('error', items?.message)
                })
                setTempQuantity(Number(item?.quantity) || 1)
            },
        })
    }

    const imageSize = isSmall ? 70 : 80

    return (
        <Stack
            direction="row"
            spacing={{ xs: 1, sm: 1.5 }}
            alignItems="center"
            sx={{
                px: { xs: 1.25, sm: 2 },
                py: { xs: 1, sm: 1.25 },
            }}
        >
            {/* Image */}
            <Box
                onClick={() => handleProductUpdateModal(item)}
                sx={{
                    cursor: 'pointer',
                    flexShrink: 0,
                    width: imageSize,
                    height: imageSize,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CustomNextImage
                    height={String(imageSize)}
                    width={String(imageSize)}
                    src={item?.image_full_url}
                    objectFit={item?.image_full_url ? 'cover' : 'contain'}
                    borderRadius="10px"
                    aspectRatio="1"
                    errorWidth={imageSize}
                    errorHeight={imageSize}
                />
            </Box>

            {/* Middle column: name / variations / price / addons */}
            <Stack flex={1} minWidth={0} spacing={0.4}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography
                        fontSize="14px"
                        fontWeight={500}
                        onClick={() => handleProductUpdateModal(item)}
                        sx={{
                            cursor: 'pointer',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {item?.name}
                    </Typography>
                    {item?.halal_tag_status === 1 && item?.is_halal === 1 && (
                        <Tooltip arrow title={t('This is a halal food')}>
                            <IconButton sx={{ padding: 0 }}>
                                <HalalSvg />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>

                {item?.variations && item.variations.length > 0 && (
                    <Box
                        sx={{
                            // VisibleVariations defaults to wordBreak: break-word
                            // which snaps "variation" to "v / ariation" in tight
                            // cart cells. Force normal word breaks + clamp.
                            '& *': { wordBreak: 'normal !important' },
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        <VisibleVariations variations={item.variations} t={t} />
                    </Box>
                )}

                <Typography
                    fontSize="15px"
                    fontWeight={700}
                    color={theme.palette.primary.main}
                >
                    {getAmount(
                        handleTotalAmountWithAddonsFF(
                            item?.totalPrice,
                            item?.selectedAddons
                        ),
                        currencySymbolDirection,
                        currencySymbol,
                        digitAfterDecimalPoint
                    )}
                </Typography>

                {item?.selectedAddons && item.selectedAddons.length > 0 && (
                    <Stack
                        direction="row"
                        alignItems="flex-start"
                        spacing={0.5}
                        flexWrap="wrap"
                    >
                        <Typography fontSize="12px" fontWeight={700}>
                            {t('Addons')}:
                        </Typography>
                        <Typography
                            fontSize="12px"
                            color="text.secondary"
                            sx={{ flex: 1, minWidth: 0 }}
                        >
                            {getSelectedAddOn(item.selectedAddons)}
                        </Typography>
                    </Stack>
                )}
            </Stack>

            {/* Right column: quantity controls */}
            <Stack
                direction="row"
                alignItems="center"
                spacing={{ xs: 0.5, sm: 0.75 }}
                sx={{ flexShrink: 0 }}
            >
                <IconButton
                    disabled={updatedLoading || removeIsLoading}
                    aria-label="decrement"
                    onClick={handleMinusClick}
                    sx={{
                        width: { xs: 22, sm: 26 },
                        height: { xs: 22, sm: 26 },
                        backgroundColor: (t2) => neutralOf(t2)[200],
                        '&:hover': {
                            backgroundColor: (t2) => neutralOf(t2)[300],
                        },
                        borderRadius: '50%',
                    }}
                >
                    <RemoveIcon
                        sx={{
                            fontSize: { xs: 12, sm: 14 },
                            color: (t2) => neutralOf(t2)[1000],
                        }}
                    />
                </IconButton>

                {updatedLoading ? (
                    <CircularLoader size="14px" color="primary" />
                ) : editingQuantity ? (
                    <TextField
                        size="small"
                        type="number"
                        value={tempQuantity}
                        onChange={handleQuantityChange}
                        onBlur={handleQuantitySubmit}
                        onKeyDown={handleQuantityKeyPress}
                        autoFocus
                        inputProps={{
                            min: 1,
                            style: {
                                textAlign: 'center',
                                padding: '4px 6px',
                                width: 32,
                                fontSize: 14,
                            },
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                height: 26,
                                '& fieldset': {
                                    borderColor: (t2) => neutralOf(t2)[400],
                                },
                                '&:hover fieldset': {
                                    borderColor: (t2) => neutralOf(t2)[400],
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: (t2) => neutralOf(t2)[400],
                                },
                            },
                            '& input[type=number]': {
                                MozAppearance: 'textfield',
                            },
                            '& input[type=number]::-webkit-outer-spin-button': {
                                WebkitAppearance: 'none',
                                margin: 0,
                            },
                            '& input[type=number]::-webkit-inner-spin-button': {
                                WebkitAppearance: 'none',
                                margin: 0,
                            },
                        }}
                    />
                ) : (
                    <Typography
                        onClick={handleQuantityEdit}
                        sx={{
                            cursor: 'pointer',
                            userSelect: 'none',
                            minWidth: { xs: 28, sm: 36 },
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: (t2) => neutralOf(t2)[400],
                            borderRadius: '6px',
                            py: '3px',
                            fontSize: { xs: '12px', sm: '14px' },
                            fontWeight: 500,
                        }}
                    >
                        {item?.quantity}
                    </Typography>
                )}

                <IconButton
                    disabled={updatedLoading}
                    aria-label="increment"
                    onClick={handleIncrement}
                    sx={{
                        width: { xs: 22, sm: 26 },
                        height: { xs: 22, sm: 26 },
                        backgroundColor: theme.palette.primary.main,
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                        },
                        borderRadius: '50%',
                    }}
                >
                    <AddIcon
                        sx={{ fontSize: { xs: 12, sm: 14 }, color: '#fff' }}
                    />
                </IconButton>
            </Stack>
        </Stack>
    )
}

export default CartItemCard
