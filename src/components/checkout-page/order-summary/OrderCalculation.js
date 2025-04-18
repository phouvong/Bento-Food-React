import { onSingleErrorResponse } from '@/components/ErrorResponse'
import { CouponApi } from '@/hooks/react-query/config/couponApi'
import { setSubscriptionSubTotal, setTotalAmount } from '@/redux/slices/cart'
import { setCouponType } from '@/redux/slices/global'
import {
    bad_weather_fees,
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
import InfoIcon from '@mui/icons-material/Info'

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
        checked,
        setCouponDiscount,
        counponRemove,
        offlineFormRef,
        page,
        paymentMethodDetails,
        cashbackAmount,
        extraPackagingCharge,
        distanceLoading,
    } = props
    const dispatch = useDispatch()
    const { couponType, zoneData } = useSelector(
        (state) => state.globalSettings
    )
    const [couponCode, setCouponCode] = useState(null)
    const { offLineWithPartial } = useSelector((state) => state.offlinePayment)
    const { userData } = useSelector((state) => state.user)
    const { token } = useSelector((state) => state.userToken)
    const tempExtraCharge = extraCharge ?? 0
    const { t } = useTranslation()
    const [freeDelivery, setFreeDelivery] = useState('false')
    const [anchorEl, setAnchorEl] = useState(null)
    const theme = useTheme()

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
          getProductDiscount(cartList, restaurantData) -
          getCouponDiscount(couponDiscount, restaurantData, cartList)
        : getSubTotalPrice(cartList) -
          getProductDiscount(cartList, restaurantData)

    const referDiscount = getReferDiscount(
        totalAmountForRefer,
        userData?.discount_amount,
        userData?.discount_amount_type
    )

    const totalPrice = getCalculatedTotal(
        cartList,
        couponDiscount,
        restaurantData,
        global,
        distanceData,
        couponType,
        orderType,
        freeDelivery,
        deliveryTip,
        zoneData,
        origin,
        destination,
        tempExtraCharge,
        global?.additional_charge_status != 0 ? additionalCharge : 0,
        extraPackagingCharge,
        referDiscount
    )

    const handleDeliveryFee = () => {
        let price = getDeliveryFees(
            restaurantData,
            global,
            cartList,
            distanceData?.data,
            couponDiscount,
            couponType,
            orderType,
            zoneData,
            origin,
            destination,
            tempExtraCharge
        )
        if (price === 0) {
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
                                price,
                                currencySymbolDirection,
                                currencySymbol,
                                digitAfterDecimalPoint
                            )}
                    </Typography>
                </Stack>
            )
        }
    }
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

    const handleOrderAmount = () => {
        let totalAmount = 0
        if (subscriptionOrderCount > 0) {
            totalAmount =
                truncate(totalPrice.toString(), digitAfterDecimalPoint) *
                subscriptionOrderCount
        } else {
            totalAmount = totalPrice
        }

        dispatch(setTotalAmount(totalAmount))
        return getAmount(
            userData?.is_valid_for_discount
                ? totalAmount - referDiscount
                : totalAmount,
            currencySymbolDirection,
            currencySymbol,
            digitAfterDecimalPoint
        )
    }

    const handleOrderAmountWithoutSubscription = () => {
        return getAmount(
            totalPrice,
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
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }
    const { isLoading, data, isError, error, refetch } = useQuery(
        ['coupon-list'],
        CouponApi.couponList,
        {
            enabled: !!token,
            retry: 1,
            onError: onSingleErrorResponse,
        }
    )
    const getCouponCodeFromCard = (value) => {
        setCouponCode(value)
        handleClose()
    }
    const restaurantChargeInfo = zoneData?.find(
        (item) =>
            Number.parseInt(item.id) ===
            Number.parseInt(restaurantData?.data?.zone_id)
    )
    const extraText = t('This charge includes extra vehicle charge')
    const badText = t('and bad weather charge')
    const deliveryToolTipsText = `${extraText} ${getAmount(
        tempExtraCharge,
        currencySymbolDirection,
        currencySymbol,
        digitAfterDecimalPoint
    )}${
        bad_weather_fees !== 0
            ? ` ${badText} ${getAmount(
                  bad_weather_fees,
                  currencySymbolDirection,
                  currencySymbol,
                  digitAfterDecimalPoint
              )}`
            : ''
    }`

    return (
        <>
            <CalculationGrid container md={12} xs={12} spacing={1}>
                <Grid item md={8} xs={8}>
                    {subscriptionOrderCount > 0
                        ? t('Items price')
                        : t('Subtotal')}
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
                    {t('Discount')}
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
                                    getProductDiscount(
                                        cartList,
                                        restaurantData
                                    ),
                                    currencySymbolDirection,
                                    currencySymbol,
                                    digitAfterDecimalPoint
                                )}
                        </Typography>
                    </Stack>
                </Grid>
                {couponDiscount ? (
                    <>
                        <Grid item md={8} xs={8}>
                            {t('Voucher Discount')}
                        </Grid>
                        <Grid item md={4} xs={4} align="right">
                            {couponDiscount.coupon_type === 'free_delivery' ? (
                                <p>{t('Free Delivery')}</p>
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
                {restaurantData?.data?.tax ? (
                    <>
                        <Grid item md={8} xs={8}>
                            {`${vat} (${restaurantData?.data?.tax}% ${
                                global?.tax_included === 1
                                    ? t('Included')
                                    : t('Excluded')
                            })`}
                        </Grid>
                        <Grid item md={4} xs={4} align="right">
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="flex-end"
                                spacing={0.5}
                            >
                                <Typography variant="h4">
                                    {global?.tax_included === 1 ? '' : '(+)'}
                                </Typography>
                                <Typography variant="h4">
                                    {getAmount(
                                        getTaxableTotalPrice(
                                            cartList,
                                            couponDiscount,
                                            restaurantData,
                                            referDiscount
                                        ),
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
                            <Typography
                                component="span"
                                align="center"
                                color={theme.palette.neutral[1000]}
                                fontSize="15px"
                            >
                                {t('Delivery fee')}
                                {Number.parseInt(
                                    restaurantData?.data?.self_delivery_system
                                ) !== 1 && (
                                    <Typography component="span">
                                        <Tooltip
                                            title={deliveryToolTipsText}
                                            placement="top"
                                            arrow
                                        >
                                            {' '}
                                            <InfoIcon
                                                sx={{ fontSize: '11px' }}
                                            />
                                        </Tooltip>
                                    </Typography>
                                )}
                            </Typography>
                        </Grid>
                        <Grid item md={4} xs={4} align="right">
                            {!distanceLoading ? (
                                <>
                                    {orderType === 'delivery' ? (
                                        couponDiscount ? (
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

                {token && (
                    <Grid item md={12} xs={12} marginTop="5px">
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Typography
                                fontSize="14px"
                                fontWeight="600"
                                color={theme.palette.neutral[1000]}
                            >
                                {t('Promo Code')}
                            </Typography>
                            <Button
                                endIcon={
                                    <AddIcon
                                        style={{
                                            fontSize: '18px',
                                            fontWeight: '700',
                                        }}
                                    />
                                }
                                onClick={handleClick}
                            >
                                {t('Add Voucher')}
                            </Button>
                        </Stack>
                    </Grid>
                )}
                <Grid item md={12} xs={12} marginBottom="1rem">
                    {restaurantData?.data && token && (
                        <HaveCoupon
                            restaurant_id={restaurantData?.data?.id}
                            setCouponDiscount={setCouponDiscount}
                            counponRemove={counponRemove}
                            couponDiscount={couponDiscount}
                            cartList={cartList}
                            total_order_amount={total_order_amount}
                            setCouponCode={setCouponCode}
                            couponCode={couponCode}
                            data={data}
                            anchorEl={anchorEl}
                            setAnchorEl={setAnchorEl}
                            handleClose={handleClose}
                        />
                    )}
                </Grid>
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

                <TotalGrid container md={12} xs={12} mt="1rem">
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
                <Grid md={12}>
                    <PlaceOrder
                        usePartialPayment={usePartialPayment}
                        placeOrder={placeOrder}
                        orderLoading={orderLoading}
                        checked={checked}
                        offlinePaymentLoading={offlinePaymentLoading}
                        offlineFormRef={offlineFormRef}
                        page={page}
                        paymentMethodDetails={paymentMethodDetails}
                        distanceLoading={distanceLoading}
                    />
                </Grid>
            </CalculationGrid>
        </>
    )
}

OrderCalculation.propTypes = {}

export default OrderCalculation
