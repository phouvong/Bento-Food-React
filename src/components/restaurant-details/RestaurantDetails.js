import React, { useEffect, useRef, useState } from 'react'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
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
import { getAmount, restaurantDiscountTag } from '@/utils/customFunctions'
import { smoothScrollTo } from '@/utils/smoothScrollTo'
import RestaurentDetailsShimmer from './RestaurantShimmer/RestaurentDetailsShimmer'
import { useGetRecommendProducts } from '@/hooks/react-query/config/useGetRecommendProduct'
import { useRestaurantCategoriesFoods } from '@/hooks/react-query/restaurants/useRestaurantCategoriesFoods'
import { debounce } from 'lodash'
import { t } from 'i18next'
import { useInView } from 'react-intersection-observer'
import FloatingDiscountTag from '@/components/restaurant-details/FloatingDiscountTag'
import useHideOnScroll from '@/hooks/custom-hooks/useHideOnScroll'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { setUser } from '@/redux/slices/customer'
import { setWalletAmount } from '@/redux/slices/cart'
import ProPlanTopBanner from './ProPlanTopBanner'
import useGetProActiveOffer from '@/hooks/react-query/pro-plans/useGetProActiveOffer'
import LastOrderSection from '@/components/home/last-order/LastOrderSection'
import ProPlanSubscriptionModal from '@/components/floating-cart/restaurant-cart/ProPlanSubscriptionModal'
import CustomModal from '@/components/custom-modal/CustomModal'
import AllPaymentMethod from '@/components/checkout-page/AllPaymentMethod'
import useSubscribeProPlan from '@/hooks/react-query/pro-plans/useSubscribeProPlan'
import { ProfileApi } from '@/hooks/react-query/config/profileApi'
import { onSingleErrorResponse } from '@/components/ErrorResponse'
import { getToken } from '@/components/checkout-page/functions/getGuestUserId'

const restaurantFoodMockData = [
    { id: 0, name: 'Veg', value: 'veg', isActive: false },
    { id: 1, name: 'Non Veg', value: 'nonVeg', isActive: false },
    { id: 2, name: 'Default', value: 'default', isActive: false },
    { id: 3, name: 'Fast Delivery', value: 'fast_delivery', isActive: false },
    { id: 4, name: 'A to Z', value: 'a_to_z', isActive: false },
    { id: 5, name: 'Z to A', value: 'z_to_a', isActive: false },
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
]

