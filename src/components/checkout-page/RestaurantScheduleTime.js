import React, { useEffect, useMemo, useState } from 'react'
import {
    Box,
    Dialog,
    Drawer,
    IconButton,
    Stack,
    Typography,
    useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { getAllSchedule, getDayNumber } from './const'
import { useTranslation } from 'react-i18next'
import SimpleBar from 'simplebar-react'
import ScheduleDateWheel from './ScheduleDateWheel'
import CloseIcon from '@mui/icons-material/Close'
import InfoIcon from '@mui/icons-material/Info'
import moment from 'moment/moment'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { getEarliestBogoOfferEnd } from '@/utils/customFunctions'
import useCloseOnBackButton from '@/hooks/custom-hooks/useCloseOnBackButton'

dayjs.extend(customParseFormat)
export const formatTimeRange = (timeRange, global) => {
    if (!timeRange) return ''

    const [start, end] = (timeRange || '').split(' - ').map((t) => t.trim())

    if (!start || !end) return timeRange

    const format = global?.timeformat === '12' ? 'hh:mm A' : 'HH:mm'

    const formattedStart = dayjs(start, ['HH:mm', 'hh:mm A']).format(format)
    const formattedEnd = dayjs(end, ['HH:mm', 'hh:mm A']).format(format)

    return `${formattedStart} - ${formattedEnd}`
}

const RestaurantScheduleTime = (props) => {
    const {
        restaurantData,
        handleChange,
        today,
        tomorrow,
        numberOfDay,
        global,
        scheduleAt,
        setScheduleAt,
        orderType,
        open,
        onClose,
    } = props
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    useCloseOnBackButton(isMobile && Boolean(open), onClose)
    const { cartList } = useSelector((state) => state.cart)
    const bogoOfferEnd = useMemo(
        () => getEarliestBogoOfferEnd(cartList),
        [cartList]
    )
    const currentDate = new Date()
    const customerOrderDate =
        (restaurantData?.data?.self_delivery_system !== 1
            ? global?.customer_order_date
            : restaurantData?.data?.customer_order_date) || 1
    const maxDate = new Date()
    maxDate.setDate(currentDate.getDate() + customerOrderDate - 1)
    maxDate.setHours(23, 59, 59, 999)
    const [selectedDate, setSelectedDate] = useState(null)
    const { t } = useTranslation()
    const [time, setTime] = useState('Now')
    const [day, setday] = useState('Today')
    const [slot, setSlot] = useState(null)
    const [slotList, setSlotList] = useState(null)
    const [selected, setSelected] = useState(false)
    const parsedSlotDuration = Number(global?.schedule_order_slot_duration)
    const slotDurationTime =
        Number.isFinite(parsedSlotDuration) && parsedSlotDuration > 0
            ? parsedSlotDuration
            : 30

    const isDineIn = orderType === 'dine_in'
    const dineInBookingDurationType = isDineIn
        ? restaurantData?.data
              ?.schedule_advance_dine_in_booking_duration_time_format
        : null
    const dineInBookingDurationValue = isDineIn
        ? restaurantData?.data?.schedule_advance_dine_in_booking_duration
        : null
    const dineInEarliestMoment =
        isDineIn && dineInBookingDurationType && dineInBookingDurationValue
            ? dineInBookingDurationType === 'day'
                ? moment(currentDate)
                      .startOf('day')
                      .add(dineInBookingDurationValue, 'days')
                : moment(currentDate).add(
                      dineInBookingDurationValue,
                      dineInBookingDurationType === 'min' ? 'minutes' : 'hours'
                  )
            : null

    const isInstantChipVisible =
        Boolean(restaurantData?.data?.instant_order) &&
        !(isDineIn && dineInEarliestMoment)

    useEffect(() => {
        setSlotList(
            getAllSchedule(
                numberOfDay,
                restaurantData?.data?.schedules,
                slotDurationTime,
                selectedDate
            )
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (!open) return
        if (!scheduleAt || scheduleAt === 'now') {
            if (
                isDineIn &&
                dineInBookingDurationType === 'day' &&
                dineInEarliestMoment
            ) {
                const earliestDateKey =
                    dineInEarliestMoment.format('YYYY-MM-DD')
                setday('CustomDate')
                setTime('Later')
                setSlot(null)
                setSelected(false)
                setSelectedDate(earliestDateKey)
                return
            }
            setday('Today')
            setTime('Now')
            setSlot(null)
            setSelected(false)
            setSelectedDate(null)
            return
        }
        const scheduledDateKey = moment(scheduleAt, 'YYYY-MM-DD HH:mm').format(
            'YYYY-MM-DD'
        )
        const todayKey = moment(currentDate).format('YYYY-MM-DD')
        const tomorrowKey = moment(currentDate)
            .add(1, 'day')
            .format('YYYY-MM-DD')
        setSelectedDate(scheduledDateKey)
        setSlot({ value: scheduleAt })
        setSelected(scheduleAt)
        setTime('Later')
        if (scheduledDateKey === todayKey) {
            setday('Today')
        } else if (scheduledDateKey === tomorrowKey) {
            setday('Tomorrow')
        } else {
            setday('CustomDate')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    const applyDineInLeadTimeFilter = (list) => {
        if (
            !isDineIn ||
            (dineInBookingDurationType !== 'min' &&
                dineInBookingDurationType !== 'hour') ||
            !dineInEarliestMoment
        ) {
            return list
        }
        return list.filter((item) =>
            moment(item.value, 'YYYY-MM-DD HH:mm').isSameOrAfter(
                dineInEarliestMoment
            )
        )
    }

    // When instant ordering isn't offered by the restaurant, auto-apply the
    // earliest available slot as soon as data is ready, instead of leaving
    // scheduleAt defaulted to 'now' until the customer opens the modal.
    useEffect(() => {
        if (open) return
        if (!restaurantData?.data?.schedule_order) return
        if (isInstantChipVisible) return
        if (scheduleAt && scheduleAt !== 'now') return

        const todaysSlots = applyDineInLeadTimeFilter(
            getAllSchedule(
                numberOfDay,
                restaurantData?.data?.schedules,
                slotDurationTime,
                moment(currentDate).format('YYYY-MM-DD')
            )
        )
        if (todaysSlots?.length > 0) {
            setScheduleAt(todaysSlots[0].value)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        open,
        isInstantChipVisible,
        scheduleAt,
        numberOfDay,
        slotDurationTime,
        restaurantData?.data?.schedule_order,
        restaurantData?.data?.schedules,
    ])

    useEffect(() => {
        if (day === 'Today') {
            if (time === 'Now') {
                setSelected(false)
            }
            setSelectedDate(moment(currentDate).format('YYYY-MM-DD'))
            setSlotList(
                applyDineInLeadTimeFilter(
                    getAllSchedule(
                        numberOfDay,
                        restaurantData?.data?.schedules,
                        slotDurationTime,
                        selectedDate
                    )
                )
            )
        } else if (day === 'Tomorrow') {
            setSelectedDate(moment().add(1, 'day').format('YYYY-MM-DD'))
            setSlotList(
                getAllSchedule(
                    getDayNumber(tomorrow),
                    restaurantData?.data?.schedules,
                    slotDurationTime,
                    selectedDate
                )
            )
        } else {
            setSlotList(
                getAllSchedule(
                    getDayNumber(moment(selectedDate).format('dddd')),
                    restaurantData?.data?.schedules,
                    slotDurationTime,
                    selectedDate
                )
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [day, time, selectedDate, numberOfDay, restaurantData?.data?.schedules])

    const handleSlot = (item) => {
        setSelected(item?.value)
        setSlot(item)
        setTime('Later')
    }

    const handleInstant = () => {
        setSlot(null)
        setSelected(false)
        setTime('Now')
    }

    useEffect(() => {
        if (
            open &&
            day === 'Today' &&
            time === 'Now' &&
            !isInstantChipVisible &&
            !selected &&
            slotList?.length > 0
        ) {
            handleSlot(slotList[0])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, day, time, isInstantChipVisible, slotList])

    const hasValidSelection = time === 'Now' || Boolean(slot?.value)

    const handleConfirm = () => {
        if (!hasValidSelection) return
        if (time !== 'Now' && bogoOfferEnd) {
            const exceedsOffer = moment(
                slot.value,
                'YYYY-MM-DD HH:mm'
            ).isAfter(moment(bogoOfferEnd, 'YYYY-MM-DD HH:mm:ss'))
            if (exceedsOffer) {
                toast.error(
                    t(
                        'The BOGO offer in your cart is not available at the selected time'
                    )
                )
                setSlot(null)
                setSelected(false)
                setScheduleAt('now')
                return
            }
        }
        setScheduleAt(time === 'Now' ? 'now' : slot.value)
        onClose()
    }

    const isDineInDayDisabled = (targetDateKey) =>
        isDineIn &&
        dineInBookingDurationType === 'day' &&
        dineInEarliestMoment &&
        moment(targetDateKey, 'YYYY-MM-DD').isBefore(
            dineInEarliestMoment,
            'day'
        )

    const handleDayTab = (nextDay) => {
        if (
            nextDay === 'Today' &&
            isDineInDayDisabled(moment(currentDate).format('YYYY-MM-DD'))
        ) {
            return
        }
        if (
            nextDay === 'Tomorrow' &&
            isDineInDayDisabled(
                moment(currentDate).add(1, 'day').format('YYYY-MM-DD')
            )
        ) {
            return
        }
        setSlot(null)
        setSelected(false)
        if (nextDay === 'Today') {
            setday('Today')
            setTime('Now')
            handleChange({ target: { value: getDayNumber(today) } })
        } else if (nextDay === 'Tomorrow') {
            setday('Tomorrow')
            setTime('Later')
            handleChange({ target: { value: getDayNumber(tomorrow) } })
        } else {
            setSelectedDate(
                isDineIn &&
                    dineInBookingDurationType === 'day' &&
                    dineInEarliestMoment
                    ? dineInEarliestMoment.format('YYYY-MM-DD')
                    : moment(currentDate).format('YYYY-MM-DD')
            )
            setday('CustomDate')
            setTime('Later')
            handleChange({ target: { value: 'Custom Date' } })
        }
    }

    const isDateDisabled = (date) => {
        const candidateMs = dayjs.isDayjs(date)
            ? date.startOf('day').valueOf()
            : moment(date?.$d ?? date)
                  .startOf('day')
                  .valueOf()
        const startOfTodayMs = moment(currentDate).startOf('day').valueOf()
        const endOfMaxMs = moment(maxDate).endOf('day').valueOf()
        const earliestDineInMs =
            isDineIn &&
            dineInBookingDurationType === 'day' &&
            dineInEarliestMoment
                ? dineInEarliestMoment.startOf('day').valueOf()
                : null
        return (
            candidateMs < startOfTodayMs ||
            candidateMs > endOfMaxMs ||
            (earliestDineInMs !== null && candidateMs < earliestDineInMs)
        )
    }

    const minDateKey = moment(currentDate).format('YYYY-MM-DD')
    const maxDateKey = moment(maxDate).format('YYYY-MM-DD')
    const dateOptions = useMemo(() => {
        const list = []
        const cursor = moment(minDateKey, 'YYYY-MM-DD').startOf('day')
        const end = moment(maxDateKey, 'YYYY-MM-DD').startOf('day')
        while (cursor.isSameOrBefore(end, 'day')) {
            if (!isDateDisabled(cursor.clone())) {
                list.push({
                    value: cursor.format('YYYY-MM-DD'),
                    label: cursor.format('DD MMMM, YYYY'),
                })
            }
            cursor.add(1, 'day')
        }
        return list
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [minDateKey, maxDateKey])

    const handleWheelChange = (dateString) => {
        setSelectedDate(dateString)
    }

    const customDateOrderAvailable =
        restaurantData?.data?.self_delivery_system !== 1
            ? global?.customer_date_order_sratus
            : restaurantData?.data?.customer_date_order_sratus

    if (!restaurantData?.data?.schedule_order) {
        return null
    }

    const tabs = [
        { key: 'Today', label: t('Today') },
        { key: 'Tomorrow', label: t('Tomorrow') },
        ...(customDateOrderAvailable
            ? [{ key: 'CustomDate', label: t('Custom Date') }]
            : []),
    ]

    const showGrid =
        day === 'Today' || (time === 'Later' && slotList?.length > 0)

    const content = (
        <Stack sx={{ width: '100%', height: '100%' }}>
            <Stack
                sx={{
                    position: 'relative',
                    pt: '24px',
                    px: '24px',
                    pb: '8px',
                    gap: '20px',
                }}
            >
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '28px',
                        height: '28px',
                        backgroundColor: (theme) => theme.palette.neutral[1800],
                    }}
                >
                    <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <Stack sx={{ gap: '4px' }}>
                    <Typography
                        sx={{
                            fontSize: '18px',
                            fontWeight: 700,
                            lineHeight: 1.1,
                            letterSpacing: '-0.54px',
                            color: 'text.primary',
                        }}
                    >
                        {t('Select Your Time Slot')}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '14px',
                            lineHeight: 1.2,
                            letterSpacing: '-0.42px',
                            color: 'text.secondary',
                        }}
                    >
                        {t('Choose preferable time when you want delivery')}
                    </Typography>
                </Stack>

                <Stack sx={{ gap: '12px' }}>
                    <Stack direction="row" sx={{ width: '100%' }}>
                        {tabs.map((tab) => {
                            const isActive = day === tab.key
                            const tabDateKey =
                                tab.key === 'Today'
                                    ? moment(currentDate).format('YYYY-MM-DD')
                                    : tab.key === 'Tomorrow'
                                    ? moment(currentDate)
                                          .add(1, 'day')
                                          .format('YYYY-MM-DD')
                                    : null
                            const isDisabled =
                                tabDateKey && isDineInDayDisabled(tabDateKey)
                            return (
                                <Box
                                    key={tab.key}
                                    onClick={() => handleDayTab(tab.key)}
                                    sx={{
                                        flex: 1,
                                        textAlign: 'center',
                                        py: '8px',
                                        cursor: isDisabled
                                            ? 'not-allowed'
                                            : 'pointer',
                                        opacity: isDisabled ? 0.4 : 1,
                                        borderBottom: '2px solid',
                                        borderColor: isActive
                                            ? 'primary.main'
                                            : 'transparent',
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: '16px',
                                            fontWeight: isActive ? 700 : 500,
                                            letterSpacing: '-0.48px',
                                            color: isActive
                                                ? 'primary.main'
                                                : 'text.secondary',
                                        }}
                                    >
                                        {tab.label}
                                    </Typography>
                                </Box>
                            )
                        })}
                    </Stack>

                    {day === 'CustomDate' && (
                        <ScheduleDateWheel
                            options={dateOptions}
                            value={selectedDate}
                            onChange={handleWheelChange}
                        />
                    )}

                    {showGrid ? (
                        <SimpleBar
                            style={{
                                maxHeight: isMobile ? '40vh' : '320px',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                    p: '16px',
                                    borderRadius: '8px',
                                    backgroundColor: (theme) =>
                                        theme.palette.neutral[1800],
                                }}
                            >
                                {day === 'Today' && isInstantChipVisible && (
                                    <Box
                                        onClick={handleInstant}
                                        sx={{
                                            flex: '1 1 150px',
                                            minWidth: '150px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            borderRadius: '8px',
                                            backgroundColor:
                                                time === 'Now'
                                                    ? 'primary.main'
                                                    : 'background.paper',
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: '16px',
                                                fontWeight: 700,
                                                letterSpacing: '-0.48px',
                                                color:
                                                    time === 'Now'
                                                        ? '#fff'
                                                        : 'text.primary',
                                            }}
                                        >
                                            {t('Instant Delivery')}
                                        </Typography>
                                    </Box>
                                )}
                                {slotList?.map((item, index) => {
                                    const isSelected = selected === item.value
                                    return (
                                        <Box
                                            key={index}
                                            onClick={() => handleSlot(item)}
                                            sx={{
                                                flex: '1 1 150px',
                                                minWidth: '150px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                borderRadius: '8px',
                                                backgroundColor: isSelected
                                                    ? 'primary.main'
                                                    : 'background.paper',
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: '16px',
                                                    fontWeight: isSelected
                                                        ? 700
                                                        : 500,
                                                    letterSpacing: '-0.48px',
                                                    color: isSelected
                                                        ? '#fff'
                                                        : 'text.primary',
                                                }}
                                            >
                                                {formatTimeRange(
                                                    item?.label,
                                                    global
                                                )}
                                            </Typography>
                                        </Box>
                                    )
                                })}
                            </Box>
                        </SimpleBar>
                    ) : (
                        (day === 'Tomorrow' ||
                            (day === 'CustomDate' && selectedDate)) && (
                            <Stack
                                direction="row"
                                alignItems="center"
                                gap="8px"
                                sx={{ pt: '4px' }}
                            >
                                <InfoIcon
                                    sx={{
                                        fontSize: 18,
                                        color: 'info.main',
                                    }}
                                />
                                <Typography
                                    sx={{ fontSize: '14px', fontWeight: 700 }}
                                >
                                    {t('Restaurant is close')}
                                </Typography>
                            </Stack>
                        )
                    )}
                </Stack>
            </Stack>

            <Stack
                direction="row"
                gap="20px"
                sx={{
                    mt: 'auto',
                    px: { xs: '20px', sm: '32px' },
                    pt: '16px',
                    pb: '20px',
                    boxShadow: '0px -1px 2px rgba(0, 0, 0, 0.05)',
                }}
            >
                <Box
                    onClick={onClose}
                    sx={{
                        flex: 1,
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        backgroundColor: (theme) => theme.palette.neutral[200],
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: '16px',
                            fontWeight: 700,
                            letterSpacing: '-0.48px',
                            color: 'text.primary',
                        }}
                    >
                        {t('Cancel')}
                    </Typography>
                </Box>
                <Box
                    onClick={handleConfirm}
                    sx={{
                        flex: 1,
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: hasValidSelection ? 'pointer' : 'not-allowed',
                        opacity: hasValidSelection ? 1 : 0.5,
                        borderRadius: '8px',
                        backgroundColor: 'primary.main',
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: '16px',
                            fontWeight: 700,
                            letterSpacing: '-0.48px',
                            color: '#fff',
                        }}
                    >
                        {t('Confirm Schedule')}
                    </Typography>
                </Box>
            </Stack>
        </Stack>
    )

    if (isMobile) {
        return (
            <Drawer
                anchor="bottom"
                open={Boolean(open)}
                onClose={onClose}
                sx={{ zIndex: (theme) => theme.zIndex.modal + 10 }}
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: '20px',
                        borderTopRightRadius: '20px',
                        maxHeight: '85vh',
                    },
                }}
            >
                {content}
            </Drawer>
        )
    }

    return (
        <Dialog
            open={Boolean(open)}
            onClose={onClose}
            PaperProps={{
                sx: { borderRadius: '20px', width: '488px', maxWidth: '92vw' },
            }}
        >
            {content}
        </Dialog>
    )
}

RestaurantScheduleTime.propTypes = {}

export default RestaurantScheduleTime
