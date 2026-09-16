import React, { useEffect, useRef, useState } from 'react'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Drawer,
    Stack,
    Typography,
} from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import { useRouter } from 'next/router'
import TopBanner from './HeadingBannerSection/TopBanner'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import CustomContainer from '../container'
import RestaurantCategoryBar from './RestaurantCategoryBar'
import { useQuery, useQueryClient } from 'react-query'
import CategoriesWiseFood from './CategoriesWiseFood'
import { getAmount } from '@/utils/customFunctions'
import { formatBogoValidUntil } from '@/utils/formatBogoValidUntil'
import { smoothScrollTo } from '@/utils/smoothScrollTo'
import RestaurentDetailsShimmer from './RestaurantShimmer/RestaurentDetailsShimmer'
import CustomEmptyResult from '@/components/empty-view/CustomEmptyResult'
import { noFoodFoundImage } from '@/utils/LocalImages'
import { useGetRecommendProducts } from '@/hooks/react-query/config/useGetRecommendProduct'
import { useRestaurantCategoriesFoods } from '@/hooks/react-query/restaurants/useRestaurantCategoriesFoods'
import { debounce } from 'lodash'
import { t } from 'i18next'
import { useInView } from 'react-intersection-observer'
import useHideOnScroll from '@/hooks/custom-hooks/useHideOnScroll'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { setUser } from '@/redux/slices/customer'
import { setWalletAmount } from '@/redux/slices/cart'
import { setCartDrawerOpen } from '@/redux/slices/utils'
import useCloseOnBackButton from '@/hooks/custom-hooks/useCloseOnBackButton'
import ProPlanTopBanner from './ProPlanTopBanner'
import ProOfferCoupon from './ProOfferCoupon'
import useGetProActiveOffer from '@/hooks/react-query/pro-plans/useGetProActiveOffer'
import { useGetBogoHome } from '@/hooks/react-query/bogo/useGetBogoHome'
import { useGetRestaurantBogoOffers } from '@/hooks/react-query/bogo/useGetRestaurantBogoOffers'
import BogoItemDetailsModal from '@/components/bogo-page/BogoItemDetailsModal'
import LastOrderSection from '@/components/home/last-order/LastOrderSection'
import ProPlanSubscriptionModal from '@/components/floating-cart/restaurant-cart/ProPlanSubscriptionModal'
import CustomModal from '@/components/custom-modal/CustomModal'
import AllPaymentMethod from '@/components/checkout-page/AllPaymentMethod'
import useSubscribeProPlan from '@/hooks/react-query/pro-plans/useSubscribeProPlan'
import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import { ProfileApi } from '@/hooks/react-query/config/profileApi'
import { onSingleErrorResponse } from '@/components/ErrorResponse'
import { getToken } from '@/components/checkout-page/functions/getGuestUserId'
import RestaurantCartSidebar from './RestaurantCartSidebar'
import RestaurantMobileBottomBar from './RestaurantMobileBottomBar'
import useHappyHourBanner from '@/hooks/custom-hooks/useHappyHourBanner'
import MobilePageHeader from '@/components/page-header/MobilePageHeader'
import { NAVBAR_HEIGHT } from '@/components/navbar/navbarConstants'
import {
    toFilterPanelValue,
    toRestaurantFilterState,
} from './restaurantFilterOptions'

const MOST_POPULAR_SORT_COMPARATORS = {
    price_high: (a, b) => (Number(b?.price) || 0) - (Number(a?.price) || 0),
    price_low: (a, b) => (Number(a?.price) || 0) - (Number(b?.price) || 0),
    a_to_z: (a, b) =>
        String(a?.name || '').localeCompare(String(b?.name || '')),
    z_to_a: (a, b) =>
        String(b?.name || '').localeCompare(String(a?.name || '')),
}

