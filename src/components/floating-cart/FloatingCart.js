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
import emptycart from '../../../public/static/emptycart.png'
import { RTL } from '../RTL/RTL'
import Cart from './Cart'
import GuestCheckoutModal from './GuestCheckoutModal'
import { getGuestId, getToken } from '../checkout-page/functions/getGuestUserId'
import useGetAllCartList from '@/hooks/react-query/add-cart/useGetAllCartList'
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
    getConvertDiscount,
    handleRestaurantRedirect,
} from '@/utils/customFunctions'
import {
    cart,
    setCartItemByDispatch,
    setCartGroups,
    removeCartGroupByRestaurantId,
    setWalletAmount,
} from '@/redux/slices/cart'
import {
    getSelectedAddons,
    getSelectedVariations,
} from '../navbar/second-navbar/SecondNavbar'

const FloatingCart = (props) => {
    const { sideDrawerOpen, setSideDrawerOpen } = props
    const theme = useTheme()
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
    const { isFilterDrawerOpen } = useSelector(
        (state) => state.searchFilterStore
    )
    console.log({cartList})

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
        if (!Array.isArray(res)) return
        // Detect format: grouped response has a `restaurant` key, individual has an `item` key
        const isGroupedFormat = res.length > 0 && res[0]?.restaurant && !res[0]?.item
        if (isRestaurantPage && !isGroupedFormat) {
            // Restaurant mode: response is individual items [{ id, item, quantity }]
            // Map into Redux cart so CartItemCard can render them
            const mapped = res.map((entry) => ({
                ...entry?.item,
                cartItemId: entry?.id,
                totalPrice: entry?.price,
                selectedAddons: getSelectedAddons(entry?.item?.addons),
                quantity: entry?.quantity,
                variations: entry?.item?.variations,
                itemBasePrice: getConvertDiscount(
                    entry?.item?.discount,
                    entry?.item?.discount_type,
                    calculateItemBasePrice(entry?.item, entry?.item?.variations),
                    entry?.item?.restaurant_discount
                ),
                selectedOptions: getSelectedVariations(entry?.item?.variations),
            }))
            dispatch(cart(mapped))
        } else if (!isRestaurantPage || isGroupedFormat) {
            // Home/other pages (or unexpected grouped response): store as groups
            dispatch(setCartGroups(res))
        }
    }

    const {
        refetch: cartListRefetch,
        isFetching: cartListFetching,
    } = useGetAllCartList(getGuestId(), cartListSuccessHandler, restaurantId)

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
        if (sideDrawerOpen) cartListRefetch()
    }, [sideDrawerOpen])

    // On the restaurant details page, auto-close the drawer when the user
    // removes the last item. Guarded by prev>0 so opening an already-empty
    // cart manually does not slam the drawer shut.
    const prevCartLenRef = useRef(cartList?.length || 0)
    useEffect(() => {
        const cur = cartList?.length || 0
        const prev = prevCartLenRef.current
        if (isRestaurantPage && sideDrawerOpen && prev > 0 && cur === 0) {
            setSideDrawerOpen(false)
        }
        prevCartLenRef.current = cur
    }, [cartList?.length, isRestaurantPage, sideDrawerOpen, setSideDrawerOpen])

    // Auto-open the drawer when landing on a restaurant page via the
    // "View cart" group action (signaled by ?openCart=1). Strip the param
    // afterwards so reloads / back-nav don't keep re-triggering.
    useEffect(() => {
        if (
            isRestaurantPage &&
            router.isReady &&
            router.query.openCart === '1'
        ) {
            setSideDrawerOpen(true)
            const { openCart, ...rest } = router.query
            router.replace(
                { pathname: router.pathname, query: rest },
                undefined,
                { shallow: true }
            )
        }
        // router.replace is referentially stable; depending on router.query
        // alone keeps this triggering only when the URL actually changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRestaurantPage, router.isReady, router.query.openCart])

    // Fetch restaurant details when on restaurant page (for header card in drawer)
    const { data: restaurantData } = useQuery(
        ['floating-cart-restaurant', restaurantId],
        () => RestaurantsApi.restaurantDetails(restaurantId),
        { enabled: isRestaurantPage && Boolean(restaurantId) }
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

    // "View cart" on a restaurant group: close the drawer for the navigation
    // animation, push the restaurant route with `openCart=1`, and the effect
    // below re-opens the drawer once the restaurant page is in view.
    const handleViewCart = (restaurantId, restaurantSlug) => {
        setSideDrawerOpen(false)
        router.push({
            pathname: `/restaurants/${restaurantSlug || restaurantId}`,
            query: { openCart: '1' },
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

            {/* Floating cart bubble (desktop only) */}
            {!sideDrawerOpen && (
                <Box
                    className="cart__burger"
                    sx={{
                        position: 'fixed',
                        width: '85px',
                        height: '90px',
                        left: languageDirection === 'rtl' ? 10 : 'auto',
                        
                        right: languageDirection === 'rtl' ? 'auto' : 10,
                        top: '38%',
                        zIndex: 1000000,
                        flexGrow: 1,
                        cursor: 'pointer',
                        display: {
                            xs: 'none',
                            sm: 'none',
                            md: isFilterDrawerOpen
                                ? 'none'
                                : totalCartItems === 0
                                ? 'none'
                                : 'inherit',
                        },
                    }}
                    onClick={() => setSideDrawerOpen(true)}
                >
                    <div>
                        <Cart />
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '35%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center',
                                fontWeight: 'bold',
                            }}
                        >
                            {totalCartItems}
                            <Typography
                                sx={{ lineHeight: 0.5, fontWeight: 'bold', fontSize: '12px' }}
                            >
                                {t('Items')}
                            </Typography>
                        </Box>
                    </div>
                    {isRestaurantPage && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '75px',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                color: (theme) => theme.palette.neutral[100],
                                width: '100px',
                                height: 'auto',
                                overflow: 'visible',
                            }}
                        >
                            <Stack flexWrap="wrap" sx={{ overflow: 'visible' }}>
                                {totalCartPrice > 0 && (
                                    <Typography
                                        sx={{
                                            lineHeight: 1,
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            fontSize: '12px',
                                            overflow: 'visible',
                                            whiteSpace: 'nowrap',
                                            mt: '2px',
                                        }}
                                        color={
                                            theme.palette.whiteContainer.main
                                        }
                                    >
                                        {getAmount(
                                            totalCartPrice,
                                            currencySymbolDirection,
                                            currencySymbol,
                                            digitAfterDecimalPoint
                                        )}
                                    </Typography>
                                )}
                            </Stack>
                        </Box>
                    )}
                </Box>
            )}

            <RTL direction={languageDirection}>
                <Drawer
                    anchor="right"
                    open={sideDrawerOpen}
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
                    {isRestaurantPage ? (
                        <CartHeader
                            itemCount={cartList?.length || 0}
                            onClose={() => setSideDrawerOpen(false)}
                            t={t}
                        />
                    ) : (
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ px: 2, pt: 2, pb: 1.5 }}
                        >
                            <Typography fontSize="20px" fontWeight={700}>
                                {t('Shopping Cart')}
                            </Typography>
                            <IconButton
                                aria-label={t('Close cart')}
                                onClick={() => setSideDrawerOpen(false)}
                                size="small"
                                sx={{
                                    backgroundColor: (theme) => theme.palette.neutral[200],
                                    '&:hover': { backgroundColor: (theme) => theme.palette.neutral[300] },
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    )}

                    {/* ── Loading shimmer (home / non-restaurant) ── */}
                    {cartListFetching && cartGroups.length === 0 && !isRestaurantPage ? (
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
                    ) : cartGroups.length === 0 && !isRestaurantPage ? (
                        /* ── Empty state (home / non-restaurant) ── */
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
                    ) : isRestaurantPage ? (
                        /* ── Restaurant page: restaurant card + cart items + banner + footer ── */
                        <>
                            <SimpleBar style={{ flex: 1, overflow: 'hidden', width: '100%' }}>
                                <Stack sx={{ pb: 2 }}>
                                    {restaurant && (
                                        <RestaurantInfoCard
                                            restaurant={restaurant}
                                            t={t}
                                        />
                                    )}

                                    {cartList?.length === 0 ? (
                                        cartListFetching ? (
                                            // Cart-list fetch is in flight and
                                            // Redux is still empty — render an
                                            // item-card shimmer instead of the
                                            // "Cart is Empty" state so the
                                            // drawer doesn't briefly flash the
                                            // empty UI before items arrive.
                                            <Stack spacing={1.25} sx={{ px: 2, pt: 1 }}>
                                                {Array.from({ length: 3 }).map((_, i) => (
                                                    <Stack
                                                        key={`cart-item-shim-${i}`}
                                                        direction="row"
                                                        spacing={1.25}
                                                        alignItems="center"
                                                        sx={{
                                                            border: `1px solid ${theme.palette.divider}`,
                                                            borderRadius: '10px',
                                                            p: 1.25,
                                                        }}
                                                    >
                                                        <Skeleton
                                                            variant="rounded"
                                                            width={56}
                                                            height={56}
                                                            sx={{ borderRadius: '8px', flexShrink: 0 }}
                                                        />
                                                        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                                                            <Skeleton variant="text" width="70%" height={18} />
                                                            <Skeleton variant="text" width="40%" height={14} />
                                                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 0.5 }}>
                                                                <Skeleton variant="text" width="25%" height={16} />
                                                                <Skeleton variant="rounded" width={72} height={26} sx={{ borderRadius: '20px' }} />
                                                            </Stack>
                                                        </Stack>
                                                    </Stack>
                                                ))}
                                            </Stack>
                                        ) : (
                                            <Stack sx={{ height: '50vh', alignItems: 'center', justifyContent: 'center', px: 2 }}>
                                                <CustomImageContainer src={emptycart?.src} height="200px" />
                                                <CustomTypographyBold align="center">{t('Cart is Empty')}</CustomTypographyBold>
                                            </Stack>
                                        )
                                    ) : (
                                        cartList?.map((item) => (
                                            <CartItemCard
                                                key={item.cartItemId ?? item.id}
                                                item={item}
                                                handleProductUpdateModal={handleProductUpdateModal}
                                                t={t}
                                            />
                                        ))
                                    )}
                                </Stack>
                            </SimpleBar>
                            {cartList?.length > 0 && global?.pro_member_status  ? (
                                !token ? (
                                    <ProPlanBanner
                                        t={t}
                                        onSubscribe={() =>
                                            toast.error(
                                                t('Please login to subscribe')
                                            )
                                        }
                                    />
                                ) : hasActiveOfferSaving ? (
                                    <ProSavingsBanner
                                        amount={savedAmount}
                                        message={savingsMessage || undefined}
                                        currencySymbol={currencySymbol}
                                        currencySymbolDirection={
                                            currencySymbolDirection
                                        }
                                        digitAfterDecimalPoint={
                                            digitAfterDecimalPoint
                                        }
                                        t={t}
                                    />
                                ) : (
                                    <ProPlanBanner
                                        t={t}
                                        onSubscribe={() => {
                                            setProPlanModalOpen(true)
                                            setSideDrawerOpen(false)
                                        }}
                                    />
                                )
                            ):null}
                            {cartList?.length > 0 && (
                                <CartFooter
                                    totalPrice={totalCartPrice}
                                    currencySymbol={currencySymbol}
                                    currencySymbolDirection={currencySymbolDirection}
                                    digitAfterDecimalPoint={digitAfterDecimalPoint}
                                    onCheckout={handleCheckout}
                                    t={t}
                                />
                            )}
                        </>
                    ) : (
                        /* ── Home / other pages: grouped restaurant cards ── */
                        <SimpleBar style={{ height: 'calc(100vh - 80px)', width: '100%' }}>
                            <Stack spacing={1.5} sx={{ px: 2, pb: 3 }}>
                                {cartGroups.map((group) => {
                                    const restaurant = group?.restaurant
                                    // Image strip pulls from each cart line's
                                    // food image — the API doesn't expose a
                                    // pre-aggregated `item_images` array on
                                    // the restaurant, so we derive it here.
                                    const itemImages = (group?.carts ?? [])
                                        .map((c) => c?.item?.image_full_url)
                                        .filter(Boolean)
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
                                            itemImages={itemImages}
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
