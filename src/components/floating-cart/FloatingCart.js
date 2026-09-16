import React, { useEffect, useRef, useState } from 'react'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import CloseIcon from '@mui/icons-material/Close'
import Drawer from '@mui/material/Drawer'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { handleBadge } from '@/utils/customFunctions'
import AuthModal from '../auth'
import { CustomTypographyBold } from '@/styled-components/CustomStyles.style'
import { useTranslation } from 'react-i18next'
import SimpleBar from 'simplebar-react'
import ProductUpdateModal from '../food-card/ProductUpdateModal'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import emptycart from '../../../public/static/emptycart.png'
import { RTL } from '../RTL/RTL'
import GuestCheckoutModal from './GuestCheckoutModal'
import { getGuestId, getToken } from '../checkout-page/functions/getGuestUserId'
import useGetAllCartList, {
    mapRestaurantCartRows,
} from '@/hooks/react-query/add-cart/useGetAllCartList'
import { useQuery, useQueryClient } from 'react-query'
import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import CustomImageContainer from '../CustomImageContainer'
import CartGroupCard from './CartGroupCard'
import CartHeader from './restaurant-cart/CartHeader'
import RestaurantInfoCard from './restaurant-cart/RestaurantInfoCard'
import CartItemCard from './restaurant-cart/CartItemCard'
import ProPlanBanner from './restaurant-cart/ProPlanBanner'
import ProSavingsBanner from './restaurant-cart/ProSavingsBanner'
import ProPlanSubscriptionModal from './restaurant-cart/ProPlanSubscriptionModal'
import CartFooter from './restaurant-cart/CartFooter'
import CustomModal from '../custom-modal/CustomModal'
import AllPaymentMethod from '../checkout-page/AllPaymentMethod'
import useSubscribeProPlan from '@/hooks/react-query/pro-plans/useSubscribeProPlan'
import useDeleteAllCartItem from '@/hooks/react-query/add-cart/useDeleteAllCartItem'
import useGetProActiveOffer from '@/hooks/react-query/pro-plans/useGetProActiveOffer'
import { ProfileApi } from '@/hooks/react-query/config/profileApi'
import { setUser } from '@/redux/slices/customer'
import { onSingleErrorResponse } from '../ErrorResponse'
import toast from 'react-hot-toast'
import {
    calculateItemBasePrice,
    getAmount,
    handleRestaurantRedirect,
} from '@/utils/customFunctions'
import {
    cart,
    setCartItemByDispatch,
    setCartGroups,
    removeCartGroupByRestaurantId,
    setWalletAmount,
} from '@/redux/slices/cart'

