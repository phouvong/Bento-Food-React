import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
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
import RepeatOrderTypeCard from './order-type/RepeatOrderTypeCard'
// import AdditionalAddresses from './AdditionalAddresses'
import { ACTIONS } from './states/additionalInformationStates'
import { Box, IconButton, Stack, TextField, Typography } from '@mui/material'
import CheckoutSelectedAddressGuest from './guest-user/CheckoutSelectedAddressGuest'
import ContactInfoModal from './guest-user/ContactInfoModal'
import TakeAwaySwitchConfirmModal from './TakeAwaySwitchConfirmModal'
import { getToken } from './functions/getGuestUserId'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import SearchableSelect from './SearchableSelect'
import moment from 'moment'
import {
    formatPhoneNumber,
    getStoredCheckoutContactInfo,
} from '@/utils/customFunctions'
import { getFromLocalStorage } from '@/utils/localStorage'
import Slider from '@/components/slider/SlickToSwiper'

const pillSliderSettings = {
    slidesToShow: 'auto',
    infinite: false,
    dots: false,
    arrows: false,
}
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
        hasBogoItem,
        zoneData,
        setSelectedDeliveryOption,
        deliveryFee,
        couponDiscount,
        // True when the customer's active Pro offer is `delivery_fee` +
        // `full_free` AND it's actively saving on this order. Used to hide
        // the "Save time / Express delivery" speed selector — paying extra
        // for express doesn't make sense when delivery is already free.
        isProFullFreeDelivery,
        showScheduleIcon,
        onOpenSchedule,
        scheduleAt,
        customerData,
        // Area/zip delivery-charge rule (coverage-list API) — the list, the
        // active flag, and the selection live in CheckoutPage because the
        // selected charge feeds OrderCalculation's delivery fee.
        coverageAreas = [],
        coverageRuleActive = false,
        selectedCoverageArea = null,
        setSelectedCoverageArea,
        // 'area_wise' | 'zip_code_wise' — labels the selected row inside
        // the address block.
        coverageType = null,
        // True while a free-delivery coupon is applied — the delivery-type
        // options are shown disabled with a notice (no extra/reduced charge
        // can combine with a free delivery).
        freeDeliveryCouponApplied = false,
    } = props

    const { t } = useTranslation()

    // Preformatted "ZIP Code: 5747" / "Area: Gulshan" line rendered inside
    // the selected-address card (both guest and logged-in variants).
    const coverageLabel =
        coverageRuleActive && selectedCoverageArea
            ? `${
                  coverageType === 'zip_code_wise' ? t('ZIP Code') : t('Area')
              }: ${selectedCoverageArea?.name}`
            : null

    const isScheduled = Boolean(scheduleAt) && scheduleAt !== 'now'
    const scheduledLabel = isScheduled
        ? moment(scheduleAt, 'YYYY-MM-DD HH:mm').format('D MMMM, hh:mm A')
        : ''
    const [scheduledDatePart, scheduledTimePart] = isScheduled
        ? scheduledLabel.split(', ')
        : ['', '']

    const instantTimeLabel =
        orderType === 'dine_in'
            ? moment().format(global?.timeformat === '12' ? 'hh:mm A' : 'HH:mm')
            : t('Now')
    const displayDatePart = isScheduled ? scheduledDatePart : t('Today')
    const displayTimePart = isScheduled ? scheduledTimePart : instantTimeLabel

    const { guestUserInfo } = useSelector((state) => state.guestUserInfo)
    const storedContactInfo = getStoredCheckoutContactInfo(
        guestUserInfo,
        customerData
    )
    const contactName =
        storedContactInfo?.contact_person_name ||
        customerData?.data?.f_name ||
        ''
    const rawContactPhone =
        storedContactInfo?.contact_person_number ||
        customerData?.data?.phone ||
        ''
    const contactPhone = rawContactPhone
        ? formatPhoneNumber(rawContactPhone)
        : ''
    const [contactModalOpen, setContactModalOpen] = React.useState(false)
    const [selectedDeliverySpeed, setSelectedDeliverySpeed] =
        React.useState(null)
    const [takeAwaySwitchConfirmOpen, setTakeAwaySwitchConfirmOpen] =
        React.useState(false)

    const applyOrderTypeChange = (nextOrderType) => {
        if (nextOrderType === 'take_away') {
            setDeliveryTip(0)
        }
        if (nextOrderType !== 'delivery') {
            setSelectedDeliverySpeed(null)
            setSelectedDeliveryOption?.(null)
        }
        setOrderType(nextOrderType)
    }

    const isHomeDeliveryAvailable = Boolean(
        global?.home_delivery && restaurantData?.data?.delivery
    )

    const handleChange = (e) => {
        const nextOrderType = e.target.value
        if (
            isHomeDeliveryAvailable &&
            orderType === 'delivery' &&
            nextOrderType === 'take_away'
        ) {
            setTakeAwaySwitchConfirmOpen(true)
            return
        }
        applyOrderTypeChange(nextOrderType)
    }

    const handleConfirmTakeAwaySwitch = () => {
        applyOrderTypeChange('take_away')
        setTakeAwaySwitchConfirmOpen(false)
    }

    const handleCancelTakeAwaySwitch = () => {
        setTakeAwaySwitchConfirmOpen(false)
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

    const restaurantDeliveryTimeValues = restaurantDeliveryTime
        .match(/\d+(?:\.\d+)?/g)
        ?.map((value) => Number.parseFloat(value)) || [0]

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
        if (
            /(^|[\s-])(minute|minutes|min|mins)([\s-]|$)/.test(normalizedText)
        ) {
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
                const timeUnit = parseUnitFromText(storeDeliveryTime) || 'min'
                const timeList = storeDeliveryTime
                    .match(/\d+(?:\.\d+)?/g)
                    ?.map((v) => Number(v)) || [0, 0]

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
                    let reduceTime =
                        deliveryOption?.reduce_delivery_time?.value ?? 0
                    const reduceTimeType =
                        deliveryOption?.reduce_delivery_time?.unit ?? timeUnit

                    reduceTime = convertTimeToMinutes(
                        reduceTime,
                        reduceTimeType
                    )

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
            // A reduce charge can never pull the final fee below the zone's
            // minimum delivery charge (or negative) — cap it against the room
            // the current fee actually has above the floor.
            const reduceRoom = Math.max(
                0,
                (Number(deliveryFee) || 0) -
                    (Number(restaurantChargeInfo?.minimum_delivery_charge) || 0)
            )
            const effectiveReduceCharge = Math.min(reduceCharge, reduceRoom)
            const surcharge =
                extraCharge > 0
                    ? extraCharge
                    : effectiveReduceCharge > 0
                    ? -effectiveReduceCharge
                    : 0

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

    const canShowScheduleCard =
        subscriptionStates?.order !== '1' &&
        Boolean(restaurantData?.data?.schedule_order) &&
        ((orderType === 'delivery' &&
            global?.home_delivery &&
            restaurantData?.data?.delivery) ||
            (orderType === 'take_away' &&
                global?.take_away &&
                restaurantData?.data?.take_away) ||
            (orderType === 'dine_in' &&
                global?.dine_in_order_option &&
                restaurantData?.data?.is_dine_in_active))

    const canShowDeliverySpeedGrid =
        subscriptionStates?.order !== '1' &&
        orderType === 'delivery' &&
        global?.home_delivery &&
        restaurantData?.data?.delivery &&
        // Self-delivery restaurants use their own fleet — the zone's
        // express / slightly-delay options don't apply.
        Number.parseInt(restaurantData?.data?.self_delivery_system) !== 1 &&
        restaurantChargeInfo?.additional_delivery_option_status &&
        canShowDeliverySpeedOptions &&
        deliverySpeedOptions.length > 0 &&
        !isProFullFreeDelivery

    const scheduleCardTextByOrderType = {
        delivery: {
            instantTitle: t('Instant Delivery'),
            scheduledTitle: t('Schedule Delivery'),
            subtitle: t(
                'You can have it delivered now or pick a time for scheduled delivery!'
            ),
        },
        take_away: {
            instantTitle: t('Instant Pickup'),
            scheduledTitle: t('Schedule Pickup'),
            subtitle: t(
                'You can pick it up now or pick a time for scheduled pickup!'
            ),
        },
        dine_in: {
            instantTitle: t('Instant Booking'),
            scheduledTitle: t('Schedule Dine In'),
            subtitle: t(
                'You can dine in now or pick a time for scheduled dine in!'
            ),
        },
    }

    const scheduleCardText =
        scheduleCardTextByOrderType[orderType] ||
        scheduleCardTextByOrderType.delivery

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
            !canShowDeliverySpeedOptions ||
            Number.parseInt(restaurantData?.data?.self_delivery_system) === 1 ||
            // Free-delivery coupon: drop any express/delay surcharge so no
            // charge combines with the free delivery; the section re-selects
            // its default when the coupon is removed.
            freeDeliveryCouponApplied
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
        freeDeliveryCouponApplied,
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

    const handleOpenRestaurantDirections = () => {
        const restaurantLat = restaurantData?.data?.latitude
        const restaurantLng = restaurantData?.data?.longitude
        if (!restaurantLat || !restaurantLng) return
        const destination = `${restaurantLat},${restaurantLng}`
        const currentLatLng = JSON.parse(
            getFromLocalStorage('currentLatLng') || 'null'
        )
        const url =
            currentLatLng?.lat && currentLatLng?.lng
                ? `https://www.google.com/maps/dir/?api=1&origin=${currentLatLng.lat},${currentLatLng.lng}&destination=${destination}`
                : `https://www.google.com/maps/search/?api=1&query=${destination}`
        window.open(url, '_blank')
    }

    const renderRestaurantLocationRow = () => (
        <Stack
            direction="row"
            alignItems="center"
            gap="12px"
            sx={{
                flex: 1,
                minWidth: 0,
                width: '100%',
                p: '12px',
                borderRadius: '8px',
                backgroundColor: 'background.paper',
                boxShadow:
                    '0px 1px 2px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.05)',
            }}
        >
            <Box
                sx={{
                    flexShrink: 0,
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: (theme) => theme.palette.neutral[200],
                }}
            >
                <i
                    className="fi fi-rr-marker"
                    style={{ fontSize: 14, color: 'inherit' }}
                />
            </Box>
            <Stack sx={{ flex: 1, minWidth: 0, gap: '4px' }}>
                <Typography
                    sx={{
                        fontSize: { xs: '14px', sm: '16px' },
                        fontWeight: 500,
                        lineHeight: 1.1,
                        letterSpacing: '-0.48px',
                        color: 'text.primary',
                    }}
                >
                    {t('Restaurant Location')}
                </Typography>
                <Typography
                    noWrap
                    sx={{
                        fontSize: { xs: '12px', sm: '14px' },
                        lineHeight: 1.2,
                        letterSpacing: '-0.42px',
                        color: 'text.secondary',
                    }}
                >
                    {restaurantData?.data?.address}
                </Typography>
            </Stack>
            <IconButton
                onClick={handleOpenRestaurantDirections}
                sx={{
                    flexShrink: 0,
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    color: 'text.info',
                }}
            >
                <i
                    className="fi fi-rr-map"
                    style={{
                        fontSize: '16px',
                        lineHeight: 1,
                        color: 'inherit',
                    }}
                />
            </IconButton>
        </Stack>
    )

    const renderContactInfoCard = () => (
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', width: '100%' }}>
            {contactName || contactPhone ? (
                <Stack
                    direction="row"
                    alignItems="center"
                    gap="12px"
                    sx={{
                        width: '100%',
                        p: '12px',
                        borderRadius: '8px',
                        backgroundColor: 'background.paper',
                        boxShadow:
                            '0px 1px 2px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.05)',
                    }}
                >
                    <Box
                        sx={{
                            flexShrink: 0,
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: (theme) =>
                                theme.palette.neutral[200],
                        }}
                    >
                        <PersonOutlineIcon
                            sx={{
                                fontSize: 18,
                                color: 'text.primary',
                            }}
                        />
                    </Box>
                    <Stack sx={{ flex: 1, minWidth: 0, gap: '4px' }}>
                        <Typography
                            noWrap
                            sx={{
                                fontSize: { xs: '14px', sm: '16px' },
                                fontWeight: 500,
                                lineHeight: 1.1,
                                letterSpacing: '-0.48px',
                                color: 'text.primary',
                                textTransform: 'capitalize',
                            }}
                        >
                            {contactName}
                        </Typography>
                        <Typography
                            noWrap
                            sx={{
                                fontSize: { xs: '12px', sm: '14px' },
                                lineHeight: 1.2,
                                letterSpacing: '-0.42px',
                                color: 'text.secondary',
                            }}
                        >
                            {contactPhone}
                        </Typography>
                    </Stack>
                    <IconButton
                        onClick={() => setContactModalOpen(true)}
                        sx={{
                            flexShrink: 0,
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            color: 'text.info',
                        }}
                    >
                        <i
                            className="fi fi-rr-pencil"
                            style={{
                                fontSize: '16px',
                                lineHeight: 1,
                                color: 'inherit',
                            }}
                        />
                    </IconButton>
                </Stack>
            ) : (
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    gap="8px"
                    onClick={() => setContactModalOpen(true)}
                    sx={{
                        width: '100%',
                        height: '100%',
                        p: '12px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: (theme) => theme.palette.neutral[200],
                    }}
                >
                    <AddCircleOutlineIcon
                        sx={{ fontSize: 16, color: 'text.primary' }}
                    />
                    <Typography
                        sx={{
                            fontSize: { xs: '14px', sm: '16px' },
                            fontWeight: 700,
                            lineHeight: 1.1,
                            letterSpacing: '-0.48px',
                            color: 'text.primary',
                            textTransform: 'capitalize',
                        }}
                    >
                        {t('Add Contact Info')}
                    </Typography>
                </Stack>
            )}
        </Box>
    )

    return (
        <CustomStackFullWidth spacing="20px">
            {page !== 'campaign' &&
                global?.cash_on_delivery &&
                restaurantData?.data?.order_subscription_active &&
                global?.home_delivery &&
                restaurantData?.data?.delivery &&
                !hasBogoItem &&
                getToken() && (
                    <OrderType
                        t={t}
                        subscriptionStates={subscriptionStates}
                        subscriptionDispatch={subscriptionDispatch}
                        setDeliveryTip={setDeliveryTip}
                        setPaymenMethod={setPaymenMethod}
                        setPaymentMethodDetails={setPaymentMethodDetails}
                        setUsePartialPayment={setUsePartialPayment}
                        setSwitchToWallet={setSwitchToWallet}
                        setOrderType={setOrderType}
                        order_subscription_active={global?.order_subscription}
                    />
                )}
            <CustomPaperBigCard nopadding="true" noboxshadow="true">
                <CustomStackFullWidth
                    sx={{ gap: '20px', p: { xs: '16px', sm: '20px' } }}
                >
                    {subscriptionStates?.order !== '1' && (
                        <FormControl sx={{ width: '100%' }}>
                            {((restaurantData?.data?.delivery &&
                                global?.home_delivery) ||
                                (restaurantData?.data?.take_away &&
                                    global?.take_away)) && (
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    flexWrap="wrap"
                                    gap="8px"
                                    sx={{ width: '100%' }}
                                >
                                    <Typography
                                        id="demo-row-radio-buttons-group-label"
                                        sx={{
                                            flex: '1 0 0',
                                            minWidth: '140px',
                                            fontSize: {
                                                xs: '16px',
                                                sm: '18px',
                                            },
                                            fontWeight: 700,
                                            lineHeight: 1.1,
                                            letterSpacing: '-0.54px',
                                            color: 'text.primary',
                                        }}
                                    >
                                        {t('Delivery Option')}
                                    </Typography>
                                    <RadioGroup
                                        value={orderType}
                                        row
                                        aria-labelledby="demo-row-radio-buttons-group-label"
                                        name="row-radio-buttons-group"
                                        onChange={(e) => handleChange(e)}
                                        sx={{
                                            flexWrap: 'nowrap',
                                            width: {
                                                xs: 'calc(100% + 16px)',
                                                sm: 'auto',
                                            },
                                            mr: { xs: '-16px', sm: 0 },
                                            minWidth: 0,
                                            '& .swiper': { py: '2px' },
                                            '& .swiper-slide': {
                                                width: 'auto',
                                            },
                                            '& .MuiFormControlLabel-root': {
                                                m: 0,
                                            },
                                            '& .MuiRadio-root': {
                                                p: 0,
                                                mr: '8px',
                                                color: 'text.secondary',
                                            },
                                            '& .MuiRadio-root.Mui-checked': {
                                                color: 'primary.main',
                                            },
                                        }}
                                    >
                                        <Slider {...pillSliderSettings} gap={8}>
                                            {global?.home_delivery &&
                                                restaurantData?.data
                                                    ?.delivery && (
                                                    <FormControlLabel
                                                        value="delivery"
                                                        control={
                                                            <Radio size="small" />
                                                        }
                                                        label={t(
                                                            'Home Delivery'
                                                        )}
                                                        sx={{
                                                            flexShrink: 0,
                                                            minWidth: {
                                                                xs: '130px',
                                                                sm: '150px',
                                                            },
                                                            p: '12px',
                                                            border: '1px solid',
                                                            borderColor: (
                                                                theme
                                                            ) =>
                                                                orderType ===
                                                                'delivery'
                                                                    ? theme
                                                                          .palette
                                                                          .neutral[700]
                                                                    : theme
                                                                          .palette
                                                                          .divider,
                                                            borderRadius: '8px',
                                                            backgroundColor:
                                                                'background.paper',
                                                            '& .MuiFormControlLabel-label':
                                                                {
                                                                    fontSize: {
                                                                        xs: '13px',
                                                                        sm: '14px',
                                                                    },
                                                                    fontWeight: 600,
                                                                    lineHeight: 1.2,
                                                                    letterSpacing:
                                                                        '-0.42px',
                                                                    color:
                                                                        orderType ===
                                                                        'delivery'
                                                                            ? 'text.primary'
                                                                            : 'text.secondary',
                                                                },
                                                        }}
                                                    />
                                                )}
                                            {restaurantData?.data?.take_away &&
                                                global?.take_away &&
                                                subscriptionStates?.order !==
                                                    '1' && (
                                                    <FormControlLabel
                                                        value="take_away"
                                                        control={
                                                            <Radio size="small" />
                                                        }
                                                        label={t('Take Away')}
                                                        sx={{
                                                            flexShrink: 0,
                                                            minWidth: {
                                                                xs: '130px',
                                                                sm: '150px',
                                                            },
                                                            p: '12px',
                                                            border: '1px solid',
                                                            borderColor: (
                                                                theme
                                                            ) =>
                                                                orderType ===
                                                                'take_away'
                                                                    ? theme
                                                                          .palette
                                                                          .neutral[700]
                                                                    : theme
                                                                          .palette
                                                                          .divider,
                                                            borderRadius: '8px',
                                                            backgroundColor:
                                                                'background.paper',
                                                            '& .MuiFormControlLabel-label':
                                                                {
                                                                    fontSize: {
                                                                        xs: '13px',
                                                                        sm: '14px',
                                                                    },
                                                                    fontWeight: 600,
                                                                    lineHeight: 1.2,
                                                                    letterSpacing:
                                                                        '-0.42px',
                                                                    color:
                                                                        orderType ===
                                                                        'take_away'
                                                                            ? 'text.primary'
                                                                            : 'text.secondary',
                                                                },
                                                        }}
                                                    />
                                                )}
                                            {restaurantData?.data
                                                ?.is_dine_in_active &&
                                            global?.dine_in_order_option &&
                                            subscriptionStates?.order !==
                                                '1' ? (
                                                <FormControlLabel
                                                    value="dine_in"
                                                    control={
                                                        <Radio size="small" />
                                                    }
                                                    label={t('Dine In')}
                                                    sx={{
                                                        flexShrink: 0,
                                                        minWidth: '150px',
                                                        p: '12px',
                                                        border: '1px solid',
                                                        borderColor: (theme) =>
                                                            orderType ===
                                                            'dine_in'
                                                                ? theme.palette
                                                                      .neutral[700]
                                                                : theme.palette
                                                                      .divider,
                                                        borderRadius: '8px',
                                                        backgroundColor:
                                                            'background.paper',
                                                        '& .MuiFormControlLabel-label':
                                                            {
                                                                fontSize: {
                                                                    xs: '13px',
                                                                    sm: '14px',
                                                                },
                                                                fontWeight: 600,
                                                                lineHeight: 1.2,
                                                                letterSpacing:
                                                                    '-0.42px',
                                                                color:
                                                                    orderType ===
                                                                    'dine_in'
                                                                        ? 'text.primary'
                                                                        : 'text.secondary',
                                                            },
                                                    }}
                                                />
                                            ) : (
                                                ''
                                            )}
                                        </Slider>
                                    </RadioGroup>
                                </Stack>
                            )}

                            {restaurantData?.data &&
                                !restaurantData?.data?.delivery &&
                                !restaurantData?.data?.take_away && (
                                    <Box
                                        sx={{
                                            mt: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            p: 1,
                                            borderRadius: '8px',
                                            backgroundColor: (theme) =>
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
                            {(canShowScheduleCard ||
                                canShowDeliverySpeedGrid) && (
                                <Box
                                    sx={{
                                        mt: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '16px',
                                        p: '16px',
                                        borderRadius: '8px',
                                        backgroundColor: 'background.paper',
                                        boxShadow:
                                            '0px 1px 2px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.05)',
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        gap="16px"
                                    >
                                        <Stack
                                            sx={{
                                                flex: 1,
                                                minWidth: 0,
                                                gap: '2px',
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: {
                                                        xs: '16px',
                                                        sm: '18px',
                                                    },
                                                    fontWeight: 700,
                                                    lineHeight: 1.1,
                                                    letterSpacing: '-0.54px',
                                                    color: 'text.primary',
                                                }}
                                            >
                                                {isScheduled
                                                    ? scheduleCardText.scheduledTitle
                                                    : scheduleCardText.instantTitle}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: {
                                                        xs: '12px',
                                                        sm: '14px',
                                                    },
                                                    lineHeight: 1.2,
                                                    letterSpacing: '-0.42px',
                                                    color: 'text.secondary',
                                                }}
                                            >
                                                {scheduleCardText.subtitle}
                                            </Typography>
                                            <Stack
                                                direction="row"
                                                alignItems="baseline"
                                                gap="4px"
                                                sx={{ mt: '10px' }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontSize: '16px',
                                                        fontWeight: 700,
                                                        letterSpacing:
                                                            '-0.48px',
                                                        color: 'text.primary',
                                                        textTransform:
                                                            'capitalize',
                                                    }}
                                                >
                                                    {displayDatePart},
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontSize: '16px',
                                                        letterSpacing:
                                                            '-0.48px',
                                                        color: 'text.primary',
                                                    }}
                                                >
                                                    {displayTimePart}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                        {showScheduleIcon && (
                                            <IconButton
                                                onClick={onOpenSchedule}
                                                sx={{
                                                    flexShrink: 0,
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '8px',
                                                    color: 'text.info',
                                                }}
                                            >
                                                <i
                                                    className="fi fi-rr-pencil"
                                                    style={{
                                                        fontSize: '16px',
                                                        lineHeight: 1,
                                                        color: 'inherit',
                                                    }}
                                                />
                                            </IconButton>
                                        )}
                                    </Stack>
                                    {canShowDeliverySpeedGrid &&
                                        !isScheduled &&
                                        freeDeliveryCouponApplied && (
                                            <Typography
                                                sx={{
                                                    fontSize: '13px',
                                                    color: 'warning.dark',
                                                    mb: '6px',
                                                }}
                                            >
                                                {t(
                                                    'Delivery type options are unavailable while a free delivery coupon is applied'
                                                )}
                                            </Typography>
                                        )}
                                    {canShowDeliverySpeedGrid && !isScheduled && (
                                        <Box
                                            sx={(theme) => ({
                                                display: 'grid',
                                                gridTemplateColumns: {
                                                    xs: 'repeat(1, 1fr)',
                                                    sm: `repeat(${deliverySpeedOptions.length}, minmax(240px, 1fr))`,
                                                },
                                                backgroundColor:
                                                    theme.palette.neutral[1800],
                                                borderRadius: '8px',
                                                overflowX: 'auto',
                                                overflowY: 'hidden',
                                                '& > div': {
                                                    borderRight: {
                                                        sm: `1px solid ${theme.palette.divider}`,
                                                    },
                                                    borderBottom: {
                                                        xs: `1px solid ${theme.palette.divider}`,
                                                        sm: 'none',
                                                    },
                                                },
                                                '& > div:last-of-type': {
                                                    borderRight: 'none',
                                                    borderBottom: 'none',
                                                },
                                                ...(couponDiscount?.coupon_type ===
                                                    'free_delivery' && {
                                                    opacity: 0.45,
                                                    pointerEvents: 'none',
                                                    userSelect: 'none',
                                                }),
                                            })}
                                        >
                                            {deliverySpeedOptions.map(
                                                (option) => {
                                                    const isSelected =
                                                        selectedDeliverySpeed ===
                                                        option.id
                                                    const chargeLabel =
                                                        getChargeLabel(
                                                            option.surcharge
                                                        )
                                                    return (
                                                        <Stack
                                                            key={option.id}
                                                            direction="row"
                                                            alignItems="center"
                                                            gap="12px"
                                                            onClick={() =>
                                                                handleSelectDeliverySpeed(
                                                                    option
                                                                )
                                                            }
                                                            sx={{
                                                                cursor: 'pointer',
                                                                p: '12px 16px',
                                                                minWidth: {
                                                                    xs: 0,
                                                                    sm: '240px',
                                                                },
                                                            }}
                                                        >
                                                            <Radio
                                                                checked={
                                                                    isSelected
                                                                }
                                                                size="small"
                                                                sx={{
                                                                    p: 0,
                                                                    flexShrink: 0,
                                                                    color: 'text.secondary',
                                                                    '&.Mui-checked':
                                                                        {
                                                                            color: 'primary.main',
                                                                        },
                                                                }}
                                                            />
                                                            <Stack
                                                                direction="row"
                                                                alignItems="center"
                                                                gap="6px"
                                                                sx={{
                                                                    flex: 1,
                                                                    minWidth: 0,
                                                                }}
                                                            >
                                                                <Stack
                                                                    sx={{
                                                                        flex: 1,
                                                                        minWidth: 0,
                                                                        gap: '4px',
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        sx={{
                                                                            fontSize:
                                                                                '16px',
                                                                            fontWeight:
                                                                                isSelected
                                                                                    ? 700
                                                                                    : 500,
                                                                            lineHeight: 1.1,
                                                                            letterSpacing:
                                                                                '-0.48px',
                                                                            color: 'text.primary',
                                                                            textTransform:
                                                                                'capitalize',
                                                                            overflow:
                                                                                'hidden',
                                                                            textOverflow:
                                                                                'ellipsis',
                                                                            whiteSpace:
                                                                                'nowrap',
                                                                        }}
                                                                    >
                                                                        {
                                                                            option.title
                                                                        }
                                                                    </Typography>
                                                                    <Typography
                                                                        sx={{
                                                                            fontSize:
                                                                                '14px',
                                                                            lineHeight: 1.2,
                                                                            letterSpacing:
                                                                                '-0.42px',
                                                                            color: 'text.secondary',
                                                                        }}
                                                                    >
                                                                        {
                                                                            option.time
                                                                        }
                                                                    </Typography>
                                                                </Stack>
                                                                {chargeLabel && (
                                                                    <Box
                                                                        sx={{
                                                                            flexShrink: 0,
                                                                            height: '24px',
                                                                            display:
                                                                                'flex',
                                                                            alignItems:
                                                                                'center',
                                                                            px: '8px',
                                                                            borderRadius:
                                                                                '8px',
                                                                            backgroundColor:
                                                                                'background.paper',
                                                                            boxShadow:
                                                                                '0px 1px 4px rgba(0, 0, 0, 0.05)',
                                                                        }}
                                                                    >
                                                                        <Typography
                                                                            sx={{
                                                                                fontSize:
                                                                                    '14px',
                                                                                lineHeight: 1.2,
                                                                                letterSpacing:
                                                                                    '-0.42px',
                                                                                color: 'text.primary',
                                                                                whiteSpace:
                                                                                    'nowrap',
                                                                            }}
                                                                        >
                                                                            {
                                                                                chargeLabel
                                                                            }
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                            </Stack>
                                                        </Stack>
                                                    )
                                                }
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </FormControl>
                    )}
                    {subscriptionStates?.order === '1' && (
                        <RepeatOrderTypeCard
                            t={t}
                            subscriptionStates={subscriptionStates}
                            subscriptionDispatch={subscriptionDispatch}
                            restaurantData={restaurantData}
                        />
                    )}
                    {orderType === 'delivery' && (
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            alignItems="stretch"
                            gap="24px"
                            sx={{ width: '100%' }}
                        >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                {!token ? (
                                    <CheckoutSelectedAddressGuest
                                        address={address}
                                        setAddress={setAddress}
                                        additionalInformationDispatch={
                                            additionalInformationDispatch
                                        }
                                        coverageLabel={coverageLabel}
                                    />
                                ) : (
                                    <DeliveryAddress
                                        setAddress={setAddress}
                                        address={address}
                                        additionalInformationDispatch={
                                            additionalInformationDispatch
                                        }
                                        restaurantId={
                                            restaurantData?.data?.zone_id
                                        }
                                        token={token}
                                        coverageLabel={coverageLabel}
                                    />
                                )}
                            </Box>
                            {renderContactInfoCard()}
                        </Stack>
                    )}

                    {orderType === 'dine_in' || orderType === 'take_away' ? (
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            alignItems="stretch"
                            gap="24px"
                            sx={{ width: '100%' }}
                        >
                            {renderRestaurantLocationRow()}
                            {renderContactInfoCard()}
                        </Stack>
                    ) : null}

                    {orderType === 'delivery' && coverageRuleActive && (
                        <Stack sx={{ width: '100%', gap: '6px' }}>
                            <Stack
                                direction="row"
                                alignItems="center"
                                gap="2px"
                            >
                                <Typography
                                    sx={{
                                        fontSize: '16px',
                                        letterSpacing: '-0.48px',
                                        color: 'text.primary',
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {t('Area/ZIP Code')}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        color: 'error.main',
                                    }}
                                >
                                    *
                                </Typography>
                            </Stack>
                            <SearchableSelect
                                value={selectedCoverageArea?.id ?? null}
                                onChange={(optionId) => {
                                    const area = coverageAreas.find(
                                        (item) => item.id === optionId
                                    )
                                    if (area) setSelectedCoverageArea?.(area)
                                }}
                                options={coverageAreas}
                                placeholder={t('Select area/zip code')}
                                searchPlaceholder={t('Search area/zip code')}
                                emptyText={t('No options found')}
                            />
                        </Stack>
                    )}

                    {/* {getToken() && (
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
                )} */}
                    {getToken() && (
                        <Stack sx={{ gap: '8px' }}>
                            <Typography
                                sx={{
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: 'text.primary',
                                }}
                            >
                                {t('Additional Note')}{' '}
                                <Typography
                                    component="span"
                                    sx={{
                                        fontSize: '14px',
                                        color: 'text.secondary',
                                    }}
                                >
                                    ({t('Optional')})
                                </Typography>
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder={t('Type additional note here')}
                                value={additionalInformationStates.note}
                                onChange={(e) =>
                                    additionalInformationDispatch({
                                        type: ACTIONS.setNote,
                                        payload: e.target.value,
                                    })
                                }
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        backgroundColor: 'background.paper',
                                        height: '44px',
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'divider',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline':
                                        {
                                            borderColor: 'divider',
                                        },
                                    '& .Mui-focused .MuiOutlinedInput-notchedOutline':
                                        {
                                            borderColor: 'divider',
                                            borderWidth: '1px',
                                        },
                                }}
                            />
                        </Stack>
                    )}
                </CustomStackFullWidth>
            </CustomPaperBigCard>
            <ContactInfoModal
                open={contactModalOpen}
                onClose={() => setContactModalOpen(false)}
                configData={global}
                customerData={customerData}
                additionalInformationDispatch={additionalInformationDispatch}
            />
            <TakeAwaySwitchConfirmModal
                open={takeAwaySwitchConfirmOpen}
                onConfirm={handleConfirmTakeAwaySwitch}
                onCancel={handleCancelTakeAwaySwitch}
            />
        </CustomStackFullWidth>
    )
}

DeliveryDetails.propTypes = {}

export default React.memo(DeliveryDetails)
