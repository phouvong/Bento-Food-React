import { baseUrl } from '@/api/MainApi'
import { GoogleApi } from '@/hooks/react-query/config/googleApi'
import { OrderApi } from '@/hooks/react-query/config/orderApi'
import { ProfileApi } from '@/hooks/react-query/config/profileApi'
import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import {
    formatPhoneNumber,
    formatSnakeCaseText,
    getAmount,
    getCouponDiscount,
    getDeliveryFees,
    getFinalTotalPrice,
    getProductDiscount,
    getStoredCheckoutContactInfo,
    getSubTotalPrice,
    getTaxableTotalPrice,
    getVariation,
    handleDistance,
    isFoodAvailableBySchedule,
    maxCodAmount,
} from '@/utils/customFunctions'
import {
    Box,
    Breadcrumbs,
    Checkbox,
    FormControlLabel,
    Grid,
    Link,
    Stack,
    Typography,
    alpha,
    Button,
} from '@mui/material'
import moment from 'moment'
import Router, { useRouter } from 'next/router'
import NextLink from 'next/link'
import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { onErrorResponse, onSingleErrorResponse } from '../ErrorResponse'
import { DeliveryTitle, OrderSummary } from './CheckOut.style'
import DeliveryDetails from './DeliveryDetails'
import DeliveryInstruction from './DeliveryInstruction'
import RestaurantScheduleTime from './RestaurantScheduleTime'
import { getDayNumber } from './const'
import OrderCalculation from './order-summary/OrderCalculation'
import useGetSurgePrice, {
    normalizeSurgePrice,
} from '@/hooks/react-query/orders/useGetSurgePrice'
import useGetCoverageList from '@/hooks/react-query/delivery-charge/useGetCoverageList'
import useGetCheckoutSummary from '@/hooks/react-query/order-place/useGetCheckoutSummary'
import OrderSummaryDetails from './order-summary/OrderSummaryDetails'
import PaymentOptions from './order-summary/PaymentOptions'