const FloatingCart = (props) => {
    const { sideDrawerOpen, setSideDrawerOpen } = props
    const theme = useTheme()
    // On the restaurant details page mobile view the page renders its own
    // bottom cart drawer for the shared open flag — keep this side drawer
    // closed there so both never show at once.
    const isMobileViewport = useMediaQuery(theme.breakpoints.down('md'))
    const { t } = useTranslation()
    const [openGuestModal, setOpenGuestModal] = useState(false)
    const [proPlanModalOpen, setProPlanModalOpen] = useState(false)
    // Pro Plan subscription payment modal state. Once the user picks a plan in
    // ProPlanSubscriptionModal, the chosen plan is stored here and the payment
    // selection modal opens with that plan's price as the charge.
    const [proPlanSelected, setProPlanSelected] = useState(null)
    const [proPlanPaymentOpen, setProPlanPaymentOpen] = useState(false)
    // The slots AllPaymentMethod expects. We mirror the shape PaymentOptions.js
    // uses inside checkout — minus the checkout-specific submit/order logic
    // (no API call yet; submit just closes + toasts).
    const [paymenMethod, setPaymenMethod] = useState('')
    const [selected, setSelected] = useState(null)
    const [paymentMethodDetails, setPaymentMethodDetails] = useState(null)
    const [switchToWallet, setSwitchToWallet] = useState(false)
    const [isCheckedOffline, setIsCheckedOffline] = useState(false)
    const [changeAmount, setChangeAmount] = useState('')
    // Subscription result dialog state. Opened after `subscribeProPlan`
    // resolves inline (wallet / free-trial). Gateway redirects bypass this
    // and the page leaves; the receiving page is responsible for showing
    // its own confirmation.
    //
    // Open + variant live in one object so a single render flips both
    // atomically. On close, `variant` survives through the Dialog's exit
    // animation so the body doesn't flip to the fail UI mid-close.
    const [resultState, setResultState] = useState({
        open: false,
        variant: null,
    })
    const resultModal = resultState.variant
    const resultModalOpen = resultState.open
    // Ref-based dedupe guard. React StrictMode double-invokes some code
    // paths in dev, and chained modal close/open animations can also cause
    // the open helper to be hit twice in quick succession. Suppressing any
    // second call within 1s of the first prevents the visible
    // "modal opens, blips, reopens" flicker the user reported.
    const lastResultOpenAt = useRef(0)
    const openResultModal = (variant) => {
        const now = Date.now()
        if (now - lastResultOpenAt.current < 1000) return
        lastResultOpenAt.current = now
        setResultState({ open: true, variant })
    }
    const handleResultClose = () => {
        // Reset the dedupe window so the next genuine open isn't ignored.
        lastResultOpenAt.current = 0
        setResultState((s) => ({ ...s, open: false }))
    }
    
    // AllPaymentMethod uses subscriptionStates.order !== '1' to gate sections
    // (wallet, partial pay, COD, etc.). For the Pro Plan flow we want every
    // method visible, so order is fixed to '0'.
    const proPlanSubscriptionStates = {
        order: '0',
        type: '',
        startDate: '',
        endDate: '',
        days: '',
    }
    const { mutate: subscribeProPlan, isLoading: subscribing } =
        useSubscribeProPlan()
    const { mutate: removeCartMutate } = useDeleteAllCartItem()
    const router = useRouter()
    const dispatch = useDispatch()
    const queryClient = useQueryClient()

    // Refresh redux `userData` after subscription so ProBadge / Pro-gated UI
    // reacts immediately. Mirrors SubscriptionPlanPage.refreshUserProfile.
    const refreshUserProfile = async () => {
        try {
            const res = await ProfileApi.profileInfo()
            const payload = res?.data?.data ?? res?.data
            if (payload) dispatch(setUser(payload))
        } catch {
            // Errors surface through global handlers.
        }
    }
    // cartList from Redux — updated by FoodCard/NewFoodCard on every add/remove dispatch.
    // Used only for bubble visibility so the cart button appears immediately after adding.
    // cartGroups holds the grouped API response shown on home / non-restaurant routes.
    // The `= []` default protects against rehydrated persisted state from
    // before `cartGroups` existed in the slice.
    const { cartList, cartGroups = [], walletAmount: walletAmountRaw } =
        useSelector((state) => state.cart)
    // Coerce to a real number — initial state is `null`, and some flows set
    // it from a string. AllPaymentMethod gates wallet visibility on
    // `walletAmount > 0`, so a falsy value must collapse to 0.
    const walletAmount = Number(walletAmountRaw) || 0
    const [modalFor, setModalFor] = useState('sign-in')
    const [openModal, setOpenModal] = React.useState(false)
    const { global } = useSelector((state) => state.globalSettings)
    const token = getToken()
    console.log({token});
    

    // True when viewing a specific restaurant's page
    const isRestaurantPage = router.pathname === '/restaurants/[id]'
    // Use the URL param (always present on /restaurants/[id]) so the hook calls
    // cart/list?restaurant_id=X even when the Redux cart is still empty on first load.
    const restaurantId = isRestaurantPage ? router.query.id : undefined

    let languageDirection
    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }

    const [authModalOpen, setOpen] = useState(false)
    const handleOpenAuthModal = () => setOpen(true)
    const handleCloseAuthModal = () => setOpen(false)

    let currencySymbol, currencySymbolDirection, digitAfterDecimalPoint
    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }

    const handleProductUpdateModal = (item) => {
        dispatch(setCartItemByDispatch(item))
        setOpenModal(true)
        setSideDrawerOpen(false)
    }


    const cartListSuccessHandler = (res) => {
        if (!isRestaurantPage || !Array.isArray(res)) return
        dispatch(cart(mapRestaurantCartRows(res)))
    }

    const {
        refetch: cartListRefetch,
        isFetching: cartListFetching,
    } = useGetAllCartList(restaurantId, { onSuccess: cartListSuccessHandler })

    // On the restaurant page the primary fetch above is scoped to that
    // restaurant (RestaurantCartSidebar reads the mapped cartList), so the
    // grouped all-restaurants summary the drawer renders is fetched
    // separately there — its own redux sync is handled inside the hook.
    // Disabled on every other page, where the primary fetch above already
    // is the grouped one.
    const {
        refetch: groupedCartRefetch,
        isFetching: groupedCartFetching,
    } = useGetAllCartList(undefined, { enabled: isRestaurantPage })

    // Source of truth for the floating bubble count:
    //   - on the restaurant page, cartList is the mapped per-restaurant cart
    //     (and FoodCard adds dispatch into it), so use its length;
    //   - elsewhere, cartGroups is the grouped API response, so sum each
    //     group's carts[] length to get total line items across restaurants.
    const totalCartItems = isRestaurantPage
        ? cartList?.length || 0
        : cartGroups?.reduce(
              (sum, g) => sum + (g?.carts?.length || 0),
              0
          ) || 0

    // Refresh cart data from API each time the drawer opens
    useEffect(() => {
        if (sideDrawerOpen) {
            cartListRefetch()
            if (isRestaurantPage) groupedCartRefetch()
        }
    }, [sideDrawerOpen])

    // Mobile restaurant page only: its bottom cart drawer (RestaurantDetails)
    // shares the cartDrawerOpen flag and shows the per-restaurant cart, so
    // auto-close it when the user removes the last item. Guarded by prev>0 so
    // opening an already-empty cart manually does not slam the drawer shut.
    // Desktop's side drawer shows the grouped view and must stay open even
    // when this restaurant's cart empties.
    const prevCartLenRef = useRef(cartList?.length || 0)
    useEffect(() => {
        const cur = cartList?.length || 0
        const prev = prevCartLenRef.current
        if (
            isRestaurantPage &&
            isMobileViewport &&
            sideDrawerOpen &&
            prev > 0 &&
            cur === 0
        ) {
            setSideDrawerOpen(false)
        }
        prevCartLenRef.current = cur
    }, [cartList?.length, isRestaurantPage, sideDrawerOpen, setSideDrawerOpen])

    // Fetch restaurant details when on restaurant page (for header card in drawer)
    const { data: restaurantData } = useQuery(
        ['floating-cart-restaurant', restaurantId],
        () => RestaurantsApi.restaurantDetails(restaurantId),
        {
            // Only the guest-checkout modal reads this (restaurant slug),
            // and the page itself already fetched these details via
            // getStaticProps — don't duplicate that request on every store
            // page load, fetch lazily when the modal actually opens.
            enabled:
                openGuestModal && isRestaurantPage && Boolean(restaurantId),
        }
    )
    const restaurant = restaurantData?.data

    // Pro-member status comes from the customer profile. The active-offer
    // call is gated on `pro_status === 1` so non-pro users never hit it.
    const { data: customerData } = useQuery(
        ['profile-info'],
        ProfileApi.profileInfo,
        {
            enabled: Boolean(token),
            onError: onSingleErrorResponse,
        }
    )
    const proStatus = Number(customerData?.data?.pro_status) === 1
    const { data: proActiveOffer } = useGetProActiveOffer({
        enabled: proStatus,
    })
    console.log({proStatus});
    

    // Mirror ProfilePage.js: profile-info owns wallet_balance, but
    // state.cart.walletAmount is only written there. If the user opens the
    // floating cart and tries to subscribe without ever visiting their
    // profile, walletAmount stays null and AllPaymentMethod hides the wallet
    // option. Sync it here whenever the profile query resolves.
    useEffect(() => {
        const balance = customerData?.data?.wallet_balance
        if (balance !== undefined && balance !== null) {
            dispatch(setWalletAmount(balance))
        }
    }, [customerData?.data?.wallet_balance, dispatch])

    // Active-offer payload shape varies by benefit.type:
    //   - 'discount'     → { percentage, max_amount, min_order_amount }
    //   - 'delivery_fee' → { offer_type: 'full_free' | 'partial_free',
    //                        charge_discount_percentage, min_order_amount }
    //   - 'coupon'       → no concrete amount surfaced here; we just signal
    //                      that a coupon benefit is unlocked.
    const cartSubtotal =
        cartList?.reduce((sum, item) => sum + (item?.totalPrice || 0), 0) || 0
    const benefit = proActiveOffer?.benefit
    const benefitType = benefit?.type
    const offerType = benefit?.offer_type
    const benefitPercentage = Number(benefit?.percentage) || 0
    const benefitMaxAmount = Number(benefit?.max_amount) || 0
    const chargeDiscountPct = Number(benefit?.charge_discount_percentage) || 0
    const benefitMinOrderAmount = Number(benefit?.min_order_amount) || 0
    const benefitMinOrderStatus = Number(benefit?.min_order_status) === 1
    const offerActive =
        proStatus &&
        proActiveOffer?.status === true

    // Compute amount-vs-message by branch. FloatingCart has no delivery-fee
    // value to multiply against, so delivery_fee offers surface as text;
    // coupon benefits do the same. Only 'discount' yields a numeric saving.
    const minOrderSuffix =
        benefitMinOrderStatus && benefitMinOrderAmount > 0
            ? ` (${t('on orders above')} ${getAmount(
                  benefitMinOrderAmount,
                  currencySymbolDirection,
                  currencySymbol,
                  digitAfterDecimalPoint
              )})`
            : ''
    // When the offer enforces a minimum, show the user how much more they
    // need to add to qualify. Once they hit the threshold the message
    // switches to the concrete savings (discount %) or the unlock copy
    // (delivery / coupon). `qualifiesForOffer` collapses to true when no
    // minimum is enforced so non-min offers work as before.
    const amountToReachMin =
        benefitMinOrderStatus && benefitMinOrderAmount > 0
            ? Math.max(0, benefitMinOrderAmount - cartSubtotal)
            : 0
    const qualifiesForOffer = amountToReachMin === 0
    let savedAmount = 0
    let savingsMessage = ''
    if (offerActive) {
        if (!qualifiesForOffer) {
            // Below the min order amount — surface a single, actionable
            // "Add ৳X more to save" message regardless of benefit type.
            const amountToReachText = getAmount(
                amountToReachMin,
                currencySymbolDirection,
                currencySymbol,
                digitAfterDecimalPoint
            )
            savingsMessage = `${t(
                'Add'
            )} ${amountToReachText} ${t('more to save with Pro Plan')}`
        } else if (benefitType === 'discount') {
            const rawDiscount = (cartSubtotal * benefitPercentage) / 100
            savedAmount =
                benefitMaxAmount > 0
                    ? Math.min(rawDiscount, benefitMaxAmount)
                    : rawDiscount
            if (savedAmount > 0) {
                const savedText = getAmount(
                    savedAmount,
                    currencySymbolDirection,
                    currencySymbol,
                    digitAfterDecimalPoint
                )
                savingsMessage = `${t(
                    'You save'
                )} ${savedText} ${t('with Pro Plan')}`
            }
        } else if (benefitType === 'delivery_fee') {
            if (offerType === 'full_free') {
                savingsMessage = t('Free delivery as a Pro member')
            } else if (offerType === 'partial_free') {
                savingsMessage = `${chargeDiscountPct}% ${t(
                    'off delivery as a Pro member'
                )}`
            }
        } else if (benefitType === 'coupon') {
            savingsMessage = t('Pro coupon benefit unlocked')
        }
    }
    const hasActiveOfferSaving =
        offerActive &&
        ((Number.isFinite(savedAmount) && savedAmount > 0) ||
            Boolean(savingsMessage))
            console.log({cartSubtotal,benefitMinOrderAmount});
            

    const handleCheckout = () => {
        setSideDrawerOpen(false)
        if (token) {
            const queryParams = { page: 'cart' }
            if (router.query.isDineIn) queryParams.isDineIn = router.query.isDineIn
            if (cartList?.[0]?.restaurant_id)
                queryParams.restuId = cartList[0].restaurant_id
            if (restaurant?.slug) queryParams.restaurant = restaurant.slug
            router.push({ pathname: '/checkout', query: queryParams }, undefined, { shallow: true })
        } else {
            if (global?.guest_checkout_status === 1) {
                setOpenGuestModal(true)
            } else {
                handleOpenAuthModal()
            }
        }
    }
    console.log({ hasActiveOfferSaving, proActiveOffer, savedAmount })

    // Redirect to the restaurant details page for "Add More Items"
    const handleAddMore = (restaurantId, restaurantSlug) => {
        setSideDrawerOpen(false)
        handleRestaurantRedirect(router, restaurantSlug, restaurantId)
    }

    // "View cart" on a restaurant group: close this drawer and navigate —
    // the restaurant details page already renders the cart as flat UI
    // (sidebar on desktop, RestaurantMobileCartBar on mobile), so no
    // second drawer needs to open there.
    const handleViewCart = (restaurantId, restaurantSlug) => {
        setSideDrawerOpen(false)
        router.push({
            pathname: `/restaurants/${restaurantSlug || restaurantId}`,
        })
    }

    // Optimistically remove a restaurant group from the display, then call
    // the API to actually clear that restaurant's items. Backend support for
    // the `restaurant_id` filter is required for this to be scoped.
    const handleRemoveGroup = (restaurantId) => {
        dispatch(removeCartGroupByRestaurantId(restaurantId))
        removeCartMutate(
            { guestId: getGuestId(), restaurantId },
            {
                onSettled: () => {
                    queryClient.invalidateQueries([
                        'cart-item-restaurant',
                        restaurantId,
                    ])
                    cartListRefetch()
                },
                onError: onSingleErrorResponse,
            }
        )
    }

    // Wipes every restaurant's cart in one call (no restaurant_id filter),
    // clearing both slices so the drawer empties without waiting on refetch.
    const handleClearAll = () => {
        dispatch(setCartGroups([]))
        dispatch(cart([]))
        removeCartMutate(
            { guestId: getGuestId() },
            {
                onSettled: () => {
                    queryClient.invalidateQueries('cart-item-restaurant')
                    cartListRefetch()
                },
                onError: onSingleErrorResponse,
            }
        )
    }

    // Line prices already carry any item discount; the pre-discount total is
    // rebuilt from each item's own price so the card can strike it through.
    const getGroupPrices = (group) => {
        const carts = group?.carts ?? []
        const payable = carts.reduce((sum, c) => sum + (c?.price || 0), 0)
        const original = carts.reduce(
            (sum, c) =>
                sum +
                calculateItemBasePrice(c?.item, c?.item?.variations) *
                    (c?.quantity || 1),
            0
        )
        return { payable, original }
    }

    // Source-of-truth split mirrors totalCartItems: cartList is canonical on a
    // restaurant page; cartGroups[].carts[].price is canonical elsewhere.
    const totalCartPrice = isRestaurantPage
        ? cartList?.reduce(
              (sum, item) => sum + (item?.totalPrice || 0),
              0
          ) || 0
        : cartGroups?.reduce(
              (sum, g) =>
                  sum +
                  (g?.carts?.reduce(
                      (cSum, c) => cSum + (c?.price || 0),
                      0
                  ) || 0),
              0
          ) || 0

    return (
        <>
            {authModalOpen && (
                <AuthModal
                    open={authModalOpen}
                    handleClose={handleCloseAuthModal}
                    modalFor={modalFor}
                    setModalFor={setModalFor}
                    cartListRefetch={cartListRefetch}
                />
            )}

            <RTL direction={languageDirection}>
                <Drawer
                    anchor="right"
                    open={
                        sideDrawerOpen &&
                        !(isRestaurantPage && isMobileViewport)
                    }
                    onClose={() => setSideDrawerOpen(false)}
                    variant="temporary"
                    sx={{
                        zIndex: '1400',
                        '& .MuiDrawer-paper': {
                            width: { xs: '90%', sm: '50%', md: '390px' },
                            backgroundColor: theme.palette.background.default,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        },
                    }}
                >
                    {/* ── Header ── */}
                    {(
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            sx={{ px: 2, pt: 2, pb: 1.5 }}
                        >
                            <IconButton
                                aria-label={t('Close cart')}
                                onClick={() => setSideDrawerOpen(false)}
                                sx={{
                                    flexShrink: 0,
                                    backgroundColor: (theme) => theme.palette.neutral[200],
                                    '&:hover': { backgroundColor: (theme) => theme.palette.neutral[300] },
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                            <Typography
                                fontSize="22px"
                                fontWeight={700}
                                noWrap
                                sx={{ flex: 1, minWidth: 0 }}
                            >
                                {t('Your Cart')}
                            </Typography>
                            {cartGroups.length > 0 && (
                                <Typography
                                    onClick={handleClearAll}
                                    fontSize="16px"
                                    fontWeight={600}
                                    color={theme.palette.error.main}
                                    sx={{
                                        flexShrink: 0,
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        '&:hover': { textDecoration: 'underline' },
                                    }}
                                >
                                    {t('Clear All')}
                                </Typography>
                            )}
                        </Stack>
                    )}

                    {/* ── Loading shimmer ── */}
                    {(isRestaurantPage
                        ? groupedCartFetching
                        : cartListFetching) && cartGroups.length === 0 ? (
                        <SimpleBar style={{ height: 'calc(100vh - 80px)', width: '100%' }}>
                            <Stack spacing={1.5} sx={{ px: 2, pb: 3 }}>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Box
                                        key={`cart-group-shim-${i}`}
                                        sx={{
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: '14px',
                                            p: 1.5,
                                        }}
                                    >
                                        {/* Top: logo + restaurant name */}
                                        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.25 }}>
                                            <Skeleton variant="circular" width={36} height={36} />
                                            <Skeleton variant="text" width="55%" height={20} />
                                        </Stack>
                                        {/* Middle: item thumbnails row */}
                                        <Stack direction="row" spacing={0.75} sx={{ mb: 1.25 }}>
                                            {Array.from({ length: 4 }).map((__, j) => (
                                                <Skeleton
                                                    key={`thumb-${i}-${j}`}
                                                    variant="rounded"
                                                    width={58}
                                                    height={58}
                                                    sx={{ borderRadius: '9px' }}
                                                />
                                            ))}
                                        </Stack>
                                        {/* Bottom: action row */}
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Skeleton variant="text" width="30%" height={18} />
                                            <Skeleton variant="rounded" width={88} height={28} sx={{ borderRadius: '20px' }} />
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        </SimpleBar>
                    ) : cartGroups.length === 0 ? (
                        /* ── Empty state ── */
                        <Stack
                            sx={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <CustomImageContainer src={emptycart?.src} height="250px" />
                            <CustomTypographyBold align="center">
                                {t('Cart is Empty')}
                            </CustomTypographyBold>
                            <Typography align="center" color="text.secondary" sx={{ mt: 1 }}>
                                {t('Start adding items to see them here')}
                            </Typography>
                        </Stack>
                    ) : (
                        /* ── Grouped restaurant cards (all pages) ── */
                        <SimpleBar style={{ height: 'calc(100vh - 80px)', width: '100%' }}>
                            <Stack spacing={1.5} sx={{ px: 2, pb: 3 }}>
                                {cartGroups.map((group) => {
                                    const restaurant = group?.restaurant
                                    // Image strip pulls from each cart line's
                                    // food image — the API doesn't expose a
                                    // pre-aggregated `item_images` array on
                                    // the restaurant, so we derive it here.
                                    // Keep a tile per line even when the API
                                    // sends image_full_url: null — dropping it
                                    // would desync the strip from item_count;
                                    // CustomNextImage falls back to the
                                    // placeholder image itself.
                                    const itemImages = (group?.carts ?? [])
                                        .flatMap((c) => {
                                            if (c?.item) {
                                                return [c.item.image_full_url]
                                            }
                                            const bundleFoods = [
                                                ...(c?.bogo_details
                                                    ?.buy_items || []),
                                                ...(c?.bogo_details
                                                    ?.free_items || []),
                                            ]
                                            return bundleFoods.map(
                                                (food) =>
                                                    food?.item
                                                        ?.image_full_url ??
                                                    food?.image_full_url
                                            )
                                        })
                                    const { payable, original } =
                                        getGroupPrices(group)
                                    // discount_eligibility is a restaurant/coupon-level
                                    // discount layered on top of the item prices — only
                                    // apply it once the backend has confirmed the cart
                                    // qualifies (min purchase met).
                                    const discountEligibility =
                                        group?.discount_eligibility
                                    const restaurantDiscountAmount =
                                        discountEligibility?.is_qualified
                                            ? discountEligibility.discount_amount || 0
                                            : 0
                                    const finalPrice = Math.max(
                                        payable - restaurantDiscountAmount,
                                        0
                                    )
                                    // `restaurant` (group.restaurant) is the
                                    // minimal summary object and doesn't carry
                                    // delivery_time — the full restaurant object
                                    // only lives on each cart line, so fall back
                                    // to the first line's nested restaurant.
                                    const deliveryTimeRaw =
                                        restaurant?.delivery_time ??
                                        group?.carts?.[0]?.restaurant
                                            ?.delivery_time
                                    // delivery_time comes through as either
                                    // "20-30" or "20-30 min" depending on the
                                    // endpoint, so only add the unit when the
                                    // string doesn't carry one already.
                                    const deliveryTime = deliveryTimeRaw
                                        ? /[a-z]/i.test(deliveryTimeRaw)
                                            ? deliveryTimeRaw
                                            : `${deliveryTimeRaw} ${t('min')}`
                                        : undefined
                                    return (
                                        <CartGroupCard
                                            key={restaurant?.id}
                                            restaurantName={restaurant?.name ?? t('Restaurant')}
                                            restaurantLogo={restaurant?.logo_full_url}
                                            restaurantVerified={
                                                restaurant?.verified ??
                                                restaurant?.verified_seller ??
                                                restaurant?.is_verified
                                            }
                                            deliveryTime={deliveryTime}
                                            itemImages={itemImages}
                                            priceText={getAmount(
                                                finalPrice,
                                                currencySymbolDirection,
                                                currencySymbol,
                                                digitAfterDecimalPoint
                                            )}
                                            originalPriceText={
                                                original > finalPrice
                                                    ? getAmount(
                                                          original,
                                                          currencySymbolDirection,
                                                          currencySymbol,
                                                          digitAfterDecimalPoint
                                                      )
                                                    : undefined
                                            }
                                            onAddMore={() => handleAddMore(restaurant?.id, restaurant?.slug)}
                                            onViewCart={() => handleViewCart(restaurant?.id, restaurant?.slug)}
                                            onRemoveGroup={() => handleRemoveGroup(restaurant?.id)}
                                            t={t}
                                        />
                                    )
                                })}
                            </Stack>
                        </SimpleBar>
                    )}
                </Drawer>
            </RTL>

            {openGuestModal && (
                <GuestCheckoutModal
                    setModalFor={setModalFor}
                    handleOpenAuthModal={handleOpenAuthModal}
                    open={openGuestModal}
                    setOpen={setOpenGuestModal}
                    setSideDrawerOpen={setSideDrawerOpen}
                    restaurantId={cartList?.[0]?.restaurant_id}
                    restaurantSlug={restaurant?.slug}
                />
            )}
            {openModal && (
                <ProductUpdateModal
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    currencySymbol={currencySymbol}
                    currencySymbolDirection={currencySymbolDirection}
                    digitAfterDecimalPoint={digitAfterDecimalPoint}
                    handleBadge={handleBadge}
                />
            )}
            <ProPlanSubscriptionModal
                open={proPlanModalOpen}
                onClose={() => setProPlanModalOpen(false)}
                isSubmitting={subscribing}
                onSubscribe={(plan) => {
                    // Free-trial plans skip the payment-method picker and
                    // subscribe directly with payment_type/method = 'free_trial'.
                    // `price === 0` is the same heuristic ChoosePlanContent uses
                    // to flip its CTA to "Start Free Trial".
                    if (plan?.price === 0) {
                        const callbackUrl =
                            typeof window !== 'undefined'
                                ? window.location.href
                                : ''
                        subscribeProPlan(
                            {
                                plan_id: plan.id,
                                payment_type: 'free_trial',
                                payment_method: 'free_trial',
                                callback_url: callbackUrl,
                            },
                            {
                                onSuccess: (resp) => {
                                    const redirectLink = resp?.redirect_link
                                    if (
                                        typeof redirectLink === 'string' &&
                                        redirectLink.length > 0
                                    ) {
                                        window.location.href = redirectLink
                                        return
                                    }
                                    setProPlanModalOpen(false)
                                    queryClient.invalidateQueries(
                                        'pro-customer-active-offer'
                                    )
                                    queryClient.invalidateQueries([
                                        'profile-info',
                                    ])
                                    refreshUserProfile()
                                    openResultModal('success')
                                },
                                onError: (err) => {
                                    toast.error(
                                        err?.response?.data?.message ??
                                            t('Subscription failed')
                                    )
                                    openResultModal('fail')
                                },
                            }
                        )
                        return
                    }
                    setProPlanSelected(plan)
                    setProPlanModalOpen(false)
                    setProPlanPaymentOpen(true)
                }}
                t={t}
            />
            {proPlanPaymentOpen && proPlanSelected && (
                <CustomModal
                    openModal={proPlanPaymentOpen}
                    handleClose={() => setProPlanPaymentOpen(false)}
                    setModalOpen={setProPlanPaymentOpen}
                    maxWidth="640px"
                    bgColor={theme.palette.customColor.ten}
                    closeButton
                >
                    <AllPaymentMethod
                        handleClose={() => setProPlanPaymentOpen(false)}
                        paymenMethod={paymenMethod}
                        usePartialPayment={false}
                        global={global}
                        hideWallet={
                            proPlanSelected
                                ? proPlanSelected.price > walletAmount
                                : false
                        }
                        setPaymenMethod={setPaymenMethod}
                        getPaymentMethod={(item) => {
                            setSelected(item)
                            setSwitchToWallet(false)
                        }}
                        setSelected={setSelected}
                        selected={selected}
                        handleSubmit={() => {
                            // Build the API payload from the selected payment
                            // method. payment_type is the high-level bucket
                            // (digital_payment / offline_payment / wallet /
                            // cash_on_delivery); payment_method is the specific
                            // method identifier (e.g. "stripe", "bkash", a
                            // specific offline method_name).
                            if (!proPlanSelected || !selected) {
                                toast.error(t('Select a payment method'))
                                return
                            }
                           let payment_platform = "web"
                            let payment_type = 'digital_payment'
                            let payment_method = selected?.name
                             if (selected?.name === 'wallet') {
                                payment_type = 'wallet'
                                payment_method = 'wallet'
                            } else if (
                                selected?.name === 'cash_on_delivery'
                            ) {
                                payment_type = 'cash_on_delivery'
                                payment_method = 'cash_on_delivery'
                            }
                            // Capture the current URL so the gateway can
                            // redirect the user back here after payment.
                            const callbackUrl =
                                typeof window !== 'undefined'
                                    ? window.location.href
                                    : ''
                            subscribeProPlan(
                                {
                                    plan_id: proPlanSelected.id,
                                    payment_type,
                                    payment_method,
                                    callback: callbackUrl,
                                    payment_platform,
                                },
                                {
                                    onSuccess: (resp) => {
                                        // Backend returns `redirect_link` for
                                        // digital payments (e.g. sslcommerz).
                                        // Navigate before touching UI state —
                                        // the page is leaving anyway.
                                        const redirectLink = resp?.redirect_link
                                        if (
                                            typeof redirectLink === 'string' &&
                                            redirectLink.length > 0
                                        ) {
                                            window.location.href = redirectLink
                                            return
                                        }
                                        setProPlanPaymentOpen(false)
                                        setProPlanSelected(null)
                                        queryClient.invalidateQueries(
                                            'pro-customer-active-offer'
                                        )
                                        queryClient.invalidateQueries([
                                            'profile-info',
                                        ])
                                        refreshUserProfile()
                                        // Defer opening the success Dialog
                                        // until after AllPaymentMethod's close
                                        // animation starts — otherwise the two
                                        // modals fight in the same React batch
                                        // and the success Dialog visibly
                                        // flickers in/out as the backdrops
                                        // resolve their stacking order.
                                        setTimeout(
                                            () => openResultModal('success'),
                                            300
                                        )
                                    },
                                    onError: (err) => {
                                        toast.error(
                                            err?.response?.data?.message ??
                                                t('Subscription failed')
                                        )
                                        setTimeout(
                                            () => openResultModal('fail'),
                                            300
                                        )
                                    },
                                }
                            )
                        }}
                        subscriptionStates={proPlanSubscriptionStates}
                        offlinePaymentOptions={undefined}
                        setIsCheckedOffline={setIsCheckedOffline}
                        isCheckedOffline={isCheckedOffline}
                        offLineWithPartial={false}
                        paymentMethodDetails={paymentMethodDetails}
                        walletAmount={walletAmount}
                        totalAmount={proPlanSelected?.price ?? 0}
                        handlePartialPayment={() => {
                            // Mirrors PaymentOptions.js's wallet selection:
                            // applying the wallet promotes it to the active
                            // payment method, flips switchToWallet so
                            // AllPaymentMethod renders the full-wallet UI, and
                            // stores a `{ name: 'wallet' }` selection so the
                            // handleSubmit branch above takes the wallet path.
                            setPaymenMethod('wallet')
                            setSwitchToWallet(true)
                            setSelected({ name: 'wallet' })
                        }}
                        removePartialPayment={() => {
                            setPaymenMethod('')
                            setSwitchToWallet(false)
                            setSelected(null)
                        }}
                        switchToWallet={switchToWallet}
                        setChangeAmount={setChangeAmount}
                        changeAmount={changeAmount}
                        openModal={proPlanPaymentOpen}
                        orderType={'subscription'}
                        submitLabel={subscribing ? 'Subscribing…' : 'Proceed'}
                        hideCashOnDelivery={true}
                    />
                </CustomModal>
            )}

            <Dialog
                open={resultModalOpen}
                onClose={handleResultClose}
                keepMounted
                TransitionProps={{
                    onExited: () =>
                        setResultState({ open: false, variant: null }),
                }}
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        p: 1,
                        width: { xs: '90%', sm: '400px' },
                    },
                }}
            >
                <DialogContent>
                    <Stack alignItems="center" spacing={1.5} sx={{ py: 1 }}>
                        {resultModal === 'success' ? (
                            <CheckCircleRoundedIcon
                                sx={{ fontSize: 64, color: '#22C55E' }}
                            />
                        ) : (
                            <CancelRoundedIcon
                                sx={{ fontSize: 64, color: '#EF4444' }}
                            />
                        )}
                        <Typography
                            fontSize="20px"
                            fontWeight={700}
                            color="text.primary"
                            textAlign="center"
                        >
                            {resultModal === 'success'
                                ? t('Subscription Successful')
                                : t('Subscription Failed')}
                        </Typography>
                        <Typography
                            fontSize="14px"
                            color="text.secondary"
                            textAlign="center"
                        >
                            {resultModal === 'success'
                                ? t(
                                      'Your Pro subscription is now active. Enjoy your benefits!'
                                  )
                                : t(
                                      'Your subscription payment did not go through. Please try again.'
                                  )}
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center' }}>
                    <Button
                        onClick={handleResultClose}
                        variant="contained"
                        sx={{
                            backgroundColor:
                                resultModal === 'success'
                                    ? '#22C55E'
                                    : '#EF4444',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 4,
                            borderRadius: '8px',
                            '&:hover': {
                                backgroundColor:
                                    resultModal === 'success'
                                        ? '#16A34A'
                                        : '#DC2626',
                            },
                        }}
                    >
                        {t('OK')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default FloatingCart