const restaurantFoodMockData = [
    { id: 0, name: 'Veg', value: 'veg', isActive: false },
    { id: 1, name: 'Non Veg', value: 'nonVeg', isActive: false },
    { id: 2, name: 'Default', value: 'default', isActive: false },
    { id: 3, name: 'Fast Delivery', value: 'fast_delivery', isActive: false },
    { id: 4, name: 'A to Z', value: 'a_to_z', isActive: false },
    { id: 5, name: 'Z to A', value: 'z_to_a', isActive: false },
    {
        id: 18,
        name: 'Price: High to Low',
        value: 'price_high',
        isActive: false,
    },
    {
        id: 19,
        name: 'Price: Low to High',
        value: 'price_low',
        isActive: false,
    },
    { id: 10, name: 'Rating 4+', value: 'rating4', isActive: false },
    { id: 11, name: 'Rating 3+', value: 'rating3', isActive: false },
    { id: 12, name: 'Rating 2+', value: 'rating2', isActive: false },
    { id: 13, name: 'Rating 1+', value: 'rating1', isActive: false },
    { id: 14, name: 'Discounted', value: 'discounted', isActive: false },
    { id: 15, name: 'New Arrivals', value: 'new_arrivals', isActive: false },
    {
        id: 16,
        name: 'Currently Available',
        value: 'currently_available',
        isActive: false,
    },
    { id: 17, name: 'Halal', value: 'halal', isActive: false },
    { id: 20, name: 'Free Delivery', value: 'free_delivery', isActive: false },
    { id: 21, name: 'Popular', value: 'popular', isActive: false },
]