import useGetCashBackAmount from '@/hooks/react-query/cashback/useGetCashBackAmount'
import { useOfflinePayment } from '@/hooks/react-query/offline-payment/useOfflinePayment'
import { useGetOrderPlaceNotification } from '@/hooks/react-query/order-place/useGetOrderPlaceNotification'
import {
    setOfflineInfoStep,
    setOfflineWithPartials,
    setOrderDetailsModal,
} from '@/redux/slices/OfflinePayment'
import { cart, setCouponAmount, setWalletAmount } from '@/redux/slices/cart'
import { setUser } from '@/redux/slices/customer'
import { setCouponType, setZoneData } from '@/redux/slices/global'
import {
    CustomPaperBigCard,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import { useTheme } from '@emotion/react'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import useGetVehicleCharge from '../../hooks/react-query/config/useGetVehicleCharge'
import useGetOfflinePaymentOptions from '../../hooks/react-query/offline-payment/useGetOfflinePaymentOptions'
import CustomImageContainer from '../CustomImageContainer'
import CustomModal from '../custom-modal/CustomModal'
import DeliveryManTips from './DeliveryManTips'
import OfflinePaymentForm from './OfflinePaymentForm'
import PartialPayment from './PartialPayment'
import PartialPaymentModal from './PartialPaymentModal'
import wallet from './assets/walletpayment.png'
import { getGuestId, getToken } from './functions/getGuestUserId'
import { getSubscriptionOrderCount } from './functions/getSubscriptionOrderCount'
import { subscriptionReducer, subscriptionsInitialState } from './states'
import {
    additionalInformationInitialState,
    additionalInformationReducer,
} from './states/additionalInformationStates'
import useGetMostTrips from '@/hooks/react-query/useGetMostTrips'
import { setIsNeedLoad } from '@/redux/slices/utils'
import CustomNextImage from '@/components/CustomNextImage'
import { useGetTax } from '@/hooks/react-query/order-place/useGetTax'
import { CouponApi } from '@/hooks/react-query/config/couponApi'
import HaveCoupon from '@/components/checkout-page/HaveCoupon'
import money from '@/components/checkout-page/assets/fi_2704332.png'
import useGetProActiveOffer from '@/hooks/react-query/pro-plans/useGetProActiveOffer'
import useGetAllCartList, {
    mapRestaurantCartRows,
} from '@/hooks/react-query/add-cart/useGetAllCartList'
import useGetDiscountEligibility from '@/hooks/react-query/add-cart/useGetDiscountEligibility'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

let currentDate = moment().format('YYYY/MM/DD HH:mm')
let nextday = moment(currentDate).add(1, 'days').format('YYYY/MM/DD')

let today = moment(currentDate).format('dddd')
let tomorrow = moment(nextday).format('dddd')

var CurrentDatee = moment().format()

let todayTime = moment(CurrentDatee).format('HH:mm')

const isChosenDayWithinRange = (type, day, startMoment, endMoment) => {
    if (!startMoment.isValid() || !endMoment.isValid()) return false
    const cursor = startMoment.clone().startOf('day')
    const last = endMoment.clone().startOf('day')
    while (cursor.isSameOrBefore(last, 'day')) {
        if (type === 'weekly' && cursor.day() === day) return true
        if (type === 'monthly' && cursor.date() === day) return true
        cursor.add(1, 'day')
    }
    return false
}

export const handleValuesFromCartItems = (variationValues) => {
    let value = []
    if (variationValues?.length > 0) {
        variationValues?.forEach((item) => {
            if (item?.isSelected) {
                value.push(item?.label)
            }
        })
    } else {
        variationValues && value.push(variationValues[0]?.label)
    }
    return value
}
const CheckoutPage = ({ isDineIn }) => {
    const router = useRouter()
    const dispatch = useDispatch()
    const theme = useTheme()
    const offlineFormRef = useRef(null)
    const { t } = useTranslation()
    const { global, couponInfo, couponType } = useSelector(
        (state) => state.globalSettings
    )

    const {
        cartList,
        campFoodList,
        type,
        totalAmount,
        walletAmount,
        subscriptionSubTotal,
        couponAmount,
        orderPreferences,
    } = useSelector((state) => state.cart)

    const checkoutRestaurantId = cartList?.[0]?.restaurant_id
    useGetAllCartList(checkoutRestaurantId, {
        enabled:
            router.query.page !== 'campaign' && Boolean(checkoutRestaurantId),
        onSuccess: (res) => {
            if (!Array.isArray(res)) return
            dispatch(cart(mapRestaurantCartRows(res)))
        },
    })

    const hasBogoItem = useMemo(
        () => cartList?.some((item) => Boolean(item?.bogoDetails)),
        [cartList]
    )

    let currentLatLng = undefined
    const [address, setAddress] = useState(undefined)
    const [paymenMethod, setPaymenMethod] = useState('cash_on_delivery')
    const [numberOfDay, setDayNumber] = useState(getDayNumber(today))
    const [orderType, setOrderType] = useState('')
    const [couponDiscount, setCouponDiscount] = useState(null)
    const [scheduleAt, setScheduleAt] = useState('now')
    const [orderSuccess, setOrderSuccess] = useState(false)
    const [taxAmount, setTaxAmount] = useState(0)
    // Owned by the restaurant-page cart's preference rows (cart slice);
    // checkout no longer shows its own controls for these, it only relays
    // the values into the order payload.
    const cutlery = orderPreferences?.addCutlery ? 1 : 0
    const unavailable_item_note = orderPreferences?.unavailableNote ?? null
    const [delivery_instruction, setDelivery_instruction] = useState(null)
    const [total_order_amount, setTotalOrderAmount] = useState(0)
    const [orderId, setOrderId] = useState(null)
    const [usePartialPayment, setUsePartialPayment] = useState(false)
    const [switchToWallet, setSwitchToWallet] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [openPartialModel, setOpenPartialModel] = useState(false)
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
    const [deliveryTip, setDeliveryTip] = useState(0)
    const [selectedDeliveryOption, setSelectedDeliveryOption] = useState(null)
    const [selected, setSelected] = useState({})
    const [paymentMethodDetails, setPaymentMethodDetails] = useState({
        name: 'cash_on_delivery',
        image: money,
    })

    const [cashbackAmount, setCashbackAmount] = useState(null)
    const [extraPackagingCharge, setExtraPackagingCharge] = useState(0)
    const [changeAmount, setChangeAmount] = useState()
    const [couponCode, setCouponCode] = useState(null)
    const [open, setOpen] = useState(false)
    const [paymentPromptTick, setPaymentPromptTick] = useState(0)
    const { method } = router.query
    const { mutate: offlineMutate, isLoading: offlinePaymentLoading } =
        useOfflinePayment()
    const [offlineCheck, setOfflineCheck] = useState(false)
    const { offLineWithPartial, offlinePaymentInfo } = useSelector(
        (state) => state.offlinePayment
    )

    useEffect(() => {
        dispatch(setOfflineWithPartials(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const { data: tripsData } = useGetMostTrips()
    const {
        data: taxData,
        refetch: taxRefetch,
        mutate,
        isLoading: taxLoading,
    } = useGetTax()

    const { data, refetch: refetchNotification } =
        useGetOrderPlaceNotification(orderId)

    useEffect(() => {
        if (data) {
            dispatch(setIsNeedLoad(data?.reload_home))
        }
    }, [data])
    console.log({ selectedDeliveryOption })

    const { data: offlinePaymentOptions, refetch: OfflinePaymentRefetch } =
        useGetOfflinePaymentOptions({})

    useEffect(() => {
        // Debug selected delivery option changes during checkout.
        console.log('selectedDeliveryOption:', selectedDeliveryOption)
    }, [selectedDeliveryOption])

    useEffect(() => {
        OfflinePaymentRefetch()
    }, [])
    const { token } = useSelector((state) => state.userToken)
    const { guestUserInfo } = useSelector((state) => state.guestUserInfo)
    const [subscriptionStates, subscriptionDispatch] = useReducer(
        subscriptionReducer,
        subscriptionsInitialState
    )
    //additional information
    const [additionalInformationStates, additionalInformationDispatch] =
        useReducer(
            additionalInformationReducer,
            additionalInformationInitialState
        )

    const text1 = t('You can not Order more then')
    const text2 = t('on COD order')
    const { page, restaurant: restaurantSlug, restuId } = router.query
    const checkoutCartList = page === 'campaign' ? campFoodList : cartList
    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint

    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }
    currentLatLng = JSON.parse(window.localStorage.getItem('currentLatLng'))
    const { data: zoneData } = useQuery(
        ['zoneId', location],
        async () => GoogleApi.getZoneId(currentLatLng),
        {
            retry: 1,
        }
    )
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (zoneData) {
                dispatch(setZoneData(zoneData?.data?.zone_data))
                localStorage.setItem('zoneid', zoneData?.data?.zone_id)
            }
        }
    }, [zoneData])
    const restaurantDetailsId =
        page === 'campaign'
            ? campFoodList?.[0]?.restaurant_id
            : restuId || checkoutRestaurantId

    const { data: restaurantData } = useQuery(
        ['restaurant-details', restaurantDetailsId],
        () => RestaurantsApi.restaurantDetails(restaurantDetailsId),
        { enabled: Boolean(restaurantDetailsId), onError: onErrorResponse }
    )

    const {
        data: distanceData,
        refetch: refetchDistance,
        isLoading: distanceLoading,
    } = useQuery(
        ['get-distance', restaurantData?.data, address],
        () => GoogleApi.distanceApi(restaurantData?.data, address),
        {
            enabled: !!restaurantData?.data && !!address,
            onError: onErrorResponse,
        }
    )

    const tempDistance = distanceData?.data?.distanceMeters / 1000
    const { data: extraCharge, refetch: extraChargeRefetch } =
        useGetVehicleCharge({ tempDistance })
    useEffect(() => {
        extraChargeRefetch()
    }, [distanceData])
    // Area/zip based delivery charge — when the zone's rule is active
    // (delivery_charge_type non-null and coverage rows exist), the customer
    // must pick their area and its charge replaces the distance-based fee.
    const coverageRestaurantId =
        restaurantData?.data?.id ??
        checkoutCartList?.[0]?.restaurant_id ??
        restuId
    const { data: coverageData } = useGetCoverageList(
        orderType === 'delivery',
        coverageRestaurantId
    )
    const [selectedCoverageArea, setSelectedCoverageArea] = useState(null)
    const coverageAreas = coverageData?.data ?? []
    // Self-delivery restaurants deliver with their own fleet — the zone's
    // area/zip charge rule doesn't apply, so the field never shows and no
    // area id is priced or submitted.
    const isSelfDeliveryRestaurant =
        Number.parseInt(restaurantData?.data?.self_delivery_system) === 1
    const coverageRuleActive = Boolean(
        !isSelfDeliveryRestaurant &&
            coverageData?.delivery_charge_type &&
            coverageAreas.length > 0
    )
    const coverageDeliveryCharge =
        coverageRuleActive && selectedCoverageArea
            ? Number(selectedCoverageArea.delivery_charge) || 0
            : null

    const { data: discountEligibility } = useGetDiscountEligibility(
        page === 'campaign' ? undefined : restaurantData?.data?.id,
        getSubTotalPrice(checkoutCartList)
    )
    const eligibilityDiscountAmount = discountEligibility?.is_qualified
        ? Number(discountEligibility.discount_amount) || 0
        : 0
    const getEffectiveProductDiscount = (items, rData) =>
        eligibilityDiscountAmount > 0
            ? eligibilityDiscountAmount
            : getProductDiscount(items, rData)

    // Single source of truth for checkout-time charges: tax, delivery fee
    // (surge already folded in) and cashback. Every request input sits in
    // the query key, so changing the delivery address, the area/zip pick,
    // or the amount recalls the API; client-side math below stays only as
    // the fallback for backends without this endpoint.
    //
    // order_amount is the discounted items subtotal, NOT redux totalAmount:
    // totalAmount includes the delivery fee this API returns, so keying on
    // it loops (response → new total → new key → recall) and every fee/tip/
    // packaging tweak would refetch the summary for nothing.
    const summaryOrderAmount =
        (getSubTotalPrice(checkoutCartList) || 0) -
        (getEffectiveProductDiscount(checkoutCartList, restaurantData) || 0)
    const { data: checkoutSummary, isFetching: checkoutSummaryFetching } =
        useGetCheckoutSummary({
            restaurantId: restaurantData?.data?.id,
            orderAmount: Number(summaryOrderAmount) || 0,
            orderType,
            distanceKm:
                distanceData?.data?.distanceMeters != null
                    ? distanceData.data.distanceMeters / 1000
                    : null,
            latitude: address?.latitude ?? address?.lat ?? null,
            longitude: address?.longitude ?? address?.lng ?? null,
            coverageId: selectedCoverageArea?.id ?? null,
            coverageType: coverageData?.delivery_charge_type ?? null,
        })

    // Fee the delivery-type (express / slightly delay) section prices and
    // gates itself against. The summary fee is authoritative — with zone
    // free delivery it is 0 (or free_delivery_by is set), which hides the
    // section; the legacy client-side figure only backs up older backends.
    const summaryDeliveryForOptions =
        orderType === 'delivery' ? checkoutSummary?.delivery : null
    const deliveryFeeForOptions =
        summaryDeliveryForOptions != null
            ? summaryDeliveryForOptions?.free_delivery_by
                ? 0
                : Number(summaryDeliveryForOptions?.delivery_charge) || 0
            : getDeliveryFees(
                  restaurantData,
                  global,
                  checkoutCartList,
                  distanceData,
                  couponDiscount,
                  couponType,
                  orderType,
                  zoneData?.data?.zone_data,
                  restaurantData?.data,
                  address,
                  Number(extraCharge) || 0
              )
    const handleChange = (event) => {
        setDayNumber(event.target.value)
    }
    const { mutate: orderMutation, isLoading: orderLoading } = useMutation(
        'order-place',
        OrderApi.placeOrder
    )
    const userOnSuccessHandler = (res) => {
        dispatch(setUser(res?.data))
        dispatch(setWalletAmount(res?.data?.wallet_balance))
    }
    const { isLoading: customerLoading, data: customerData } = useQuery(
        ['profile-info'],
        ProfileApi.profileInfo,
        {
            enabled: Boolean(token) && Boolean(getToken()),
            onSuccess: userOnSuccessHandler,
            onError: onSingleErrorResponse,
        }
    )

    const storedContactInfo = getStoredCheckoutContactInfo(
        guestUserInfo,
        customerData
    )

    const proStatus = Number(customerData?.data?.pro_status) === 1
    const { data: proActiveOffer } = useGetProActiveOffer({
        enabled: proStatus,
    })
    console.log({ proActiveOffer })

    // Active-offer payload shape varies by benefit.type:
    //   - 'discount'     → { percentage, max_amount, min_order_amount }
    //   - 'delivery_fee' → { offer_type: 'full_free' | 'partial_free',
    //                        charge_discount_percentage, min_order_amount }
    //   - 'coupon'       → handled by the existing coupon flow elsewhere;
    //                      proSavedAmount stays 0 to avoid double-counting.
    const proCouponDiscount =
        couponDiscount && couponDiscount.coupon_type !== 'free_delivery'
            ? getCouponDiscount(
                  couponDiscount,
                  restaurantData,
                  checkoutCartList
              ) || 0
            : 0
    const proCartSubtotal = Math.max(
        0,
        (checkoutCartList?.reduce(
            (sum, item) => sum + (item?.totalPrice || 0),
            0
        ) || 0) - proCouponDiscount
    )
    const proBenefit = proActiveOffer?.benefit
    const proBenefitType = proBenefit?.type
    const proOfferType = proBenefit?.offer_type
    const proBenefitPercentage = Number(proBenefit?.percentage) || 0
    const proBenefitMaxAmount = Number(proBenefit?.max_amount) || 0
    const proChargeDiscountPct =
        Number(proBenefit?.charge_discount_percentage) || 0
    const proBenefitMinOrderAmount = Number(proBenefit?.min_order_amount) || 0
    const proOfferActive =
        proStatus &&
        proActiveOffer?.status === true &&
        proCartSubtotal >= proBenefitMinOrderAmount

    let proSavedAmount = 0
    let proSavedLabel = ''
    console.log({
        proBenefitMinOrderAmount,
        proCartSubtotal,
        cartList,
        campFoodList,
    })

    // When a free-delivery coupon is applied alongside a Pro "discount"
    // benefit, the Pro savings row would double up against the coupon's
    // free-delivery line — suppress the cart-discount calculation in that
    // edge case so we don't show the "Pro User Discount" row.
    const isFreeDeliveryCoupon = couponDiscount?.coupon_type === 'free_delivery'

    if (proOfferActive) {
        if (proBenefitType === 'discount' && !isFreeDeliveryCoupon) {
            const proRawDiscount =
                (proCartSubtotal * proBenefitPercentage) / 100
            proSavedAmount =
                proBenefitMaxAmount > 0
                    ? Math.min(proRawDiscount, proBenefitMaxAmount)
                    : proRawDiscount
            proSavedLabel = t('Pro User Discount')
        } else if (proBenefitType === 'delivery_fee') {
            // deliveryFeeForOptions is computed above (after getDeliveryFees),
            // so the numeric fee is available to multiply against here.
            const fee = Number(deliveryFeeForOptions) || 0
            if (proOfferType === 'full_free') {
                proSavedAmount = fee
                proSavedLabel = t('Free Delivery (Pro)')
            } else if (proOfferType === 'partial_free') {
                proSavedAmount = (fee * proChargeDiscountPct) / 100
                proSavedLabel = `${proChargeDiscountPct}% ${t(
                    'off Delivery (Pro)'
                )}`
            }
        }
    }
    // checkout-summary is the authority for Pro savings when it carries
    // them — the client-side math above stays only as the fallback for
    // backends without the field. The envelope isn't pinned yet, so both
    // `pro` / `pro_discount` spellings and the common amount keys are read.
    const summaryPro =
        checkoutSummary?.pro ?? checkoutSummary?.pro_discount ?? null
    // Live shape is { status, type, discount, delivery_savings, total_savings }.
    // `total_savings` leads because it is the whole benefit whatever the type;
    // `discount` is 0 on a delivery_fee benefit, so reading it first would
    // wrongly resolve to zero. The older speculative spellings stay last for
    // backends that still send them.
    const summaryProAmount = Number(
        summaryPro?.total_savings ??
            summaryPro?.delivery_savings ??
            summaryPro?.discount ??
            summaryPro?.amount ??
            summaryPro?.discount_amount ??
            summaryPro?.calculated_amount
    )
    const proFromSummary =
        summaryPro != null &&
        summaryPro?.status !== false &&
        Number.isFinite(summaryProAmount)
    if (proFromSummary) {
        proSavedAmount = summaryProAmount
        proSavedLabel =
            summaryPro?.label ??
            summaryPro?.title ??
            (proSavedLabel || t('Pro User Discount'))
    }
    // The API names this `type`; `benefit_type` is the older spelling.
    const effectiveProBenefitType = proFromSummary
        ? summaryPro?.benefit_type ?? summaryPro?.type ?? proBenefitType
        : proBenefitType
    const effectiveProOfferType = proFromSummary
        ? summaryPro?.offer_type ?? proOfferType
        : proOfferType

    useEffect(() => {
        orderId && refetchNotification()
    }, [orderId])

    useEffect(() => {
        currentLatLng = JSON.parse(localStorage.getItem('currentLatLng'))
        const location = localStorage.getItem('location')
        setAddress({
            ...currentLatLng,
            latitude: currentLatLng?.lat,
            longitude: currentLatLng?.lng,
            address: location,
            address_type: 'Selected Address',
        })
    }, [])

    useEffect(() => {
        restaurantData && address && refetchDistance()
    }, [restaurantData])
    useEffect(() => {
        if (
            isDineIn === 'dine_in' &&
            restaurantData?.data?.is_dine_in_active &&
            global?.dine_in_order_option
        ) {
            setOrderType('dine_in')
        } else if (
            restaurantData?.data?.delivery &&
            global?.home_delivery &&
            restaurantData?.data?.take_away &&
            global?.take_away
        ) {
            setOrderType('delivery')
        } else if (restaurantData?.data?.take_away && global?.take_away) {
            setOrderType('take_away')
        } else if (restaurantData?.data?.delivery && global?.home_delivery) {
            setOrderType('delivery')
        }
    }, [restaurantData, global])
    useEffect(() => {
        const taxAmount = getTaxableTotalPrice(
            cartList,
            couponDiscount,
            restaurantData
        )

        setTaxAmount(taxAmount)
    }, [cartList, couponDiscount, restaurantData])
    useEffect(() => {
        const total_order_amount = getFinalTotalPrice(
            cartList,
            couponDiscount,
            taxAmount,
            restaurantData
        )
        setTotalOrderAmount(total_order_amount)
    }, [cartList, couponDiscount, taxAmount])

    const handleOfflineOrder = () => {
        const offlinePaymentData = {
            ...offlinePaymentInfo,
            order_id: orderId,
        }
        dispatch(setOfflineInfoStep(3))
        dispatch(setOrderDetailsModal(true))
        offlineMutate(offlinePaymentData)
        // setOrderId(orderId)
    }

    useEffect(() => {
        if (offlineCheck) {
            handleOfflineOrder()
        }
    }, [orderId])

    const handleProductList = (productList, totalQty) => {
        return productList?.map((cart) => {
            if (cart?.bogoDetails) {
                return {
                    bogo_group_id: cart?.bogoGroupId,
                    quantity: cart?.quantity,
                }
            }
            return {
                add_on_ids: cart?.selectedAddons?.map((add) => {
                    return add.id
                }),
                add_on_qtys: cart?.selectedAddons?.map((add) => {
                    totalQty = add.quantity
                    return totalQty
                }),
                add_ons: cart?.selectedAddons?.map((add) => {
                    return {
                        id: add.id,
                        name: add.name,
                        price: add.price,
                    }
                }),
                item_type: cart?.available_date_starts
                    ? 'AppModelsItemCampaign'
                    : 'AppModelsItem',
                item_id: cart?.id,
                item_campaign_id: cart?.available_date_starts ? cart?.id : null,

                price: cart?.price,
                quantity: cart?.quantity,
                variant: getVariation(cart?.variation),
                //new variation form needs to added here
                variations: cart?.variations?.map((variation) => {
                    return {
                        name: variation.name,
                        values: {
                            label: handleValuesFromCartItems(variation.values),
                        },
                    }
                }),
            }
        })
    }

    const handleOrderMutationObject = (carts, productList) => {
        const subscriptionOrderCount = getSubscriptionOrderCount(
            restaurantData?.data?.schedules,
            subscriptionStates.type,
            subscriptionStates.startDate,
            subscriptionStates.endDate,
            subscriptionStates.days
        )
        const isDigital =
            paymenMethod !== 'cash_on_delivery' &&
            paymenMethod !== 'wallet' &&
            paymenMethod !== 'offline_payment' &&
            paymenMethod !== ''
                ? 'digital_payment'
                : paymenMethod

        return {
            cart: carts,
            ...address,
            schedule_at:
                scheduleAt === 'now'
                    ? null
                    : moment(scheduleAt)
                          .subtract(1, 'minutes')
                          .format('YYYY-MM-DD HH:mm'),
            //additional address
            address_type: !getToken()
                ? guestUserInfo?.address_type
                : additionalInformationStates?.addressType,
            road: !getToken()
                ? guestUserInfo?.road
                : additionalInformationStates?.streetNumber,
            house: !getToken()
                ? guestUserInfo?.house
                : additionalInformationStates?.houseNumber,
            floor: !getToken()
                ? guestUserInfo?.floor
                : additionalInformationStates?.floor,
            order_note: additionalInformationStates?.note,
            partial_payment: usePartialPayment,
            payment_method: isDigital,
            order_type: orderType,
            restaurant_id: restaurantData?.data?.id,
            coupon_code: couponDiscount?.code,
            coupon_discount_amount: couponDiscount?.discount,
            coupon_discount_title: couponDiscount?.title,
            discount_amount: getEffectiveProductDiscount(productList),
            distance: handleDistance(
                distanceData,
                restaurantData?.data,
                address
            ),
            // Route travel time from the distance API — arrives as "468s",
            // sent as plain seconds. Null when the route lookup had no
            // result (straight-line distance fallback path).
            duration: Number.parseInt(distanceData?.data?.duration) || null,
            order_amount: totalAmount,
            // Selected coverage row when the zone's area/zip delivery-charge
            // rule is active — same id the checkout-summary call prices the
            // delivery fee with. zip_code_wise rows go as zip_code_id,
            // area_wise rows as area_id.
            ...(orderType === 'delivery' &&
                selectedCoverageArea?.id != null && {
                    [coverageData?.delivery_charge_type === 'zip_code_wise'
                        ? 'zip_code_id'
                        : 'area_id']: selectedCoverageArea.id,
                }),
            dm_tips: deliveryTip,
            ...(couponDiscount?.coupon_type !== 'free_delivery' && {
                delivery_id: selectedDeliveryOption?.id,
                delivery_type: selectedDeliveryOption?.deliveryType,
            }),
            subscription_order: subscriptionStates.order,
            subscription_type: subscriptionStates.type,
            subscription_days: JSON.stringify(subscriptionStates.days),
            subscription_start_at: subscriptionStates.startDate,
            subscription_end_at: subscriptionStates.endDate,
            subscription_quantity: subscriptionOrderCount,
            cutlery: cutlery,
            guest_id: getGuestId(),
            contact_person_name:
                additionalInformationStates?.dine_in_contact?.name ||
                storedContactInfo?.contact_person_name ||
                customerData?.data?.f_name,
            contact_person_number: additionalInformationStates?.dine_in_contact
                ?.phone
                ? formatPhoneNumber(
                      additionalInformationStates?.dine_in_contact?.phone
                  )
                : formatPhoneNumber(
                      storedContactInfo?.contact_person_number ||
                          customerData?.data?.phone
                  ),
            is_guest: token ? 0 : 1,
            is_buy_now: page === 'campaign' ? 1 : 0,
            cart_id: page === 'campaign' ? cartList[0]?.cartItemId : null,
            unavailable_item_note,
            delivery_instruction,
            extra_packaging_amount: extraPackagingCharge,
            contact_person_email:
                additionalInformationStates?.dine_in_contact?.email ||
                storedContactInfo?.contact_person_email ||
                customerData?.data?.email,
            bring_change_amount: changeAmount,
        }
    }
    useEffect(() => {
        if (restaurantData?.data?.id) {
            let productList = page === 'campaign' ? campFoodList : cartList
            let totalQty = 0
            let carts = handleProductList(productList, totalQty)
            let order = handleOrderMutationObject(carts, productList)
            mutate(order, {
                onError: onErrorResponse,
            })
        }
    }, [
        restaurantData?.data?.id,
        couponDiscount?.discount,
        cartList,
        extraPackagingCharge,
        selectedDeliveryOption?.id,
        selectedCoverageArea?.id,
    ])
    const orderPlaceMutation = (
        carts,
        handleSuccess,
        orderMutation,
        productList
    ) => {
        let order = handleOrderMutationObject(carts, productList)
        orderMutation(order, {
            onSuccess: handleSuccess,
            onError: (error) => {
                error?.response?.data?.errors?.forEach((item) => {
                    // Only bogo-related error codes get the "Code: message"
                    // prefix — every other error (area_id, stock, etc.) just
                    // shows its plain message, same as before this was added.
                    const isBogoCode = item?.code
                        ?.toString()
                        .toLowerCase()
                        .includes('bogo')
                    toast.error(
                        isBogoCode
                            ? `${formatSnakeCaseText(item.code)}: ${
                                  item.message
                              }`
                            : item.message,
                        {
                            position: 'bottom-right',
                        }
                    )
                })
            },
        })
    }

    const handlePlaceOrder = () => {
        if (!paymenMethod) {
            toast.error(t('Please select a payment method'), {
                position: 'bottom-right',
                id: 'payment_method',
            })
            setPaymentPromptTick((prev) => prev + 1)
            return
        }
        let productList = page === 'campaign' ? campFoodList : cartList
        if (!restaurantData?.data?.active)
            return toast.error(t('Restaurant is currently closed'))
        let isAvailable =
            page === 'campaign'
                ? true
                : isFoodAvailableBySchedule(cartList, scheduleAt)
        if (isAvailable) {
            //const walletBalance = localStorage.getItem('wallet_amount')
            if (paymenMethod === 'wallet') {
                if (Number(walletAmount) < Number(totalAmount)) {
                    toast.error(t('Wallet balance is below total amount.'), {
                        id: 'wallet',
                        position: 'bottom-right',
                    })
                } else {
                    let totalQty = 0
                    let carts = handleProductList(productList, totalQty)
                    const handleSuccessSecond = (response) => {
                        setOrderId(response?.data?.order_id)
                        if (response?.data) {
                            if (paymenMethod === 'digital_payment') {
                                toast.success(response?.data?.message)
                                const newBaseUrl = baseUrl.substring(0, 31)
                                const callBackUrl = `${window.location.origin}/order`
                                const url = `${
                                    window.location.origin
                                }/payment-mobile?order_id=${
                                    response?.data?.order_id
                                }&customer_id=${
                                    customerData?.data?.id
                                        ? customerData?.data?.id
                                        : getGuestId()
                                }&callback=${callBackUrl}`
                            } else if (paymenMethod === 'wallet') {
                                toast.success(response?.data?.message)
                                setOrderSuccess(true)
                            } else {
                                if (response.status === 203) {
                                    toast.error(response.data.errors[0].message)
                                }
                            }
                        }
                    }
                    if (carts?.length > 0) {
                        orderPlaceMutation(
                            carts,
                            handleSuccessSecond,
                            orderMutation,
                            productList
                        )
                    }
                }
            } else if (paymenMethod === 'cash_on_delivery') {
                const totalMaxCodAmount = maxCodAmount(
                    restaurantData,
                    global,
                    zoneData
                )

                const totalAmountOrSubTotalAmount =
                    subscriptionStates?.order === '1'
                        ? subscriptionSubTotal
                        : totalAmount

                if (
                    totalMaxCodAmount !== 0 &&
                    Number.parseInt(totalAmountOrSubTotalAmount) >
                        Number.parseInt(totalMaxCodAmount)
                ) {
                    toast.error(
                        `${text1} ${getAmount(
                            totalMaxCodAmount,
                            currencySymbolDirection,
                            currencySymbol,
                            digitAfterDecimalPoint
                        )}  ${text2}`
                    )
                } else {
                    const handleSuccessCod = (response) => {
                        setOrderId(response?.data?.order_id)
                        toast.success(response?.data?.message)
                        setOrderSuccess(true)
                    }
                    let totalQty = 0
                    let carts = handleProductList(productList, totalQty)
                    if (carts?.length > 0) {
                        orderPlaceMutation(
                            carts,
                            handleSuccessCod,
                            orderMutation,
                            productList
                        )
                    }
                }
            } else if (paymenMethod === 'offline_payment') {
                let totalQty = 0
                let carts = handleProductList(productList, totalQty)
                const handleSuccessOffline = (response) => {
                    if (response?.data) {
                        toast.success(response?.data?.message)
                        setOfflineCheck(true)
                        setOrderId(response?.data?.order_id)
                        setOrderSuccess(true)
                    }
                }
                if (carts?.length > 0) {
                    orderPlaceMutation(
                        carts,
                        handleSuccessOffline,
                        orderMutation,
                        productList
                    )
                }
            } else {
                let totalQty = 0
                let carts = handleProductList(productList, totalQty)
                const handleSuccess = (response) => {
                    const payment_platform = 'web'
                    setOrderId(response?.data?.order_id)
                    if (response?.data) {
                        if (paymenMethod !== 'cash_on_delivery') {
                            const callBackUrl = token
                                ? `${window.location.origin}/info`
                                : `${window.location.origin}/order`
                            const url = `${baseUrl}/payment-mobile?order_id=${
                                response?.data?.order_id
                            }&customer_id=${
                                customerData?.data?.id
                                    ? customerData?.data?.id
                                    : getGuestId()
                            }&payment_platform=${payment_platform}&callback=${callBackUrl}&payment_method=${paymenMethod}`
                            Router.push(url)
                        } else {
                            toast.success(response?.data?.message)
                            setOrderSuccess(true)
                        }
                    }
                }
                if (carts?.length > 0) {
                    orderPlaceMutation(
                        carts,
                        handleSuccess,
                        orderMutation,
                        productList
                    )
                }
            }
        } else {
            toast.error(
                t(
                    'One or more item is not available for the chosen preferable schedule time.'
                )
            )
        }
    }
    const placeOrder = () => {
        const hasContactName =
            additionalInformationStates?.dine_in_contact?.name ||
            storedContactInfo?.contact_person_name ||
            customerData?.data?.f_name
        const hasContactPhone =
            additionalInformationStates?.dine_in_contact?.phone ||
            storedContactInfo?.contact_person_number ||
            customerData?.data?.phone
        if (orderType !== 'dine_in' && (!hasContactName || !hasContactPhone)) {
            toast.error(t('Please add your contact information to continue'), {
                id: 'contact_info_required',
                position: 'bottom-right',
            })
            return
        }
        localStorage.setItem('access', totalAmount)
        if (page !== 'campaign') {
            if (subscriptionStates.order === '1') {
                if (subscriptionStates.type === '') {
                    toast(t('You must choose a subscription type'), {
                        id: 'subscription-type-required',
                        duration: 4000,
                        icon: '⚠️',
                        style: {
                            textTransform: 'none',
                        },
                    })
                    return
                }
                // Missing dates make the schedule count below meaningless —
                // catch them first so the user gets pointed at "Select Date
                // & Time" instead of the unrelated "restaurant not
                // available" message. One combined toast (not a separate
                // one per missing field) names the section to fix, and a
                // fixed id stops repeat clicks from stacking duplicates.
                if (
                    subscriptionStates.startDate === '' ||
                    subscriptionStates.endDate === ''
                ) {
                    toast(
                        t('Please select a date & time for your repeat order'),
                        {
                            id: 'subscription-date-time-required',
                            duration: 4000,
                            icon: '⚠️',
                            style: {
                                textTransform: 'none',
                            },
                        }
                    )
                    return
                }

                const subscriptionOrderCount = getSubscriptionOrderCount(
                    restaurantData?.data?.schedules,
                    subscriptionStates.type,
                    subscriptionStates.startDate,
                    subscriptionStates.endDate,
                    subscriptionStates.days
                )

                if (
                    subscriptionStates.type === 'weekly' ||
                    subscriptionStates.type === 'monthly'
                ) {
                    const dateStart = moment(
                        subscriptionStates.startDate,
                        'yyyy/MM/DD HH:mm'
                    )
                    const dateEnd = moment(
                        subscriptionStates.endDate,
                        'yyyy/MM/DD HH:mm'
                    )

                    if (subscriptionStates.days.length > 0) {
                        const isInsideChoseDate = subscriptionStates.days.every(
                            (item) =>
                                isChosenDayWithinRange(
                                    subscriptionStates.type,
                                    Number(item.day),
                                    dateStart,
                                    dateEnd
                                )
                        )
                        if (isInsideChoseDate) {
                            if (subscriptionOrderCount > 0) {
                                handlePlaceOrder()
                            } else {
                                toast(
                                    t(
                                        'Restaurant is not available at the selected date(s)/time(s). Please choose a different date or time.'
                                    ),
                                    {
                                        id: 'subscription-restaurant-unavailable',
                                        duration: 5000,
                                        icon: '⚠️',
                                        style: {
                                            textTransform: 'none',
                                        },
                                    }
                                )
                            }
                        } else {
                            toast(
                                t(
                                    `Your chosen delivery ${
                                        subscriptionStates?.days?.length > 1
                                            ? 'days'
                                            : 'day'
                                    } and ${
                                        subscriptionStates?.days?.length > 1
                                            ? 'times'
                                            : 'time'
                                    } must be in between start date and end date`
                                ),
                                {
                                    id: 'subscription-days-out-of-range',
                                    duration: 5000,
                                    icon: '⚠️',
                                    style: {
                                        textTransform: 'none',
                                    },
                                }
                            )
                        }
                    } else {
                        toast(t('You must choose delivery days and times'), {
                            id: 'subscription-days-required',
                            duration: 5000,
                            icon: '⚠️',
                            style: {
                                textTransform: 'none',
                            },
                        })
                    }
                } else if (subscriptionStates.type === 'daily') {
                    if (subscriptionOrderCount > 0) {
                        handlePlaceOrder()
                    } else {
                        toast(
                            t(
                                'Restaurant is not available at the selected date(s)/time(s). Please choose a different date or time.'
                            ),
                            {
                                id: 'subscription-restaurant-unavailable',
                                duration: 5000,
                                icon: '⚠️',
                                style: {
                                    textTransform: 'none',
                                },
                            }
                        )
                    }
                }
            } else {
                handlePlaceOrder()
            }
        } else {
            handlePlaceOrder()
        }
    }
    const counponRemove = () => {}
    if (orderSuccess) {
        if (getToken()) {
            router.push(
                {
                    pathname: '/info',
                    query: { page: 'order', orderId: orderId },
                },
                undefined,
                { shallow: true }
            )
        } else {
            router.push(
                {
                    pathname: '/order',
                    query: {
                        orderId: orderId,
                        ...(storedContactInfo?.contact_person_number && {
                            phone: storedContactInfo.contact_person_number,
                        }),
                    },
                },
                undefined,
                { shallow: true }
            )
        }
    }

    const handleDeliveryInstructionNote = (value) => {
        setDelivery_instruction(value)
    }
    const handlePartialPayment = () => {
        if (totalAmount > walletAmount) {
            setUsePartialPayment(true)
            dispatch(setOfflineWithPartials(true))
            setSelected({ name: '', image: null })
        } else {
            setSelected({ name: 'wallet', image: wallet })
            setPaymentMethodDetails({ name: 'wallet', image: wallet })
            setPaymenMethod('wallet')
            setSwitchToWallet(true)
        }
    }

    const removePartialPayment = () => {
        if (totalAmount > walletAmount) {
            setUsePartialPayment(false)
            dispatch(setOfflineWithPartials(false))
            setPaymentMethodDetails(null)
            setSwitchToWallet(false)
        } else {
            setPaymentMethodDetails(null)
            setSwitchToWallet(false)
        }
    }
    const handlePartialPaymentCheck = () => {
        if (subscriptionStates?.order !== '1') {
            if (global?.partial_payment_status === 1) {
                if (couponDiscount && usePartialPayment && offLineWithPartial) {
                    if (
                        totalAmount > walletAmount &&
                        !usePartialPayment &&
                        !offLineWithPartial
                    ) {
                        setOpenPartialModel(true)
                    } else {
                        if (
                            usePartialPayment &&
                            walletAmount > totalAmount &&
                            offLineWithPartial
                        ) {
                            setOpenModal(true)
                        }
                    }
                } else if (
                    (deliveryTip > 0 &&
                        usePartialPayment &&
                        offLineWithPartial) ||
                    switchToWallet
                ) {
                    if (totalAmount > walletAmount && !usePartialPayment) {
                        setOpenPartialModel(true)
                    } else {
                        if (
                            offLineWithPartial &&
                            usePartialPayment &&
                            walletAmount > totalAmount
                        ) {
                            setOpenModal(true)
                        }
                    }
                } else if (
                    orderType &&
                    usePartialPayment &&
                    offLineWithPartial
                ) {
                    if (
                        totalAmount > walletAmount &&
                        !usePartialPayment &&
                        !offLineWithPartial
                    ) {
                        setOpenPartialModel(true)
                    } else {
                        if (
                            offLineWithPartial &&
                            usePartialPayment &&
                            walletAmount > totalAmount
                        ) {
                            setOpenModal(true)
                        }
                    }
                }
            }
        }
    }
    useEffect(() => {
        handlePartialPaymentCheck()
    }, [totalAmount])

    const agreeToPartial = () => {
        setPaymentMethodDetails(null)
        setSelected({ name: '', image: '' })
        setUsePartialPayment(true)
        dispatch(setOfflineWithPartials(true))
        setOpenPartialModel(false)
        setSwitchToWallet(false)
    }
    const notAgreeToPartial = () => {
        setUsePartialPayment(false)
        dispatch(setOfflineWithPartials(false))
        setOpenPartialModel(false)
        setSwitchToWallet(false)
    }
    const agreeToWallet = () => {
        setSelected({ name: 'wallet', image: wallet })
        setPaymentMethodDetails({ name: 'wallet', image: wallet })
        setPaymenMethod('wallet')
        setSwitchToWallet(true)
        setUsePartialPayment(false)
        dispatch(setOfflineWithPartials(false))
        setOpenModal(false)
    }
    const notAgreeToWallet = () => {
        setPaymentMethodDetails(null)
        setSwitchToWallet(false)
        setUsePartialPayment(false)
        dispatch(setOfflineWithPartials(false))
        setOpenModal(false)
    }

    const handleCashbackAmount = (data) => {
        setCashbackAmount(data)
    }
    const { refetch: refetchCashbackAmount, isFetching: cashbackFetching } =
        useGetCashBackAmount({
            amount: totalAmount,
            handleSuccess: handleCashbackAmount,
        })
    useEffect(() => {
        refetchCashbackAmount()
    }, [totalAmount])

    const checkoutApisFetching =
        taxLoading || checkoutSummaryFetching || cashbackFetching

    useEffect(() => {
        if (
            global?.extra_packaging_charge &&
            restaurantData?.data?.extra_packaging_status
        ) {
            setExtraPackagingCharge(
                restaurantData?.data?.extra_packaging_amount
            )
        }
    }, [restaurantData, global])

    // Seed the optional extra-packaging choice made on the restaurant
    // page's cart once the restaurant amount is available.
    useEffect(() => {
        if (
            orderPreferences?.extraPackaging &&
            restaurantData?.data?.extra_packaging_amount
        ) {
            setExtraPackagingCharge(
                restaurantData?.data?.extra_packaging_amount
            )
        }
    }, [restaurantData, orderPreferences])

    // Surge charge for the (scheduled) delivery time — added on top of the
    // delivery fee inside OrderCalculation. Only meaningful for deliveries.
    const { data: surgeData } = useGetSurgePrice(
        scheduleAt,
        orderType === 'delivery'
    )
    const surgePrice = normalizeSurgePrice(surgeData)

    const handleExtraPackaging = (e) => {
        setExtraPackagingCharge(e.target.checked)
        if (e.target.checked) {
            setExtraPackagingCharge(
                restaurantData?.data?.extra_packaging_amount
            )
        } else {
            setExtraPackagingCharge(0)
        }
    }

    const hasOnlyPaymentMethod = () => {
        if (
            !global?.cash_on_delivery &&
            global?.customer_wallet_status !== 1 &&
            global?.offline_payment_status !== 1 &&
            global?.digital_payment &&
            global?.active_payment_method_list?.length === 1
        ) {
            setPaymenMethod('digital_payment')
            setSelected({
                name: global?.active_payment_method_list[0]?.gateway,
            })
            setPaymentMethodDetails({
                name: global?.active_payment_method_list[0]?.gateway,
                image: global?.active_payment_method_list[0]
                    ?.gateway_image_full_url,
            })
        } else {
            if (global?.cash_on_delivery) {
                setSelected({
                    name: 'cash_on_delivery',
                    image: money,
                })
            }
        }
    }

    useEffect(() => {
        hasOnlyPaymentMethod()
    }, [global])

    const totalAmountForRefer = couponDiscount
        ? getSubTotalPrice(cartList) -
          getEffectiveProductDiscount(cartList, restaurantData) -
          getCouponDiscount(couponDiscount, restaurantData, cartList)
        : getSubTotalPrice(cartList) -
          getEffectiveProductDiscount(cartList, restaurantData)

    useEffect(() => {
        dispatch(setCouponAmount(totalAmountForRefer))
    }, [totalAmountForRefer])

    const handleCouponDiscount = () => {
        let couponDiscountValue = getCouponDiscount(
            couponDiscount,
            restaurantData,
            cartList
        )
        if (couponDiscount && couponDiscount.coupon_type === 'free_delivery') {
            setFreeDelivery('true')
            return 0
        } else {
            let discount = getAmount(
                couponDiscountValue,
                currencySymbolDirection,
                currencySymbol,
                digitAfterDecimalPoint
            )
            return discount
        }
    }
    useEffect(() => {
        dispatch(setCouponType(''))
    }, [])
    const handleClose = () => {
        setOpen(false)
    }
    const { isLoading, data: couponData } = useQuery(
        ['coupon-list'],
        () =>
            CouponApi.couponList(totalAmountForRefer, restaurantData?.data?.id),
        {
            enabled:
                !!getToken() &&
                !!restaurantData?.data?.id &&
                !!totalAmountForRefer,
            retry: 1,
            onError: onSingleErrorResponse,
        }
    )
    console.log({ selectedDeliveryOption })

    const restaurantBreadcrumbSlug =
        restaurantData?.data?.slug || restaurantSlug
    const restaurantBreadcrumbName =
        restaurantData?.data?.name || restaurantSlug || ''

    return (
        <>
            <Breadcrumbs
                separator={
                    <NavigateNextIcon sx={{ fontSize: { xs: 12, md: 14 } }} />
                }
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    width: 'fit-content',
                    mt: { xs: '16px', md: '24px' },
                    mb: '16px',
                    fontSize: { xs: '12px', md: '14px' },
                    color: (theme) => theme.palette.text.secondary,
                    '& .MuiBreadcrumbs-separator': {
                        mx: { xs: '4px', md: '8px' },
                    },
                }}
            >
                <Link
                    component={NextLink}
                    href="/home"
                    underline="hover"
                    color="text.secondary"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: 'inherit',
                    }}
                >
                    <HomeOutlinedIcon sx={{ fontSize: { xs: 12, md: 14 } }} />
                    {t('Home')}
                </Link>
                {restaurantBreadcrumbName && (
                    <Link
                        component={NextLink}
                        href={`/restaurants/${
                            restaurantBreadcrumbSlug || restuId
                        }`}
                        underline="hover"
                        color="text.secondary"
                        sx={{
                            fontSize: 'inherit',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {restaurantBreadcrumbName}
                    </Link>
                )}
                <Typography color="text.secondary" fontSize="inherit">
                    {t('Checkout')}
                </Typography>
            </Breadcrumbs>
            <Grid
                container
                spacing={{ xs: 3, md: 4 }}
                mb="2rem"
                sx={{ minHeight: '50vh' }}
            >
                <Grid
                    item
                    xs={12}
                    sx={{
                        flexBasis: { xs: '100%', md: '71.4%' },
                        maxWidth: { xs: '100%', md: '71.4%' },
                    }}
                >
                    {method !== 'offline' ? (
                        <Stack spacing={3}>
                            <DeliveryDetails
                                token={token}
                                global={global}
                                hasBogoItem={hasBogoItem}
                                coverageAreas={coverageAreas}
                                coverageRuleActive={coverageRuleActive}
                                selectedCoverageArea={selectedCoverageArea}
                                setSelectedCoverageArea={
                                    setSelectedCoverageArea
                                }
                                coverageType={
                                    coverageData?.delivery_charge_type ?? null
                                }
                                restaurantData={restaurantData}
                                deliveryFee={deliveryFeeForOptions}
                                freeDeliveryCouponApplied={
                                    couponDiscount?.coupon_type ===
                                    'free_delivery'
                                }
                                setOrderType={setOrderType}
                                orderType={orderType}
                                setAddress={setAddress}
                                address={address}
                                subscriptionStates={subscriptionStates}
                                subscriptionDispatch={subscriptionDispatch}
                                page={page}
                                setPaymenMethod={setPaymenMethod}
                                additionalInformationStates={
                                    additionalInformationStates
                                }
                                additionalInformationDispatch={
                                    additionalInformationDispatch
                                }
                                setDeliveryTip={setDeliveryTip}
                                setPaymentMethodDetails={
                                    setPaymentMethodDetails
                                }
                                setUsePartialPayment={setUsePartialPayment}
                                setSwitchToWallet={setSwitchToWallet}
                                zoneData={zoneData?.data?.zone_data}
                                setSelectedDeliveryOption={
                                    setSelectedDeliveryOption
                                }
                                couponDiscount={couponDiscount}
                                isProFullFreeDelivery={
                                    proBenefitType === 'delivery_fee' &&
                                    proOfferType === 'full_free' &&
                                    proSavedAmount > 0
                                }
                                showScheduleIcon={
                                    page !== 'campaign' &&
                                    subscriptionStates.order === '0' &&
                                    token &&
                                    Boolean(
                                        restaurantData?.data?.schedule_order
                                    )
                                }
                                onOpenSchedule={() =>
                                    setScheduleModalOpen(true)
                                }
                                scheduleAt={scheduleAt}
                                customerData={customerData}
                            />
                            {orderType === 'delivery' && (
                                <DeliveryInstruction
                                    selected={delivery_instruction}
                                    onSelect={handleDeliveryInstructionNote}
                                />
                            )}
                            {page !== 'campaign' &&
                                subscriptionStates.order === '0' &&
                                token && (
                                    <RestaurantScheduleTime
                                        restaurantData={restaurantData}
                                        handleChange={handleChange}
                                        today={today}
                                        tomorrow={tomorrow}
                                        numberOfDay={numberOfDay}
                                        global={global}
                                        scheduleAt={scheduleAt}
                                        setScheduleAt={setScheduleAt}
                                        orderType={orderType}
                                        open={scheduleModalOpen}
                                        onClose={() =>
                                            setScheduleModalOpen(false)
                                        }
                                    />
                                )}

                            {orderType !== 'dine_in' &&
                                orderType !== 'take_away' &&
                                Number.parseInt(global?.dm_tips_status) ===
                                    1 && (
                                    <DeliveryManTips
                                        deliveryTip={deliveryTip}
                                        setDeliveryTip={setDeliveryTip}
                                        tripsData={tripsData}
                                        global={global}
                                        customerData={customerData}
                                    />
                                )}

                            <PaymentOptions
                                global={global}
                                paymenMethod={paymenMethod}
                                setPaymenMethod={setPaymenMethod}
                                openPaymentPrompt={paymentPromptTick}
                                subscriptionStates={subscriptionStates}
                                usePartialPayment={usePartialPayment}
                                setSelected={setSelected}
                                selected={selected}
                                paymentMethodDetails={paymentMethodDetails}
                                setPaymentMethodDetails={
                                    setPaymentMethodDetails
                                }
                                setSwitchToWallet={setSwitchToWallet}
                                offlinePaymentOptions={offlinePaymentOptions}
                                walletAmount={walletAmount}
                                totalAmount={totalAmount}
                                switchToWallet={switchToWallet}
                                handlePartialPayment={handlePartialPayment}
                                removePartialPayment={removePartialPayment}
                                setChangeAmount={setChangeAmount}
                                changeAmount={changeAmount}
                                orderType={orderType}
                            />
                            {restaurantData?.data && token && (
                                <HaveCoupon
                                    restaurant_id={restaurantData?.data?.id}
                                    setCouponDiscount={setCouponDiscount}
                                    couponDiscount={couponDiscount}
                                    cartList={cartList}
                                    setCouponCode={setCouponCode}
                                    couponCode={couponCode}
                                    data={couponData}
                                    handleClose={handleClose}
                                    totalAmountForRefer={totalAmountForRefer}
                                    open={open}
                                    setOpen={setOpen}
                                />
                            )}
                        </Stack>
                    ) : (
                        <OfflinePaymentForm
                            key={method}
                            offlinePaymentOptions={offlinePaymentOptions}
                            paymenMethod={paymenMethod}
                            setPaymenMethod={setPaymenMethod}
                            // handleSubmitOfflineForm={handleSubmitOfflineForm}
                            totalAmount={totalAmount}
                            currencySymbolDirection={currencySymbolDirection}
                            currencySymbol={currencySymbol}
                            digitAfterDecimalPoint={digitAfterDecimalPoint}
                            walletBalance={walletAmount}
                            usePartialPayment={usePartialPayment}
                            offlineFormRef={offlineFormRef}
                            placeOrder={placeOrder}
                        />
                    )}
                </Grid>

                <Grid
                    item
                    xs={12}
                    height="auto"
                    sx={{
                        flexBasis: { xs: '100%', md: '28.6%' },
                        maxWidth: { xs: '100%', md: '28.6%' },
                    }}
                >
                    <CustomPaperBigCard height="auto" nopadding="true">
                        <Stack
                            spacing={2}
                            justifyContent="space-between"
                            sx={{ p: { xs: '16px', sm: '20px' } }}
                        >
                            <OrderSummary variant="h4">
                                {t('Billing')}
                            </OrderSummary>
                            <Box
                                sx={{
                                    mr: { xs: '-16px', sm: '-20px' },
                                    '& .simplebar-track.simplebar-vertical': {
                                        width: '8px',
                                    },
                                    '& .simplebar-scrollbar:before': {
                                        left: '2px',
                                        right: '2px',
                                        backgroundColor: (theme) =>
                                            theme.palette.neutral[400],
                                    },
                                }}
                            >
                                <SimpleBar
                                    style={{
                                        maxHeight: '500px',
                                        width: '100%',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            pr: { xs: '16px', sm: '20px' },
                                        }}
                                    >
                                        <OrderSummaryDetails
                                            type={type}
                                            page={page}
                                            global={global}
                                            orderType={orderType}
                                        />
                                    </Box>
                                </SimpleBar>
                            </Box>
                            <Stack>
                                {/* Cutlery and unavailable-item preferences
                                    are collected in the restaurant page's
                                    cart (RestaurantCartSidebar) and arrive
                                    here via the cart slice's
                                    orderPreferences — the checkout no longer
                                    repeats those controls, but their values
                                    still flow into the order payload. */}
                                {restaurantData?.data
                                    ?.is_extra_packaging_active &&
                                global?.extra_packaging_charge
                                    ? !restaurantData?.data
                                          ?.extra_packaging_status &&
                                      restaurantData?.data
                                          ?.extra_packaging_amount != null &&
                                      restaurantData?.data
                                          ?.extra_packaging_amount > 0 &&
                                      orderType !== 'take_away' &&
                                      orderType !== 'dine_in' && (
                                          <Stack
                                              direction="row"
                                              justifyContent="space-between"
                                              alignItems="center"
                                              boxShadow={theme.shadows2[0]}
                                              borderRadius="8px"
                                              minHeight="50px"
                                              py={0.5}
                                              px={2}
                                          >
                                              <FormControlLabel
                                                  onChange={(e) =>
                                                      handleExtraPackaging(e)
                                                  }
                                                  control={
                                                      <Checkbox
                                                          checked={Boolean(
                                                              extraPackagingCharge
                                                          )}
                                                      />
                                                  }
                                                  label={
                                                      <Typography
                                                          fontWeight="700"
                                                          fontSize="14px"
                                                          color={
                                                              theme.palette
                                                                  .primary.main
                                                          }
                                                      >
                                                          {t(
                                                              'Need Extra Packaging'
                                                          )}
                                                      </Typography>
                                                  }
                                              />
                                              <Typography
                                                  component="span"
                                                  m="0"
                                                  fontWeight="700"
                                                  fontSize="14px"
                                                  mt="6px"
                                              >
                                                  {getAmount(
                                                      restaurantData.data
                                                          .extra_packaging_amount,
                                                      currencySymbolDirection,
                                                      currencySymbol,
                                                      digitAfterDecimalPoint
                                                  )}
                                              </Typography>
                                          </Stack>
                                      )
                                    : null}
                            </Stack>

                            <OrderCalculation
                                subscriptionStates={subscriptionStates}
                                cartList={
                                    page === 'campaign'
                                        ? campFoodList
                                        : cartList
                                }
                                restaurantData={restaurantData}
                                discountEligibility={discountEligibility}
                                couponDiscount={couponDiscount}
                                taxAmount={taxAmount}
                                distanceData={distanceData}
                                total_order_amount={total_order_amount}
                                global={global}
                                couponInfo={couponInfo}
                                orderType={orderType}
                                deliveryTip={deliveryTip}
                                origin={restaurantData?.data}
                                destination={address}
                                extraCharge={extraCharge}
                                additionalCharge={global?.additional_charge}
                                totalAmount={totalAmount}
                                walletBalance={walletAmount}
                                usePartialPayment={usePartialPayment}
                                placeOrder={placeOrder}
                                orderLoading={orderLoading}
                                offlinePaymentLoading={offlinePaymentLoading}
                                checkoutApisFetching={checkoutApisFetching}
                                setCouponDiscount={setCouponDiscount}
                                counponRemove={counponRemove}
                                offlineFormRef={offlineFormRef}
                                setOfflineCheck={setOfflineCheck}
                                page={page}
                                paymentMethodDetails={paymentMethodDetails}
                                cashbackAmount={
                                    checkoutSummary?.cashback ?? cashbackAmount
                                }
                                extraPackagingCharge={extraPackagingCharge}
                                surgePrice={surgePrice}
                                coverageDeliveryCharge={coverageDeliveryCharge}
                                checkoutSummaryDelivery={
                                    checkoutSummary?.delivery ?? null
                                }
                                checkoutSummarySurge={
                                    checkoutSummary?.surge ?? null
                                }
                                distanceLoading={distanceLoading}
                                taxData={checkoutSummary?.tax ?? taxData}
                                handleCouponDiscount={handleCouponDiscount}
                                selectedDeliveryOption={selectedDeliveryOption}
                                proSavedAmount={proSavedAmount}
                                proSavedLabel={proSavedLabel}
                                proBenefitType={effectiveProBenefitType}
                                proOfferType={effectiveProOfferType}
                            />
                        </Stack>
                    </CustomPaperBigCard>
                </Grid>

                {openModal && (
                    <CustomModal
                        openModal={openModal}
                        bgColor={theme.palette.customColor.ten}
                        //handleClose={() => setOpenModal(false)}
                    >
                        <PartialPaymentModal
                            global={global}
                            payableAmount={totalAmount}
                            agree={agreeToWallet}
                            reject={notAgreeToWallet}
                            colorTitle=" Want to pay via your wallet ? "
                            title="You can pay the full amount with your wallet."
                            remainingBalance={walletAmount - totalAmount}
                        />
                    </CustomModal>
                )}
                {openPartialModel && (
                    <CustomModal
                        openModal={openPartialModel}
                        bgColor={theme.palette.customColor.ten}
                    >
                        <PartialPaymentModal
                            global={global}
                            payableAmount={totalAmount}
                            agree={agreeToPartial}
                            reject={notAgreeToPartial}
                            colorTitle=" Want to pay partially with wallet ? "
                            title="You do not have sufficient balance to pay full amount via wallet."
                        />
                    </CustomModal>
                )}
            </Grid>
        </>
    )
}

export default CheckoutPage
