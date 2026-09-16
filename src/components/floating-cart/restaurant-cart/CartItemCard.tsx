import React, { useEffect, useRef, useState } from 'react'
import {
    Box,
    IconButton,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import VisibleVariations from '@/components/floating-cart/VisibleVariations'
import {
    calculateItemBasePrice,
    getAmount,
    getSelectedAddOn,
    getTotalVariationsPrice,
    handleTotalAmountWithAddonsFF,
} from '@/utils/customFunctions'
import { rawFoodDataNormalize } from '@/components/new-food-card/rawFoodDataNormalize'
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
    itemBasePrice?: number
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

// neutral[400] reads as a heavy dark grey against the light pill background —
// too strong for a hover state. A translucent overlay stays legible in both
// modes without darkening as much.
const stepperHoverBg = (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.16)'
        : 'rgba(0, 0, 0, 0.06)'

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
    // Variation summary starts collapsed to one line; the chevron only
    // appears (and is only clickable) when that single line actually
    // truncates the content — matches the checkout page, where the
    // full text renders plainly and never gets a toggle.
    const [variationsExpanded, setVariationsExpanded] = useState(false)
    const [variationsOverflow, setVariationsOverflow] = useState(false)
    const variationsTextRef = useRef<HTMLDivElement | null>(null)
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
        itemBasePrice: rawFoodDataNormalize({
            price: calculateItemBasePrice(
                entry,
                (entry?.item as { variations?: unknown })?.variations
            ),
            discount: (entry?.item as { discount?: unknown })?.discount,
            discount_type: (entry?.item as { discount_type?: unknown })
                ?.discount_type,
        }).discountedPrice,
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
        const { discountedPrice: priceAfterDiscount } = rawFoodDataNormalize({
            price: totalPrice,
            discount: item?.discount,
            discount_type: item?.discount_type,
        })
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
        const { discountedPrice: priceAfterDiscount } = rawFoodDataNormalize({
            price: totalPrice,
            discount: item?.discount,
            discount_type: item?.discount_type,
        })
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

    const isQuantityOne = (item?.quantity || 0) <= 1

    const imageSize = 48

    const payableTotal = handleTotalAmountWithAddonsFF(
        item?.itemBasePrice,
        item?.selectedAddons
    )
    // Pre-discount unit price, rebuilt from the item's own base price so the
    // strike-through never shows an identical number next to the payable one.
    const originalTotal = calculateItemBasePrice(item, item?.variations)
    const hasVariations = Boolean(item?.variations?.length)

    useEffect(() => {
        // Clamp is only active while collapsed — measuring while expanded
        // would always read as non-overflowing and hide the chevron.
        if (variationsExpanded) return
        const measure = () => {
            const el = variationsTextRef.current
            if (!el) return
            setVariationsOverflow(el.scrollHeight > el.clientHeight + 1)
        }
        measure()
        window.addEventListener('resize', measure)
        return () => window.removeEventListener('resize', measure)
    }, [item?.variations, variationsExpanded])

    const showVariationsToggle = variationsOverflow || variationsExpanded

    return (
        <Stack
            spacing={1}
            sx={{
                px: 2,
                py: 1.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                '&:last-of-type': { borderBottom: 'none' },
            }}
        >
            {/* Top row: thumbnail + name + price */}
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <Box
                    onClick={() => handleProductUpdateModal(item)}
                    sx={{
                        cursor: 'pointer',
                        flexShrink: 0,
                        width: imageSize,
                        height: imageSize,
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

                <Stack flex={1} minWidth={0} spacing={0.4}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography
                            fontSize="14px"
                            fontWeight={500}
                            onClick={() => handleProductUpdateModal(item)}
                            sx={{
                                // Explicit color: dark mode's body text is
                                // black in this app, so inherit won't do.
                                color: (t2) => neutralOf(t2)[1000],
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
                        {item?.halal_tag_status === 1 &&
                            item?.is_halal === 1 && (
                                <Tooltip
                                    arrow
                                    title={t('This is a halal food')}
                                >
                                    <IconButton sx={{ padding: 0 }}>
                                        <HalalSvg />
                                    </IconButton>
                                </Tooltip>
                            )}
                    </Stack>

                    <Stack
                        direction="row"
                        alignItems="baseline"
                        spacing={0.75}
                    >
                        <Typography
                            fontSize="15px"
                            fontWeight={700}
                            sx={{ color: (t2) => neutralOf(t2)[1000] }}
                        >
                            {getAmount(
                                payableTotal,
                                currencySymbolDirection,
                                currencySymbol,
                                digitAfterDecimalPoint
                            )}
                        </Typography>
                        {originalTotal > payableTotal + 0.01 && (
                            <Typography
                                fontSize="13px"
                                sx={{
                                    color: (t2) => neutralOf(t2)[400],
                                    textDecoration: 'line-through',
                                }}
                            >
                                {getAmount(
                                    originalTotal,
                                    currencySymbolDirection,
                                    currencySymbol,
                                    digitAfterDecimalPoint
                                )}
                            </Typography>
                        )}
                    </Stack>

                    {item?.selectedAddons &&
                        item.selectedAddons.length > 0 && (
                            <Stack
                                direction="row"
                                alignItems="flex-start"
                                spacing={0.5}
                                flexWrap="wrap"
                            >
                                <Typography
                                    fontSize="12px"
                                    fontWeight={700}
                                    sx={{
                                        color: (t2) => neutralOf(t2)[1000],
                                    }}
                                >
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
            </Stack>

            {/* Bottom row: collapsible variation summary + pill stepper */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent={hasVariations ? 'space-between' : 'flex-end'}
                spacing={1}
            >
                {hasVariations && (
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.25}
                        onClick={
                            showVariationsToggle
                                ? () => setVariationsExpanded((prev) => !prev)
                                : undefined
                        }
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            cursor: showVariationsToggle
                                ? 'pointer'
                                : 'default',
                            userSelect: 'none',
                        }}
                    >
                        <Box
                            ref={variationsTextRef}
                            sx={{
                                minWidth: 0,
                                '& *': {
                                    wordBreak: 'normal !important',
                                },
                                ...(variationsExpanded
                                    ? {}
                                    : {
                                          display: '-webkit-box',
                                          WebkitLineClamp: 1,
                                          WebkitBoxOrient: 'vertical',
                                          overflow: 'hidden',
                                      }),
                            }}
                        >
                            <VisibleVariations
                                variations={item.variations}
                                t={t}
                            />
                        </Box>
                        {showVariationsToggle && (
                            <KeyboardArrowDownIcon
                                sx={{
                                    fontSize: 18,
                                    flexShrink: 0,
                                    color: 'text.secondary',
                                    transform: variationsExpanded
                                        ? 'rotate(180deg)'
                                        : 'none',
                                    transition: 'transform 200ms ease',
                                }}
                            />
                        )}
                    </Stack>
                )}

                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.75}
                    sx={{
                        flexShrink: 0,
                        // Dark palette's neutral[300] is a light grey that
                        // swallows the white icons — use translucent white.
                        backgroundColor:
                            theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.12)'
                                : (t2: any) => neutralOf(t2)[300],
                        borderRadius: '999px',
                        px: 1,
                        py: 0.4,
                    }}
                >
                {isQuantityOne ? (
                    <IconButton
                        disabled={removeIsLoading}
                        aria-label="remove"
                        onClick={handleRemove}
                        sx={{
                            width: 26,
                            height: 26,
                            padding: 0,
                            backgroundColor: 'transparent',
                            color: (t2) => t2.palette.error.main,
                            '&:hover': {
                                backgroundColor: (t2) =>
                                    alpha(t2.palette.error.main, 0.1),
                            },
                            borderRadius: '50%',
                            '& i': {
                                fontSize: 14,
                                lineHeight: 1,
                            },
                        }}
                    >
                        <i className="fi fi-rr-trash" />
                    </IconButton>
                ) : (
                    <IconButton
                        disabled={updatedLoading}
                        aria-label="decrement"
                        onClick={handleDecrement}
                        sx={{
                            width: 26,
                            height: 26,
                            padding: 0,
                            backgroundColor: 'transparent',
                            '&:hover': {
                                backgroundColor: stepperHoverBg,
                            },
                            borderRadius: '50%',
                        }}
                    >
                        <RemoveIcon
                            sx={{
                                fontSize: 16,
                                color: (t2) => neutralOf(t2)[1000],
                            }}
                        />
                    </IconButton>
                )}

                {updatedLoading ? (
                    <CircularLoader size="14px" color="primary" />
                ) : (
                    <Typography
                        sx={{
                            userSelect: 'none',
                            minWidth: 24,
                            textAlign: 'center',
                            fontSize: '15px',
                            fontWeight: 700,
                            color: (t2) => neutralOf(t2)[1000],
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
                        width: 26,
                        height: 26,
                        padding: 0,
                        backgroundColor: 'transparent',
                        '&:hover': {
                            backgroundColor: stepperHoverBg,
                        },
                        borderRadius: '50%',
                    }}
                >
                    <AddIcon
                        sx={{
                            fontSize: 16,
                            color: (t2) => neutralOf(t2)[1000],
                        }}
                    />
                </IconButton>
                </Stack>
            </Stack>
        </Stack>
    )
}

export default CartItemCard
