import React, { useEffect, useMemo, useRef, useState } from 'react'
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
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import CloseIcon from '@mui/icons-material/Close'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import TimeWheelPicker from '@/components/time-picker/TimeWheelPicker'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import moment from 'moment'
import toast from 'react-hot-toast'
import DateRangeField from './DateRangeField'
import { weekDays } from './data'
import { ACTIONS } from '../states'
import { getSubscriptionOrderCount } from '../functions/getSubscriptionOrderCount'
import useCloseOnBackButton from '@/hooks/custom-hooks/useCloseOnBackButton'

dayjs.extend(customParseFormat)

// data.js lists Monday-first; the design lays the grid out Sunday-first.
const orderedWeekDays = [...weekDays].sort((a, b) => a.value - b.value)

// Time is stored in the same 'H:mm:ss' shape the previous subscription form
// produced, since getSubscriptionOrderCount parses it as 'HH:mm:ss'.
const STORED_TIME_FORMAT = 'H:mm:ss'

// Weekday/day-of-month/time selection (the grid below the date field in
// Figma) is a follow-up task — this modal currently only wires the date
// range picker into subscriptionStates.startDate/endDate.
const RepeatOrderScheduleModal = ({
    open,
    onClose,
    subscriptionStates,
    subscriptionDispatch,
    restaurantData,
}) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const { global } = useSelector((state) => state.globalSettings)
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    useCloseOnBackButton(isMobile && Boolean(open), onClose)

    const [localStartDate, setLocalStartDate] = useState(null)
    const [localEndDate, setLocalEndDate] = useState(null)
    const [localTime, setLocalTime] = useState(null)
    const [timePickerOpen, setTimePickerOpen] = useState(false)
    const [weeklyDays, setWeeklyDays] = useState([])
    const [activeDayValue, setActiveDayValue] = useState(null)
    const [draftDayTime, setDraftDayTime] = useState(null)
    const [monthlyTimes, setMonthlyTimes] = useState({})
    const [activeMonthDate, setActiveMonthDate] = useState(null)
    // Populated on a failed Confirm — flags exactly which selected day/date
    // tiles never land inside an open, still-upcoming slot, so the user can
    // see which pick(s) to fix instead of a single opaque toast.
    const [invalidWeekDayValues, setInvalidWeekDayValues] = useState([])
    const [invalidMonthDateKeys, setInvalidMonthDateKeys] = useState([])
    const weekDayTileRefs = useRef({})
    const monthDateTileRefs = useRef({})

    // After a failed Confirm marks tiles red, jump the scroll position to
    // the first flagged one so the user doesn't have to hunt through a
    // (possibly long, scrolled) grid to find what needs fixing.
    useEffect(() => {
        if (invalidWeekDayValues.length === 0) return
        const target = weekDayTileRefs.current[invalidWeekDayValues[0]]
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, [invalidWeekDayValues])

    useEffect(() => {
        if (invalidMonthDateKeys.length === 0) return
        const target = monthDateTileRefs.current[invalidMonthDateKeys[0]]
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, [invalidMonthDateKeys])

    const isDaily = subscriptionStates?.type === 'daily'
    const isWeekly = subscriptionStates?.type === 'weekly'
    const isMonthly = subscriptionStates?.type === 'monthly'
    const is12HourFormat = global?.timeformat !== '24'
    const displayTimeFormat = is12HourFormat ? 'h:mm A' : 'HH:mm'

    // Every calendar date in the picked range — the monthly grid shows one
    // tile per date (not a fixed 1-31 set), same as the Figma spec.
    const monthlyDateKeys = useMemo(() => {
        if (!localStartDate || !localEndDate) return []
        const keys = []
        let cursor = moment(localStartDate).startOf('day')
        const end = moment(localEndDate).startOf('day')
        while (cursor.isSameOrBefore(end, 'day')) {
            keys.push(cursor.format('YYYY-MM-DD'))
            cursor = cursor.clone().add(1, 'day')
        }
        return keys
    }, [localStartDate, localEndDate])

    useEffect(() => {
        if (!open) return
        setLocalStartDate(
            subscriptionStates?.startDate
                ? moment(
                      subscriptionStates.startDate,
                      'yyyy/MM/DD HH:mm'
                  ).toDate()
                : null
        )
        setLocalEndDate(
            subscriptionStates?.endDate
                ? moment(
                      subscriptionStates.endDate,
                      'yyyy/MM/DD HH:mm'
                  ).toDate()
                : null
        )
        const storedDays = subscriptionStates?.days || []
        const storedTime = storedDays?.[0]?.time
        setLocalTime(storedTime ? dayjs(storedTime, STORED_TIME_FORMAT) : null)
        setWeeklyDays(
            orderedWeekDays.map((day) => ({
                ...day,
                time:
                    storedDays.find(
                        (stored) => Number(stored?.day) === day.value
                    )?.time || '',
            }))
        )
        setActiveDayValue(null)
        setInvalidWeekDayValues([])
        setInvalidMonthDateKeys([])

        // Stored monthly days only carry a day-of-month number, so map them
        // back onto every matching calendar date in the saved range.
        const nextMonthlyTimes = {}
        if (subscriptionStates?.startDate && subscriptionStates?.endDate) {
            let cursor = moment(
                subscriptionStates.startDate,
                'yyyy/MM/DD HH:mm'
            ).startOf('day')
            const end = moment(
                subscriptionStates.endDate,
                'yyyy/MM/DD HH:mm'
            ).startOf('day')
            while (cursor.isSameOrBefore(end, 'day')) {
                const match = storedDays.find(
                    (stored) =>
                        Number(stored?.day) === Number(cursor.format('D'))
                )
                if (match) {
                    nextMonthlyTimes[cursor.format('YYYY-MM-DD')] = match.time
                }
                cursor = cursor.clone().add(1, 'day')
            }
        }
        setMonthlyTimes(nextMonthlyTimes)
        setActiveMonthDate(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    const handleDateRangeChange = (nextStart, nextEnd) => {
        if (isMonthly) {
            // Monthly picks a single anchor date; the range is always that
            // date plus the following 29 days (30 days total, inclusive of
            // the picked date). moment().add() rolls over month boundaries
            // correctly on its own (Jan 31 + 30 days lands in March, a
            // 28/29/30/31-day February is handled the same way) — no manual
            // per-month-length math needed.
            setLocalStartDate(nextStart)
            setLocalEndDate(moment(nextStart).add(29, 'days').toDate())
            return
        }
        setLocalStartDate(nextStart)
        setLocalEndDate(nextEnd)
    }

    // Matches the previous day-picker: tapping a day that already has a time
    // clears it, which is the only way to deselect a day.
    const handleDayClick = (dayValue) => {
        const current = weeklyDays.find((day) => day.value === dayValue)
        if (current?.time) {
            setWeeklyDays((prev) =>
                prev.map((day) =>
                    day.value === dayValue ? { ...day, time: '' } : day
                )
            )
            setInvalidWeekDayValues((prev) =>
                prev.filter((value) => value !== dayValue)
            )
            return
        }
        setDraftDayTime(dayjs())
        setActiveDayValue(dayValue)
    }

    const handleDayTimeAccept = (value) => {
        const picked = value || draftDayTime
        if (picked) {
            setWeeklyDays((prev) =>
                prev.map((day) =>
                    day.value === activeDayValue
                        ? {
                              ...day,
                              time: dayjs(picked).format(STORED_TIME_FORMAT),
                          }
                        : day
                )
            )
            setInvalidWeekDayValues((prev) =>
                prev.filter((value) => value !== activeDayValue)
            )
        }
        setActiveDayValue(null)
    }

    // Same clear-on-reclick semantics as the weekly grid.
    const handleMonthDateClick = (dateKey) => {
        if (monthlyTimes[dateKey]) {
            setMonthlyTimes((prev) => {
                const next = { ...prev }
                delete next[dateKey]
                return next
            })
            setInvalidMonthDateKeys((prev) =>
                prev.filter((key) => key !== dateKey)
            )
            return
        }
        setDraftDayTime(dayjs())
        setActiveMonthDate(dateKey)
    }

    const handleMonthTimeAccept = (value) => {
        const picked = value || draftDayTime
        if (picked) {
            setMonthlyTimes((prev) => ({
                ...prev,
                [activeMonthDate]: dayjs(picked).format(STORED_TIME_FORMAT),
            }))
            setInvalidMonthDateKeys((prev) =>
                prev.filter((key) => key !== activeMonthDate)
            )
        }
        setActiveMonthDate(null)
    }

    const selectedWeekDays = weeklyDays.filter((day) => day.time !== '')
    const selectedMonthDates = monthlyDateKeys.filter(
        (dateKey) => monthlyTimes[dateKey]
    )

    const hasValidSelection = Boolean(
        localStartDate &&
            localEndDate &&
            (!isDaily || localTime) &&
            (!isWeekly || selectedWeekDays.length > 0) &&
            (!isMonthly || selectedMonthDates.length > 0)
    )

    const handleConfirm = () => {
        if (!hasValidSelection) return
        if (moment(localStartDate).isSame(moment(localEndDate), 'day')) {
            toast.error(
                t(
                    'Start date and end date can not be same for subscription orders.'
                )
            )
            return
        }

        let daysPayload = []
        if (isDaily) {
            daysPayload = [
                {
                    day: `${moment().day()}`,
                    time: dayjs(localTime).format(STORED_TIME_FORMAT),
                },
            ]
        }
        if (isWeekly) {
            daysPayload = selectedWeekDays.map((day) => ({
                day: day.value,
                time: day.time,
            }))
        }
        if (isMonthly) {
            // The backend only stores a day-of-month (1-31), so if the range
            // spans multiple months and two picked dates share that number,
            // keep a single entry rather than double-counting that day.
            const byDayOfMonth = new Map()
            selectedMonthDates.forEach((dateKey) => {
                byDayOfMonth.set(
                    moment(dateKey, 'YYYY-MM-DD').date(),
                    monthlyTimes[dateKey]
                )
            })
            daysPayload = Array.from(byDayOfMonth.entries()).map(
                ([day, time]) => ({ day, time })
            )
        }

        const rangeStart = moment(localStartDate).format('yyyy/MM/DD HH:mm')
        const rangeEnd = moment(localEndDate).format('yyyy/MM/DD HH:mm')

        // Restaurant-hours + "not already passed" check, before committing
        // — same calculation used at Place Order time, run early so a dead
        // selection (e.g. a today+past-time daily pick, or a weekday/date
        // that never lands inside open hours) gets caught right here
        // instead of silently producing a 0-order subscription later.
        //
        // For weekly/monthly, also check each entry individually so only
        // the actually-conflicting tile(s) get flagged red — a single
        // opaque toast doesn't tell the user which of 7 days is the
        // problem.
        if (isWeekly || isMonthly) {
            const badEntries = daysPayload.filter(
                (entry) =>
                    getSubscriptionOrderCount(
                        restaurantData?.data?.schedules,
                        subscriptionStates?.type,
                        rangeStart,
                        rangeEnd,
                        [entry]
                    ) <= 0
            )
            if (badEntries.length > 0) {
                if (isWeekly) {
                    setInvalidWeekDayValues(
                        badEntries.map((entry) => Number(entry.day))
                    )
                } else {
                    setInvalidMonthDateKeys(
                        monthlyDateKeys.filter(
                            (dateKey) =>
                                monthlyTimes[dateKey] &&
                                badEntries.some(
                                    (entry) =>
                                        Number(entry.day) ===
                                        moment(dateKey, 'YYYY-MM-DD').date()
                                )
                        )
                    )
                }
                toast.error(
                    t(
                        'Restaurant is not available at the selected date(s)/time(s). Please choose a different date or time.'
                    )
                )
                return
            }
        }

        const orderCount = getSubscriptionOrderCount(
            restaurantData?.data?.schedules,
            subscriptionStates?.type,
            rangeStart,
            rangeEnd,
            daysPayload
        )
        if (orderCount <= 0) {
            toast.error(
                t(
                    'Restaurant is not available at the selected date(s)/time(s). Please choose a different date or time.'
                )
            )
            return
        }

        setInvalidWeekDayValues([])
        setInvalidMonthDateKeys([])
        subscriptionDispatch({
            type: ACTIONS.setStartDate,
            payload: moment(localStartDate).format('yyyy/MM/DD HH:mm'),
        })
        subscriptionDispatch({
            type: ACTIONS.setEndDate,
            payload: moment(localEndDate).format('yyyy/MM/DD HH:mm'),
        })
        subscriptionDispatch({
            type: ACTIONS.setSubscriptionDays,
            payload: daysPayload,
        })
        onClose()
    }

    const content = (
        <Stack sx={{ width: '100%', maxHeight: '100%', minHeight: 0 }}>
            <Stack
                sx={{
                    position: 'relative',
                    pt: '24px',
                    px: { xs: '16px', sm: '24px' },
                    pb: '8px',
                    gap: { xs: '16px', sm: '20px' },
                    flex: '1 1 auto',
                    minHeight: 0,
                    overflowY: 'auto',
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
                        {t('Select Date & Time')}
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

                <DateRangeField
                    mode={isMonthly ? 'single' : 'range'}
                    label={t('Select Date')}
                    startDate={localStartDate}
                    endDate={localEndDate}
                    onChange={handleDateRangeChange}
                    placeholder={
                        isMonthly ? t('Select a date') : t('Select date range')
                    }
                />

                {isDaily && (
                    <Box sx={{ width: '100%' }}>
                        <Typography
                            sx={{
                                mb: '6px',
                                fontSize: '16px',
                                color: 'text.primary',
                            }}
                        >
                            {t('Select Time')}
                        </Typography>
                        <Box
                            onClick={() => setTimePickerOpen(true)}
                            sx={{
                                width: '100%',
                                height: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px',
                                px: '12px',
                                borderRadius: '8px',
                                backgroundColor: 'background.paper',
                                border: '1px solid',
                                borderColor: timePickerOpen
                                    ? theme.palette.primary.main
                                    : theme.palette.divider,
                                cursor: 'pointer',
                                transition: 'border-color 0.15s ease',
                            }}
                        >
                            <Typography
                                noWrap
                                sx={{
                                    fontSize: '16px',
                                    color: localTime
                                        ? 'text.primary'
                                        : 'text.secondary',
                                }}
                            >
                                {localTime
                                    ? dayjs(localTime).format(displayTimeFormat)
                                    : t('Select delivery time')}
                            </Typography>
                            <AccessTimeOutlinedIcon
                                sx={{
                                    fontSize: 18,
                                    color: 'text.secondary',
                                    flexShrink: 0,
                                }}
                            />
                        </Box>
                        <TimeWheelPicker
                            open={timePickerOpen}
                            onClose={() => setTimePickerOpen(false)}
                            value={localTime}
                            onAccept={(value) => setLocalTime(value)}
                            ampm={is12HourFormat}
                            title={t('Select Time')}
                        />
                    </Box>
                )}

                {isWeekly && (
                    <Stack
                        sx={{
                            width: '100%',
                            gap: { xs: '12px', sm: '16px' },
                            p: { xs: '12px', sm: '16px' },
                            borderRadius: '8px',
                            backgroundColor: (theme) =>
                                theme.palette.neutral[1800],
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: { xs: '16px', sm: '18px' },
                                fontWeight: 700,
                                lineHeight: 1.1,
                                letterSpacing: '-0.54px',
                                color: 'text.primary',
                            }}
                        >
                            {t('Select Date')}
                        </Typography>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(2, minmax(0, 1fr))',
                                gap: { xs: '8px', sm: '16px' },
                            }}
                        >
                            {weeklyDays.map((day, index) => {
                                const isSelected = day.time !== ''
                                const isInvalid = invalidWeekDayValues.includes(
                                    day.value
                                )
                                const isLast = index === weeklyDays.length - 1
                                return (
                                    <Stack
                                        key={day.value}
                                        ref={(el) => {
                                            weekDayTileRefs.current[day.value] =
                                                el
                                        }}
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="center"
                                        onClick={() =>
                                            handleDayClick(day.value)
                                        }
                                        sx={{
                                            gridColumn:
                                                isLast && index % 2 === 0
                                                    ? 'span 2'
                                                    : 'auto',
                                            gap: { xs: '4px', sm: '8px' },
                                            minWidth: { xs: 0, sm: '150px' },
                                            height: '44px',
                                            px: { xs: '6px', sm: '12px' },
                                            py: '8px',
                                            cursor: 'pointer',
                                            borderRadius: '6px',
                                            border: isInvalid
                                                ? '1.5px solid'
                                                : isSelected
                                                ? 'none'
                                                : '1px solid',
                                            borderColor: isInvalid
                                                ? 'error.main'
                                                : 'divider',
                                            backgroundColor: isSelected
                                                ? 'background.paper'
                                                : 'transparent',
                                        }}
                                    >
                                        <Typography
                                            noWrap
                                            sx={{
                                                minWidth: 0,
                                                fontSize: {
                                                    xs: '13px',
                                                    sm: '16px',
                                                },
                                                lineHeight: 1.1,
                                                letterSpacing: '-0.48px',
                                                color: isInvalid
                                                    ? 'error.main'
                                                    : 'text.primary',
                                                textTransform: 'capitalize',
                                            }}
                                        >
                                            {t(day.name)}
                                        </Typography>
                                        {isSelected && (
                                            <Typography
                                                noWrap
                                                sx={{
                                                    flexShrink: 0,
                                                    fontSize: {
                                                        xs: '12px',
                                                        sm: '14px',
                                                    },
                                                    fontWeight: 700,
                                                    lineHeight: 1.1,
                                                    letterSpacing: '-0.42px',
                                                    color: isInvalid
                                                        ? 'error.main'
                                                        : 'text.info',
                                                }}
                                            >
                                                {dayjs(
                                                    day.time,
                                                    STORED_TIME_FORMAT
                                                ).format(displayTimeFormat)}
                                            </Typography>
                                        )}
                                    </Stack>
                                )
                            })}
                        </Box>
                        <TimeWheelPicker
                            open={activeDayValue !== null}
                            onClose={() => setActiveDayValue(null)}
                            value={draftDayTime}
                            onAccept={handleDayTimeAccept}
                            ampm={is12HourFormat}
                            title={t('Select Time')}
                        />
                    </Stack>
                )}

                {isMonthly && (
                    <Stack
                        sx={{
                            width: '100%',
                            gap: { xs: '12px', sm: '16px' },
                            p: { xs: '12px', sm: '16px' },
                            borderRadius: '8px',
                            backgroundColor: (theme) =>
                                theme.palette.neutral[1800],
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: { xs: '16px', sm: '18px' },
                                fontWeight: 700,
                                lineHeight: 1.1,
                                letterSpacing: '-0.54px',
                                color: 'text.primary',
                            }}
                        >
                            {t('Select Date')}
                        </Typography>
                        {monthlyDateKeys.length > 0 ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: { xs: '8px', sm: '16px' },
                                    maxHeight: { xs: '260px', sm: '320px' },
                                    overflowY: 'auto',
                                }}
                            >
                                {monthlyDateKeys.map((dateKey) => {
                                    const time = monthlyTimes[dateKey]
                                    const isSelected = Boolean(time)
                                    const isInvalid =
                                        invalidMonthDateKeys.includes(dateKey)
                                    return (
                                        <Stack
                                            key={dateKey}
                                            ref={(el) => {
                                                monthDateTileRefs.current[
                                                    dateKey
                                                ] = el
                                            }}
                                            alignItems="center"
                                            justifyContent="center"
                                            onClick={() =>
                                                handleMonthDateClick(dateKey)
                                            }
                                            sx={{
                                                flex: '1 1 124px',
                                                minWidth: {
                                                    xs: '100px',
                                                    sm: '124px',
                                                },
                                                height: '58px',
                                                gap: '4px',
                                                px: { xs: '8px', sm: '12px' },
                                                py: '12px',
                                                cursor: 'pointer',
                                                borderRadius: '6px',
                                                border: isInvalid
                                                    ? '1.5px solid'
                                                    : isSelected
                                                    ? 'none'
                                                    : '1px solid',
                                                borderColor: isInvalid
                                                    ? 'error.main'
                                                    : 'divider',
                                                backgroundColor: isSelected
                                                    ? 'background.paper'
                                                    : 'transparent',
                                            }}
                                        >
                                            <Typography
                                                noWrap
                                                sx={{
                                                    fontSize: {
                                                        xs: '13px',
                                                        sm: '16px',
                                                    },
                                                    lineHeight: 1.1,
                                                    letterSpacing: '-0.48px',
                                                    color: isInvalid
                                                        ? 'error.main'
                                                        : 'text.primary',
                                                    textTransform: 'capitalize',
                                                }}
                                            >
                                                {moment(
                                                    dateKey,
                                                    'YYYY-MM-DD'
                                                ).format('DD MMM, YYYY')}
                                            </Typography>
                                            {isSelected && (
                                                <Typography
                                                    noWrap
                                                    sx={{
                                                        fontSize: {
                                                            xs: '12px',
                                                            sm: '14px',
                                                        },
                                                        fontWeight: 700,
                                                        lineHeight: 1.1,
                                                        letterSpacing:
                                                            '-0.42px',
                                                        color: isInvalid
                                                            ? 'error.main'
                                                            : 'text.info',
                                                    }}
                                                >
                                                    {dayjs(
                                                        time,
                                                        STORED_TIME_FORMAT
                                                    ).format(displayTimeFormat)}
                                                </Typography>
                                            )}
                                        </Stack>
                                    )
                                })}
                            </Box>
                        ) : (
                            <Typography
                                sx={{
                                    fontSize: '14px',
                                    color: 'text.secondary',
                                }}
                            >
                                {t('Pick a date range above first')}
                            </Typography>
                        )}
                        <TimeWheelPicker
                            open={activeMonthDate !== null}
                            onClose={() => setActiveMonthDate(null)}
                            value={draftDayTime}
                            onAccept={handleMonthTimeAccept}
                            ampm={is12HourFormat}
                            title={t('Select Time')}
                        />
                    </Stack>
                )}
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
                <Stack
                    onClick={onClose}
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        flex: 1,
                        height: '40px',
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
                </Stack>
                <Stack
                    onClick={handleConfirm}
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        flex: 1,
                        height: '40px',
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
                        {t('Confirm')}
                    </Typography>
                </Stack>
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
                sx: {
                    borderRadius: '20px',
                    width: '500px',
                    maxWidth: '92vw',
                    maxHeight: '90vh',
                },
            }}
        >
            {content}
        </Dialog>
    )
}

export default RepeatOrderScheduleModal