const RestaurantDetails = ({ restaurantData, configData }) => {
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
    const restaurantId = restaurantData?.id
    const activeFilters = checkedFilterKey?.filter((item) => item?.isActive)

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

    const { data: categoriesFoodsData } = useRestaurantCategoriesFoods({
        restaurantId,
        searchKey,
        filterByData,
        price: priceAndRating?.price,
    })

    const highestPrice = 8000
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))

    // Pro Plan subscription flow (mirrors FloatingCart). Banner is shown to
    // non-Pro users only; clicking Subscribe opens the plan modal, then
    // AllPaymentMethod handles the payment step.
    const { global } = useSelector((state) => state.globalSettings)
    const { token } = useSelector((state) => state.userToken)
    const { walletAmount: walletAmountRaw } = useSelector((state) => state.cart)
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

    const { data: proActiveOffer } = useGetProActiveOffer({
        
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
                activeOfferMessage = `${t('Free delivery as a Pro member')}${minOrderSuffix}`
            } else if (offerType === 'partial_free' && chargeDiscountPct > 0) {
                activeOfferMessage = `${chargeDiscountPct}% ${t(
                    'off delivery as a Pro member'
                )}${minOrderSuffix}`
            }
        } else if (benefitType === 'coupon') {
            activeOfferMessage = `${t('Pro coupon benefit unlocked')}${minOrderSuffix}`
        }
    }
    const hasActiveOfferMessage = Boolean(activeOfferMessage)
    const showProBanner =
        global?.pro_member_status === 1 

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
                    url.pathname +
                        (url.search ? url.search : '') +
                        url.hash
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
    const scrollCancelRef = useRef(null)
    const [scrollingByClick, setScrollingByClick] = useState(false)
    const { ref, inView } = useInView()
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

        const recommend = {
            id: 1233,
            name: t('Recommend Products'),
            products: recommendProducts?.products,
            isBgColor: true,
        }

        // Backend already groups foods per category in `category_wise_foods`,
        // so we just attach the matching array to each category entry.
        const grouped = categories
            .map((cat) => ({
                ...cat,
                products: categoryWiseFoods?.[cat?.id] || [],
            }))
            .filter((cat) => cat?.products?.length > 0)

        const final =
            recommendProducts?.products?.length > 0
                ? [recommend, ...grouped]
                : grouped

        setData(final)
        setIsFirstRender(false)
    }, [categoriesFoodsData, recommendProducts])

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

    const handlePrice = (value) => {
        setPriceAndRating((prev) => ({ ...prev, price: value }))
    }

    const handleChangeRatings = (value) => {
        setPriceAndRating((prev) => ({ ...prev, rating: value }))
    }

    const handleReset = () => {
        setCheckedFilterKey(
            restaurantFoodMockData.map((item) => ({ ...item, isActive: false }))
        )
        setPriceAndRating({ price: [], rating: 0 })
    }

    const handleFilterBy = () => {}
    const handleSearchResult = async (values) => {
        if (values === '') {
            setSearchKey('')
        } else {
            setSearchKey(values)
        }
    }
    const restaurantDiscount = restaurantDiscountTag(
        restaurantData?.discount,
        restaurantData?.free_delivery
    )


    return (
        <CustomContainer sx={{ mb: { xs: '7px', md: '0' } }}>
            <CustomStackFullWidth
                pb={isSmall ? '1rem' : '3rem'}
                paddingTop={{ xs: '10px', md: '70px' }}
            >
                {restaurantData && (
                    <TopBanner
                        details={restaurantData}
                        isHidden={isHidden}
                        removeStickyBanner={removeStickyBanner}
                    />
                )}
                {showProBanner ? (
                    <Box sx={{ mt: 1.5 }}>
                        {proStatus ? (
                            <ProPlanTopBanner
                                t={t}
                                messageKey="Order now to enjoy exclusive offer with your"
                                message={activeOfferMessage}
                            />
                        ) : (
                            <ProPlanTopBanner
                                t={t}
                                onSubscribe={handleSubscribeClick}
                            />
                        )}
                    </Box>
                ) : null}

                <CustomStackFullWidth>
                    {!isFirstRender && (
                        <>
                            {restaurantData?.id &&
                            configData?.repeat_order_option &&
                            token ? (
                                <Box sx={{ mt: { xs: '1rem', sm: '1.5rem' } }}>
                                    <LastOrderSection
                                        restaurantId={restaurantData.id}
                                        isStoreDetails
                                    />
                                </Box>
                            ) : null}

                            <RestaurantCategoryBar
                                data={data}
                                selectedId={selectedId}
                                handleClick={handleClick}
                                isSmall={isSmall}
                                handleSearchResult={handleSearchResult}
                                searchKey={searchKey}
                                isHidden={isHidden}
                                setRemoveStickyBanner={setRemoveStickyBanner}
                                removeStickyBanner={removeStickyBanner}
                                highestPrice={highestPrice}
                                handlePrice={handlePrice}
                                handleChangeRatings={handleChangeRatings}
                                handleReset={handleReset}
                                handleFilterBy={handleFilterBy}
                                checkedFilterKey={checkedFilterKey}
                                setCheckedFilterKey={setCheckedFilterKey}
                                priceAndRating={priceAndRating}
                                activeFilters={activeFilters}
                            />

                            {data?.map((item, index) => {
                                return (
                                    <Box
                                        sx={{ position: 'relative' }}
                                        key={item?.id ?? `cat-${index}`}
                                    >
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: '-340px',
                                            }}
                                            ref={(el) =>
                                                (refs.current[item?.id] = el)
                                            }
                                        />
                                        <CategoriesWiseFood
                                            disRef={ref}
                                            data={item}
                                            handleFocusedSection={
                                                handleFocusedSection
                                            }
                                            indexNumber={index}
                                            restaurantDiscount={
                                                restaurantDiscount
                                            }
                                            hasFreeDelivery={
                                                restaurantData?.free_delivery
                                            }
                                        />
                                    </Box>
                                )
                            })}
                            {data?.length === 0 && (
                                <RestaurentDetailsShimmer
                                    showComponent={showComponent}
                                />
                            )}
                        </>
                    )}
                    {!inView && restaurantDiscount && (
                        <FloatingDiscountTag
                            resDiscount={restaurantData?.discount}
                            freeDelivery={restaurantData?.free_delivery}
                            restaurantDiscount={restaurantDiscount}
                        />
                    )}
                </CustomStackFullWidth>
            </CustomStackFullWidth>
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
                <DialogActions
                    sx={{ px: 3, pb: 2, justifyContent: 'center' }}
                >
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
