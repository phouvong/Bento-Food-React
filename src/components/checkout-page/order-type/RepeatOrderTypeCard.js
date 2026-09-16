import React, { useEffect, useState } from 'react'
import {
    Box,
    FormControlLabel,
    IconButton,
    Radio,
    RadioGroup,
    Stack,
    Typography,
} from '@mui/material'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { type as repeatOrderTypes } from './data'
import { ACTIONS } from '../states'
import RepeatOrderScheduleModal from './RepeatOrderScheduleModal'
import { getSubscriptionOrderCount } from '../functions/getSubscriptionOrderCount'
import Slider from '@/components/slider/SlickToSwiper'

const pillSliderSettings = {
    slidesToShow: 'auto',
    infinite: false,
    dots: false,
    arrows: false,
}

const subtitleByType = {
    daily: 'Choose the date range and preferred time for your daily repeat orders.',
    weekly: 'Choose the date range and preferred time for your weekly repeat orders.',
    monthly: 'Choose the date range and preferred time for your monthly repeat orders.',
}

const RepeatOrderTypeCard = ({
    t,
    subscriptionStates,
    subscriptionDispatch,
    restaurantData,
}) => {
    const { global } = useSelector((state) => state.globalSettings)
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false)

    useEffect(() => {
        if (!subscriptionStates?.type) {
            subscriptionDispatch({
                type: ACTIONS.setSubscriptionType,
                payload: 'daily',
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleChange = (e) => {
        subscriptionDispatch({
            type: ACTIONS.setSubscriptionType,
            payload: e.target.value,
        })
        // Date range and day/time selections are meaningless across a type
        // switch (monthly's range is auto-derived from a single anchor
        // date, weekly/monthly day entries are shaped differently), so
        // clear everything rather than carrying stale values into the new
        // type's Select Date & Time modal.
        subscriptionDispatch({
            type: ACTIONS.setStartDate,
            payload: '',
        })
        subscriptionDispatch({
            type: ACTIONS.setEndDate,
            payload: '',
        })
        subscriptionDispatch({
            type: ACTIONS.setSubscriptionDays,
            payload: [],
        })
    }

    const hasSchedule = Boolean(
        subscriptionStates?.startDate && subscriptionStates?.endDate
    )
    const scheduleSummary = hasSchedule
        ? `${moment(subscriptionStates.startDate, 'yyyy/MM/DD HH:mm').format('D MMM, YYYY')} - ${moment(
              subscriptionStates.endDate,
              'yyyy/MM/DD HH:mm'
          ).format('D MMM, YYYY')}`
        : ''
    const storedTime = subscriptionStates?.days?.[0]?.time
    const isDaily = subscriptionStates?.type === 'daily'
    const isMonthly = subscriptionStates?.type === 'monthly'

    // Same calculation the order summary and placeOrder validation use
    // (restaurant open-hours aware) — a plain "days between selected
    // weekday names" count was wrong: e.g. picking only Sunday across a
    // 3-31 Aug range must count every Sunday landing in that range, not 1.
    const hasDaySelection = Boolean(subscriptionStates?.days?.length)
    const orderCount =
        hasSchedule && hasDaySelection
            ? getSubscriptionOrderCount(
                  restaurantData?.data?.schedules,
                  subscriptionStates.type,
                  subscriptionStates.startDate,
                  subscriptionStates.endDate,
                  subscriptionStates.days
              )
            : 0

    const countSummary =
        orderCount > 0
            ? isMonthly
                ? t('{{count}} date(s) selected', { count: orderCount })
                : t('{{count}} day(s) selected', { count: orderCount })
            : ''

    const timeSummary =
        isDaily && storedTime
            ? moment(storedTime, 'H:mm:ss').format(
                  global?.timeformat === '24' ? 'HH:mm' : 'h:mm A'
              )
            : ''

    return (
        <Stack sx={{ width: '100%', gap: '16px' }}>
            <Stack
                direction="row"
                alignItems="center"
                flexWrap="wrap"
                gap="8px"
                sx={{ width: '100%' }}
            >
                <Typography
                    sx={{
                        flex: '1 0 0',
                        minWidth: '140px',
                        fontSize: { xs: '16px', sm: '18px' },
                        fontWeight: 700,
                        lineHeight: 1.1,
                        letterSpacing: '-0.54px',
                        color: 'text.primary',
                    }}
                >
                    {t('Repeat Order Type')}
                </Typography>
                <RadioGroup
                    value={subscriptionStates?.type || ''}
                    row
                    onChange={handleChange}
                    sx={{
                        flexWrap: 'nowrap',
                        gap: '8px',
                        width: { xs: 'calc(100% + 16px)', sm: 'auto' },
                        mr: { xs: '-16px', sm: 0 },
                        minWidth: 0,
                        '& .swiper': { py: '2px' },
                        '& .swiper-slide': { width: 'auto' },
                        '& .MuiFormControlLabel-root': { m: 0 },
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
                        {repeatOrderTypes.map((option) => (
                            <FormControlLabel
                                key={option.value}
                                value={option.value}
                                control={<Radio size="small" />}
                                label={t(option.label)}
                                sx={{
                                    flexShrink: 0,
                                    minWidth: { xs: '130px', sm: '150px' },
                                    p: '12px',
                                    border: '1px solid',
                                    borderColor: (theme) =>
                                        subscriptionStates?.type ===
                                        option.value
                                            ? theme.palette.neutral[700]
                                            : theme.palette.divider,
                                    borderRadius: '8px',
                                    backgroundColor: 'background.paper',
                                    '& .MuiFormControlLabel-label': {
                                        fontSize: { xs: '13px', sm: '14px' },
                                        fontWeight: 600,
                                        lineHeight: 1.2,
                                        letterSpacing: '-0.42px',
                                        color:
                                            subscriptionStates?.type ===
                                            option.value
                                                ? 'text.primary'
                                                : 'text.secondary',
                                    },
                                }}
                            />
                        ))}
                    </Slider>
                </RadioGroup>
            </Stack>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    p: '16px',
                    borderRadius: '8px',
                    backgroundColor: 'background.paper',
                    boxShadow:
                        '0px 1px 2px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.05)',
                }}
            >
                <Stack direction="row" alignItems="center" gap="16px">
                    <Stack sx={{ flex: 1, minWidth: 0, gap: '2px' }}>
                        <Typography
                            sx={{
                                fontSize: { xs: '16px', sm: '18px' },
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
                                fontSize: { xs: '12px', sm: '14px' },
                                lineHeight: 1.2,
                                letterSpacing: '-0.42px',
                                color: 'text.secondary',
                            }}
                        >
                            {t(
                                subtitleByType[subscriptionStates?.type] ||
                                    subtitleByType.daily
                            )}
                        </Typography>
                    </Stack>
                    <IconButton
                        onClick={() => setScheduleModalOpen(true)}
                        sx={{
                            flexShrink: 0,
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            color: 'text.info',
                        }}
                    >
                        <i
                            className={
                                hasSchedule
                                    ? 'fi fi-rr-pencil'
                                    : 'fi fi-rr-calendar-clock'
                            }
                            style={{
                                fontSize: '16px',
                                lineHeight: 1,
                                color: 'inherit',
                            }}
                        />
                    </IconButton>
                </Stack>
                {hasSchedule && (
                    <Stack
                        direction="row"
                        alignItems="baseline"
                        flexWrap="wrap"
                        gap="4px"
                    >
                        <Typography
                            sx={{
                                fontSize: { xs: '12px', sm: '14px' },
                                fontWeight: 700,
                                lineHeight: 1.1,
                                letterSpacing: '-0.42px',
                                color: 'text.info',
                            }}
                        >
                            {scheduleSummary}
                        </Typography>
                        {countSummary && (
                            <Typography
                                sx={{
                                    fontSize: { xs: '12px', sm: '14px' },
                                    lineHeight: 1.3,
                                    color: 'text.info',
                                }}
                            >
                                {countSummary}
                            </Typography>
                        )}
                        {timeSummary && (
                            <Typography
                                sx={{
                                    fontSize: { xs: '12px', sm: '14px' },
                                    lineHeight: 1.3,
                                    color: 'text.info',
                                }}
                            >
                                {timeSummary}
                            </Typography>
                        )}
                    </Stack>
                )}
            </Box>
            <RepeatOrderScheduleModal
                open={scheduleModalOpen}
                onClose={() => setScheduleModalOpen(false)}
                subscriptionStates={subscriptionStates}
                subscriptionDispatch={subscriptionDispatch}
                restaurantData={restaurantData}
            />
        </Stack>
    )
}

export default RepeatOrderTypeCard
