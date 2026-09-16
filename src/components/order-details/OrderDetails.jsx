import { OrderApi } from '@/hooks/react-query/config/orderApi'
import { useGetRefundReasons } from '@/hooks/react-query/refund-request/useGetRefundReasons'
import { useStoreRefundRequest } from '@/hooks/react-query/refund-request/useStoreRefundRequest'
import {
    clearOfflinePaymentInfo,
    setOrderDetailsModal,
} from '@/redux/slices/OfflinePayment'
import {
    CustomColouredTypography,
    CustomPaperBigCard,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import { CustomButtonPrimary } from '@/styled-components/CustomButtons.style'
import { getAmount } from '@/utils/customFunctions'
import CancelIcon from '@mui/icons-material/Cancel'
import ChatIcon from '@mui/icons-material/Chat'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import StarIcon from '@mui/icons-material/Star'
import {
    alpha,
    Box,
    Button,
    Grid,
    IconButton,
    NoSsr,
    Stack,
    styled,
    Typography,
    useMediaQuery,
} from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import jwt from 'base-64'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import 'simplebar-react/dist/simplebar.min.css'
import CustomDivider from '../CustomDivider'
import CustomImageContainer from '../CustomImageContainer'
import { onErrorResponse, onSingleErrorResponse } from '../ErrorResponse'
import Meta from '../Meta'
import { getGuestId, getToken } from '../checkout-page/functions/getGuestUserId'
import CustomModal from '../custom-modal/CustomModal'
import CustomFormatedDateTime from '../date/CustomFormatedDateTime'
import ProBadge from '@/components/pro-badge/ProBadge'
import RefundModal from '../order-history/RefundModal'
import DeliveryInfoCard from './DeliveryInfoCard'
import DeliveryTimeInfoVisibility from './DeliveryTimeInfoVisibility'
import GifShimmer from './GifShimmer'
import {
    AmountTypography,
    CustomOrderStatus,
    IformationGrid,
    InfoTypography,
    InstructionWrapper,
    OrderSummaryGrid,
    ProductDetailsWrapper,
    RefundButton,
    StatusPill,
    TitleTypography,
    TotalGrid,
} from './OrderDetail.style'
import OrderDetailsBottom from './OrderDetailsBottom'
import OrderDetailsShimmer from './OrderDetailsShimmer'
import OrderItemRow from './OrderItemRow'
import PaymentUpdate from './PaymentUpdate'
import PaymentMethodCard from './PaymentMethodCard'
import PayDigitallyModal from './PayDigitallyModal'
import { normalizeOrderEta } from './orderEta'
import Refund from './Refund'
import Reorder from './Reorder'
import OfflineDetailsModal from './offline-payment/OfflineDetailsModal'
import OfflineOrderDetails from './offline-payment/OfflineOrderDetails'
import SubscriptionDetails from './subscription-details'
import BottomActions from './subscription-details/BottomActions'

import ReviewSideDrawer from '@/components/order-details/ReviewSideDrawer'
import { setDeliveryManInfoByDispatch } from '@/redux/slices/searchFilter'
import InfoIcon from '@mui/icons-material/Info'
import startReview from '../../../public/static/star-review.png'
import TrackingPage from '../order-tracking/TrackingPage'
import ProSavingsBanner from '@/components/floating-cart/restaurant-cart/ProSavingsBanner'

import Tooltip, { tooltipClasses } from '@mui/material/Tooltip'
import ContactAddressMap from '@/components/help-page/ContactAddressMap'
import DIneInOrderTimeInfo from '@/components/order-details/DIneInOrderTimeInfo'
import CustomNextImage from '@/components/CustomNextImage'

const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
        color: alpha(theme.palette.neutral[1000], 0.8),
    },
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: theme.palette.neutral[1000],
        color: theme.palette.neutral[100],
    },
}))
const getItemsPrice = (items) => {
    return items?.reduce(
        (total, product) => product?.price * product?.quantity + total,
        0
    )
}
const getAddOnsPrice = (items) => {
    return items?.reduce(
        (total, product) =>
            (product?.add_ons?.length > 0
                ? product?.add_ons?.reduce(
                      (cTotal, cProduct) =>
                          cProduct.price * cProduct.quantity + cTotal,
                      0
                  )
                : 0) + total,
        0
    )
}
const OrderDetails = ({ OrderIdDigital }) => {
    const theme = useTheme()
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const router = useRouter()
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const { orderId, phone, isTrackOrder, token } = router.query
    const { global } = useSelector((state) => state.globalSettings)
    const { userData } = useSelector((state) => state.user)
    const { orderDetailsModal } = useSelector((state) => state.offlinePayment)
    const [openOfflineModal, setOpenOfflineModal] = useState(orderDetailsModal)
    const [openModal, setOpenModal] = useState(false)
    const [openReviewModal, setOpenReviewModal] = useState(false)
    const [openPayDigitallyModal, setOpenPayDigitallyModal] = useState(false)
    const [openRes, setOpenRes] = useState(false)
    const [paymentResultFlag, setPaymentResultFlag] = useState(null)

    useEffect(() => {
        if (!router.isReady) return
        const match = router.asPath.match(/[?&]flag=(success|fail)\b/)
        if (match) setPaymentResultFlag(match[1])
    }, [router.isReady])

    const guestId = getGuestId()
    const userPhone = phone && jwt.decode(phone)
    const tempOrderId = orderId ? orderId : OrderIdDigital
    let languageDirection = undefined
    const tip_text = t('order delivered out of')
    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }

    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint

    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }
    const { data: reasonsData } = useGetRefundReasons()

    const { mutate, isLoading: refundIsLoading } = useStoreRefundRequest()
    const formSubmitHandler = (values) => {
        const tempValue = { ...values, orderId: tempOrderId }
        const onSuccessHandler = async (resData) => {
            if (resData) {
                await refetchTrackData()
                toast.success(resData.message)
                setOpenModal(false)
            }
        }
        mutate(tempValue, {
            onSuccess: onSuccessHandler,
            onError: onErrorResponse,
        })
    }

    const {
        isLoading,
        data,
        refetch: refetchOrderDetails,
    } = useQuery(
        ['order-details', tempOrderId],
        () => OrderApi.orderDetails(tempOrderId, userPhone, guestId),
        {
            onError: onSingleErrorResponse,
        }
    )

    const {
        data: trackData,
        refetch: refetchTrackData,
        isLoading: trackOrderLoading,
    } = useQuery([`category-tracking`, tempOrderId], () =>
        OrderApi.orderTracking(tempOrderId, userPhone, guestId)
    )

    const hasBogoItem = Boolean(
        data?.data?.details?.some((item) => item?.bogo_details) ||
            trackData?.data?.is_bogo
    )
    const isCampaignOrder = Boolean(trackData?.data?.is_item_campaign)

    // COD → digital switch via /order/pay-digitally: the backend builds the
    // gateway URL and re-checks eligibility when it is opened, and a failed
    // or abandoned payment leaves the order a live cash order.
    const { mutate: payDigitallyMutation, isLoading: payDigitallyLoading } =
        useMutation('order-pay-digitally', OrderApi.payDigitally)
    const handleProceedDigitalPayment = (gateway) => {
        const callbackUrl = new URL(window.location.href)
        callbackUrl.searchParams.delete('flag')
        callbackUrl.searchParams.delete('token')
        callbackUrl.searchParams.set('_gw', '1')
        const formData = {
            order_id: tempOrderId,
            payment_method: gateway?.gateway,
            callback: callbackUrl.toString(),
        }
        if (!getToken()) formData.guest_id = getGuestId()
        payDigitallyMutation(formData, {
            onSuccess: (res) => {
                const paymentUrl = res?.data?.payment_url
                if (paymentUrl) window.location.href = paymentUrl
            },
            onError: onErrorResponse,
        })
    }

    const proBenefitType = trackData?.data?.benefit_type
    const proDeliveryOfferType = trackData?.data?.delivery_offer_type
    const proDeliveryReductionAmount =
        Number(trackData?.data?.delivery_fee_reduction_amount) || 0
    const proCouponDiscount =
        Number(trackData?.data?.coupon_discount_amount) || 0
    const proDiscountAmount = Number(trackData?.data?.pro_discount) || 0
    const isFullFreeProDelivery =
        proBenefitType === 'delivery_fee' &&
        proDeliveryOfferType === 'full_free'
    const isProDeliveryDiscount =
        proBenefitType === 'delivery_fee' &&
        !isFullFreeProDelivery &&
        proDeliveryReductionAmount > 0
    const hasProBenefit =
        Boolean(proBenefitType) &&
        (proDiscountAmount > 0 ||
            proDeliveryReductionAmount > 0 ||
            isFullFreeProDelivery ||
            (proBenefitType === 'coupon' && proCouponDiscount > 0))
    // Same source labels as checkout's OrderCalculation discount tooltip.
    const discountSourceText =
        trackData?.data?.restaurant_discount_type === 'happy_hour'
            ? t('Happy Hour discount')
            : trackData?.data?.restaurant_discount_type ===
              'restaurant_discount'
            ? t('Restaurant discount')
            : ''

    let proSavingsMessage = ''
    if (proBenefitType === 'delivery_fee') {
        // Keyed on the reduction amount rather than `delivery_offer_type`
        // alone: a missing or unrecognised offer type must not claim free
        // delivery when the order plainly paid part of the fee.
        proSavingsMessage =
            !isFullFreeProDelivery && proDeliveryReductionAmount > 0
                ? `${t('You saved')} ${getAmount(
                      proDeliveryReductionAmount,
                      currencySymbolDirection,
                      currencySymbol,
                      digitAfterDecimalPoint
                  )} ${t('on delivery as a Pro member')}`
                : t('Free delivery as a Pro member')
    } else if (proBenefitType === 'coupon') {
        proSavingsMessage =
            proCouponDiscount > 0
                ? `${t('You saved')} ${getAmount(
                      proCouponDiscount,
                      currencySymbolDirection,
                      currencySymbol,
                      digitAfterDecimalPoint
                  )} ${t('with your Pro coupon')}`
                : t('Pro coupon benefit unlocked')
    }

    if (isLoading) {
        return <OrderDetailsShimmer />
    }
    const refetchAll = async () => {
        await refetchOrderDetails()
        await refetchTrackData()
    }
    // Refetch trackData every 5 seconds

    const handleTotalAmount = () => {
        if (trackData?.data?.subscription) {
            if (trackData?.data?.subscription?.quantity > 0) {
                return (
                    trackData?.data?.order_amount *
                    trackData?.data?.subscription?.quantity
                )
            } else {
                return trackData?.data?.order_amount
            }
        } else {
            return trackData?.data?.order_amount
        }
    }

    const paymentStatusInfo = (() => {
        if (trackData?.data?.subscription) return null
        const paymentStatus = trackData?.data?.payment_status
        if (!paymentStatus) return null
        if (paymentStatus === 'paid') {
            return { label: t('Paid'), color: theme.palette.success.main }
        }
        const partiallyPaidAmount =
            Number(trackData?.data?.partially_paid_amount) || 0
        if (partiallyPaidAmount > 0) {
            return {
                label: t('Partially Paid'),
                color: theme.palette.warning.main,
            }
        }
        return { label: t('Unpaid'), color: theme.palette.error.pureRed }
    })()

    const handleOfflineClose = () => {
        dispatch(clearOfflinePaymentInfo())
        dispatch(setOrderDetailsModal(false))
        setOpenOfflineModal(false)
    }
    const backgroundColorOrderStatus = () => {
        if (trackData?.data?.order_status === 'delivered') {
            return theme.palette.success.main
        } else if (trackData?.data?.order_status === 'canceled') {
            return theme.palette.error.main
        } else {
            return theme.palette.info.dark
        }
    }
    const getCommonValue = (data, key) => {
        return data?.data?.details[0]?.[key]
    }
    const deliveryTypeLabels = {
        standard: t('Standard Delivery'),
        express: t('Express Delivery'),
        slightly_delay: t('Slightly Delay Delivery'),
    }
    const deliveryType = trackData?.data?.delivery_type
    const deliveryTypeCharge =
        Number(trackData?.data?.delivery_type_charge) || 0
    const baseDeliveryCharge = Number(trackData?.data?.delivery_charge) || 0
    const normalizedDeliveryType = deliveryType
        ?.toString()
        ?.trim()
        ?.toLowerCase()
        ?.replace(/\s+/g, '_')

    let deliveryFeeWithTypeCharge = baseDeliveryCharge

    // if (normalizedDeliveryType === 'express') {
    //     deliveryFeeWithTypeCharge = baseDeliveryCharge + deliveryTypeCharge
    // } else if (normalizedDeliveryType === 'slightly_delay') {
    //     deliveryFeeWithTypeCharge = baseDeliveryCharge - deliveryTypeCharge
    // }

    // label
    const deliveryTypeLabel =
        deliveryTypeCharge > 0 &&
        normalizedDeliveryType &&
        deliveryTypeLabels[normalizedDeliveryType]
            ? deliveryTypeLabels[normalizedDeliveryType]
            : ''
    const handleSideDrawer = () => {
        dispatch(setDeliveryManInfoByDispatch(trackData?.data?.delivery_man))
        setOpenReviewModal(true)
    }

    //

    const getReviewButton = (trackData) => {
        if (
            !trackData?.data?.is_reviewed &&
            !trackData?.data?.is_dm_reviewed &&
            trackData?.data?.subscription === null
        ) {
            return (
                <Button
                    onClick={handleSideDrawer}
                    variant="outlined"
                    sx={{
                        p: {
                            xs: '5px',
                            sm: '5px',
                            md: '2px 10px',
                        },
                    }}
                >
                    <Stack
                        alignItems="center"
                        justifyContent="space-between"
                        direction="row"
                        gap={{ xs: '5px', sm: '6px', md: '10px' }}
                        flexWrap="wrap"
                    >
                        <CustomNextImage
                            src={startReview}
                            width={isXSmall ? '15' : '20'}
                            height={isXSmall ? '15' : '20'}
                        />
                        <CustomColouredTypography
                            color="primary"
                            fontWeight={600}
                            fontSize="14px"
                            smallFont="12px"
                        >
                            {t('Give Review')}
                        </CustomColouredTypography>
                    </Stack>
                </Button>
            )
        } else if (!trackData?.data?.is_reviewed) {
            return (
                <Button
                    onClick={handleSideDrawer}
                    variant="outlined"
                    sx={{
                        p: {
                            xs: '5px',
                            sm: '5px',
                            md: '2px 10px',
                        },
                    }}
                >
                    <Stack
                        alignItems="center"
                        justifyContent="space-between"
                        direction="row"
                        gap={{ xs: '5px', sm: '6px', md: '10px' }}
                        flexWrap="wrap"
                    >
                        <CustomNextImage
                            src={startReview.src}
                            width={isXSmall ? '15' : '20'}
                            height={isXSmall ? '15' : '20'}
                        />
                        <CustomColouredTypography
                            color="primary"
                            fontWeight={600}
                            fontSize="14px"
                            smallFont="12px"
                        >
                            {t('Give Review')}
                        </CustomColouredTypography>
                    </Stack>
                </Button>
            )
        } else if (!trackData?.data?.is_dm_reviewed) {
            return (
                <Button
                    onClick={handleSideDrawer}
                    variant="outlined"
                    sx={{
                        p: {
                            xs: '5px',
                            sm: '5px',
                            md: '2px 10px',
                        },
                    }}
                >
                    <Stack
                        alignItems="center"
                        justifyContent="space-between"
                        direction="row"
                        gap={{ xs: '5px', sm: '6px', md: '10px' }}
                        flexWrap="wrap"
                    >
                        <CustomNextImage
                            src={startReview}
                            width={isXSmall ? '15' : '20'}
                            height={isXSmall ? '15' : '20'}
                        />
                        <CustomColouredTypography
                            color="primary"
                            fontWeight={600}
                            fontSize="14px"
                            smallFont="12px"
                        >
                            {t('Give Review')}
                        </CustomColouredTypography>
                    </Stack>
                </Button>
            )
        } else {
            return null
        }
    }
    console.log({ orderDetailsModal })

    return (
        <NoSsr>
            <Meta title={`Order details - ${global?.business_name}`} />
            <CustomPaperBigCard
                padding={isXSmall ? '0' : '0px'}
                border={false}
                nopadding={isXSmall && 'true'}
                sx={{
                    minHeight: !isXSmall && '558px',
                    boxShadow: isXSmall && 'unset',
                    marginBottom: '1rem',
                }}
            >
                <Grid container>
                    <Grid
                        item
                        xs={12}
                        md={7}
                        padding={{ xs: '10px', sm: '20px', md: '20px' }}
                    >
                        <Stack
                            direction="row"
                            flexWrap="wrap"
                            alignItems="center"
                            sx={{
                                rowGap: { xs: '6px', md: '10px' },
                                columnGap: { xs: '12px', md: '16px' },
                                justifyContent: {
                                    xs: 'center',
                                    md: 'flex-start',
                                },
                            }}
                        >
                            <Typography
                                sx={{
                                    color: theme.palette.text.primary,
                                    fontSize: {
                                        xs: '15px',
                                        sm: '16px',
                                        md: '18px',
                                    },
                                    fontWeight: 700,
                                    letterSpacing: '-0.54px',
                                    width: { xs: '100%', sm: 'auto' },
                                    textAlign: { xs: 'center', sm: 'inherit' },
                                }}
                            >
                                {trackData?.data?.subscription !== null
                                    ? t('Subscription')
                                    : t('Order')}{' '}
                                #{getCommonValue(data, 'order_id')}
                            </Typography>
                            <Stack
                                direction="row"
                                alignItems="center"
                                sx={{ columnGap: '8px', rowGap: '6px' }}
                                flexWrap="wrap"
                            >
                                {trackData && (
                                    <StatusPill
                                        color={backgroundColorOrderStatus()}
                                    >
                                        <Typography
                                            component="span"
                                            textTransform="capitalize"
                                            color={backgroundColorOrderStatus()}
                                            align="center"
                                            sx={{
                                                fontSize: '12px',
                                                fontWeight: 400,
                                                lineHeight: 1.2,
                                                letterSpacing: '-0.36px',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            <>
                                                {trackData?.data?.order_type ===
                                                    'dine_in' &&
                                                trackData?.data
                                                    ?.order_status ===
                                                    'delivered'
                                                    ? t('Served')
                                                    : trackData?.data
                                                          ?.order_type ===
                                                          'dine_in' &&
                                                      trackData?.data
                                                          ?.order_status ===
                                                          'handover'
                                                    ? t('Ready to serve')
                                                    : t(
                                                          trackData?.data
                                                              ?.order_status
                                                      ).replaceAll('_', ' ')}
                                            </>
                                        </Typography>
                                    </StatusPill>
                                )}
                                <StatusPill color={theme.palette.success.main}>
                                    <Typography
                                        component="span"
                                        textTransform="capitalize"
                                        color={theme.palette.success.main}
                                        align="center"
                                        sx={{
                                            fontSize: '12px',
                                            fontWeight: 400,
                                            lineHeight: 1.2,
                                            letterSpacing: '-0.36px',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {trackData?.data?.order_type ===
                                        'delivery'
                                            ? t('Home Delivery')
                                            : t(
                                                  trackData?.data?.order_type
                                              ).replaceAll('_', ' ')}
                                    </Typography>
                                </StatusPill>
                            </Stack>
                        </Stack>
                        <Stack
                            // height="100%"
                            // mt="8px"
                            flexDirection={{ xs: 'column', md: 'row' }}
                            gap="5px"
                            alignItems={{ md: 'left', xs: 'center' }}
                        >
                            <Stack
                                flexDirection="row"
                                gap="4px"
                                paddingInlineEnd="5px"
                                alignItems="center"
                            >
                                <Typography
                                    fontSize="14px"
                                    fontWeight={400}
                                    sx={{ color: theme.palette.text.secondary }}
                                >
                                    {t('Order date:')}
                                </Typography>
                                <Typography
                                    fontSize="14px"
                                    fontWeight={400}
                                    sx={{ color: theme.palette.text.secondary }}
                                >
                                    <CustomFormatedDateTime
                                        date={
                                            data?.data?.details?.[0]?.created_at
                                        }
                                    />
                                </Typography>
                            </Stack>
                            {(trackData?.data?.scheduled !== 0 ||
                                trackData?.data?.order_type === 'dine_in') && (
                                <Stack
                                    flexDirection="row"
                                    gap="4px"
                                    paddingInlineEnd="5px"
                                    alignItems="center"
                                >
                                    <Typography
                                        fontSize="14px"
                                        fontWeight={400}
                                        sx={{
                                            color: theme.palette.text.secondary,
                                        }}
                                    >
                                        {trackData?.data?.order_type ===
                                        'dine_in'
                                            ? t('Dine-in date:')
                                            : t('Scheduled delivery')}
                                    </Typography>
                                    <Typography
                                        fontSize="14px"
                                        fontWeight={400}
                                        sx={{
                                            color: theme.palette.text.secondary,
                                        }}
                                    >
                                        <CustomFormatedDateTime
                                            date={trackData?.data?.schedule_at}
                                        />
                                    </Typography>
                                </Stack>
                            )}
                        </Stack>
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        md={5}
                        padding={{ xs: '10px', sm: '20px', md: '20px' }}
                    >
                        <Stack
                            width="100%"
                            flexDirection="row"
                            justifyContent={{
                                xs: 'center',
                                sm: 'flex-end',
                                md: 'flex-end',
                            }}
                        >
                            {trackData && (
                                <>
                                    {trackData?.data?.order_status ===
                                        'delivered' &&
                                        !isTrackOrder &&
                                        getToken() && (
                                            <Stack
                                                flexDirection="row"
                                                gap="15px"
                                            >
                                                {getReviewButton(trackData)}
                                                {trackData?.data
                                                    ?.subscription === null &&
                                                    global?.repeat_order_option &&
                                                    getToken() &&
                                                    !isTrackOrder &&
                                                    !hasBogoItem &&
                                                    !isCampaignOrder && (
                                                        <Reorder
                                                            orderData={
                                                                data?.data
                                                                    ?.details
                                                            }
                                                            orderZoneId={
                                                                trackData?.data
                                                                    ?.restaurant
                                                                    ?.zone_id
                                                            }
                                                        />
                                                    )}
                                            </Stack>
                                        )}
                                    {trackData?.data?.subscription === null &&
                                        trackData &&
                                        getToken() &&
                                        (trackData?.data?.order_status ===
                                            'canceled' ||
                                            trackData?.data?.order_status ===
                                                'failed') && (
                                            <Stack>
                                                {global?.repeat_order_option &&
                                                    !hasBogoItem &&
                                                    !isCampaignOrder && (
                                                        <Reorder
                                                            orderData={
                                                                data?.data
                                                                    ?.details
                                                            }
                                                            orderZoneId={
                                                                trackData?.data
                                                                    ?.zone_id
                                                            }
                                                        />
                                                    )}
                                                {trackData?.data
                                                    ?.order_status ===
                                                    'failed' && (
                                                    <PaymentUpdate
                                                        id={tempOrderId}
                                                        refetchOrderDetails={
                                                            refetchOrderDetails
                                                        }
                                                        refetchTrackData={
                                                            refetchTrackData
                                                        }
                                                        trackData={trackData}
                                                    />
                                                )}
                                            </Stack>
                                        )}
                                    {trackData &&
                                        (trackData?.data?.order_status ===
                                            'accepted' ||
                                            trackData?.data?.order_status ===
                                                'pending' ||
                                            trackData?.data?.order_status ===
                                                'processing' ||
                                            trackData?.data?.order_status ===
                                                'confirmed' ||
                                            trackData?.data?.order_status ===
                                                'handover' ||
                                            trackData?.data?.order_status ===
                                                'picked_up') && (
                                            // trackData?.data?.subscription
                                            <OrderDetailsBottom
                                                id={tempOrderId}
                                                refetchOrderDetails={
                                                    refetchOrderDetails
                                                }
                                                refetchTrackData={
                                                    refetchTrackData
                                                }
                                                trackData={trackData}
                                                isTrackOrder={isTrackOrder}
                                            />
                                        )}
                                </>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
                <Grid item md={12}>
                    <CustomDivider marginTop="10px" />
                </Grid>
                {isTrackOrder ? (
                    <>
                        {!trackOrderLoading && (
                            <TrackingPage
                                data={trackData?.data}
                                refetchTrackData={refetchTrackData}
                            />
                        )}
                    </>
                ) : (
                    <>
                        <Grid
                            container
                            spacing={2}
                            padding={{ xs: '10px', sm: '15px', md: '15px' }}
                        >
                            <Grid
                                item
                                xs={12}
                                sm={7.3}
                                md={7.3}
                                display="flex"
                                flexDirection="column"
                                gap={{ xs: '15px', sm: '20px', md: '25px' }}
                            >
                                {trackData &&
                                    trackData?.data?.subscription === null &&
                                    trackData?.data?.order_type !==
                                        'dine_in' && (
                                        <>
                                            {trackData ? (
                                                <DeliveryTimeInfoVisibility
                                                    trackData={trackData}
                                                />
                                            ) : (
                                                <GifShimmer />
                                            )}
                                        </>
                                    )}
                                {trackData &&
                                    trackData?.data &&
                                    trackData?.data?.subscription !== null && (
                                        <SubscriptionDetails
                                            subscriptionData={
                                                trackData?.data?.subscription
                                            }
                                            eta={normalizeOrderEta(
                                                trackData?.data
                                            )}
                                            t={t}
                                            subscriptionSchedules={
                                                data?.data
                                                    ?.subscription_schedules
                                            }
                                            orderId={trackData?.data?.id}
                                            paymentMethod={
                                                trackData?.data?.payment_method
                                            }
                                            subscriptionCancelled={
                                                trackData?.data?.canceled_by
                                            }
                                            subscriptionCancellationReason={
                                                trackData?.data
                                                    ?.cancellation_reason
                                            }
                                            subscriptionCancellationNote={
                                                trackData?.data
                                                    ?.cancellation_note
                                            }
                                            subscriptionOrderNote={
                                                trackData?.data?.order_note
                                            }
                                            orderAmount={
                                                trackData?.data?.order_amount
                                            }
                                        />
                                    )}

                                {trackData &&
                                    trackData?.data?.order_type === 'dine_in' &&
                                    trackData?.data?.order_status !==
                                        'canceled' &&
                                    trackData?.data?.order_status !==
                                        'refund_requested' &&
                                    trackData?.data?.order_status !==
                                        'refunded' &&
                                    trackData?.data?.order_status !==
                                        'refunded_canceled' && (
                                        <DIneInOrderTimeInfo
                                            trackData={trackData}
                                        />
                                    )}
                                {/*<DeliveryTimeInfo trackData={trackData} />*/}
                                {trackData &&
                                    trackData?.data?.order_type ===
                                        'delivery' && (
                                        <DeliveryInfoCard
                                            order={trackData?.data}
                                            onRestaurantLocationClick={() =>
                                                setOpenRes(true)
                                            }
                                        />
                                    )}
                                <ProductDetailsWrapper gap="16px">
                                    {data?.data?.details?.length > 0 && (
                                        <TitleTypography>
                                            {data.data.details.length}{' '}
                                            {t('Items')}
                                        </TitleTypography>
                                    )}
                                    {data?.data?.details?.length > 0 &&
                                        data?.data?.details?.map(
                                            (product, id) => (
                                                <OrderItemRow
                                                    key={id}
                                                    product={product}
                                                    isLast={
                                                        id ===
                                                        data.data.details
                                                            .length -
                                                            1
                                                    }
                                                    currencySymbolDirection={
                                                        currencySymbolDirection
                                                    }
                                                    currencySymbol={
                                                        currencySymbol
                                                    }
                                                    digitAfterDecimalPoint={
                                                        digitAfterDecimalPoint
                                                    }
                                                    t={t}
                                                />
                                            )
                                        )}
                                </ProductDetailsWrapper>

                                {(trackData?.data?.order_reference
                                    ?.token_number ||
                                    trackData?.data?.order_reference
                                        ?.table_number) && (
                                    <ProductDetailsWrapper>
                                        <Stack
                                            sx={{
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                            direction="row"
                                            width="100%"
                                            padding="5px"
                                        >
                                            {/* Token Number */}
                                            {trackData?.data?.order_reference
                                                ?.token_number && (
                                                <Stack
                                                    width="100%"
                                                    justifyContent="center"
                                                    alignItems="center"
                                                >
                                                    <Typography
                                                        fontSize="14px"
                                                        fontWeight="600"
                                                        component="span"
                                                    >
                                                        {
                                                            trackData.data
                                                                .order_reference
                                                                .token_number
                                                        }
                                                        <Typography
                                                            paddingInlineStart="5px"
                                                            component="span"
                                                            color={
                                                                theme.palette
                                                                    .primary
                                                                    .main
                                                            }
                                                            fontSize="12px"
                                                        >
                                                            {t('(Token No.)')}
                                                        </Typography>
                                                    </Typography>
                                                </Stack>
                                            )}

                                            {/* Divider */}
                                            {trackData?.data?.order_reference
                                                ?.token_number &&
                                                trackData?.data?.order_reference
                                                    ?.table_number && (
                                                    <Stack
                                                        height="100%"
                                                        border="1px solid"
                                                        borderColor={
                                                            theme.palette
                                                                .neutral[400]
                                                        }
                                                    />
                                                )}

                                            {/* Table Number */}
                                            {trackData?.data?.order_reference
                                                ?.table_number && (
                                                <Typography
                                                    width="100%"
                                                    textAlign="center"
                                                    fontSize="12px"
                                                    color={
                                                        theme.palette.info.main
                                                    }
                                                >
                                                    {`${t('Table No-')} ${
                                                        trackData.data
                                                            .order_reference
                                                            .table_number
                                                    }`}
                                                </Typography>
                                            )}
                                        </Stack>
                                    </ProductDetailsWrapper>
                                )}

                                {trackData && trackData?.data?.order_note && (
                                    <Stack gap="10px">
                                        <TitleTypography>
                                            {t('Order note')}
                                        </TitleTypography>
                                        <InstructionWrapper>
                                            {trackData ? (
                                                <Typography
                                                    component="span"
                                                    textTransform="capitalize"
                                                    align="left"
                                                    fontSize="14px"
                                                    color={
                                                        theme.palette
                                                            .neutral[400]
                                                    }
                                                >
                                                    {t(
                                                        trackData?.data
                                                            ?.order_note
                                                    )}
                                                </Typography>
                                            ) : (
                                                <Skeleton
                                                    width="100px"
                                                    variant="text"
                                                />
                                            )}
                                        </InstructionWrapper>
                                    </Stack>
                                )}
                                {trackData?.data?.cutlery ? (
                                    <Stack
                                        direction="row"
                                        gap={2}
                                        alignItems="center"
                                        justifyContent="space-between"
                                    >
                                        <Typography>
                                            {t('Cutlery')} :{' '}
                                        </Typography>
                                        <Typography>{t('On')}</Typography>
                                    </Stack>
                                ) : null}

                                <Stack gap="25px">
                                    {trackData?.data?.delivery_man &&
                                        trackData?.data?.order_status !==
                                            'delivered' &&
                                        trackData?.data?.order_status !==
                                            'failed' &&
                                        trackData?.data?.order_status !==
                                            'canceled' &&
                                        trackData?.data?.order_status !==
                                            'refunded' &&
                                        getToken() && (
                                            <Stack gap="25px">
                                                <TitleTypography>
                                                    {t(
                                                        'Delivery Man Information'
                                                    )}
                                                </TitleTypography>
                                                <IformationGrid
                                                    bgColor={
                                                        theme.palette.sectionBg
                                                    }
                                                >
                                                    <Stack
                                                        direction="row"
                                                        justifyContent="space-between"
                                                        alignItems="center"
                                                        spacing={2}
                                                    >
                                                        <Stack>
                                                            {trackData && (
                                                                <CustomImageContainer
                                                                    src={
                                                                        trackData
                                                                            ?.data
                                                                            ?.delivery_man
                                                                            ?.image_full_url
                                                                    }
                                                                    height="80px"
                                                                    width="80px"
                                                                    borderRadius=".5rem"
                                                                    objectFit="cover"
                                                                    alt={
                                                                        trackData
                                                                            ?.data
                                                                            ?.delivery_man
                                                                            ?.f_name
                                                                    }
                                                                />
                                                            )}
                                                        </Stack>
                                                        <Stack alignItems="flex-start">
                                                            <Typography
                                                                fontSize="16px"
                                                                fontWeight="500"
                                                            >
                                                                {trackData?.data?.delivery_man?.f_name.concat(
                                                                    ' ',
                                                                    trackData
                                                                        ?.data
                                                                        ?.delivery_man
                                                                        ?.l_name
                                                                )}
                                                            </Typography>
                                                            <InfoTypography
                                                                sx={{
                                                                    fontWeight:
                                                                        'bold',
                                                                    display:
                                                                        'flex',
                                                                    alignItems:
                                                                        'center',
                                                                    gap: '5px',
                                                                }}
                                                            >
                                                                {trackData &&
                                                                    trackData?.data?.delivery_man?.avg_rating?.toFixed(
                                                                        1
                                                                    )}
                                                                <StarIcon
                                                                    sx={{
                                                                        fontSize:
                                                                            '16px',
                                                                        color: (
                                                                            theme
                                                                        ) =>
                                                                            theme
                                                                                .palette
                                                                                .primary
                                                                                .main,
                                                                    }}
                                                                />{' '}
                                                            </InfoTypography>
                                                        </Stack>
                                                    </Stack>
                                                    <Stack
                                                        direction="row"
                                                        spacing={2}
                                                    >
                                                        {/*<Typography>call</Typography>*/}
                                                        <Stack
                                                            sx={{
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            <Link
                                                                href={{
                                                                    pathname:
                                                                        '/info',
                                                                    query: {
                                                                        page: 'inbox',
                                                                        type: 'delivery_man',
                                                                        id: trackData
                                                                            ?.data
                                                                            ?.delivery_man
                                                                            ?.id,
                                                                        routeName:
                                                                            'delivery_man_id',
                                                                        chatFrom:
                                                                            'true',
                                                                        restaurantName:
                                                                            trackData
                                                                                ?.data
                                                                                ?.delivery_man
                                                                                ?.f_name,
                                                                        logo: trackData
                                                                            ?.data
                                                                            ?.delivery_man
                                                                            ?.image,
                                                                    },
                                                                }}
                                                            >
                                                                <ChatIcon
                                                                    sx={{
                                                                        height: 25,
                                                                        width: 25,
                                                                        color: (
                                                                            theme
                                                                        ) =>
                                                                            theme
                                                                                .palette
                                                                                .primary
                                                                                .main,
                                                                    }}
                                                                ></ChatIcon>
                                                            </Link>
                                                        </Stack>
                                                    </Stack>
                                                </IformationGrid>
                                            </Stack>
                                        )}

                                    <Stack gap="15px">
                                        <TitleTypography>
                                            {t('Payment Method')}
                                        </TitleTypography>
                                        <ProductDetailsWrapper
                                            isVerfired={
                                                trackData?.offline_payment?.data
                                                    ?.status === 'verified'
                                            }
                                        >
                                            {global?.order_delivery_verification && (
                                                <Stack
                                                    direction="row"
                                                    marginBottom="10px"
                                                >
                                                    <Typography
                                                        color={
                                                            theme.palette
                                                                .neutral[400]
                                                        }
                                                        fontSize="14px"
                                                        fontWeight={600}
                                                        sx={{
                                                            textTransform:
                                                                'capitalize',
                                                            wordWrap:
                                                                'break-word',
                                                        }}
                                                    >
                                                        {t('Order Otp')}
                                                    </Typography>
                                                    <Typography
                                                        fontSize="14px"
                                                        fontWeight={600}
                                                        color={
                                                            theme.palette
                                                                .neutral[400]
                                                        }
                                                        sx={{
                                                            textTransform:
                                                                'capitalize',
                                                            wordWrap:
                                                                'break-word',
                                                        }}
                                                    >
                                                        {' '}
                                                        &nbsp;&nbsp;&nbsp;:
                                                        &nbsp;&nbsp;{' '}
                                                        {trackData?.data?.otp}
                                                    </Typography>
                                                </Stack>
                                            )}
                                            {(trackData?.data
                                                ?.payment_method ===
                                                'offline_payment' ||
                                                trackData?.data
                                                    ?.offline_payment !==
                                                    null) && (
                                                <OfflineOrderDetails
                                                    trackData={trackData?.data}
                                                    refetchTrackData={
                                                        refetchTrackData
                                                    }
                                                />
                                            )}
                                            {trackData?.data?.payment_method !==
                                                'offline_payment' && (
                                                <PaymentMethodCard
                                                    method={
                                                        trackData?.data
                                                            ?.payment_method
                                                    }
                                                    amount={getAmount(
                                                        trackData?.data
                                                            ?.order_amount,
                                                        currencySymbolDirection,
                                                        currencySymbol,
                                                        digitAfterDecimalPoint
                                                    )}
                                                    showPayDigitally={
                                                        trackData?.data
                                                            ?.payment_method ===
                                                            'cash_on_delivery' &&
                                                        trackData?.data
                                                            ?.payment_status ===
                                                            'unpaid' &&
                                                        Boolean(
                                                            global?.cod_to_digital_payment
                                                        ) &&
                                                        [
                                                            'pending',
                                                            'accepted',
                                                            'confirmed',
                                                            'processing',
                                                            'handover',
                                                            'picked_up',
                                                        ].includes(
                                                            trackData?.data
                                                                ?.order_status
                                                        )
                                                    }
                                                    onPayDigitally={() =>
                                                        setOpenPayDigitallyModal(
                                                            true
                                                        )
                                                    }
                                                />
                                            )}
                                        </ProductDetailsWrapper>
                                    </Stack>
                                    {trackData?.data?.refund && (
                                        <Stack width="100%" mt=".5rem">
                                            <Stack
                                                spacing={1}
                                                alignItems="center"
                                                direction="row"
                                            >
                                                {trackData?.data?.refund &&
                                                trackData?.data
                                                    ?.order_status ===
                                                    'refund_request_canceled' ? (
                                                    <Refund
                                                        t={t}
                                                        title="Refund cancellation"
                                                        note={
                                                            trackData?.data
                                                                ?.refund
                                                                ?.admin_note
                                                        }
                                                    />
                                                ) : (
                                                    trackData?.data
                                                        ?.order_status ===
                                                        'refund_requested' && (
                                                        <Refund
                                                            t={t}
                                                            title="Refund request"
                                                            note={
                                                                trackData?.data
                                                                    ?.refund
                                                                    ?.customer_note
                                                            }
                                                            reason={
                                                                trackData?.data
                                                                    ?.refund
                                                                    ?.customer_reason
                                                            }
                                                            image={
                                                                trackData?.data
                                                                    ?.refund
                                                                    ?.image_full_url
                                                            }
                                                        />
                                                    )
                                                )}
                                            </Stack>
                                        </Stack>
                                    )}
                                    {trackData?.data?.order_status ===
                                        'canceled' && (
                                        <Stack spacing={1.2}>
                                            <TitleTypography>
                                                {t('Cancellation Note')}
                                            </TitleTypography>
                                            <Stack
                                                padding="20px 16px"
                                                borderRadius="10px"
                                                backgroundColor={alpha(
                                                    theme.palette.nonVeg,
                                                    0.1
                                                )}
                                            >
                                                <Typography
                                                    fontSize="14px"
                                                    color={
                                                        theme.palette
                                                            .neutral[400]
                                                    }
                                                >
                                                    {
                                                        trackData?.data
                                                            ?.cancellation_reason
                                                    }
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    )}
                                </Stack>
                            </Grid>
                            <Grid item sm={4.7} xs={12}>
                                <OrderSummaryGrid
                                    container
                                    sx={{
                                        position: 'sticky',
                                        top: { xs: '90px', md: '130px' },
                                        zIndex: 9,
                                        background: (theme) =>
                                            theme.palette.neutral[100],
                                        borderRadius: '5px',
                                    }}
                                >
                                    <Grid item md={12} xs={12}>
                                        <Typography
                                            fontSize="16px"
                                            lineHeight="28px"
                                            fontWeight={500}
                                            sx={{
                                                paddingBlock: '12px',
                                                color: theme.palette
                                                    .neutral[1000],
                                            }}
                                        >
                                            {t('Summary')}
                                        </Typography>
                                    </Grid>
                                    <Grid
                                        container
                                        item
                                        md={12}
                                        xs={12}
                                        spacing={1}
                                    >
                                        <Grid item md={7} xs={8}>
                                            <InfoTypography>
                                                {t('Items Price')}
                                            </InfoTypography>
                                        </Grid>
                                        <Grid item md={5} xs={4}>
                                            <AmountTypography align="right">
                                                {data &&
                                                    getAmount(
                                                        getItemsPrice(
                                                            data?.data?.details
                                                        ),
                                                        currencySymbolDirection,
                                                        currencySymbol,
                                                        digitAfterDecimalPoint
                                                    )}
                                            </AmountTypography>
                                        </Grid>
                                        {getAddOnsPrice(data?.data?.details) >
                                        0 ? (
                                            <>
                                                <Grid item md={8} xs={8}>
                                                    <InfoTypography>
                                                        {t('Addons Price')}
                                                    </InfoTypography>
                                                </Grid>
                                                <Grid item md={4} xs={4}>
                                                    <AmountTypography align="right">
                                                        {data &&
                                                            getAmount(
                                                                getAddOnsPrice(
                                                                    data?.data
                                                                        ?.details
                                                                ),
                                                                currencySymbolDirection,
                                                                currencySymbol,
                                                                digitAfterDecimalPoint
                                                            )}
                                                    </AmountTypography>
                                                </Grid>
                                            </>
                                        ) : null}

                                        <Grid item md={7} xs={8}>
                                            <Stack
                                                direction="row"
                                                alignItems="center"
                                                spacing={0.5}
                                            >
                                                <InfoTypography>
                                                    {t('Discount')}
                                                </InfoTypography>
                                                {Boolean(
                                                    trackData?.data
                                                        ?.restaurant_discount_amount
                                                ) &&
                                                    discountSourceText && (
                                                        <Tooltip
                                                            title={
                                                                discountSourceText
                                                            }
                                                            placement="top"
                                                            arrow
                                                        >
                                                            <Box
                                                                component="i"
                                                                className="fi fi-br-info"
                                                                sx={{
                                                                    fontSize:
                                                                        '14px',
                                                                    lineHeight: 1,
                                                                    display:
                                                                        'flex',
                                                                    color: 'text.primary',
                                                                    cursor: 'pointer',
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    )}
                                            </Stack>
                                        </Grid>
                                        <Grid item md={5} xs={4}>
                                            <AmountTypography align="right">
                                                (-)
                                                <InfoTypography
                                                    component="span"
                                                    marginLeft="4px"
                                                >
                                                    {trackData &&
                                                    trackData?.data
                                                        ?.restaurant_discount_amount
                                                        ? getAmount(
                                                              trackData?.data
                                                                  ?.restaurant_discount_amount,
                                                              currencySymbolDirection,
                                                              currencySymbol,
                                                              digitAfterDecimalPoint
                                                          )
                                                        : getAmount(
                                                              0,
                                                              currencySymbolDirection,
                                                              currencySymbol,
                                                              digitAfterDecimalPoint
                                                          )}
                                                </InfoTypography>
                                            </AmountTypography>
                                        </Grid>
                                        <Grid item md={8} xs={8}>
                                            <InfoTypography>
                                                {t('Coupon Discount')}
                                                {proBenefitType ===
                                                    'coupon' && (
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            display:
                                                                'inline-flex',
                                                            alignItems:
                                                                'center',
                                                            ml: 0.75,
                                                            px: 0.75,
                                                            py: 0.25,
                                                            borderRadius:
                                                                '999px',
                                                            backgroundColor:
                                                                'rgba(181, 142, 255, 0.15)',
                                                            color: '#7C3AED',
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            lineHeight: 1,
                                                            gap: 0.25,
                                                        }}
                                                    >
                                                        <ProBadge size={12} />
                                                        {t('Pro')}
                                                    </Box>
                                                )}
                                            </InfoTypography>
                                        </Grid>
                                        <Grid item md={4} xs={4}>
                                            <AmountTypography align="right">
                                                (-)
                                                <InfoTypography
                                                    component="span"
                                                    marginLeft="4px"
                                                >
                                                    {trackData &&
                                                        getAmount(
                                                            trackData?.data
                                                                ?.coupon_discount_amount,
                                                            currencySymbolDirection,
                                                            currencySymbol,
                                                            digitAfterDecimalPoint
                                                        )}
                                                </InfoTypography>
                                            </AmountTypography>
                                        </Grid>
                                        {trackData?.data?.ref_bonus_amount >
                                        0 ? (
                                            <>
                                                <Grid item md={8} xs={8}>
                                                    <InfoTypography>
                                                        {t('Referral Discount')}
                                                    </InfoTypography>
                                                </Grid>
                                                <Grid item md={4} xs={4}>
                                                    <AmountTypography align="right">
                                                        (-)
                                                        <InfoTypography
                                                            component="span"
                                                            marginLeft="4px"
                                                        >
                                                            {trackData &&
                                                                getAmount(
                                                                    trackData
                                                                        ?.data
                                                                        ?.ref_bonus_amount,
                                                                    currencySymbolDirection,
                                                                    currencySymbol,
                                                                    digitAfterDecimalPoint
                                                                )}
                                                        </InfoTypography>
                                                    </AmountTypography>
                                                </Grid>
                                            </>
                                        ) : (
                                            ''
                                        )}
                                        {trackData?.data
                                            ?.extra_packaging_amount > 0 ? (
                                            <>
                                                <Grid item md={8} xs={8}>
                                                    <InfoTypography>
                                                        {t(
                                                            'Extra Packaging Charge'
                                                        )}
                                                    </InfoTypography>
                                                </Grid>
                                                <Grid item md={4} xs={4}>
                                                    <AmountTypography align="end">
                                                        (+)
                                                        <InfoTypography
                                                            component="span"
                                                            marginLeft="4px"
                                                        >
                                                            {trackData &&
                                                                getAmount(
                                                                    trackData
                                                                        ?.data
                                                                        ?.extra_packaging_amount,
                                                                    currencySymbolDirection,
                                                                    currencySymbol,
                                                                    digitAfterDecimalPoint
                                                                )}
                                                        </InfoTypography>
                                                    </AmountTypography>
                                                </Grid>
                                            </>
                                        ) : (
                                            ''
                                        )}
                                        {trackData?.data?.tax_status ===
                                            'excluded' &&
                                            trackData?.data?.total_tax_amount >
                                                0 && (
                                                <>
                                                    <Grid item md={8} xs={8}>
                                                        <InfoTypography>
                                                            {t('VAT/TAX')}
                                                        </InfoTypography>
                                                    </Grid>
                                                    <Grid
                                                        item
                                                        md={4}
                                                        xs={4}
                                                        align="end"
                                                    >
                                                        <AmountTypography>
                                                            (+)
                                                            <InfoTypography
                                                                component="span"
                                                                marginLeft="4px"
                                                            >
                                                                {trackData &&
                                                                    getAmount(
                                                                        trackData
                                                                            ?.data
                                                                            ?.total_tax_amount,
                                                                        currencySymbolDirection,
                                                                        currencySymbol,
                                                                        digitAfterDecimalPoint
                                                                    )}
                                                            </InfoTypography>
                                                        </AmountTypography>
                                                    </Grid>
                                                </>
                                            )}

                                        {trackData &&
                                            trackData?.data?.dm_tips > 0 && (
                                                <>
                                                    <Grid item md={8} xs={8}>
                                                        <InfoTypography>
                                                            {t(
                                                                'Delivery man tips'
                                                            )}
                                                        </InfoTypography>
                                                    </Grid>
                                                    <Grid item md={4} xs={4}>
                                                        <AmountTypography align="right">
                                                            {getAmount(
                                                                trackData?.data
                                                                    ?.dm_tips,
                                                                currencySymbolDirection,
                                                                currencySymbol,
                                                                digitAfterDecimalPoint
                                                            )}
                                                        </AmountTypography>
                                                    </Grid>
                                                </>
                                            )}
                                        {/* {trackData &&
                                            trackData?.data?.bring_change_amount > 0 && (
                                                <>
                                                    <Grid item md={8} xs={8} alignItems="center">
                                                        <InfoTypography>
                                                            {t(
                                                                'Bring Change Amount'
                                                            )}
                                                            <Tooltip title={t('Insert amount if you need deliveryman to bring')} placement="top">
                                                                <InfoIcon
                                                                    sx={{
                                                                        width: '16px',
                                                                        height: '16px',
                                                                        ml: '5px',
                                                                        color: theme => theme.palette.neutral[1000]
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        </InfoTypography>
                                                    </Grid>
                                                    <Grid item md={4} xs={4}>
                                                        <InfoTypography align="right">
                                                            {getAmount(
                                                                trackData?.data
                                                                    ?.bring_change_amount,
                                                                currencySymbolDirection,
                                                                currencySymbol,
                                                                digitAfterDecimalPoint
                                                            )}
                                                        </InfoTypography>
                                                    </Grid>
                                                </>
                                            )} */}
                                        {trackData &&
                                            global?.additional_charge_status ===
                                                1 && (
                                                <>
                                                    <Grid item md={8} xs={8}>
                                                        <InfoTypography>
                                                            {t(
                                                                global?.additional_charge_name
                                                            )}
                                                        </InfoTypography>
                                                    </Grid>
                                                    <Grid item md={4} xs={4}>
                                                        <AmountTypography align="right">
                                                            (+)
                                                            <InfoTypography
                                                                component="span"
                                                                marginLeft="4px"
                                                            >
                                                                {getAmount(
                                                                    trackData
                                                                        ?.data
                                                                        ?.additional_charge,
                                                                    currencySymbolDirection,
                                                                    currencySymbol,
                                                                    digitAfterDecimalPoint
                                                                )}
                                                            </InfoTypography>
                                                        </AmountTypography>
                                                    </Grid>
                                                </>
                                            )}
                                        <Grid item md={8} xs={8}>
                                            <InfoTypography>
                                                {t('Delivery fee')}
                                            </InfoTypography>
                                        </Grid>
                                        <Grid item md={4} xs={4}>
                                            <AmountTypography align="right">
                                                {trackData &&
                                                    (deliveryFeeWithTypeCharge >
                                                    0 ? (
                                                        // A Pro partial-free
                                                        // benefit shows what
                                                        // the fee would have
                                                        // been beside what was
                                                        // charged, the same way
                                                        // checkout does.
                                                        <Stack
                                                            direction="row"
                                                            alignItems="center"
                                                            justifyContent="flex-end"
                                                            spacing={0.5}
                                                            component="span"
                                                        >
                                                            {isProDeliveryDiscount && (
                                                                <Typography
                                                                    component="span"
                                                                    fontSize="inherit"
                                                                    sx={{
                                                                        textDecoration:
                                                                            'line-through',
                                                                        color: theme
                                                                            .palette
                                                                            .text
                                                                            .secondary,
                                                                    }}
                                                                >
                                                                    {getAmount(
                                                                        deliveryFeeWithTypeCharge +
                                                                            proDeliveryReductionAmount,
                                                                        currencySymbolDirection,
                                                                        currencySymbol,
                                                                        digitAfterDecimalPoint
                                                                    )}
                                                                </Typography>
                                                            )}
                                                            <Typography
                                                                component="span"
                                                                fontSize="inherit"
                                                            >
                                                                {getAmount(
                                                                    deliveryFeeWithTypeCharge,
                                                                    currencySymbolDirection,
                                                                    currencySymbol,
                                                                    digitAfterDecimalPoint
                                                                )}
                                                            </Typography>
                                                            {isProDeliveryDiscount && (
                                                                <Typography
                                                                    component="span"
                                                                    fontSize="11px"
                                                                    fontWeight={
                                                                        600
                                                                    }
                                                                    color="success.main"
                                                                >
                                                                    ({t('Pro')})
                                                                </Typography>
                                                            )}
                                                        </Stack>
                                                    ) : (
                                                        <Stack
                                                            direction="row"
                                                            alignItems="center"
                                                            justifyContent="flex-end"
                                                            spacing={0.5}
                                                            component="span"
                                                        >
                                                            <Typography
                                                                component="span"
                                                                fontSize="inherit"
                                                                fontWeight={600}
                                                                color={
                                                                    theme
                                                                        .palette
                                                                        .success
                                                                        .main
                                                                }
                                                            >
                                                                {t('Free')}
                                                            </Typography>
                                                            {/* Only Pro made it
                                                                free — a zone or
                                                                restaurant free
                                                                delivery must not
                                                                be credited to the
                                                                membership. */}
                                                            {isFullFreeProDelivery && (
                                                                <Typography
                                                                    component="span"
                                                                    fontSize="11px"
                                                                    fontWeight={
                                                                        600
                                                                    }
                                                                    color="success.main"
                                                                >
                                                                    ({t('Pro')})
                                                                </Typography>
                                                            )}
                                                        </Stack>
                                                    ))}
                                            </AmountTypography>
                                        </Grid>

                                        {normalizedDeliveryType &&
                                            normalizedDeliveryType !==
                                                'standard' &&
                                            deliveryTypeCharge > 0 && (
                                                <>
                                                    <Grid item md={8} xs={8}>
                                                        <InfoTypography>
                                                            {deliveryTypeLabels[
                                                                normalizedDeliveryType
                                                            ] ||
                                                                normalizedDeliveryType}
                                                        </InfoTypography>
                                                    </Grid>
                                                    <Grid item md={4} xs={4}>
                                                        <AmountTypography align="right">
                                                            {normalizedDeliveryType ===
                                                            'express'
                                                                ? '(+) '
                                                                : '(-) '}
                                                            {getAmount(
                                                                deliveryTypeCharge,
                                                                currencySymbolDirection,
                                                                currencySymbol,
                                                                digitAfterDecimalPoint
                                                            )}
                                                        </AmountTypography>
                                                    </Grid>
                                                </>
                                            )}
                                    </Grid>
                                    <Grid item md={12} xs={12} mb="10px">
                                        <Stack
                                            width="100%"
                                            sx={{
                                                mt: '12px',
                                                borderBottom: `0.088rem dashed ${theme.palette.neutral[300]}`,
                                            }}
                                        ></Stack>
                                    </Grid>

                                    <TotalGrid container md={12} xs={12}>
                                        <Grid item md={6} xs={6}>
                                            <Typography
                                                fontSize="16px"
                                                fontWeight="400"
                                                sx={{
                                                    color: theme.palette.text
                                                        .secondary,
                                                }}
                                            >
                                                {t('Total')}
                                                {trackData?.data?.tax_status ===
                                                    'included' && (
                                                    <Typography
                                                        fontSize="12px"
                                                        sx={{
                                                            marginInlineStart:
                                                                '5px',
                                                        }}
                                                        color="primary"
                                                        component="span"
                                                    >
                                                        {t('(Vat/Tax incl.)')}
                                                    </Typography>
                                                )}
                                            </Typography>
                                        </Grid>
                                        <Grid item md={6} xs={6}>
                                            <Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="flex-end"
                                                flexWrap="wrap"
                                                gap="12px"
                                            >
                                                {paymentStatusInfo && (
                                                    <Typography
                                                        sx={{
                                                            fontSize: '14px',
                                                            fontWeight: 500,
                                                            letterSpacing:
                                                                '-0.42px',
                                                            textTransform:
                                                                'capitalize',
                                                            whiteSpace:
                                                                'nowrap',
                                                            color: paymentStatusInfo.color,
                                                        }}
                                                    >
                                                        {
                                                            paymentStatusInfo.label
                                                        }
                                                    </Typography>
                                                )}
                                                <Typography
                                                    fontWeight="600"
                                                    color={
                                                        theme.palette.text
                                                            .primary
                                                    }
                                                    sx={{
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {trackData &&
                                                        getAmount(
                                                            handleTotalAmount(),
                                                            currencySymbolDirection,
                                                            currencySymbol,
                                                            digitAfterDecimalPoint
                                                        )}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                        {global?.pro_member_status &&
                                        hasProBenefit ? (
                                            <Grid item md={12} xs={12}>
                                                <ProSavingsBanner
                                                    amount={
                                                        trackData?.data
                                                            ?.pro_discount
                                                    }
                                                    message={proSavingsMessage}
                                                    currencySymbol={
                                                        currencySymbol
                                                    }
                                                    currencySymbolDirection={
                                                        currencySymbolDirection
                                                    }
                                                    digitAfterDecimalPoint={
                                                        digitAfterDecimalPoint
                                                    }
                                                    t={t}
                                                    sx={{ mx: 0 }}
                                                />
                                            </Grid>
                                        ) : null}
                                        {trackData?.data?.subscription !==
                                            null && (
                                            <>
                                                <Grid
                                                    item
                                                    md={8}
                                                    xs={8}
                                                    pt=".5rem"
                                                    pb=".5rem"
                                                >
                                                    <Stack
                                                        direction="row"
                                                        alignItems="center"
                                                    >
                                                        <InfoTypography>
                                                            {t(
                                                                'Total Delivered'
                                                            )}{' '}
                                                            (
                                                            {trackOrderLoading ? (
                                                                <Skeleton
                                                                    variant="text"
                                                                    width={18}
                                                                    sx={{
                                                                        display:
                                                                            'inline-block',
                                                                        verticalAlign:
                                                                            'middle',
                                                                    }}
                                                                />
                                                            ) : (
                                                                trackData?.data
                                                                    ?.subscription
                                                                    ?.delivered_count ??
                                                                0
                                                            )}
                                                            )
                                                        </InfoTypography>
                                                        <CustomTooltip
                                                            title={`${trackData?.data?.subscription?.delivered_count} ${tip_text} ${trackData?.data?.subscription?.quantity}`}
                                                            arrow
                                                            placement="top"
                                                        >
                                                            <Box
                                                                component="i"
                                                                className="fi fi-br-info"
                                                                sx={{
                                                                    fontSize:
                                                                        '14px',
                                                                    lineHeight: 1,
                                                                    display:
                                                                        'flex',
                                                                    ml: '6px',
                                                                    color: 'text.secondary',
                                                                    cursor: 'pointer',
                                                                }}
                                                            />
                                                        </CustomTooltip>
                                                    </Stack>
                                                </Grid>
                                                <Grid
                                                    item
                                                    md={4}
                                                    xs={4}
                                                    pt=".5rem"
                                                    pb=".5rem"
                                                >
                                                    <AmountTypography align="right">
                                                        (-)
                                                        {getAmount(
                                                            trackData?.data
                                                                ?.subscription
                                                                ?.paid_amount,
                                                            currencySymbolDirection,
                                                            currencySymbol,
                                                            digitAfterDecimalPoint
                                                        )}
                                                    </AmountTypography>
                                                </Grid>
                                                <Grid item md={8} xs={8}>
                                                    <Typography fontWeight="600">
                                                        {t('Due')}
                                                    </Typography>
                                                </Grid>
                                                <Grid item md={4} xs={4}>
                                                    <Typography
                                                        fontWeight="600"
                                                        align="right"
                                                    >
                                                        {getAmount(
                                                            handleTotalAmount() -
                                                                trackData?.data
                                                                    ?.subscription
                                                                    ?.paid_amount,
                                                            currencySymbolDirection,
                                                            currencySymbol,
                                                            digitAfterDecimalPoint
                                                        )}
                                                    </Typography>
                                                </Grid>
                                            </>
                                        )}
                                        {trackData &&
                                            trackData?.data?.subscription !==
                                                null &&
                                            trackData?.data?.subscription
                                                ?.status !== 'canceled' && (
                                                //this bottom actions are for subscriptions order
                                                <BottomActions
                                                    refetchAll={refetchAll}
                                                    subscriptionId={
                                                        trackData?.data
                                                            ?.subscription?.id
                                                    }
                                                    t={t}
                                                    minDate={
                                                        trackData?.data
                                                            ?.subscription
                                                            ?.start_at
                                                    }
                                                    maxDate={
                                                        trackData?.data
                                                            ?.subscription
                                                            ?.end_at
                                                    }
                                                />
                                            )}
                                        {trackData?.data
                                            ?.partially_paid_amount &&
                                        trackData?.data?.order_status !==
                                            'canceled' ? (
                                            <>
                                                <Grid item md={8} xs={8}>
                                                    <Typography
                                                        textTransform="capitalize"
                                                        variant="h5"
                                                    >
                                                        {t('Paid by wallet')}
                                                    </Typography>
                                                </Grid>
                                                <Grid
                                                    item
                                                    md={4}
                                                    xs={4}
                                                    align="right"
                                                >
                                                    <Typography variant="h5">
                                                        (-){' '}
                                                        {trackData &&
                                                            getAmount(
                                                                trackData?.data
                                                                    ?.partially_paid_amount,
                                                                currencySymbolDirection,
                                                                currencySymbol,
                                                                digitAfterDecimalPoint
                                                            )}
                                                    </Typography>
                                                </Grid>
                                            </>
                                        ) : null}

                                        {trackData?.data?.payment_method ===
                                        'partial_payment' ? (
                                            <>
                                                {trackData?.data?.payments[1]
                                                    ?.payment_status ===
                                                'unpaid' ? (
                                                    <>
                                                        {' '}
                                                        <Grid
                                                            item
                                                            md={8}
                                                            xs={8}
                                                        >
                                                            <Typography
                                                                textTransform="capitalize"
                                                                variant="h5"
                                                            >
                                                                {t(
                                                                    'Due Payment'
                                                                )}{' '}
                                                                (
                                                                {trackData &&
                                                                    t(
                                                                        trackData
                                                                            ?.data
                                                                            ?.payments[1]
                                                                            ?.payment_method
                                                                    ).replaceAll(
                                                                        '_',
                                                                        ' '
                                                                    )}
                                                                )
                                                            </Typography>
                                                        </Grid>
                                                        <Grid
                                                            item
                                                            md={4}
                                                            xs={4}
                                                            align="right"
                                                        >
                                                            <Typography variant="h5">
                                                                {trackData &&
                                                                    getAmount(
                                                                        trackData
                                                                            ?.data
                                                                            ?.order_amount -
                                                                            trackData
                                                                                ?.data
                                                                                ?.partially_paid_amount,
                                                                        currencySymbolDirection,
                                                                        currencySymbol,
                                                                        digitAfterDecimalPoint
                                                                    )}
                                                            </Typography>
                                                        </Grid>
                                                    </>
                                                ) : (
                                                    <>
                                                        {' '}
                                                        <Grid
                                                            item
                                                            md={8}
                                                            xs={8}
                                                        >
                                                            <Typography
                                                                textTransform="capitalize"
                                                                variant="h5"
                                                            >
                                                                {t('Paid By')} (
                                                                {trackData &&
                                                                    t(
                                                                        trackData
                                                                            ?.data
                                                                            ?.payments[1]
                                                                            ?.payment_method
                                                                    ).replaceAll(
                                                                        '_',
                                                                        ' '
                                                                    )}
                                                                )
                                                            </Typography>
                                                        </Grid>
                                                        <Grid
                                                            item
                                                            md={4}
                                                            xs={4}
                                                            align="right"
                                                        >
                                                            <Typography variant="h5">
                                                                {trackData &&
                                                                    getAmount(
                                                                        trackData
                                                                            ?.data
                                                                            ?.order_amount -
                                                                            trackData
                                                                                ?.data
                                                                                ?.partially_paid_amount,
                                                                        currencySymbolDirection,
                                                                        currencySymbol,
                                                                        digitAfterDecimalPoint
                                                                    )}
                                                            </Typography>
                                                        </Grid>
                                                    </>
                                                )}
                                            </>
                                        ) : null}
                                    </TotalGrid>
                                    {global?.refund_active_status &&
                                        trackData?.data?.order_status ===
                                            'delivered' &&
                                        trackData &&
                                        trackData?.data?.subscription ===
                                            null &&
                                        getToken() && (
                                            <RefundButton
                                                variant="outlined"
                                                onClick={() =>
                                                    setOpenModal(true)
                                                }
                                            >
                                                {t('Refund Request')}
                                            </RefundButton>
                                        )}
                                </OrderSummaryGrid>
                            </Grid>
                        </Grid>
                    </>
                )}
            </CustomPaperBigCard>
            {paymentResultFlag && (
                <CustomModal
                    maxWidth="400px"
                    openModal={Boolean(paymentResultFlag)}
                    setModalOpen={() => setPaymentResultFlag(null)}
                    closeButton
                >
                    <Stack
                        alignItems="center"
                        textAlign="center"
                        spacing={2.5}
                        sx={{ px: '28px', pt: '8px', pb: '28px' }}
                    >
                        <Stack
                            alignItems="center"
                            justifyContent="center"
                            sx={{
                                width: '84px',
                                height: '84px',
                                borderRadius: '50%',
                                backgroundColor: alpha(
                                    paymentResultFlag === 'success'
                                        ? theme.palette.success.main
                                        : theme.palette.error.main,
                                    0.1
                                ),
                            }}
                        >
                            {paymentResultFlag === 'success' ? (
                                <CheckCircleIcon
                                    sx={{
                                        fontSize: '52px',
                                        color: theme.palette.success.main,
                                    }}
                                />
                            ) : (
                                <CancelIcon
                                    sx={{
                                        fontSize: '52px',
                                        color: theme.palette.error.main,
                                    }}
                                />
                            )}
                        </Stack>
                        <Stack spacing={0.75}>
                            <Typography variant="h5" fontWeight={700}>
                                {paymentResultFlag === 'success'
                                    ? t('Payment Successful')
                                    : t('Payment Failed')}
                            </Typography>
                            <Typography color={theme.palette.text.secondary}>
                                {paymentResultFlag === 'success'
                                    ? t(
                                          'Your payment has been completed successfully.'
                                      )
                                    : t(
                                          'Your payment could not be completed. Please try again.'
                                      )}
                            </Typography>
                        </Stack>
                        <CustomButtonPrimary
                            maxWidth="160px"
                            paddingTop="8px"
                            paddingBottom="8px"
                            onClick={() => setPaymentResultFlag(null)}
                        >
                            {t('Close')}
                        </CustomButtonPrimary>
                    </Stack>
                </CustomModal>
            )}
            {getToken() && orderDetailsModal && (
                <CustomModal
                    maxWidth="670px"
                    openModal={openOfflineModal}
                    setModalOpen={setOpenOfflineModal}
                >
                    <CustomStackFullWidth
                        direction="row"
                        alignItems="center"
                        justifyContent="flex-end"
                        sx={{ position: 'relative' }}
                    >
                        <IconButton
                            onClick={handleOfflineClose}
                            sx={{
                                zIndex: '99',
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                backgroundColor: (theme) =>
                                    theme.palette.neutral[100],
                                borderRadius: '50%',
                                [theme.breakpoints.down('md')]: {
                                    top: 10,
                                    right: 5,
                                },
                            }}
                        >
                            <CloseIcon
                                sx={{ fontSize: '24px', fontWeight: '500' }}
                            />
                        </IconButton>
                    </CustomStackFullWidth>
                    <OfflineDetailsModal
                        trackData={trackData?.data}
                        handleOfflineClose={handleOfflineClose}
                    />
                </CustomModal>
            )}

            <ContactAddressMap
                global={global}
                open={openRes}
                setOpen={setOpenRes}
                lat={trackData && trackData?.data?.restaurant?.latitude}
                lng={trackData && trackData?.data?.restaurant?.longitude}
                data={[trackData?.data?.restaurant]}
                order_details
            />
            <RefundModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                reasons={reasonsData?.refund_reasons}
                formSubmit={formSubmitHandler}
                refundIsLoading={refundIsLoading}
            />
            <ReviewSideDrawer
                open={openReviewModal}
                onClose={() => setOpenReviewModal(false)}
                orderId={tempOrderId}
                refetchTrackData={refetchTrackData}
                refetchOrderDetails={refetchOrderDetails}
                is_reviewed={trackData?.data?.is_reviewed}
                is_dm_reviewed={trackData?.data?.is_dm_reviewed}
            />
            <PayDigitallyModal
                open={openPayDigitallyModal}
                onClose={() => setOpenPayDigitallyModal(false)}
                gateways={global?.active_payment_method_list ?? []}
                // Unpaid due, not the raw order amount: any already-settled
                // payment rows (e.g. a paid wallet share) are subtracted so
                // the modal's Total matches pay-digitally's amount_due.
                totalAmount={getAmount(
                    Math.max(
                        0,
                        (Number(trackData?.data?.order_amount) || 0) -
                            (trackData?.data?.payments ?? [])
                                .filter(
                                    (payment) =>
                                        payment?.payment_status === 'paid'
                                )
                                .reduce(
                                    (sum, payment) =>
                                        sum + (Number(payment?.amount) || 0),
                                    0
                                )
                    ),
                    currencySymbolDirection,
                    currencySymbol,
                    digitAfterDecimalPoint
                )}
                onProceed={handleProceedDigitalPayment}
                proceedLoading={payDigitallyLoading}
            />
        </NoSsr>
    )
}

export default OrderDetails
