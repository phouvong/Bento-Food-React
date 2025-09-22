import React, { useState, useEffect } from 'react'
import {
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from '@mui/material'
import {
    CustomPaperBigCard,
    CustomStackFullWidth,
    CustomTypographyBold,
} from '@/styled-components/CustomStyles.style'
import { t } from 'i18next'
import FormControl from '@mui/material/FormControl'
import { getAllSchedule, getDayNumber } from '@/components/checkout-page/const'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimePicker, MobileTimePicker } from '@mui/x-date-pickers'
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers'
import dayjs from 'dayjs'
import moment from 'moment'
import { toast } from 'react-hot-toast'

const DineInPreferableTime = ({
    today,
    global,
    restaurantData,
    numberOfDay,
    handleChange,
    setScheduleAt,
}) => {
    const [time, setTime] = useState(
        restaurantData?.data
            ?.schedule_advance_dine_in_booking_duration_time_format === 'day'
            ? 'Custom Date'
            : 'Today'
    )
    const [selectedDateTime, setSelectedDateTime] = useState(null)

    const [slotList, setSlotList] = useState(null)
    const slotDurationTime =
        global?.schedule_order_slot_duration === 0
            ? 30
            : global?.schedule_order_slot_duration

    const booking_duration_type =
        restaurantData?.data
            ?.schedule_advance_dine_in_booking_duration_time_format
    const booking_duration_time =
        restaurantData?.data?.schedule_advance_dine_in_booking_duration

    // Calculate minimum selectable date based on booking duration type and time
    const minSelectableDate =
        booking_duration_type === 'day'
            ? dayjs().add(booking_duration_time, 'day')
            : null

    useEffect(() => {
        if (selectedDateTime) {
            if (time === 'Custom Date') {
                const formatDate = moment(selectedDateTime?.$d).format(
                    'YYYY-MM-DD'
                )

                setSlotList(
                    getAllSchedule(
                        getDayNumber(moment(formatDate).format('dddd')),
                        restaurantData?.data?.schedules,
                        slotDurationTime,
                        selectedDateTime
                    )
                )
            } else {
                setSlotList(
                    getAllSchedule(
                        numberOfDay,
                        restaurantData?.data?.schedules,
                        slotDurationTime,
                        selectedDateTime
                    )
                )
            }
        }
    }, [selectedDateTime])

    useEffect(() => {
        if (
            (booking_duration_type === 'min' ||
                booking_duration_type === 'hour') &&
            time === 'Today'
        ) {
            const currentTime = dayjs()
            const adjustedTime = currentTime
                .add(
                    booking_duration_time,
                    booking_duration_type === 'min'
                        ? 'minute'
                        : booking_duration_type
                )
                .add(2, 'minute')
            setSelectedDateTime(adjustedTime)
            setScheduleAt(adjustedTime.format('YYYY-MM-DD HH:mm'))
        }
    }, [time, booking_duration_type, booking_duration_time])

    const handleTimeChange = (event, newValue) => {
        if (newValue?.props?.children === 'Today') {
            setTime('Today')
            const currentTime = dayjs()
            if (
                booking_duration_type === 'min' ||
                booking_duration_type === 'hour'
            ) {
                const adjustedTime = currentTime.add(
                    booking_duration_time,
                    booking_duration_type
                )
                setSelectedDateTime(adjustedTime)
            } else {
                setSelectedDateTime(currentTime)
            }
        } else {
            setTime('Custom Date')
            setSelectedDateTime(null)
        }
    }

    const handleDateChange = (dateTime) => {
        setSelectedDateTime(dateTime)
    }

    const handleTime = (time) => {
        if (time) {
            const currentTime = dayjs()
            const adjustedTime = currentTime.add(
                booking_duration_time,
                booking_duration_type
            )

            if (adjustedTime > time) {
                setSelectedDateTime(adjustedTime)
                toast.error('Restaurant not available')
            } else {
                setSelectedDateTime(time)
            }
        }
    }

    useEffect(() => {
        if (
            selectedDateTime &&
            time === 'Custom Date' &&
            slotList?.length > 0
        ) {
            const isSelectedTimeInsideRange = (selectedDateTime) => {
                return slotList.some((slot) => {
                    const slotStart = dayjs(
                        `${dayjs(selectedDateTime?.$d).format('YYYY-MM-DD')} ${
                            slot.start
                        }`
                    )
                    const slotEnd = dayjs(
                        `${dayjs(selectedDateTime?.$d).format('YYYY-MM-DD')} ${
                            slot.end
                        }`
                    )

                    return selectedDateTime.isBetween(
                        slotStart,
                        slotEnd,
                        null,
                        '[)'
                    )
                })
            }
            const result = isSelectedTimeInsideRange(selectedDateTime)
            if (!result) {
                setSelectedDateTime(null)
                toast.error('Restaurant not available')
            }
        }
    }, [selectedDateTime, slotList])

    useEffect(() => {
        if (selectedDateTime) {
            setScheduleAt(selectedDateTime.format('YYYY-MM-DD HH:mm'))
        }
    }, [selectedDateTime])
    return (
        <CustomPaperBigCard>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <CustomTypographyBold>
                        {t('Preferable Time')}
                    </CustomTypographyBold>
                </Grid>
                <Grid item md={6} sm={6} xs={12}>
                    <FormControl fullWidth>
                        <InputLabel>{t('Time')}</InputLabel>
                        <Select
                            variant="outlined"
                            label={t('Time')}
                            onChange={(event, newValue) =>
                                handleTimeChange(event, newValue)
                            }
                            defaultValue={
                                booking_duration_type === 'day'
                                    ? 'Custom Date'
                                    : getDayNumber(today)
                            }
                        >
                            {booking_duration_type !== 'day' && (
                                <MenuItem
                                    value={getDayNumber(today)}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'primary.main',
                                        },
                                    }}
                                >
                                    {t('Today')}
                                </MenuItem>
                            )}

                            <MenuItem
                                value="Custom Date"
                                sx={{
                                    '&:hover': {
                                        backgroundColor: 'primary.main',
                                    },
                                }}
                            >
                                {t('Custom Date')}
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item md={6} sm={6} xs={12}>
                    <CustomStackFullWidth>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            {time === 'Today' ? (
                                <MobileTimePicker
                                    ampm={global?.timeformat !== '24'}
                                    label="Select Time"
                                    value={selectedDateTime}
                                    onChange={(time) => handleTime(time)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            variant="outlined"
                                        />
                                    )}
                                />
                            ) : (
                                <DateTimePicker
                                    ampm={global?.timeformat !== '24'}
                                    label="Schedule"
                                    viewRenderers={{
                                        hours: renderTimeViewClock,
                                        minutes: renderTimeViewClock,
                                        seconds: renderTimeViewClock,
                                    }}
                                    value={selectedDateTime}
                                    onChange={(dateTime) => {
                                        // Ensure the selected date-time is valid
                                        if (
                                            dateTime &&
                                            dayjs(dateTime).isValid()
                                        ) {
                                            const selectedHour =
                                                dayjs(dateTime).hour()
                                            const selectedMinute =
                                                dayjs(dateTime).minute()

                                            if (
                                                selectedHour !== 0 &&
                                                selectedMinute !== 0
                                            ) {
                                                handleDateChange(dateTime)
                                            } else {
                                                console.log(
                                                    'Hour and minute must be selected'
                                                )
                                            }
                                        }
                                    }}
                                    minDate={
                                        minSelectableDate
                                            ? dayjs(minSelectableDate)
                                            : dayjs()
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            variant="outlined"
                                        />
                                    )}
                                />
                            )}
                        </LocalizationProvider>
                    </CustomStackFullWidth>
                </Grid>
            </Grid>
        </CustomPaperBigCard>
    )
}

export default DineInPreferableTime
