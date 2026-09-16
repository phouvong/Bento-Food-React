import { onSingleErrorResponse } from '@/components/ErrorResponse'
import { CouponApi } from '@/hooks/react-query/config/couponApi'
import { setCouponAmount, setSubscriptionSubTotal, setTotalAmount } from '@/redux/slices/cart'
import { setCouponType } from '@/redux/slices/global'
import {
    getAmount,
    getCalculatedTotal,
    getCouponDiscount,
    getDeliveryFees,
    getProductDiscount,
    getReferDiscount,
    getSubTotalPrice,
    getTaxableTotalPrice,
    truncate,
} from '@/utils/customFunctions'
import { alpha } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Grid, Stack, Tooltip, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import CustomDivider from '../../CustomDivider'
import { CalculationGrid, TotalGrid } from '../CheckOut.style'
import HaveCoupon from '../HaveCoupon'
import { getSubscriptionOrderCount } from '../functions/getSubscriptionOrderCount'
import PlaceOrder from './PlaceOrder'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import Skeleton from '@mui/material/Skeleton'
import { CustomTooltip } from '@/components/user-info/coupon/CustomCopyWithToolTip'
import { getToken } from '@/components/checkout-page/functions/getGuestUserId'



const OrderCalculation = (props) => {
    const {
        subscriptionStates,
        cartList,
        restaurantData,
        couponDiscount,
        taxAmount,
        distanceData,
        total_order_amount,
        global,
        orderType,
        couponInfo,
        deliveryTip,
        origin,
        destination,
        extraCharge,
        additionalCharge,
        usePartialPayment,
        walletBalance,
        totalAmount,
        placeOrder,
        orderLoading,
        offlinePaymentLoading,
        checkoutApisFetching,
        checked,
        offlineFormRef,
        page,
        paymentMethodDetails,
        cashbackAmount,
        extraPackagingCharge,
        distanceLoading,
        taxData,
        handleCouponDiscount,
        selectedDeliveryOption,
        proSavedAmount = 0,
        // Empty string falls back to the legacy "Pro User Discount" copy so
        // older call sites that don't pass this prop still render correctly.
        proSavedLabel = '',
        // Drives placement of the Pro savings row:
        //   'discount'     → after the Discount row
        //   'coupon'       → after the Voucher Discount row
        //   'delivery_fee' → after the Delivery fee row
        // Anything else (or missing) falls back to the delivery-fee slot so
        // legacy callers keep their old placement.
        proBenefitType = '',
        // Suppresses the Pro savings row when delivery_fee + full_free —
        // the Delivery row already shows "Free", so an extra "(-) amount"
        // line would double-count visually.
        proOfferType = '',
        // Normalized surge object from useGetSurgePrice ({ price,
        // price_type, name }) or null when no surge window is active.
        surgePrice = null,
        // Selected coverage area's charge (number) when the zone's
        // area/zip delivery rule is active, else null.
        coverageDeliveryCharge = null,
        // checkout-summary API objects — when present, `delivery` is the
        // fee authority (surge already folded into delivery_charge) and
        // `surge` carries the tooltip copy.
        checkoutSummaryDelivery = null,
        checkoutSummarySurge = null,
        discountEligibility = null,
    } = props
    const dispatch = useDispatch()
    const { couponType, zoneData } = useSelector(
        (state) => state.globalSettings
    )
    const { offLineWithPartial } = useSelector((state) => state.offlinePayment)
    const { userData } = useSelector((state) => state.user)
    const tempExtraCharge = extraCharge ?? 0
    const { t } = useTranslation()
    const [freeDelivery, setFreeDelivery] = useState('false')
    const theme = useTheme()
    const eligibilityDiscountAmount = discountEligibility?.is_qualified
        ? Number(discountEligibility.discount_amount) || 0
        : 0
    const isEligibilityDiscount = eligibilityDiscountAmount > 0
    const discountAmountToShow = isEligibilityDiscount
        ? eligibilityDiscountAmount
        : getProductDiscount(cartList)
    const discountSourceText =
        discountEligibility?.source === 'happy_hour'
            ? t('Happy Hour discount')
            : discountEligibility?.source === 'restaurant_discount'
            ? t('Restaurant discount')
            : ''

    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint

    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }

    const languageDirection = localStorage.getItem('direction')
    const subscriptionOrderCount = getSubscriptionOrderCount(
        restaurantData?.data?.schedules,
        subscriptionStates?.type,
        subscriptionStates?.startDate,
        subscriptionStates?.endDate,
        subscriptionStates?.days
    )
    // total product amount aftetr all discount
    const totalAmountForRefer = couponDiscount
        ? getSubTotalPrice(cartList) -
          discountAmountToShow -
          getCouponDiscount(couponDiscount, restaurantData, cartList)
        : getSubTotalPrice(cartList) - discountAmountToShow


    const referDiscount = getReferDiscount(
        totalAmountForRefer,
        userData?.discount_amount,
        userData?.discount_amount_type
    )

    const deliveryOptionSurcharge =
        orderType === 'delivery'
            ? Number(selectedDeliveryOption?.surcharge) || 0
            : 0

    const rawDeliveryFee = getDeliveryFees(
        restaurantData,
        global,
        cartList,
        distanceData,
        couponDiscount,
        couponType,
        orderType,
        zoneData,
        origin,
        destination,
        tempExtraCharge
    )
    // checkout-summary is the delivery-fee authority when present — its
    // delivery_charge already folds the surge in. The coverage/surge math
    // below stays only as the fallback for backends without the endpoint.
    const summaryFeeActive =
        checkoutSummaryDelivery != null && orderType === 'delivery'
    // Area/zip delivery rule (fallback path): the selected area's charge
    // replaces the distance-based fee. Only while a fee is actually payable
    // (rawDeliveryFee > 0), so every existing free-delivery path
    // (coupon / restaurant / Pro) stays free.
    const coverageOverrideActive =
        !summaryFeeActive &&
        coverageDeliveryCharge != null &&
        orderType === 'delivery' &&
        rawDeliveryFee > 0
    const baseDeliveryFee = summaryFeeActive
        ? Number(checkoutSummaryDelivery?.delivery_charge) || 0
        : coverageOverrideActive
          ? Number(coverageDeliveryCharge) || 0
          : rawDeliveryFee
    // Client-side surge only on the fallback path — the summary's charge
    // already contains surge_amount. Percentage surges scale the pre-surge
    // fee; anything else is a flat amount.
    const surgeAmount =
        !summaryFeeActive &&
        orderType === 'delivery' &&
        baseDeliveryFee > 0 &&
        surgePrice
            ? surgePrice?.price_type === 'percentage'
                ? (baseDeliveryFee * (Number(surgePrice?.price) || 0)) / 100
                : Number(surgePrice?.price) || 0
            : 0
    const baseTotalPrice = getCalculatedTotal(
        cartList,
        couponDiscount,
        restaurantData,
        global,
        distanceData,
        couponType,
        orderType,
        freeDelivery,
        deliveryTip || 0,
        zoneData,
        origin,
        destination,
        tempExtraCharge,
        global?.additional_charge_status != 0 ? additionalCharge : 0,
        extraPackagingCharge,
        referDiscount,
        taxData?.tax_status === 'excluded' ? taxData?.tax_amount : 0,
        discountAmountToShow,
        baseDeliveryFee
    )
    const totalPrice =
        baseTotalPrice +
        (couponDiscount?.coupon_type === 'free_delivery'
            ? 0
            : deliveryOptionSurcharge + surgeAmount)
    // The summary's `delivery_charge` is ALREADY net of the Pro saving
    // (original_delivery_charge - pro_customer_savings), and `totalPrice` above
    // is built from that net fee. So the benefit is surfaced here, on the fee
    // row, and must never also become a deducting "(-) Pro" savings row — that
    // would subtract a discount the fee has already had, undercharging the
    // order by the saving a second time.
    const proDeliverySavings = summaryFeeActive
        ? Number(checkoutSummaryDelivery?.pro_customer_savings) || 0
        : 0
    const originalDeliveryCharge = summaryFeeActive
        ? Number(checkoutSummaryDelivery?.original_delivery_charge) || 0
        : 0
    // Only claim a Pro reduction when the summary actually shows one: a saving
    // recorded AND an original above what is being charged.
    const showProDeliveryDiscount =
        proDeliverySavings > 0 && originalDeliveryCharge > baseDeliveryFee
    const proDeliveryDiscountTooltip = t(
        'Your Pro membership reduced this delivery fee.'
    )

    const handleDeliveryFee = () => {
        let price = baseDeliveryFee + surgeAmount
        // A Pro reduction states the fee at its full amount here and deducts
        // the saving on its own row below, so the rows still sum to the total.
        // That holds even when the reduction takes the fee to zero — showing
        // "Free" there would leave the deduction row with nothing to subtract
        // from and the breakdown would no longer add up.
        if (price === 0 && !showProDeliveryDiscount) {
            return <Typography variant="h4">{t('Free')}</Typography>
        } else {
            return (
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-end"
                    spacing={0.5}
                    width="100%"
                >
                    <Typography variant="h4">{'(+)'}</Typography>
                    <Typography variant="h4">
                        {restaurantData &&
                            getAmount(
                                showProDeliveryDiscount
                                    ? originalDeliveryCharge
                                    : price,
                                currencySymbolDirection,
                                currencySymbol,
                                digitAfterDecimalPoint
                            )}
                    </Typography>
                </Stack>
            )
        }
    }

    const isFullFreeDelivery =
        proBenefitType === 'delivery_fee' && proOfferType === 'full_free'
    // A Pro delivery-fee discount makes no sense when the fee row already
    // reads "Free" (zone/restaurant free delivery or a free-delivery
    // coupon) — neither the savings row nor the deduction may apply, or the
    // total would silently drop for a fee that was never charged.
    const deliveryFeeIsFree =
        couponDiscount?.coupon_type === 'free_delivery' ||
        baseDeliveryFee + surgeAmount <= 0
    // The summary nets the Pro saving into `delivery_charge` before sending it,
    // and `totalPrice` is built from that net fee — so on a delivery benefit the
    // saving is ALREADY deducted and must not come off the total a second time.
    // It is surfaced on the Delivery Fee Discount row instead. A cart `discount`
    // benefit is the opposite case: the client totals the cart itself, nothing
    // has been applied, and the deduction below is what makes it real.
    const proSavingAlreadyInFee = summaryFeeActive && proDeliverySavings > 0
    const effectiveProSavedAmount =
        proSavingAlreadyInFee ||
        (proBenefitType === 'delivery_fee' &&
            !isFullFreeDelivery &&
            deliveryFeeIsFree)
            ? 0
            : Number(proSavedAmount) || 0

    const handleOrderAmount = () => {
        let totalAmount = 0
        if (subscriptionOrderCount > 0) {
            totalAmount =
                truncate(totalPrice.toString(), digitAfterDecimalPoint) *
                subscriptionOrderCount
        } else {
            totalAmount = totalPrice
        }
        const proDiscount = effectiveProSavedAmount
        const totalAfterPro = Math.max(0, totalAmount - proDiscount)

        dispatch(setTotalAmount(totalAfterPro))
        return getAmount(
            userData?.is_valid_for_discount
                ? totalAfterPro - referDiscount
                : totalAfterPro,
            currencySymbolDirection,
            currencySymbol,
            digitAfterDecimalPoint
        )
    }

    // Mirrors handleOrderAmount()'s arithmetic (without the setTotalAmount
    // dispatch) so the mobile sticky bar can show the same payable/original
    // amounts without re-triggering that side effect.
    const originalAmountRaw =
        subscriptionOrderCount > 0
            ? truncate(totalPrice.toString(), digitAfterDecimalPoint) *
              subscriptionOrderCount
            : totalPrice
    const payableAmountRaw = (() => {
        const totalAfterPro = Math.max(
            0,
            originalAmountRaw - effectiveProSavedAmount
        )
        return userData?.is_valid_for_discount
            ? totalAfterPro - referDiscount
            : totalAfterPro
    })()

    const proSavedAmountNumber = Number(proSavedAmount) || 0

    const renderProSavingsRow = () =>
        effectiveProSavedAmount > 0 && !isFullFreeDelivery ? (
            <>
                <Grid item md={8} xs={8}>
                    {proSavedLabel || t('Pro User Discount')}
                </Grid>
                <Grid item md={4} xs={4} align="right">
                    <Stack
                        width="100%"
                        direction="row"
                        alignItems="center"
                        justifyContent="flex-end"
                        spacing={0.5}
                    >
                        <Typography variant="h4">{'(-)'}</Typography>
                        <Typography variant="h4">
                            {getAmount(
                                proSavedAmount,
                                currencySymbolDirection,
                                currencySymbol,
                                digitAfterDecimalPoint
                            )}
                        </Typography>
                    </Stack>
                </Grid>
            </>
        ) : null

    const handleOrderAmountWithoutSubscription = () => {
        const proDiscount = effectiveProSavedAmount
        return getAmount(
            Math.max(0, totalPrice - proDiscount),
            currencySymbolDirection,
            currencySymbol,
            digitAfterDecimalPoint
        )
    }

    useEffect(() => {
        if (subscriptionStates?.order === '1') {
            dispatch(
                setSubscriptionSubTotal(handleOrderAmountWithoutSubscription())
            )
        }
    }, [subscriptionStates])
    const totalAmountAfterPartial = totalPrice - walletBalance

    const vat = t('VAT/TAX')
    // Tooltip is informational only: it shows when there is actually
    // something folded into the fee to explain (extra vehicle charge and/or
    // surge), and never on a free delivery. Surge shows its amount and the
    // admin's customer note — never the internal surge title.
    const tooltipSurgeAmount = summaryFeeActive
        ? Number(checkoutSummaryDelivery?.surge_amount) || 0
        : surgeAmount
    const tooltipSurgeNote =
        summaryFeeActive && checkoutSummarySurge?.customer_note
            ? checkoutSummarySurge.customer_note
            : null
    const deliveryTooltipParts = []
    if (Number(tempExtraCharge) > 0) {
        deliveryTooltipParts.push(
            `${t('This charge includes extra vehicle charge')} ${getAmount(
                tempExtraCharge,
                currencySymbolDirection,
                currencySymbol,
                digitAfterDecimalPoint
            )}`
        )
    }
    if (tooltipSurgeAmount > 0) {
        deliveryTooltipParts.push(
            `${
                deliveryTooltipParts.length > 0
                    ? t('and surge charge')
                    : t('Surge charge')
            } ${getAmount(
                tooltipSurgeAmount,
                currencySymbolDirection,
                currencySymbol,
                digitAfterDecimalPoint
            )}${tooltipSurgeNote ? ` — ${tooltipSurgeNote}` : ''}`
        )
    }
    const deliveryToolTipsText = deliveryTooltipParts.join(' ')
    const showDeliveryFeeTooltip =
        deliveryTooltipParts.length > 0 &&
        baseDeliveryFee + surgeAmount > 0 &&
        couponDiscount?.coupon_type !== 'free_delivery' &&
        !(
            isFullFreeDelivery &&
            proSavedAmountNumber > 0 &&
            baseDeliveryFee + surgeAmount <= 0
        )

    return (
        <>
            <CalculationGrid id="order-calculation-card" container md={12} xs={12} spacing={1}>
                <Grid item md={8} xs={8}>
                    {subscriptionOrderCount > 0 ? (
                        <>
                            {t('Items price')}

                        </>
                    ) : (
                        <>
                           {t('Subtotal')}
                            {taxData?.tax_included === 1 && taxData?.tax_included !== null && taxData?.tax_amount>0 && (
                                <Typography
                                    fontSize="12px"
                                    sx={{ marginInlineStart: '5px' }}
                                    color="primary"
                                    component="span"
                                >
                                    {t('(Vat/Tax incl.)')}
                                </Typography>
                            )}
                        </>

                    )}
                </Grid>

                <Grid
                    item
                    md={4}
                    xs={4}
                    align={languageDirection === 'rtl' ? 'left' : 'right'}
                >
                    <Typography variant="h4">
                        {getAmount(
                            getSubTotalPrice(cartList),
                            currencySymbolDirection,
                            currencySymbol,
                            digitAfterDecimalPoint
                        )}
                    </Typography>
                </Grid>
                <Grid item md={8} xs={8}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                    >
                        <Typography component="span">
                            {t('Discount')}
                        </Typography>
                        {isEligibilityDiscount && discountSourceText && (
                            <Tooltip
                                title={discountSourceText}
                                placement="top"
                                arrow
                            >
                                <Box
                                    component="i"
                                    className="fi fi-br-info"
                                    sx={{
                                        fontSize: '14px',
                                        lineHeight: 1,
                                        display: 'flex',
                                        color: 'text.primary',
                                        cursor: 'pointer',
                                    }}
                                />
                            </Tooltip>
                        )}
                    </Stack>
                </Grid>
                <Grid item md={4} xs={4} align="right">
                    <Stack
                        width="100%"
                        direction="row"
                        alignItems="center"
                        justifyContent="flex-end"
                        spacing={0.5}
                    >
                        <Typography variant="h4">{'(-)'}</Typography>
                        <Typography variant="h4">
                            {restaurantData &&
                                getAmount(
                                    discountAmountToShow,
                                    currencySymbolDirection,
                                    currencySymbol,
                                    digitAfterDecimalPoint
                                )}
                        </Typography>
                    </Stack>
                </Grid>
                {proBenefitType === 'discount' && renderProSavingsRow()}
                {couponDiscount ? (
                    <>
                        <Grid item md={8} xs={8}>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.75}
                                flexWrap="wrap"
                            >
                                <span>{t('Voucher Discount')}</span>
                                {couponDiscount?.coupon_type ===
                                'pro_customer' ? (
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        sx={{
                                            px: 0.75,
                                            py: 0.25,
                                            borderRadius: '4px',
                                            background:
                                                'linear-gradient(90deg, #A78BFA 0%, #8B5CF6 100%)',
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: '10px',
                                                fontWeight: 600,
                                                color: '#fff',
                                                letterSpacing: '0.3px',
                                            }}
                                        >
                                            {t('Pro Customer')}
                                        </Typography>
                                    </Stack>
                                ) : null}
                            </Stack>
                        </Grid>
                        <Grid item md={4} xs={4} align="right">
                            {couponDiscount.coupon_type === 'free_delivery' ? (
                                <Typography variant="h4" fontWeight="600">
                                    {t('Free Delivery')}
                                </Typography>
                            ) : (
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="flex-end"
                                    spacing={0.5}
                                >
                                    <Typography variant="h4">
                                        {'(-)'}
                                    </Typography>
                                    <Typography variant="h4">
                                        {restaurantData &&
                                            cartList &&
                                            handleCouponDiscount()}
                                    </Typography>
                                </Stack>
                            )}
                        </Grid>
                    </>
                ) : null}
                {proBenefitType === 'coupon' && renderProSavingsRow()}
                {referDiscount ? (
                    <>
                        <Grid item md={8} xs={8}>
                            {t('Referral Discount')}
                        </Grid>
                        <Grid item md={4} xs={4} align="right">
                            <Typography fontWeight="700">
                                (-){' '}
                                {getAmount(
                                    referDiscount,
                                    currencySymbolDirection,
                                    currencySymbol,
                                    digitAfterDecimalPoint
                                )}
                            </Typography>
                        </Grid>
                    </>
                ) : null}
                {taxData?.tax_status==="excluded" && taxData?.tax_amount>0  ? (
                    <>
                        <Grid item md={8} xs={8}>
                            {`${vat}`}
                        </Grid>
                        <Grid item md={4} xs={4} align="right">
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="flex-end"
                                spacing={0.5}
                            >
                                <Typography variant="h4">
                                    {'(+)'}
                                </Typography>
                                <Typography variant="h4">
                                    {getAmount(
                                       taxData?.tax_amount,
                                        currencySymbolDirection,
                                        currencySymbol,
                                        digitAfterDecimalPoint
                                    )}
                                </Typography>
                            </Stack>
                        </Grid>
                    </>
                ) : null}
                {Number.parseInt(global?.dm_tips_status) === 1 &&
                orderType !== 'dine_in' &&
                orderType !== 'take_away' &&
                deliveryTip > 0 ? (
                    <>
                        <Grid item md={8} xs={8}>
                            {t('Deliveryman tips')}
                        </Grid>
                        <Grid item md={4} xs={4} align="right">
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="flex-end"
                                spacing={0.5}
                            >
                                <Typography variant="h4">{'(+)'}</Typography>
                                <Typography variant="h4">
                                    {getAmount(
                                        deliveryTip,
                                        currencySymbolDirection,
                                        currencySymbol,
                                        digitAfterDecimalPoint
                                    )}
                                </Typography>
                            </Stack>
                        </Grid>
                    </>
                ) : null}

                {Number.parseInt(global?.additional_charge_status) === 1 ? (
                    <>
                        <Grid item md={8} xs={8}>
                            {t(global?.additional_charge_name)}
                        </Grid>
                        <Grid item md={4} xs={4} align="right">
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="flex-end"
                                spacing={0.5}
                            >
                                <Typography variant="h4">{'(+)'}</Typography>
                                <Typography variant="h4">
                                    {getAmount(
                                        global?.additional_charge,
                                        currencySymbolDirection,
                                        currencySymbol,
                                        digitAfterDecimalPoint
                                    )}
                                </Typography>
                            </Stack>
                        </Grid>
                    </>
                ) : null}

                {restaurantData?.data?.is_extra_packaging_active &&
                    extraPackagingCharge > 0 && (
                        <>
                            <Grid item md={8} xs={8}>
                                {t('Extra Packaging Charge')}
                            </Grid>
                            <Grid item md={4} xs={4} align="end">
                                <Typography fontWeight="700">
                                    (+){' '}
                                    {getAmount(
                                        extraPackagingCharge,
                                        currencySymbolDirection,
                                        currencySymbol,
                                        digitAfterDecimalPoint
                                    )}
                                </Typography>
                            </Grid>
                        </>
                    )}

                {orderType !== 'dine_in' && orderType !== 'take_away' && (
                    <>
                        <Grid item md={8} xs={8}>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                            >
                                <Typography
                                    component="span"
                                    align="center"
                                    color={theme.palette.neutral[1000]}
                                    fontSize="15px"
                                >
                                    {t('Delivery fee')}
                                </Typography>
                                {showDeliveryFeeTooltip &&
                                    Number.parseInt(
                                        restaurantData?.data
                                            ?.self_delivery_system
                                    ) !== 1 && (
                                    <Tooltip
                                        title={deliveryToolTipsText}
                                        placement="top"
                                        arrow
                                    >
                                        <Box
                                            component="i"
                                            className="fi fi-br-info"
                                            sx={{
                                                fontSize: '14px',
                                                lineHeight: 1,
                                                display: 'flex',
                                                color: theme.palette
                                                    .neutral[1000],
                                                cursor: 'pointer',
                                            }}
                                        />
                                    </Tooltip>
                                )}
                            </Stack>
                        </Grid>
                        <Grid item md={4} xs={4} align="right">
                            {!distanceLoading ? (
                                <>
                                    {orderType === 'delivery' ? (
                                        isFullFreeDelivery &&
                                        proSavedAmountNumber > 0 &&
                                        // `isFullFreeDelivery` comes from the
                                        // pro-active-offer API, which can
                                        // disagree with the summary. Never
                                        // print "Free" over a fee the summary
                                        // says is payable.
                                        !showProDeliveryDiscount &&
                                        baseDeliveryFee + surgeAmount <= 0 ? (
                                            // Pro "full_free" delivery is
                                            // active and applied — surface it
                                            // here so the user sees the benefit
                                            // even though the dedicated Pro
                                            // savings row is suppressed to
                                            // avoid double-counting.
                                            <Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="flex-end"
                                                spacing={0.5}
                                            >
                                                <Typography
                                                    fontWeight="700"
                                                    color="success.main"
                                                >
                                                    {t('Free')}
                                                </Typography>
                                                <Typography
                                                    fontSize="11px"
                                                    fontWeight={600}
                                                    color="success.main"
                                                >
                                                    ({t('Pro')})
                                                </Typography>
                                            </Stack>
                                        ) : couponDiscount ? (
                                            couponDiscount?.coupon_type ===
                                            'free_delivery' ? (
                                                <Typography fontWeight="700">
                                                    {t('Free')}
                                                </Typography>
                                            ) : (
                                                restaurantData &&
                                                handleDeliveryFee()
                                            )
                                        ) : (
                                            restaurantData &&
                                            handleDeliveryFee()
                                        )
                                    ) : (
                                        <Typography fontWeight="700">
                                            {t('Free')}
                                        </Typography>
                                    )}
                                </>
                            ) : (
                                <Skeleton variant="text" width="50px" />
                            )}
                        </Grid>
                    </>
                )}

                {/* Never alongside the dedicated Delivery Fee Discount row
                    below: that row deducts a saving the summary's
                    `delivery_charge` has already applied, whereas this one also
                    subtracts from the total. Showing both would list the
                    discount twice and undercharge the order. */}
                {!showProDeliveryDiscount &&
                    (proBenefitType === 'delivery_fee' ||
                        (proBenefitType !== 'discount' &&
                            proBenefitType !== 'coupon')) &&
                    renderProSavingsRow()}

                {showProDeliveryDiscount && (
                    <>
                        <Grid item md={8} xs={8}>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                            >
                                <Typography
                                    component="span"
                                    color={theme.palette.neutral[1000]}
                                    fontSize="15px"
                                >
                                    {t('Delivery Fee Discount')} ({t('pro')})
                                </Typography>
                                <Tooltip
                                    title={proDeliveryDiscountTooltip}
                                    placement="top"
                                    arrow
                                >
                                    <Box
                                        component="i"
                                        className="fi fi-br-info"
                                        sx={{
                                            fontSize: '14px',
                                            lineHeight: 1,
                                            display: 'flex',
                                            color: theme.palette.neutral[1000],
                                            cursor: 'pointer',
                                        }}
                                    />
                                </Tooltip>
                            </Stack>
                        </Grid>
                        <Grid item md={4} xs={4} align="right">
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="flex-end"
                                spacing={0.5}
                            >
                                <Typography variant="h4">{'(-)'}</Typography>
                                <Typography variant="h4">
                                    {getAmount(
                                        proDeliverySavings,
                                        currencySymbolDirection,
                                        currencySymbol,
                                        digitAfterDecimalPoint
                                    )}
                                </Typography>
                            </Stack>
                        </Grid>
                    </>
                )}

                {selectedDeliveryOption &&
                    selectedDeliveryOption.deliveryType !== 'standard' &&
                    orderType === 'delivery' &&
                    couponDiscount?.coupon_type !== 'free_delivery' &&
                    deliveryOptionSurcharge !== 0 && (
                        <>
                            <Grid item md={8} xs={8}>
                                <Typography
                                    component="span"
                                    color={theme.palette.neutral[1000]}
                                    fontSize="15px"
                                >
                                    {selectedDeliveryOption.deliveryType === 'express'
                                        ? t('Express Delivery')
                                        : t('Slightly Delay Delivery')}{' '}
                                </Typography>
                            </Grid>
                            <Grid item md={4} xs={4} align="right">
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="flex-end"
                                    spacing={0.5}
                                >
                                    <Typography variant="h4">
                                        {selectedDeliveryOption.deliveryType === 'express'
                                            ? '(+)'
                                            : '(-)'}
                                    </Typography>
                                    <Typography variant="h4">
                                        {getAmount(
                                            Math.abs(deliveryOptionSurcharge),
                                            currencySymbolDirection,
                                            currencySymbol,
                                            digitAfterDecimalPoint
                                        )}
                                    </Typography>
                                </Stack>
                            </Grid>
                        </>
                    )}

                <CustomDivider />
                {subscriptionOrderCount > 0 && (
                    <>
                        <TotalGrid container md={12} xs={12} mt="1rem">
                            <Grid item md={8} xs={8} pl=".5rem">
                                <Typography>{t('Subtotal')}</Typography>
                            </Grid>
                            <Grid
                                item
                                md={4}
                                xs={4}
                                align={
                                    languageDirection === 'rtl'
                                        ? 'left'
                                        : 'right'
                                }
                            >
                                <Typography>
                                    {restaurantData &&
                                        cartList &&
                                        handleOrderAmountWithoutSubscription()}
                                </Typography>
                            </Grid>
                        </TotalGrid>
                        <Grid item md={8} xs={8}>
                            <Typography color={theme.palette.primary.main}>
                                {t('Subscription Order Count')}
                            </Typography>
                        </Grid>
                        <Grid
                            item
                            md={4}
                            xs={4}
                            align={
                                languageDirection === 'rtl' ? 'left' : 'right'
                            }
                        >
                            <Typography variant="h4">
                                {getSubscriptionOrderCount(
                                    restaurantData?.data?.schedules,
                                    subscriptionStates.type,
                                    subscriptionStates.startDate,
                                    subscriptionStates.endDate,
                                    subscriptionStates.days
                                )}
                            </Typography>
                        </Grid>
                        <CustomDivider />
                    </>
                )}

                <TotalGrid
                    container
                    md={12}
                    xs={12}
                    mt="1rem"
                    sx={{ display: { xs: 'flex', sm: 'none' } }}
                >
                    <Grid item md={8} xs={8} pl=".5rem">
                        <Typography color={theme.palette.primary.main}>
                            {t('Total')}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        md={4}
                        xs={4}
                        align={languageDirection === 'rtl' ? 'left' : 'right'}
                    >
                        {!distanceLoading ? (
                            <Typography color={theme.palette.primary.main}>
                                {restaurantData &&
                                    cartList &&
                                    handleOrderAmount()}
                            </Typography>
                        ) : (
                            <Skeleton variant="text" width="50px" />
                        )}
                    </Grid>
                </TotalGrid>
                {(usePartialPayment || offLineWithPartial) &&
                totalAmount > walletBalance &&
                subscriptionStates?.order !== '1' ? (
                    <>
                        <Grid item md={8} xs={8}>
                            {t('Paid by wallet')}
                        </Grid>
                        <Grid item md={4} xs={4} align="right">
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="flex-end"
                                spacing={0.5}
                            >
                                <Typography>{'(-)'}</Typography>
                                <Typography>
                                    {getAmount(
                                        walletBalance,
                                        currencySymbolDirection,
                                        currencySymbol,
                                        digitAfterDecimalPoint
                                    )}
                                </Typography>
                            </Stack>
                        </Grid>
                    </>
                ) : null}
                {(usePartialPayment || offLineWithPartial) &&
                totalAmount > walletBalance &&
                subscriptionStates?.order !== '1' ? (
                    <>
                        <Grid item md={8} xs={8}>
                            {t('Due Payment')}
                        </Grid>
                        <Grid item md={4} xs={4} align="right">
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="flex-end"
                                spacing={0.5}
                            >
                                <Typography>
                                    {getAmount(
                                        totalAmountAfterPartial,
                                        currencySymbolDirection,
                                        currencySymbol,
                                        digitAfterDecimalPoint
                                    )}
                                </Typography>
                            </Stack>
                        </Grid>
                    </>
                ) : null}
                {cashbackAmount?.cashback_amount > 0 ? (
                    <Grid item xs={12}>
                        <Box
                            padding={'0.5rem'}
                            paddingInlineStart={'0.7rem'}
                            backgroundColor={alpha(
                                theme.palette.primary.main,
                                0.051
                            )}
                            fontSize={{ xs: '0.8rem' }}
                            sx={{
                                borderStyle: 'solid',
                                borderWidth: '0',
                                borderLeftWidth:
                                    theme.direction !== 'rtl' ? '2px' : '',
                                borderRightWidth:
                                    theme.direction === 'rtl' ? '2px' : '',
                                borderColor: `${theme.palette.primary.main}`,
                                borderRadius:
                                    theme.direction != 'rtl'
                                        ? '0 4px 4px 0'
                                        : '4px 0 0 4px',
                            }}
                        >
                            {`${t(
                                'After completing the order, you will receive a'
                            )} ${
                                cashbackAmount?.cashback_type === 'percentage'
                                    ? cashbackAmount?.cashback_amount + '%'
                                    : getAmount(
                                          cashbackAmount?.cashback_amount,
                                          currencySymbolDirection,
                                          currencySymbol,
                                          digitAfterDecimalPoint
                                      )
                            } ${t('cashback')}.`}
                        </Box>
                    </Grid>
                ) : (
                    ''
                )}
                <Grid xs={12} md={12}>
                    <PlaceOrder
                        usePartialPayment={usePartialPayment}
                        placeOrder={placeOrder}
                        orderLoading={orderLoading}
                        checked={checked}
                        offlinePaymentLoading={offlinePaymentLoading}
                        checkoutApisFetching={checkoutApisFetching}
                        offlineFormRef={offlineFormRef}
                        page={page}
                        paymentMethodDetails={paymentMethodDetails}
                        distanceLoading={distanceLoading}
                        restaurantReady={Boolean(restaurantData?.data)}
                        payableAmount={
                            restaurantData && cartList && !distanceLoading
                                ? payableAmountRaw
                                : null
                        }
                        originalAmount={
                            originalAmountRaw > payableAmountRaw
                                ? originalAmountRaw
                                : null
                        }
                        currencySymbol={currencySymbol}
                        currencySymbolDirection={currencySymbolDirection}
                        digitAfterDecimalPoint={digitAfterDecimalPoint}
                    />
                </Grid>
            </CalculationGrid>
        </>
    )
}

OrderCalculation.propTypes = {}

export default OrderCalculation
