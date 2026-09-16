import React, { useEffect, useState } from 'react'
import HappyHourProgressBanner from '@/components/happy-hour/HappyHourProgressBanner'
import useHappyHourBanner from '@/hooks/custom-hooks/useHappyHourBanner'
import DiscountEligibilityBanner from '@/components/restaurant-details/DiscountEligibilityBanner'
import useGetDiscountEligibility from '@/hooks/react-query/add-cart/useGetDiscountEligibility'
import {
    Box,
    Collapse,
    Divider,
    LinearProgress,
    Radio,
    Skeleton,
    Stack,
    Switch,
    Typography,
    alpha,
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining'
import { styled, useTheme } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { useQueryClient } from 'react-query'
import { useTranslation } from 'react-i18next'
import SimpleBar from 'simplebar-react'

import CartItemCard from '@/components/floating-cart/restaurant-cart/CartItemCard'
import BogoCartItemRow from '@/components/floating-cart/restaurant-cart/BogoCartItemRow'
import CartFooter from '@/components/floating-cart/restaurant-cart/CartFooter'
import ProPlanBanner from '@/components/floating-cart/restaurant-cart/ProPlanBanner'
import ProductUpdateModal from '@/components/food-card/ProductUpdateModal'
import GuestCheckoutModal from '@/components/floating-cart/GuestCheckoutModal'
import AuthModal from '@/components/auth'
import NewFoodCard from '@/components/new-food-card/NewFoodCard'
import Slider from '@/components/slider/SlickToSwiper'
import emptycart from '../../../public/static/empty-cart-basket.svg'
import useDeleteAllCartItem from '@/hooks/react-query/add-cart/useDeleteAllCartItem'
import useGetAllCartList from '@/hooks/react-query/add-cart/useGetAllCartList'
import {
    cart,
    setCartGroups,
    setCartItemByDispatch,
    setOrderPreferences,
} from '@/redux/slices/cart'
import {
    getGuestId,
    getToken,
} from '@/components/checkout-page/functions/getGuestUserId'
import { onSingleErrorResponse } from '@/components/ErrorResponse'
import {
    cartItemsTotalAmount,
    getAmount,
    getProductDiscount,
    getSubTotalPrice,
    handleBadge,
} from '@/utils/customFunctions'
import { NAVBAR_HEIGHT } from '@/components/navbar/navbarConstants'
import { productUnavailableData } from '@/components/checkout-page/demo'

// The redux cart slice stores API items augmented with runtime-only fields
// (cartItemId, totalPrice, …). We only read a few fields here, so the item
// type stays intentionally loose — CartItemCard owns the detailed shape.
type CartLineItem = Record<string, unknown> & {
    id?: number | string
    cartItemId?: number | string
    quantity?: number
    totalPrice?: number
    variations?: Array<Record<string, unknown>>
    // Present only on a bogo bundle line — it has no single food, so
    // CartItemCard's normal fields (name, price, …) are all empty on it.
    bogoGroupId?: string
    bogoDetails?: Record<string, unknown>
}

interface RestaurantCartSidebarProps {
    // Recommend-products payload already fetched by RestaurantDetails —
    // passed down so the sidebar never issues its own query.
    alsoBoughtProducts?: Array<Record<string, unknown>>
    // Restaurant details for feature gates (extra packaging / cutlery).
    restaurantDetails?: Record<string, any>
    showProBanner?: boolean
    // Active Pro members see their current offer instead of the subscribe CTA.
    isProMember?: boolean
    proOfferMessage?: string
    onProSubscribe?: () => void
    // 'sidebar' (default): desktop sticky shell. 'drawer': flat panel meant
    // to live inside the mobile bottom Drawer.
    variant?: 'sidebar' | 'drawer'
}

// Sticky shell — mirrors 6amMart's store-details SidebarSurface: the extra
// padding/negative margin keeps the card shadow from being clipped by the
// scroll container.
const SidebarSurface = styled(Box)(({ theme }) => ({
    position: 'sticky',
    top: NAVBAR_HEIGHT + 16,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    overflow: 'visible',
    [theme.breakpoints.up('md')]: {
        maxHeight: `calc(100vh - ${NAVBAR_HEIGHT + 26}px)`,
        padding: '12px',
        margin: '-12px',
    },
}))

const CartRowSkeleton = () => (
    <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ px: 2, py: 1.5 }}>
        <Skeleton variant="rounded" width={48} height={48} />
        <Stack flex={1} minWidth={0} spacing={0.75}>
            <Skeleton variant="text" width="70%" height={18} />
            <Skeleton variant="text" width="40%" height={16} />
            <Skeleton variant="text" width="30%" height={16} />
        </Stack>
    </Stack>
)

