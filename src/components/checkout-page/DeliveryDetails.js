import React from 'react'
import { DeliveryCaption, DeliveryTitle } from './CheckOut.style'
import { useTranslation } from 'react-i18next'
import FormControl from '@mui/material/FormControl'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import DeliveryAddress from './DeliveryAddress'
import {
    CustomPaperBigCard,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import OrderType from './order-type'
import AdditionalAddresses from './AdditionalAddresses'
import { Box, Typography } from '@mui/material'
import CheckoutSelectedAddressGuest from './guest-user/CheckoutSelectedAddressGuest'
import { getToken } from './functions/getGuestUserId'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
const DeliveryDetails = (props) => {
    const {
        global,
        restaurantData,
        setOrderType,
        orderType,
        setAddress,
        address,
        subscriptionStates,
        subscriptionDispatch,
        page,
        additionalInformationStates,
        additionalInformationDispatch,
        setDeliveryTip,
        setPaymenMethod,
        setPaymentMethodDetails,
        setUsePartialPayment,
        setSwitchToWallet,
        token,
        zoneData,
        setSelectedDeliveryOption,
        deliveryFee,
        couponDiscount
    } = props

    const { t } = useTranslation()
    const [selectedDeliverySpeed, setSelectedDeliverySpeed] =
        React.useState(null)
    const handleChange = (e) => {
        if (e.target.value === 'take_away') {
            setDeliveryTip(0)
        }
        if (e.target.value !== 'delivery') {
            setSelectedDeliverySpeed(null)
            setSelectedDeliveryOption?.(null)
        }
        setOrderType(e.target.value)
    }
    const currencySymbol = global?.currency_symbol || '$'
    const currencySymbolDirection = global?.currency_symbol_direction || 'left'
    const digitAfterDecimalPoint =
        Number.parseInt(global?.digit_after_decimal_point, 10) || 2
    const restaurantChargeInfo = zoneData?.find(
        (item) =>
            Number.parseInt(item.id) ===
            Number.parseInt(restaurantData?.data?.zone_id)
    )
    const deliveryTypeLabels = {
        standard: t('Standard Delivery'),
        express: t('Express Delivery'),
        slightly_delay: t('Slightly Delay Delivery'),
    }
  

const restaurantDeliveryTime =
    restaurantData?.data?.delivery_time?.toString() || ''

const restaurantDeliveryTimeValues =
    restaurantDeliveryTime.match(/\d+(?:\.\d+)?/g)?.map((value) => Number.parseFloat(value)) || [0]

const normalizeTimeUnit = (unit) => {
    const normalizedUnit = unit?.toString()?.toLowerCase?.() || ''
    if (['minute', 'minutes', 'min', 'mins'].includes(normalizedUnit)) {
        return 'min'
    }
    if (['hour', 'hours', 'hr', 'hrs'].includes(normalizedUnit)) {
        return 'hour'
    }
    return normalizedUnit
}

const parseUnitFromText = (value) => {
    const normalizedText = value?.toString()?.toLowerCase?.() || ''
    if (/(^|[\s-])(hour|hours|hr|hrs)([\s-]|$)/.test(normalizedText)) {
        return 'hour'
    }
    if (/(^|[\s-])(minute|minutes|min|mins)([\s-]|$)/.test(normalizedText)) {
        return 'min'
    }
    return ''
}

const convertTimeToMinutes = (value, unit) => {
    const numericValue = Number(value) || 0
    return normalizeTimeUnit(unit) === 'hour'
        ? Math.round(numericValue * 60)
        : Math.round(numericValue)
}

const minimumDeliveryUnit = normalizeTimeUnit(
    restaurantChargeInfo?.minimum_delivery_time?.unit || 'min'
)

const restaurantDeliveryUnit =
    parseUnitFromText(restaurantDeliveryTime) || 'min'

const restaurantDeliveryMinTime = convertTimeToMinutes(
    restaurantDeliveryTimeValues[0] || 0,
    restaurantDeliveryUnit
)

const restaurantDeliveryMaxTime = convertTimeToMinutes(
    restaurantDeliveryTimeValues.length > 1
        ? restaurantDeliveryTimeValues[1]
        : restaurantDeliveryTimeValues[0] || 0,
    restaurantDeliveryUnit
)

const minimumDeliveryTime =
    convertTimeToMinutes(
        restaurantChargeInfo?.minimum_delivery_time?.value,
        minimumDeliveryUnit
    ) || 0

const getSlidTime = (value) => {
    if (value >= 60) {
        const h = Math.floor(value / 60)
        const m = value % 60

        if (m === 0) {
            return `${h} hr`
        }

        return `${h} hr ${m} min`
    }

    return `${value} min`
}

const formatDeliveryTime = (minTime, maxTime, t = (key) => key) => {
    let left = getSlidTime(minTime)
    let right = getSlidTime(maxTime)

    const isLeftContainMin = left.includes('min')
    const isRightContainMin = right.includes('min')
    const isLeftContainHour = left.includes('hr')
    const isRightContainHour = right.includes('hr')

    if (
        isLeftContainMin &&
        isRightContainMin &&
        !isLeftContainHour &&
        !isRightContainHour
    ) {
        left = left.replace(' min', '')
        right = right.replace(' min', '')

        if (left === right) {
            return `(${t('upto')} ${left} min)`
        }

        return `(${left} - ${right}) min`
    }

    if (
        !isLeftContainMin &&
        !isRightContainMin &&
        isLeftContainHour &&
        isRightContainHour
    ) {
        left = left.replace(' hr', '')
        right = right.replace(' hr', '')

        if (left === right) {
            return `(${t('upto')} ${left} hr)`
        }

        return `(${left} - ${right}) hr`
    }

    if (left === right) {
        return `(${t('upto')} ${left})`
    }

    return `(${left} - ${right})`
}

const finalizeDeliveryTime = (
    storeDeliveryTime,
    deliveryOption,
    minimumDeliveryTime,
    t = (key) => key
) => {
    let time = ''

    if (storeDeliveryTime?.length > 0) {
        let minTime = 0
        let maxTime = 0

        try {
            const timeUnit =
                parseUnitFromText(storeDeliveryTime) || 'min'
            const timeList =
                storeDeliveryTime.match(/\d+(?:\.\d+)?/g)?.map((v) => Number(v)) || [0, 0]

            minTime = convertTimeToMinutes(timeList[0] || 0, timeUnit)
            maxTime = convertTimeToMinutes(
                timeList.length > 1 ? timeList[1] : timeList[0] || 0,
                timeUnit
            )

            let saverMinTime = minimumDeliveryTime || 0

            if (minTime > saverMinTime) {
                minTime = saverMinTime
            }

            if (maxTime < saverMinTime) {
                maxTime = saverMinTime
            }

            if (deliveryOption?.delivery_type === 'standard') {
                time = formatDeliveryTime(minTime, maxTime, t)
            } else if (deliveryOption?.delivery_type === 'express') {
                let reduceTime = deliveryOption?.reduce_delivery_time?.value ?? 0
                const reduceTimeType =
                    deliveryOption?.reduce_delivery_time?.unit ?? timeUnit

                reduceTime = convertTimeToMinutes(reduceTime, reduceTimeType)

                time = formatDeliveryTime(
                    minTime,
                    Math.max(minTime, maxTime - reduceTime),
                    t
                )
            } else if (deliveryOption?.delivery_type === 'slightly_delay') {
                let addTime = deliveryOption?.add_delivery_time?.value ?? 0
                const addTimeType =
                    deliveryOption?.add_delivery_time?.unit ?? timeUnit

                addTime = convertTimeToMinutes(addTime, addTimeType)

                time = formatDeliveryTime(minTime, maxTime + addTime, t)
            }
        } catch (error) {
            console.error('Error finalizing delivery time:', error)
        }
    }

    return time
}

const getDeliveryOptionTime = (option) => {
    return finalizeDeliveryTime(
        restaurantDeliveryTime,
        option,
        minimumDeliveryTime,
        t
    )
}

const deliverySpeedOptions =
    restaurantChargeInfo?.delivery_options?.map((option) => {
        const extraCharge = Number(option?.extra_charge) || 0
        const reduceCharge = Number(option?.reduce_charge) || 0
        const surcharge =
            extraCharge > 0 ? extraCharge : reduceCharge > 0 ? -reduceCharge : 0

        return {
            id: option?.id,
            title:
                deliveryTypeLabels[option?.delivery_type] ||
                option?.delivery_type,
            deliveryType: option?.delivery_type,
            time: getDeliveryOptionTime(option),
            surcharge,
            strike: reduceCharge > 0,
        }
    }) || []

const minimumDeliveryCharge =
    Number(restaurantChargeInfo?.minimum_delivery_charge) || 0

const canShowDeliverySpeedOptions =
    Number(deliveryFee) > minimumDeliveryCharge

const handleSelectDeliverySpeed = (option) => {
    setSelectedDeliverySpeed(option?.id)
    setSelectedDeliveryOption?.((prev) => {
        const nextValue = {
            id: option?.id,
            deliveryType: option?.deliveryType,
            surcharge: option?.surcharge,
        }

        if (
            prev?.id === nextValue.id &&
            prev?.deliveryType === nextValue.deliveryType &&
            prev?.surcharge === nextValue.surcharge
        ) {
            return prev
        }

        return nextValue
    })
}
    React.useEffect(() => {
        if (
            orderType !== 'delivery' ||
            deliverySpeedOptions.length === 0 ||
            !canShowDeliverySpeedOptions
        ) {
            setSelectedDeliverySpeed(null)
            setSelectedDeliveryOption?.(null)
            return
        }
        const selectedOption =
            deliverySpeedOptions.find(
                (option) => option.id === selectedDeliverySpeed
            ) || deliverySpeedOptions[0]
        if (selectedOption?.id !== selectedDeliverySpeed) {
            setSelectedDeliverySpeed(selectedOption?.id)
        }
        setSelectedDeliveryOption?.((prev) => {
            const nextValue = {
                id: selectedOption?.id,
                deliveryType: selectedOption?.deliveryType,
                surcharge: selectedOption?.surcharge,
            }
            if (
                prev?.id === nextValue.id &&
                prev?.deliveryType === nextValue.deliveryType &&
                prev?.surcharge === nextValue.surcharge
            ) {
                return prev
            }
            return nextValue
        })
    }, [
        deliverySpeedOptions,
        orderType,
        selectedDeliverySpeed,
        canShowDeliverySpeedOptions,
        setSelectedDeliveryOption,
    ])
    const getChargeLabel = (surcharge) => {
        if (surcharge === 0) return null
        const amount =
            currencySymbolDirection === 'left'
                ? `${currencySymbol}${Math.abs(surcharge)}`
                : `${Math.abs(surcharge)}${currencySymbol}`
        return surcharge > 0 ? `+ ${amount}` : `- ${amount}`
    }
    const formatAmount = (amount) => {
        const numericAmount = Number(amount) || 0
        const fixedAmount = numericAmount.toFixed(digitAfterDecimalPoint)
        return currencySymbolDirection === 'left'
            ? `${currencySymbol}${fixedAmount}`
            : `${fixedAmount}${currencySymbol}`
    }
    const getDeliveryFeeLabel = (surcharge) => {
        const surchargeAmount = Number(surcharge) || 0
        const baseFee = Number(deliveryFee) || 0
        const totalFee = Math.max(baseFee + surchargeAmount, 0)
        const surchargeLabel = getChargeLabel(surchargeAmount)
        const totalFeeLabel = formatAmount(totalFee)
        return surchargeLabel
            ? `${surchargeLabel} (${totalFeeLabel})`
            : totalFeeLabel
    }
    console.log({selectedDeliverySpeed});
    
    return (
        <CustomPaperBigCard padding="16px" >
            <CustomStackFullWidth>
                <DeliveryTitle>
                    {global?.cash_on_delivery &&
                        restaurantData?.data?.order_subscription_active &&
                        t('ORDER TYPE &')}{' '}
                    {t('DELIVERY DETAILS')}
                </DeliveryTitle>
                <FormControl>
                    {page !== 'campaign' &&
                        global?.cash_on_delivery &&
                        restaurantData?.data?.order_subscription_active &&
                        getToken() && (
                            <OrderType
                                t={t}
                                subscriptionStates={subscriptionStates}
                                subscriptionDispatch={subscriptionDispatch}
                                setDeliveryTip={setDeliveryTip}
                                setPaymenMethod={setPaymenMethod}
                                setPaymentMethodDetails={
                                    setPaymentMethodDetails
                                }
                                setUsePartialPayment={setUsePartialPayment}
                                setSwitchToWallet={setSwitchToWallet}
                                setOrderType={setOrderType}
                                order_subscription_active={global?.order_subscription}
                            />
                        )}
                    {((restaurantData?.data?.delivery &&
                        global?.home_delivery) ||
                        (restaurantData?.data?.take_away &&
                            global?.take_away)) && (
                            <DeliveryCaption id="demo-row-radio-buttons-group-label">
                                {t('Delivery Options')}
                            </DeliveryCaption>
                        )}

                    {restaurantData?.data && (
                        <Box
                            sx={{
                                mt: 0.25,
                                p: { xs: 1.25, sm: 1.6 },
                                borderRadius: '10px',
                                border: '1px solid',
                                borderColor: 'divider',
                                backgroundColor: theme => theme.palette.mode === 'dark' ? theme.palette.neutral[800] : theme.palette.neutral[300],
                            }}
                        >
                            <RadioGroup
                                value={orderType}
                                row
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                name="row-radio-buttons-group"
                                onChange={(e) => handleChange(e)}
                                sx={{
                                    columnGap: 2,
                                    rowGap: 1,
                                    '& .MuiFormControlLabel-root': {
                                        mr: 0,
                                        ml: 0,
                                    },
                                    '& .MuiRadio-root': {
                                        color: 'text.secondary',
                                    },
                                    '& .MuiRadio-root.Mui-checked': {
                                        color: 'primary.main',
                                    },
                                    '& .MuiFormControlLabel-label': {
                                        fontSize: { xs: '1rem', sm: '1.05rem' },
                                        fontWeight: 500,
                                        color: 'text.primary',
                                    },
                                }}
                            >
                                {global?.home_delivery &&
                                    restaurantData?.data?.delivery && (
                                        <FormControlLabel
                                            value="delivery"
                                            control={<Radio />}
                                            label={t('Home Delivery')}
                                        />
                                    )}
                                {restaurantData?.data?.take_away &&
                                    global?.take_away &&
                                    subscriptionStates?.order !== '1' && (
                                        <FormControlLabel
                                            value="take_away"
                                            control={<Radio />}
                                            label={t('Take Away')}
                                        />
                                    )}
                                {restaurantData?.data?.is_dine_in_active &&
                                global?.dine_in_order_option &&
                                subscriptionStates?.order !== '1' ? (
                                    <FormControlLabel
                                        value="dine_in"
                                        control={<Radio />}
                                        label={t('Dine In')}
                                    />
                                ) : (
                                    ''
                                )}
                            </RadioGroup>
                            {!restaurantData?.data?.delivery &&
                                !restaurantData?.data?.take_away && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            p: 1,
                                            borderRadius: '8px',
                                            backgroundColor: theme =>
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255, 167, 38, 0.12)'
                                                    : 'rgba(255, 167, 38, 0.15)',
                                            color: 'warning.main',
                                        }}
                                    >
                                        <ReportProblemOutlinedIcon
                                            sx={{ fontSize: 18 }}
                                        />
                                        <Typography
                                            sx={{
                                                fontSize: '13px',
                                                fontWeight: 500,
                                            }}
                                        >
                                            {t(
                                                'Delivery is currently unavailable at this restaurant.'
                                            )}
                                        </Typography>
                                    </Box>
                                )}
                            {orderType === 'delivery' &&
                                global?.home_delivery &&
                                restaurantData?.data?.delivery &&
                                restaurantChargeInfo?.additional_delivery_option_status &&
                                canShowDeliverySpeedOptions &&
                                deliverySpeedOptions.length > 0  &&  (
                                    <Box
                                        sx={{
                                            mt: 0.9,
                                            display: 'grid',
                                            gridTemplateColumns: {
                                                xs: 'repeat(1, 1fr)',
                                                sm: `repeat(${deliverySpeedOptions.length}, minmax(0, 1fr))`,
                                            },
                                            gap: 1.2,
                                            ...(couponDiscount?.coupon_type === 'free_delivery' && {
                                                opacity: 0.45,
                                                pointerEvents: 'none',
                                                userSelect: 'none',
                                            }),
                                        }}
                                    >
                                        {deliverySpeedOptions.map((option) => {
                                            const isSelected =
                                                selectedDeliverySpeed ===
                                                option.id
                                            return (
                                                <Box
                                                    key={option.id}
                                                    onClick={() =>
                                                        handleSelectDeliverySpeed(
                                                            option
                                                        )
                                                    }
                                                    sx={{
                                                        cursor: 'pointer',
                                                        borderRadius: '8px',
                                                        border: '1px solid',
                                                        borderColor: isSelected
                                                            ? 'primary.main'
                                                            : 'divider',
                                                        backgroundColor:
                                                            isSelected
                                                                ? 'action.selected'
                                                                : 'background.paper',
                                                        p: 1,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '2px',
                                                        minWidth: 0,
                                                        position: 'relative',
                                                    }}
                                                >
                                                    {isSelected && (
                                                        <CheckCircleRoundedIcon
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 5,
                                                                right: 5,
                                                                fontSize: 14,
                                                                color: 'primary.main',
                                                            }}
                                                        />
                                                    )}
                                                    <Typography
                                                        sx={{
                                                            fontSize: '13px',
                                                            fontWeight: option.surcharge === 0 ? 700 : 500,
                                                            lineHeight: 1.2,
                                                            pr: isSelected ? '18px' : 0,
                                                        }}
                                                    >
                                                        {option.title}
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            fontSize: '11px',
                                                            color: 'text.secondary',
                                                            lineHeight: 1.3,
                                                        }}
                                                    >
                                                        {option.time}
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            mt: '2px',
                                                            fontSize: '12px',
                                                            fontWeight: 700,
                                                            color: isSelected ? 'primary.main' : 'text.primary',
                                                        }}
                                                    >
                                                        {getDeliveryFeeLabel(option.surcharge)}
                                                    </Typography>
                                                </Box>
                                            )
                                        })}
                                    </Box>
                                )}
                        </Box>
                    )}
                </FormControl>
                {!token && orderType !== 'dine_in' ? (
                    <CheckoutSelectedAddressGuest
                        address={address}
                        orderType={orderType}
                    />
                ) : (
                    <>
                        {orderType &&
                            orderType !== 'dine_in' &&
                            orderType !== 'take_away' && (
                                <DeliveryAddress
                                    setAddress={setAddress}
                                    address={address}
                                    additionalInformationDispatch={
                                        additionalInformationDispatch
                                    }
                                    restaurantId={restaurantData?.data?.zone_id}
                                    token={token}
                                />
                            )}
                    </>
                )}

                {getToken() && (
                    <AdditionalAddresses
                        orderType={orderType}
                        t={t}
                        additionalInformationStates={
                            additionalInformationStates
                        }
                        additionalInformationDispatch={
                            additionalInformationDispatch
                        }
                    />
                )}
            </CustomStackFullWidth>
        </CustomPaperBigCard>
    )
}

DeliveryDetails.propTypes = {}

export default React.memo(DeliveryDetails)