const RestaurantDetails = ({
    restaurantData: staticRestaurantData,
    configData,
}) => {
    const [data, setData] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [isFirstRender, setIsFirstRender] = useState(true)
    const [showComponent, setShowComponent] = useState(true)
    const [checkedFilterKey, setCheckedFilterKey] = useState(
        restaurantFoodMockData
    )

    const [priceAndRating, setPriceAndRating] = useState({
        price: [],
        rating: 0,
    })
    const [searchKey, setSearchKey] = useState('')
    const restaurantId = staticRestaurantData?.id

    const { data: liveRestaurantData } = useQuery(
        ['restaurant-details-live', restaurantId],
        () => RestaurantsApi.restaurantDetails(restaurantId),
        { enabled: Boolean(restaurantId) }
    )
    const restaurantData = liveRestaurantData?.data
        ? {
              ...staticRestaurantData,
              distance: liveRestaurantData.data.distance,
              distance_label: liveRestaurantData.data.distance_label,
          }
        : staticRestaurantData

    // Skip the per-restaurant bogo-offers call entirely unless the global
    // BOGO campaign is live — avoids a wasted request (and its bogo-offers
    // section flicker) on every store page while BOGO is off.
    const { data: bogoHome } = useGetBogoHome()
    const { data: restaurantBogoOffers } = useGetRestaurantBogoOffers(
        restaurantData?.slug || restaurantId,
        undefined,
        { enabled: Boolean(bogoHome?.is_live) }
    )
    const [activeBogoItem, setActiveBogoItem] = useState(null)

    const [isBogoDetailsModalOpen, setIsBogoDetailsModalOpen] = useState(false)
    const handleBogoCardClick = (offer) => {
        setActiveBogoItem({
            bundle: offer,
            offerId: offer?.id,
            offerTitle: offer?.title,
            offerDescription: offer?.description,
            offerImage: offer?.image_full_url,
            validUntil: formatBogoValidUntil(offer),
            restaurant: {
                id: restaurantData?.id,
                slug: restaurantData?.slug,
                name: restaurantData?.name,
                logoUrl: restaurantData?.logo_full_url,
                deliveryTime: restaurantData?.delivery_time,
                distance_label: restaurantData?.distance_label,
            },
        })
        setIsBogoDetailsModalOpen(true)
    }
    const handleCloseBogoDetailsModal = () => {
        setIsBogoDetailsModalOpen(false)
        setActiveBogoItem(null)
    }

    const highestPrice = 8000

    const hasPriceFilter =
        Array.isArray(priceAndRating?.price) &&
        priceAndRating.price.length === 2 &&
        (priceAndRating.price[0] > 0 || priceAndRating.price[1] < highestPrice)

    const activeFilters = [
        ...(checkedFilterKey?.filter((item) => item?.isActive) ?? []),
        ...(hasPriceFilter
            ? [{ id: 'price-range', value: 'price_range', isActive: true }]
            : []),
    ]

    const isSearchingOrFiltering =
        Boolean(searchKey) || activeFilters.length > 0

    const filterPanelValue = toFilterPanelValue(
        checkedFilterKey,
        priceAndRating?.price
    )

    const has = (val) =>
        checkedFilterKey.some((item) => item.isActive && item.value === val)
    const filterByData = {
        veg: has('veg'),
        non_veg: has('nonVeg'),
        popular: has('popular'),
        free_delivery: has('free_delivery'),
        discounted: has('discounted'),
        new: has('new_arrivals'),
        halal: has('halal'),
        currently_available: has('currently_available'),
        sort_by: has('fast_delivery')
            ? 'fast_delivery'
            : has('a_to_z')
            ? 'a_to_z'
            : has('z_to_a')
            ? 'z_to_a'
            : has('price_high')
            ? 'price_high'
            : has('price_low')
            ? 'price_low'
            : '',
        rating: has('rating4')
            ? 4
            : has('rating3')
            ? 3
            : has('rating2')
            ? 2
            : has('rating1')
            ? 1
            : priceAndRating?.rating || 0,
    }

    const { data: categoriesFoodsData, isFetched: isFoodsFetched } =
        useRestaurantCategoriesFoods({
            restaurantId,
            searchKey,
            filterByData,
            price: priceAndRating?.price,
        })

    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    // Same hook the bottom dock uses (react-query dedupes the lookup) — only
    // to reserve the right amount of page padding under the dock.
    const mobileHappyHour = useHappyHourBanner({
        restaurantId: restaurantData?.id,
    })

    // Pro Plan subscription flow (mirrors FloatingCart). Banner is shown to
    // non-Pro users only; clicking Subscribe opens the plan modal, then
    // AllPaymentMethod handles the payment step.
    const { global } = useSelector((state) => state.globalSettings)
    const { token: reduxToken } = useSelector((state) => state.userToken)
    const token = reduxToken || getToken()
    const { walletAmount: walletAmountRaw } = useSelector((state) => state.cart)
    // Shared cart-drawer flag — on mobile this page renders its own bottom
    // drawer for it (the floating side drawer is suppressed here).
    const cartDrawerOpen = useSelector(
        (state) => state.utilsData.cartDrawerOpen
    )
    useCloseOnBackButton(Boolean(isSmall && cartDrawerOpen), () =>
        dispatch(setCartDrawerOpen(false))
    )
    const walletAmount = Number(walletAmountRaw) || 0
    const { data: customerData } = useQuery(
        ['profile-info'],
        ProfileApi.profileInfo,
        {
            enabled: Boolean(token),
            onError: onSingleErrorResponse,
        }
    )
    const proStatus =
        Boolean(token) && Number(customerData?.data?.pro_status) === 1

    // Guests can never have a pro offer — unauthenticated calls are a
    // guaranteed 401 on every store page load.
    const { data: proActiveOffer } = useGetProActiveOffer({
        enabled: Boolean(token),
    })
    const benefit = proActiveOffer?.benefit
    const benefitType = benefit?.type
    const offerType = benefit?.offer_type
    const benefitPercentage = Number(benefit?.percentage) || 0
    const benefitMaxAmount = Number(benefit?.max_amount) || 0
    const chargeDiscountPct = Number(benefit?.charge_discount_percentage) || 0
    const benefitMinOrderStatus = Number(benefit?.min_order_status) === 1
    const benefitMinOrderAmount = Number(benefit?.min_order_amount) || 0
    const offerActive = proStatus && proActiveOffer?.status === true

    const currencySymbol = global?.currency_symbol
    const currencySymbolDirection = global?.currency_symbol_direction
    const digitAfterDecimalPoint = global?.digit_after_decimal_point

    const minOrderSuffix =
        benefitMinOrderStatus && benefitMinOrderAmount > 0
            ? ` (${t('on orders above')} ${getAmount(
                  benefitMinOrderAmount,
                  currencySymbolDirection,
                  currencySymbol,
                  digitAfterDecimalPoint
              )})`
            : ''
    let activeOfferMessage = ''
    if (offerActive) {
        if (benefitType === 'discount' && benefitPercentage > 0) {
            const capPart =
                benefitMaxAmount > 0
                    ? ` (${t('up to')} ${getAmount(
                          benefitMaxAmount,
                          currencySymbolDirection,
                          currencySymbol,
                          digitAfterDecimalPoint
                      )})`
                    : ''
            activeOfferMessage = `${benefitPercentage}% ${t(
                'off as a Pro member'
            )}${capPart}${minOrderSuffix}`
        } else if (benefitType === 'delivery_fee') {
            if (offerType === 'full_free') {
                activeOfferMessage = `${t(
                    'Free delivery as a Pro member'
                )}${minOrderSuffix}`
            } else if (offerType === 'partial_free' && chargeDiscountPct > 0) {
                activeOfferMessage = `${chargeDiscountPct}% ${t(
                    'off delivery as a Pro member'
                )}${minOrderSuffix}`
            }
        } else if (benefitType === 'coupon') {
            activeOfferMessage = `${t(
                'Pro coupon benefit unlocked'
            )}${minOrderSuffix}`
        }
    }
    const hasActiveOfferMessage = Boolean(activeOfferMessage)

    // Short "30% OFF"-style heading for the Pro coupon card (ProOfferCoupon)
    // — same offer-type branching as activeOfferMessage above, just terser.
    let proOfferHeading = ''
    if (offerActive) {
        if (benefitType === 'discount' && benefitPercentage > 0) {
            proOfferHeading = `${benefitPercentage}% ${t('OFF')}`
        } else if (benefitType === 'delivery_fee') {
            if (offerType === 'full_free') {
                proOfferHeading = t('Free Delivery')
            } else if (offerType === 'partial_free' && chargeDiscountPct > 0) {
                proOfferHeading = `${chargeDiscountPct}% ${t('OFF Delivery')}`
            }
        } else if (benefitType === 'coupon') {
            proOfferHeading = t('Pro Benefit')
        }
    }
    const showProBanner = global?.pro_member_status === 1

    const [proPlanModalOpen, setProPlanModalOpen] = useState(false)

    const handleSubscribeClick = () => {
        if (!getToken()) {
            toast.error(t('Please login to subscribe'))
            return
        }
        setProPlanModalOpen(true)
    }

    const [proPlanSelected, setProPlanSelected] = useState(null)
    const [proPlanPaymentOpen, setProPlanPaymentOpen] = useState(false)
    const [paymenMethod, setPaymenMethod] = useState('')
    const [selected, setSelected] = useState(null)
    const [paymentMethodDetails] = useState(null)
    const [switchToWallet, setSwitchToWallet] = useState(false)
    const [isCheckedOffline, setIsCheckedOffline] = useState(false)
    const [changeAmount, setChangeAmount] = useState('')

    // Pro plan subscription result modal — mirrors the SubscriptionPlanPage
    // flow. Payment gateway redirects to the current page with ?flag=success
    // | cancel | fail; the effect below opens the dialog once per landing.
    const router = useRouter()
    const queryClient = useQueryClient()
    const dispatch = useDispatch()
    const [resultShown, setResultShown] = useState(false)
    // Single source of truth — collapsing `open` and `variant` into one
    // object means a single render flips both atomically.
    const [resultState, setResultState] = useState({
        open: false,
        variant: null,
    })
    const resultModal = resultState.variant
    const resultModalOpen = resultState.open
    // Dedupe guard against double-invocation (StrictMode dev, chained
    // close/open animations). Drops any second open call within 1s.
    const lastResultOpenAt = useRef(0)
    const openResultModal = (variant) => {
        const now = Date.now()
        if (now - lastResultOpenAt.current < 1000) return
        lastResultOpenAt.current = now
        setResultState({ open: true, variant })
    }

    // Mirror FloatingCart: profile-info owns wallet_balance, but
    // state.cart.walletAmount is the slot AllPaymentMethod reads. Without this
    // sync, walletAmount stays null and the wallet option is hidden in the
    // Pro Plan payment modal.
    useEffect(() => {
        const balance = customerData?.data?.wallet_balance
        if (balance !== undefined && balance !== null) {
            dispatch(setWalletAmount(balance))
        }
    }, [customerData?.data?.wallet_balance, dispatch])

    // Refresh redux `userData` after subscribe so ProBadge / Pro-gated UI
    // updates immediately. Mirrors SubscriptionPlanPage.refreshUserProfile.
    const refreshUserProfile = async () => {
        try {
            const res = await ProfileApi.profileInfo()
            const payload = res?.data?.data ?? res?.data
            if (payload) dispatch(setUser(payload))
        } catch {
            // Errors surface through global handlers.
        }
    }

    useEffect(() => {
        if (resultShown) return
        const flag = router.query?.flag
        if (flag === 'success') {
            openResultModal('success')
            setResultShown(true)
            queryClient.invalidateQueries('pro-customer-active-offer')
            queryClient.invalidateQueries(['profile-info'])
            refreshUserProfile()
        } else if (flag === 'cancel') {
            openResultModal('cancel')
            setResultShown(true)
        } else if (flag === 'fail') {
            openResultModal('fail')
            setResultShown(true)
        }
    }, [router.query?.flag, resultShown, queryClient])

    // Strip gateway-callback params (flag, token) so back-nav / reload
    // doesn't reopen the dialog and the URL is clean. Using
    // window.history.replaceState avoids Next.js dynamic-route quirks.
    const handleResultClose = () => {
        // Reset the dedupe window so the next genuine open isn't ignored.
        lastResultOpenAt.current = 0
        // Flip `open=false` only — `variant` survives so the body keeps
        // rendering the right copy through the exit animation; onExited
        // nulls it out after the Dialog has fully closed.
        setResultState((s) => ({ ...s, open: false }))
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            const removed = ['flag', 'token'].some((k) => {
                if (url.searchParams.has(k)) {
                    url.searchParams.delete(k)
                    return true
                }
                return false
            })
            if (removed) {
                window.history.replaceState(
                    {},
                    '',
                    url.pathname + (url.search ? url.search : '') + url.hash
                )
            }
        }
    }

    const proPlanSubscriptionStates = {
        order: '0',
        type: '',
        startDate: '',
        endDate: '',
        days: '',
    }
    const { mutate: subscribeProPlan, isLoading: subscribing } =
        useSubscribeProPlan()
    const refs = useRef([])
    const categoryBarAnchorRef = useRef(null)
    const scrollCancelRef = useRef(null)
    const [scrollingByClick, setScrollingByClick] = useState(false)

    const scrollToCategoryBar = () => {
        const node = categoryBarAnchorRef.current
        if (!node) return
        const offset = isSmall ? 58 : NAVBAR_HEIGHT
        const targetY =
            node.getBoundingClientRect().top + window.pageYOffset - offset
        if (scrollCancelRef.current) {
            scrollCancelRef.current()
        }
        scrollCancelRef.current = smoothScrollTo(Math.max(targetY, 0), 500)
    }
    // Mobile condensed header: appears once the restaurant name in the hero
    // scrolls out of view. initialInView keeps it hidden on first paint.
    const { ref: heroNameRef, inView: heroNameInView } = useInView({
        initialInView: true,
    })
    const isHidden = useHideOnScroll({ threshold: 50 })
    const [removeStickyBanner, setRemoveStickyBanner] = useState(false)
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowComponent(false)
        }, 15000)
        return () => clearTimeout(timer)
    }, [])

    const clickedOnCategoryRef = useRef(false)

    ///RECOMMEND PRODUCTS API
    const { data: recommendProducts, refetch: refetchRecommend } =
        useGetRecommendProducts({
            restaurantId,
            page_limit: 25,
            offset: 1,
            searchKey,
            filterByData,
            price: priceAndRating?.price,
        })
    useEffect(() => {
        if (restaurantId) {
            refetchRecommend()
        }
    }, [
        restaurantId,
        searchKey,
        JSON.stringify(filterByData),
        priceAndRating?.price?.join('-'),
    ])

    useEffect(() => {
        setSearchKey('')
        setSelectedId(null)
        setCheckedFilterKey(
            restaurantFoodMockData.map((item) => ({
                ...item,
                isActive: false,
            }))
        )
        setPriceAndRating({ price: [], rating: 0 })
    }, [restaurantId])

    useEffect(() => {
        const categories = categoriesFoodsData?.categories || []
        const categoryWiseFoods = categoriesFoodsData?.category_wise_foods || {}

        // "Most Popular" — the restaurant's recommended products first, then
        // the top most-ordered items across every category. A food can live
        // in multiple categories (and also be recommended), so dedupe by id.
        const seenFoodIds = new Set()
        const dedupe = (foods = []) =>
            foods.filter((food) => {
                if (!food?.id || seenFoodIds.has(food.id)) return false
                seenFoodIds.add(food.id)
                return true
            })
        const recommendedFoods = dedupe(recommendProducts?.products)
        const allFoods = dedupe(Object.values(categoryWiseFoods).flat())
        const sortComparator =
            MOST_POPULAR_SORT_COMPARATORS[filterByData.sort_by]

        let mergedFoods
        if (sortComparator) {
            mergedFoods = [...recommendedFoods, ...allFoods].sort(
                sortComparator
            )
        } else if (isSearchingOrFiltering) {
            mergedFoods = [...recommendedFoods, ...allFoods]
        } else {
            mergedFoods = [
                ...recommendedFoods,
                ...[...allFoods].sort(
                    (a, b) =>
                        (Number(b?.order_count) || 0) -
                        (Number(a?.order_count) || 0)
                ),
            ]
        }
        const mostPopular = {
            id: 1234,
            name: t('Most Popular'),
            products: mergedFoods.slice(0, 10),
            isBgColor: true,
        }

        // This store's own BOGO bundles. Kept in `data` alongside the food
        // sections so the category bar, scroll anchor and scroll-spy all
        // pick it up with no special-casing.
        const bogoOffersList = restaurantBogoOffers?.offers || []
        const bogo = {
            id: 1235,
            name: t('BOGO'),
            offers: bogoOffersList,
            isBogo: true,
        }

        // Backend already groups foods per category in `category_wise_foods`,
        // so we just attach the matching array to each category entry.
        const grouped = categories
            .map((cat) => ({
                ...cat,
                products: categoryWiseFoods?.[cat?.id] || [],
            }))
            .filter((cat) => cat?.products?.length > 0)

        const final = [
            ...(mostPopular.products.length > 0 ? [mostPopular] : []),
            ...(bogoOffersList.length > 0 ? [bogo] : []),
            ...grouped,
        ]

        setData(final)
        setIsFirstRender(false)
    }, [
        categoriesFoodsData,
        recommendProducts,
        restaurantBogoOffers,
        isSearchingOrFiltering,
    ])

    const handleFocusedSection = debounce((val) => {
        if (!clickedOnCategoryRef.current) {
            setSelectedId(val?.id)
        }
        clickedOnCategoryRef.current = false
    }, 300)

    const handleClick = (val) => {
        clickedOnCategoryRef.current = true
        setScrollingByClick(true)
        setSelectedId(val)
    }

    useEffect(() => {
        if (!selectedId) return
        if (!scrollingByClick) return

        const node = refs.current[selectedId]
        if (!node) return

        // Abort any in-flight scroll from a previous click so back-to-back
        // category clicks chain correctly. The cancel handle is kept in a ref
        // (not returned as cleanup) so the normal re-render triggered by
        // setScrollingByClick(false) below doesn't kill the animation.
        if (scrollCancelRef.current) {
            scrollCancelRef.current()
        }

        const targetY = node.getBoundingClientRect().top + window.pageYOffset
        scrollCancelRef.current = smoothScrollTo(targetY, 500)
        setScrollingByClick(false)
    }, [selectedId, data, scrollingByClick])

    const handleApplyFilters = (panelValue) => {
        const { checkedFilterKey: nextFilterKeys, price } =
            toRestaurantFilterState(panelValue, {
                baseFilterKeys: restaurantFoodMockData,
                highestPrice,
            })
        setCheckedFilterKey(nextFilterKeys)
        setPriceAndRating((prev) => ({ ...prev, price }))
        scrollToCategoryBar()
    }

    const handleSearchResult = async (values) => {
        if (values === '') {
            setSearchKey('')
        } else {
            setSearchKey(values)
        }
    }

    const hasFoodResults = data.some((item) => !item?.isBogo)
    const hasBogoOnly = data.length > 0 && !hasFoodResults

    return (
        <CustomContainer
            sx={{
                mb: { xs: '7px', md: '0' },
                // Full-bleed mobile layout: the container drops its gutters
                // below md; sections that still need an inset (pro banner,
                // food content) carry their own horizontal padding.
                px: { xs: 0, md: 3 },
            }}
        >
            {/* Mobile-only compact header — the global navbar is hidden on
                this route (see MOBILE_PAGE_HEADER_ROUTES). Fixed and hidden
                until the hero's restaurant name scrolls out of view, then it
                slides down. */}
            <Box
                sx={{
                    display: { xs: 'block', md: 'none' },
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1200,
                    transform: heroNameInView
                        ? 'translateY(-110%)'
                        : 'translateY(0)',
                    transition: 'transform 250ms ease',
                    // MobilePageHeader styles itself as a sticky in-flow bar
                    // with bleed margins — neutralize those inside this
                    // fixed shell.
                    '& > div': { position: 'static', mx: 0, mb: 0 },
                }}
            >
                <MobilePageHeader title={restaurantData?.name} />
            </Box>
            {/* 6amMart store-details layout: main content + sticky cart
                sidebar in an 8.5 / 3.5 flex split with a 34px gutter. */}
            <Box
                sx={{
                    mt: { xs: 0, md: '45px' },
                    // Clear the fixed mobile bottom dock so it never covers
                    // the last section — taller while the happy-hour banner
                    // is stacked on the cart bar.
                    pb: isSmall
                        ? mobileHappyHour.show
                            ? '150px'
                            : '90px'
                        : '3rem',
                    display: 'flex',
                    gap: '34px',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'stretch',
                }}
            >
                <Box sx={{ flex: { xs: '1 1 auto', md: 8.5 }, minWidth: 0 }}>
                    {/* 10px rhythm between the page sections. Safe to use Stack
                spacing here: every direct child is a real layout box (the
                modals live outside this stack). */}
                    <CustomStackFullWidth spacing="16px">
                        {restaurantData && (
                            <TopBanner
                                details={restaurantData}
                                isHidden={isHidden}
                                removeStickyBanner={removeStickyBanner}
                                heroNameRef={heroNameRef}
                                showProOffer={
                                    showProBanner &&
                                    proStatus &&
                                    hasActiveOfferMessage
                                }
                                proOfferHeading={proOfferHeading}
                                proOfferMessage={activeOfferMessage}
                            />
                        )}
                        {showProBanner && !proStatus ? (
                            <Box>
                                <ProPlanTopBanner
                                    t={t}
                                    onSubscribe={handleSubscribeClick}
                                />
                            </Box>
                        ) : null}

                        <CustomStackFullWidth>
                            {!isFirstRender && (
                                <>
                                    {restaurantData?.id &&
                                    configData?.repeat_order_option &&
                                    token ? (
                                        <Box
                                            sx={{
                                                pt: 2,
                                                pb: 2,
                                                // LastOrderSection renders null when
                                                // there are no reorderable items —
                                                // collapse the padded wrapper too so
                                                // no empty strip is left behind.
                                                '&:empty': { display: 'none' },
                                            }}
                                        >
                                            <LastOrderSection
                                                restaurantId={restaurantData.id}
                                            />
                                        </Box>
                                    ) : null}

                                    {/* No inset wrapper here on purpose: the bar is
                                position:sticky and can only travel within its
                                parent, so a Box hugging it would kill the
                                stickiness. Its mobile inset lives in the
                                bar's own padding instead. */}
                                    <Box
                                        ref={categoryBarAnchorRef}
                                        sx={{ height: 0 }}
                                    />
                                    <RestaurantCategoryBar
                                        data={data}
                                        selectedId={selectedId}
                                        handleClick={handleClick}
                                        isSmall={isSmall}
                                        handleSearchResult={handleSearchResult}
                                        searchKey={searchKey}
                                        isHidden={isHidden}
                                        setRemoveStickyBanner={
                                            setRemoveStickyBanner
                                        }
                                        removeStickyBanner={removeStickyBanner}
                                        highestPrice={highestPrice}
                                        filterValue={filterPanelValue}
                                        onApplyFilters={handleApplyFilters}
                                        activeFilters={activeFilters}
                                    />

                                    {!isFoodsFetched && (
                                        <Box
                                            sx={{ px: { xs: 2, sm: 3, md: 0 } }}
                                        >
                                            <RestaurentDetailsShimmer
                                                showComponent
                                            />
                                        </Box>
                                    )}

                                    {isFoodsFetched &&
                                        isSearchingOrFiltering &&
                                        hasBogoOnly && (
                                            <Box
                                                sx={{
                                                    px: { xs: 2, sm: 3, md: 0 },
                                                    pt: '10px',
                                                }}
                                            >
                                                <CustomEmptyResult
                                                    label="No Food Found"
                                                    image={noFoodFoundImage}
                                                    height={80}
                                                    width={80}
                                                    labelFontSize="13px"
                                                />
                                            </Box>
                                        )}

                                    {isFoodsFetched &&
                                        data?.map((item, index) => {
                                            return (
                                                <Box
                                                    sx={{
                                                        position: 'relative',
                                                        mt: '10px',
                                                        pl: {
                                                            xs: 2,
                                                            sm: 3,
                                                            md: 0,
                                                        },
                                                        pr: item?.isBgColor
                                                            ? {
                                                                  xs: 0,
                                                                  sm: 0,
                                                                  md: 0,
                                                              }
                                                            : {
                                                                  xs: 2,
                                                                  sm: 3,
                                                                  md: 0,
                                                              },
                                                    }}
                                                    key={
                                                        item?.id ??
                                                        `cat-${index}`
                                                    }
                                                >
                                                    <Box
                                                        sx={{
                                                            position:
                                                                'absolute',
                                                            // Clears the fixed navbar +
                                                            // sticky category bar so a
                                                            // category click lands with
                                                            // the section heading right
                                                            // below the toolbar.
                                                            top: {
                                                                xs: '-185px',
                                                                md: '-140px',
                                                            },
                                                        }}
                                                        ref={(el) =>
                                                            (refs.current[
                                                                item?.id
                                                            ] = el)
                                                        }
                                                    />
                                                    <CategoriesWiseFood
                                                        data={item}
                                                        handleFocusedSection={
                                                            handleFocusedSection
                                                        }
                                                        indexNumber={index}
                                                        hasFreeDelivery={
                                                            restaurantData?.free_delivery
                                                        }
                                                        onBogoCardClick={
                                                            handleBogoCardClick
                                                        }
                                                        restaurantId={
                                                            restaurantId
                                                        }
                                                    />
                                                </Box>
                                            )
                                        })}

                                    {isFoodsFetched && data?.length === 0 && (
                                        <Box
                                            sx={{
                                                px: { xs: 2, sm: 3, md: 0 },
                                            }}
                                        >
                                            <RestaurentDetailsShimmer
                                                showComponent={showComponent}
                                            />
                                        </Box>
                                    )}
                                </>
                            )}
                        </CustomStackFullWidth>
                    </CustomStackFullWidth>
                </Box>
                {/* Mobile-only bottom dock: happy-hour banner + cart bar */}
                <RestaurantMobileBottomBar restaurantDetails={restaurantData} />
                {/* Mobile bottom cart drawer — same panel as the desktop
                sidebar, opened by the shared cartDrawerOpen flag (the
                floating side drawer is suppressed on this page for mobile). */}
                <Drawer
                    anchor="bottom"
                    open={Boolean(isSmall && cartDrawerOpen)}
                    onClose={() => dispatch(setCartDrawerOpen(false))}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        zIndex: 1300,
                    }}
                    PaperProps={{
                        sx: {
                            borderRadius: '16px 16px 0 0',
                            overflow: 'hidden',
                        },
                    }}
                >
                    <RestaurantCartSidebar
                        variant="drawer"
                        alsoBoughtProducts={recommendProducts?.products}
                        restaurantDetails={restaurantData}
                        showProBanner={Boolean(showProBanner)}
                        isProMember={proStatus}
                        proOfferMessage={activeOfferMessage}
                        onProSubscribe={() => {
                            dispatch(setCartDrawerOpen(false))
                            handleSubscribeClick()
                        }}
                    />
                </Drawer>
                {/* Desktop-only sticky cart sidebar */}
                <Box
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        flex: { md: 3.5 },
                        minWidth: 0,
                    }}
                >
                    <RestaurantCartSidebar
                        alsoBoughtProducts={recommendProducts?.products}
                        restaurantDetails={restaurantData}
                        showProBanner={Boolean(showProBanner)}
                        isProMember={proStatus}
                        proOfferMessage={activeOfferMessage}
                        onProSubscribe={handleSubscribeClick}
                    />
                </Box>
            </Box>
            <BogoItemDetailsModal
                isOpenModal={isBogoDetailsModalOpen}
                onCloseModal={handleCloseBogoDetailsModal}
                activeBogoItem={activeBogoItem}
                disableRestaurantRedirect
            />
            <ProPlanSubscriptionModal
                open={proPlanModalOpen}
                onClose={() => setProPlanModalOpen(false)}
                onSubscribe={(plan) => {
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
                    bgColor={theme.palette.customColor?.ten ?? '#FAFAFA'}
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
                            if (!proPlanSelected || !selected) {
                                toast.error(t('Select a payment method'))
                                return
                            }
                            const payment_platform = 'web'
                            let payment_type = 'digital_payment'
                            let payment_method = selected?.name
                            if (selected?.method === 'offline_payment') {
                                payment_type = 'offline_payment'
                                payment_method =
                                    selected?.method_name ?? selected?.name
                            } else if (selected?.name === 'wallet') {
                                payment_type = 'wallet'
                                payment_method = 'wallet'
                            } else if (selected?.name === 'cash_on_delivery') {
                                payment_type = 'cash_on_delivery'
                                payment_method = 'cash_on_delivery'
                            }
                            const callbackUrl =
                                typeof window !== 'undefined'
                                    ? window.location.href
                                    : ''
                            subscribeProPlan(
                                {
                                    plan_id: proPlanSelected.id,
                                    payment_type,
                                    payment_method,
                                    payment_platform,
                                    callback: callbackUrl,
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
                                        setProPlanPaymentOpen(false)
                                        setProPlanSelected(null)
                                        queryClient.invalidateQueries(
                                            'pro-customer-active-offer'
                                        )
                                        queryClient.invalidateQueries([
                                            'profile-info',
                                        ])
                                        refreshUserProfile()
                                        // Defer the success Dialog open so
                                        // AllPaymentMethod's close animation
                                        // starts cleanly first — otherwise
                                        // both modals animate in the same
                                        // React batch and the success Dialog
                                        // visibly flickers as the backdrops
                                        // resolve stacking order.
                                        setResultShown(true)
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
                                        setResultShown(true)
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
                            // Mirrors FloatingCart's Pro Plan flow: applying
                            // the wallet promotes it to the active payment
                            // method, flips switchToWallet so AllPaymentMethod
                            // renders the full-wallet UI, and stores a
                            // `{ name: 'wallet' }` selection so the submit
                            // branch below takes the wallet path.
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
        </CustomContainer>
    )
}

export default RestaurantDetails