const CartSyncSkeleton = () => (
    <Box sx={{ pt: 1.5 }}>
        {[0, 1, 2].map((i) => (
            <CartRowSkeleton key={i} />
        ))}
    </Box>
)

const CutlerySwitch = styled(Switch)(({ theme }) => ({
    width: 36,
    height: 24,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 4,
        transitionDuration: '200ms',
        color: '#fff !important',
        '&.Mui-checked': {
            transform: 'translateX(12px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: `${theme.palette.primary.main} !important`,
                opacity: 1,
                border: 0,
            },
        },
    },
    '& .MuiSwitch-thumb': {
        width: 16,
        height: 16,
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.15)',
    },
    '& .MuiSwitch-track': {
        borderRadius: 12,
        backgroundColor:
            theme.palette.mode === 'light'
                ? '#CDCDCD !important'
                : '#39393D !important',
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 200,
        }),
    },
}))

const SidebarCartLayout = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: '16px',
    boxShadow: '0px 0px 16px -1px rgba(0, 0, 0, 0.1)',
    overflow: 'clip',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'calc(100vh - 32px)',
}))

// Desktop-only cart sidebar for the restaurant details page. Pure UI shell:
// cart data lives in the shared redux cart slice (kept fresh by the global
// FloatingCart's cart-list query), and every mutating action reuses the same
// hooks/components the floating drawer already uses.
const RestaurantCartSidebar: React.FC<RestaurantCartSidebarProps> = ({
    alsoBoughtProducts,
    restaurantDetails,
    showProBanner,
    isProMember,
    proOfferMessage,
    onProSubscribe,
    variant = 'sidebar',
}) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const router = useRouter()
    const dispatch = useDispatch()
    const queryClient = useQueryClient()

    const { cartList = [] } = useSelector(
        (state: { cart: { cartList: CartLineItem[] } }) => state.cart
    )
    const { global } = useSelector(
        (state: { globalSettings: { global?: Record<string, any> } }) =>
            state.globalSettings
    )
    const token = getToken()

    const isRestaurantPage = router.pathname === '/restaurants/[id]'
    const cartRestaurantId = isRestaurantPage
        ? (router.query.id as string | undefined)
        : undefined
    const { isFetching: isCartFetching } = useGetAllCartList(cartRestaurantId)
    const [syncedRestaurantId, setSyncedRestaurantId] = useState<
        string | undefined
    >(undefined)
    useEffect(() => {
        if (!isCartFetching && cartRestaurantId) {
            setSyncedRestaurantId(cartRestaurantId)
        }
    }, [isCartFetching, cartRestaurantId])
    const isCartSyncing = cartRestaurantId !== syncedRestaurantId

    const [openUpdateModal, setOpenUpdateModal] = useState(false)
    const [openGuestModal, setOpenGuestModal] = useState(false)
    const [authModalOpen, setAuthModalOpen] = useState(false)
    const [modalFor, setModalFor] = useState('sign-in')

    // Cart-level preferences — held in the cart slice so the checkout page
    // can seed its packaging/cutlery/note state from what was picked here.
    const orderPreferences = useSelector(
        (state: any) => state.cart.orderPreferences
    )
    const extraPackaging = Boolean(orderPreferences?.extraPackaging)
    const addCutlery = Boolean(orderPreferences?.addCutlery)
    const unavailableNote: string | null =
        orderPreferences?.unavailableNote ?? null
    const [notAvailableOpen, setNotAvailableOpen] = useState(false)

    const isExtraPackagingActive = Boolean(
        restaurantDetails?.is_extra_packaging_active
    )
    const isExtraPackagingMandatory = Boolean(
        restaurantDetails?.extra_packaging_status
    )

    // uncheck/remove it.
    useEffect(() => {
        if (
            isExtraPackagingActive &&
            isExtraPackagingMandatory &&
            cartList.length > 0 &&
            !extraPackaging
        ) {
            dispatch(setOrderPreferences({ extraPackaging: true }))
        }
    }, [
        isExtraPackagingActive,
        isExtraPackagingMandatory,
        cartList.length,
        extraPackaging,
        dispatch,
    ])

    const currencySymbol = global?.currency_symbol
    const currencySymbolDirection = global?.currency_symbol_direction
    const digitAfterDecimalPoint = global?.digit_after_decimal_point

    const { mutate: removeCartMutate } = useDeleteAllCartItem()

    const totalCartPrice = getSubTotalPrice(cartList)

    const happyHour = useHappyHourBanner({
        restaurantId: restaurantDetails?.id,
        cartSubtotal: totalCartPrice,
    })
    const showHappyHourBanner = variant !== 'drawer' && happyHour.show

    const { data: discountEligibility } = useGetDiscountEligibility(
        restaurantDetails?.id,
        totalCartPrice
    )
    const showDiscountEligibilityBanner =
        variant !== 'drawer' &&
        !showHappyHourBanner &&
        discountEligibility?.source === 'restaurant_discount' &&
        Number(discountEligibility?.percentage) > 0
    const discountEligibilityProgress =
        discountEligibility && Number(discountEligibility.min_purchase) > 0
            ? Math.min(
                  100,
                  (Number(discountEligibility.qualifying_amount) /
                      Number(discountEligibility.min_purchase)) *
                      100
              )
            : null

    const eligibilityDiscountAmount = discountEligibility?.is_qualified
        ? Number(discountEligibility.discount_amount) || 0
        : 0
    const cartDiscount =
        eligibilityDiscountAmount > 0
            ? eligibilityDiscountAmount
            : getProductDiscount(cartList)
    const payableCartPrice = Math.max(0, totalCartPrice - cartDiscount)

    // Free-delivery progress — only when admin sets a threshold and the cart
    // hasn't reached it yet.
    //
    // Mirrors the admin rule in getDeliveryFees() exactly, because a hint that
    // measures anything else would promise free delivery at the wrong basket
    // value. That rule lives under `admin_free_delivery`; the bare
    // `free_delivery_over` read here before is the legacy top-level key, which
    // is why an admin-configured threshold never reached this banner.
    const adminFreeDelivery = (global as any)?.admin_free_delivery
    const adminFreeDeliveryActive = adminFreeDelivery?.status === true
    const isFreeDeliveryToAllStores =
        adminFreeDeliveryActive &&
        adminFreeDelivery?.type === 'free_delivery_to_all_store'
    const freeDeliveryOver =
        adminFreeDeliveryActive &&
        adminFreeDelivery?.type === 'free_delivery_by_specific_criteria'
            ? Number(adminFreeDelivery?.free_delivery_over) || 0
            : Number(global?.free_delivery_over) || 0
    // getDeliveryFees() compares `cartItemsTotalAmount`, not the struck-through
    // subtotal shown in the footer, so the same figure is used here.
    const freeDeliveryProgressAmount = cartItemsTotalAmount(cartList)
    const freeDeliveryRemaining = freeDeliveryOver - freeDeliveryProgressAmount
    const showFreeDeliveryHint =
        cartList.length > 0 &&
        // Nothing to work toward when every store already delivers free.
        !isFreeDeliveryToAllStores &&
        freeDeliveryOver > 0 &&
        freeDeliveryRemaining > 0

    // Same behavior as FloatingCart's handleClearAll — optimistic clear of
    // both cart slices, then the API call.
    const handleClearAll = () => {
        dispatch(setCartGroups([]))
        dispatch(cart([]))
        removeCartMutate(
            {
                guestId: getGuestId(),
                restaurantId: restaurantDetails?.id,
            },
            {
                onSettled: () => {
                    queryClient.invalidateQueries('cart-item-restaurant')
                },
                onError: onSingleErrorResponse,
            }
        )
    }

    // Same routing rules as FloatingCart's handleCheckout.
    const handleCheckout = () => {
        if (token) {
            const queryParams: Record<string, string> = { page: 'cart' }
            if (router.query.isDineIn) {
                queryParams.isDineIn = String(router.query.isDineIn)
            }
            if (restaurantDetails?.id) {
                queryParams.restuId = String(restaurantDetails.id)
            }
            if (restaurantDetails?.slug) {
                queryParams.restaurant = String(restaurantDetails.slug)
            }
            router.push(
                { pathname: '/checkout', query: queryParams },
                undefined,
                { shallow: true }
            )
        } else {
            if (global?.guest_checkout_status === 1) {
                setOpenGuestModal(true)
            } else {
                setAuthModalOpen(true)
            }
        }
    }

    const handleProductUpdateModal = (item: CartLineItem) => {
        dispatch(setCartItemByDispatch(item))
        setOpenUpdateModal(true)
    }

    const suggestions = (alsoBoughtProducts ?? []).slice(0, 10)

    // Drawer mode: no sticky shell — the bottom Drawer's paper is the shell.
    const Shell = variant === 'drawer' ? Box : SidebarSurface

    return (
        <Shell>
            {showHappyHourBanner && (
                <HappyHourProgressBanner
                    expireAt={happyHour.expireAt}
                    windowMinutes={happyHour.windowMinutes}
                    remainingAmount={happyHour.remainingAmount}
                    discountPercent={happyHour.discountPercent}
                    amountProgress={happyHour.amountProgress}
                />
            )}
            {showDiscountEligibilityBanner && (
                <DiscountEligibilityBanner
                    percentage={discountEligibility?.percentage}
                    shortfall={discountEligibility?.shortfall}
                    amountProgress={discountEligibilityProgress}
                />
            )}
            <SidebarCartLayout
                sx={
                    variant === 'drawer'
                        ? {
                              borderRadius: 0,
                              boxShadow: 'none',
                              maxHeight: '85vh',
                          }
                        : undefined
                }
            >
                {/* ── Header ── */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ padding: '16px 20px 12px' }}
                >
                    <Typography
                        fontSize="22px"
                        fontWeight={700}
                        sx={{
                            color: (theme.palette as any).neutral?.[1000],
                        }}
                    >
                        {t('Your Cart')}
                    </Typography>
                    {!isCartSyncing && cartList.length > 0 && (
                        <Typography
                            onClick={handleClearAll}
                            fontSize="14px"
                            fontWeight={600}
                            sx={{
                                color: theme.palette.error.main,
                                cursor: 'pointer',
                                userSelect: 'none',
                                '&:hover': { textDecoration: 'underline' },
                            }}
                        >
                            {t('Clear All')}
                        </Typography>
                    )}
                </Stack>
                <Divider />

                {/* ── Body ── */}
                {isCartSyncing ? (
                    <CartSyncSkeleton />
                ) : cartList.length === 0 ? (
                    <Stack
                        spacing={2}
                        alignItems="center"
                        sx={{
                            padding: '24px 24px 32px',
                            minHeight: 240,
                        }}
                    >
                        <Box
                            component="img"
                            src={emptycart?.src}
                            alt={String(t('Cart is Empty'))}
                            sx={{
                                width: 80,
                                height: 80,
                                objectFit: 'contain',
                            }}
                        />
                        <Typography
                            fontSize="15px"
                            fontWeight={700}
                            align="center"
                            sx={{
                                color: (theme.palette as any).neutral?.[1000],
                            }}
                        >
                            {t('Your Cart is Empty')}
                        </Typography>
                        <Typography
                            fontSize="12.5px"
                            align="center"
                            color={theme.palette.text.secondary}
                            sx={{ lineHeight: 1.4 }}
                        >
                            {t('Add items from the menu to get started.')}
                        </Typography>
                    </Stack>
                ) : (
                    <>
                        <SimpleBar
                            style={{
                                maxHeight:
                                    variant === 'drawer'
                                        ? 'calc(85vh - 200px)'
                                        : `calc(100vh - ${
                                              NAVBAR_HEIGHT + 260
                                          }px)`,
                            }}
                        >
                            {/* Items label */}
                            <Stack
                                direction="row"
                                alignItems="baseline"
                                spacing={0.5}
                                sx={{ px: 2, pt: 1.5 }}
                            >
                                <Typography
                                    fontSize="15px"
                                    fontWeight={700}
                                    sx={{
                                        color: (theme.palette as any)
                                            .neutral?.[1000],
                                    }}
                                >
                                    {t('Items')}
                                </Typography>
                                <Typography
                                    fontSize="14px"
                                    color="text.secondary"
                                >
                                    ({cartList.length})
                                </Typography>
                            </Stack>

                            <Stack>
                                {cartList.map((item: CartLineItem) =>
                                    item.bogoDetails ? (
                                        <BogoCartItemRow
                                            key={String(item.bogoGroupId)}
                                            item={item}
                                            restaurantId={restaurantDetails?.id}
                                        />
                                    ) : (
                                        <CartItemCard
                                            key={String(
                                                item.cartItemId ?? item.id
                                            )}
                                            item={item}
                                            handleProductUpdateModal={
                                                handleProductUpdateModal
                                            }
                                            t={t}
                                        />
                                    )
                                )}
                            </Stack>

                            {/* Cart-level preference rows — one shared grey
                                card; rows are divided by bottom borders (the
                                :not(:last-child) rule keeps the divider
                                correct when a row is conditionally hidden). */}
                            <Stack
                                sx={{
                                    mt: 1,
                                    // Dark palette's neutral[300] is a LIGHT
                                    // gray (text tone), not a surface — the
                                    // section would render white-on-light.
                                    backgroundColor:
                                        theme.palette.mode === 'dark'
                                            ? theme.palette.neutral[200]
                                            : theme.palette.neutral[300],
                                    '& > *:not(:last-child)': {
                                        borderBottom: `1px solid ${theme.palette.neutral[100]}`,
                                    },
                                }}
                            >
                                {isExtraPackagingActive && (
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                        sx={{
                                            px: 2,
                                            py: 1.5,
                                        }}
                                    >
                                        <Stack
                                            spacing={0.25}
                                            sx={{ flex: 1, minWidth: 0 }}
                                        >
                                            <Typography
                                                fontSize="15px"
                                                fontWeight={700}
                                                sx={{
                                                    color: (
                                                        theme.palette as any
                                                    ).neutral?.[1000],
                                                }}
                                            >
                                                {isExtraPackagingMandatory
                                                    ? t(
                                                          'Extra Packaging Charge'
                                                      )
                                                    : t(
                                                          'Need Extra Packaging?'
                                                      )}
                                            </Typography>
                                            <Typography
                                                fontSize="13px"
                                                color="text.secondary"
                                            >
                                                {t('An additional')}{' '}
                                                {getAmount(
                                                    Number(
                                                        restaurantDetails?.extra_packaging_amount
                                                    ) || 0,
                                                    currencySymbolDirection,
                                                    currencySymbol,
                                                    digitAfterDecimalPoint
                                                )}{' '}
                                                {t('will be applied.')}
                                            </Typography>
                                        </Stack>
                                        {/* Mandatory packaging has no
                                            checkbox — it's forced on above
                                            and can't be unchecked/removed.
                                            Only the optional case is
                                            user-toggleable. */}
                                        {!isExtraPackagingMandatory && (
                                            <Box
                                                onClick={() =>
                                                    dispatch(
                                                        setOrderPreferences({
                                                            extraPackaging:
                                                                !extraPackaging,
                                                        })
                                                    )
                                                }
                                                role="checkbox"
                                                aria-checked={extraPackaging}
                                                sx={{
                                                    width: 22,
                                                    height: 22,
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    flexShrink: 0,
                                                    // divider is too faint on the
                                                    // grey row bg — use a mid
                                                    // grey so the box reads as a
                                                    // checkbox when unchecked.
                                                    border: `2px solid ${
                                                        extraPackaging
                                                            ? theme.palette
                                                                  .primary.main
                                                            : (
                                                                  theme.palette as any
                                                              )
                                                                  .neutral?.[400] ??
                                                              '#9CA3AF'
                                                    }`,
                                                    backgroundColor:
                                                        extraPackaging
                                                            ? theme.palette
                                                                  .primary.main
                                                            : 'transparent',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition:
                                                        'all 120ms ease',
                                                }}
                                            >
                                                {extraPackaging && (
                                                    <i
                                                        className="fi fi-br-check"
                                                        style={{
                                                            fontSize: 10,
                                                            color: '#fff',
                                                            lineHeight: 1,
                                                            display: 'flex',
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        )}
                                    </Stack>
                                )}

                                {Boolean(restaurantDetails?.cutlery) && (
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                        sx={{
                                            px: 2.5,
                                            py: 2,
                                        }}
                                    >
                                        <Stack
                                            spacing={0.25}
                                            sx={{ flex: 1, minWidth: 0 }}
                                        >
                                            <Typography
                                                fontSize="15px"
                                                fontWeight={700}
                                                sx={{
                                                    color: (
                                                        theme.palette as any
                                                    ).neutral?.[1000],
                                                }}
                                            >
                                                {t('Add Cutlery')}
                                            </Typography>
                                            <Typography
                                                fontSize="13px"
                                                color="text.secondary"
                                                sx={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 1,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {t(
                                                    'No cutlery provided. Thanks for reducing waste.'
                                                )}
                                            </Typography>
                                        </Stack>
                                        <CutlerySwitch
                                            checked={addCutlery}
                                            onChange={(e) =>
                                                dispatch(
                                                    setOrderPreferences({
                                                        addCutlery:
                                                            e.target.checked,
                                                    })
                                                )
                                            }
                                        />
                                    </Stack>
                                )}

                                <Box>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                        onClick={() =>
                                            setNotAvailableOpen((prev) => !prev)
                                        }
                                        sx={{
                                            px: 2,
                                            py: 1.5,
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                        }}
                                    >
                                        <Typography
                                            fontSize="15px"
                                            fontWeight={700}
                                            sx={{
                                                flex: 1,
                                                color: (theme.palette as any)
                                                    .neutral?.[1000],
                                            }}
                                        >
                                            {t('If Any Items Is Not Available')}
                                        </Typography>
                                        <KeyboardArrowDownIcon
                                            sx={{
                                                fontSize: 22,
                                                color: 'text.primary',
                                                transform: notAvailableOpen
                                                    ? 'rotate(180deg)'
                                                    : 'none',
                                                transition:
                                                    'transform 200ms ease',
                                            }}
                                        />
                                    </Stack>
                                    <Collapse in={notAvailableOpen}>
                                        <Stack sx={{ px: 1.5, pb: 1.5 }}>
                                            {productUnavailableData.map(
                                                (option: string) => (
                                                    <Stack
                                                        key={option}
                                                        direction="row"
                                                        alignItems="center"
                                                        spacing={0.5}
                                                        onClick={() =>
                                                            dispatch(
                                                                setOrderPreferences(
                                                                    {
                                                                        unavailableNote:
                                                                            option,
                                                                    }
                                                                )
                                                            )
                                                        }
                                                        sx={{
                                                            cursor: 'pointer',
                                                            userSelect: 'none',
                                                        }}
                                                    >
                                                        <Radio
                                                            size="small"
                                                            checked={
                                                                unavailableNote ===
                                                                option
                                                            }
                                                            sx={{ p: 0.75 }}
                                                        />
                                                        <Typography
                                                            fontSize="13px"
                                                            sx={{
                                                                color: (
                                                                    theme.palette as any
                                                                )
                                                                    .neutral?.[1000],
                                                            }}
                                                        >
                                                            {t(option)}
                                                        </Typography>
                                                    </Stack>
                                                )
                                            )}
                                        </Stack>
                                    </Collapse>
                                </Box>
                            </Stack>

                            {/* Also Brought Together */}
                            {suggestions.length > 0 && (
                                <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
                                    <Typography
                                        fontSize="15px"
                                        fontWeight={700}
                                        sx={{
                                            mb: 1.25,
                                            color: (theme.palette as any)
                                                .neutral?.[1000],
                                        }}
                                    >
                                        {t('Also Brought Together')}
                                    </Typography>
                                    <Box
                                        sx={{
                                            '& .swiper-slide > *': {
                                                width: '100% !important',
                                                maxWidth: '100% !important',
                                            },
                                        }}
                                    >
                                        <Slider
                                            dots={false}
                                            arrows={false}
                                            infinite={false}
                                            speed={400}
                                            slidesToShow={2.2}
                                            slidesToScroll={1}
                                            gap={12}
                                        >
                                            {suggestions.map((food: any) => (
                                                <NewFoodCard
                                                    key={food?.id}
                                                    product={food}
                                                    variant="vertical"
                                                    // JS component infers
                                                    // this prop required;
                                                    // undefined matches
                                                    // other call sites.
                                                    campaign={undefined}
                                                    mediaSize={undefined}
                                                    productImageUrl={
                                                        global?.base_urls
                                                            ?.product_image_url
                                                    }
                                                />
                                            ))}
                                        </Slider>
                                    </Box>
                                </Box>
                            )}

                            {/* Pro plan banner — carries its own mx/my.
                                Members see their active offer; everyone else
                                gets the subscribe prompt with Explore. */}
                            {showProBanner &&
                                (isProMember ? (
                                    <ProPlanBanner
                                        t={t}
                                        messageKey="Order now to enjoy exclusive offer with your"
                                        suffixKey={
                                            proOfferMessage
                                                ? `— ${proOfferMessage}`
                                                : ''
                                        }
                                    />
                                ) : (
                                    <ProPlanBanner
                                        t={t}
                                        onSubscribe={() => onProSubscribe?.()}
                                    />
                                ))}
                        </SimpleBar>

                        {/* Free delivery progress */}
                        {showFreeDeliveryHint && (
                            <Box
                                sx={{
                                    px: 2,
                                    py: 1,
                                    backgroundColor: alpha(
                                        theme.palette.warning.main,
                                        0.15
                                    ),
                                }}
                            >
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="center"
                                    spacing={0.5}
                                    sx={{ mb: 0.5 }}
                                >
                                    <DeliveryDiningIcon
                                        sx={{
                                            fontSize: 16,
                                            color: theme.palette.warning.dark,
                                        }}
                                    />
                                    <Typography
                                        fontSize="12px"
                                        sx={{
                                            color: (theme.palette as any)
                                                .neutral?.[1000],
                                        }}
                                    >
                                        {t('Add')}{' '}
                                        <Box
                                            component="span"
                                            sx={{ fontWeight: 700 }}
                                        >
                                            {getAmount(
                                                freeDeliveryRemaining,
                                                currencySymbolDirection,
                                                currencySymbol,
                                                digitAfterDecimalPoint
                                            )}
                                        </Box>{' '}
                                        {t('more to get free delivery')}
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(
                                        100,
                                        (freeDeliveryProgressAmount /
                                            freeDeliveryOver) *
                                            100
                                    )}
                                    sx={{
                                        height: 4,
                                        borderRadius: 2,
                                        backgroundColor: alpha(
                                            theme.palette.warning.main,
                                            0.25
                                        ),
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor:
                                                theme.palette.warning.dark,
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Box>
                        )}

                        <CartFooter
                            totalPrice={payableCartPrice}
                            originalPrice={totalCartPrice}
                            currencySymbol={currencySymbol}
                            currencySymbolDirection={currencySymbolDirection}
                            digitAfterDecimalPoint={digitAfterDecimalPoint}
                            onCheckout={handleCheckout}
                            t={t}
                        />
                    </>
                )}
            </SidebarCartLayout>

            {/* Modals — same components the floating drawer mounts */}
            {openUpdateModal && (
                <ProductUpdateModal
                    openModal={openUpdateModal}
                    setOpenModal={setOpenUpdateModal}
                    currencySymbol={currencySymbol}
                    currencySymbolDirection={currencySymbolDirection}
                    digitAfterDecimalPoint={digitAfterDecimalPoint}
                    handleBadge={handleBadge}
                />
            )}
            {openGuestModal && (
                <GuestCheckoutModal
                    setModalFor={setModalFor}
                    handleOpenAuthModal={() => setAuthModalOpen(true)}
                    open={openGuestModal}
                    setOpen={setOpenGuestModal}
                    setSideDrawerOpen={() => {}}
                    restaurantId={restaurantDetails?.id}
                    restaurantSlug={restaurantDetails?.slug}
                />
            )}
            {authModalOpen && (
                <AuthModal
                    open={authModalOpen}
                    handleClose={() => setAuthModalOpen(false)}
                    // Matches FloatingCart's usage, which omits this prop —
                    // explicit undefined keeps the same runtime behavior while
                    // satisfying the inferred required-prop type.
                    signInSuccess={undefined}
                    modalFor={modalFor}
                    setModalFor={setModalFor}
                    cartListRefetch={() => {}}
                />
            )}
        </Shell>
    )
}

export default RestaurantCartSidebar
