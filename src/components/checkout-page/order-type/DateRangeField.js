import React, { useEffect, useState } from 'react'
import {
    Box,
    Dialog,
    Drawer,
    Stack,
    Typography,
    alpha,
    useMediaQuery,
    useTheme,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { PickersDay } from '@mui/x-date-pickers/PickersDay'
import dayjs from 'dayjs'
import moment from 'moment'
import useCloseOnBackButton from '@/hooks/custom-hooks/useCloseOnBackButton'
import { useTranslation } from 'react-i18next'

// Custom range day cell built on top of the same free DateCalendar used for
// the single-date mode, so both modes share one MUI theme instead of mixing
// in the react-date-range package's own default styling.
const RangeDay = styled(PickersDay, {
    shouldForwardProp: (prop) =>
        !['isStart', 'isEnd', 'isInRange'].includes(prop),
})(({ theme, isStart, isEnd, isInRange }) => ({
    ...(isInRange && {
        borderRadius: 0,
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
        color: theme.palette.text.primary,
        '&:hover, &:focus': {
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
        },
    }),
    ...(isStart && {
        borderTopLeftRadius: '50%',
        borderBottomLeftRadius: '50%',
    }),
    ...(isEnd && {
        borderTopRightRadius: '50%',
        borderBottomRightRadius: '50%',
    }),
    ...((isStart || isEnd) && {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        '&:hover, &:focus': {
            backgroundColor: theme.palette.primary.main,
        },
    }),
}))

const RangeDayCell = (props) => {
    const { day, rangeStart, rangeEnd, ...other } = props
    const isStart = Boolean(rangeStart && day.isSame(rangeStart, 'day'))
    const isEnd = Boolean(rangeEnd && day.isSame(rangeEnd, 'day'))
    const isInRange = Boolean(
        rangeStart &&
            rangeEnd &&
            day.isAfter(rangeStart, 'day') &&
            day.isBefore(rangeEnd, 'day')
    )
    return (
        <RangeDay
            {...other}
            day={day}
            selected={isStart || isEnd}
            isStart={isStart}
            isEnd={isEnd}
            isInRange={isInRange}
        />
    )
}

// Compact "Select Date" input that opens a date picker of its own — a
// Dialog on desktop, a bottom Drawer on mobile — same shell pattern as
// every other picker in this codebase, so it stacks correctly even when
// this field itself is rendered inside another Dialog/Drawer.
// mode="range" (default) opens the two-ended calendar; mode="single" opens
// a plain one-month calendar and reports the same date as both start/end,
// leaving the caller to derive whatever end date it needs.
const DateRangeField = ({
    label,
    startDate,
    endDate,
    onChange,
    minDate,
    placeholder,
    mode = 'range',
}) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const [open, setOpen] = useState(false)
    useCloseOnBackButton(isMobile && open, () => setOpen(false))
    const [draftRange, setDraftRange] = useState(null)
    const [draftSingleDate, setDraftSingleDate] = useState(null)
    const isSingle = mode === 'single'

    const hasValue = Boolean(startDate && endDate)
    const displayValue = hasValue
        ? `${moment(startDate).format('D MMM, YYYY')} - ${moment(
              endDate
          ).format('D MMM, YYYY')}`
        : placeholder

    useEffect(() => {
        if (!open) return
        if (isSingle) {
            setDraftSingleDate(startDate ? dayjs(startDate) : null)
        } else {
            setDraftRange(
                startDate && endDate ? { start: startDate, end: endDate } : null
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, isSingle])

    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    // Two-click range selection: first click starts a new range, second
    // click (on/after the start) completes it. Clicking before the current
    // start restarts the range from that day instead.
    const handleRangeDayClick = (value) => {
        setDraftRange((prev) => {
            if (!prev?.start || prev.end) {
                return { start: value.toDate(), end: null }
            }
            if (value.isBefore(dayjs(prev.start), 'day')) {
                return { start: value.toDate(), end: null }
            }
            return { start: prev.start, end: value.toDate() }
        })
    }

    const handleConfirm = () => {
        if (isSingle) {
            if (!draftSingleDate) return
            const picked = draftSingleDate.toDate()
            onChange?.(picked, picked)
        } else {
            if (!draftRange?.start || !draftRange?.end) return
            onChange?.(draftRange.start, draftRange.end)
        }
        handleClose()
    }

    const canConfirm = isSingle
        ? Boolean(draftSingleDate)
        : Boolean(draftRange?.start && draftRange?.end)

    const rangeStart = draftRange?.start ? dayjs(draftRange.start) : null
    const rangeEnd = draftRange?.end ? dayjs(draftRange.end) : null

    const calendarContent = (
        <Box sx={{ overflowX: 'auto' }}>
            {!isSingle && (
                <Stack
                    direction="row"
                    gap="12px"
                    sx={{ px: '16px', pt: '16px' }}
                >
                    {[
                        { label: t('Start Date'), value: rangeStart },
                        { label: t('End Date'), value: rangeEnd },
                    ].map(({ label, value }) => (
                        <Stack key={label} sx={{ flex: 1 }}>
                            <Typography
                                sx={{
                                    fontSize: '12px',
                                    mb: '4px',
                                    color: 'text.secondary',
                                }}
                            >
                                {label}
                            </Typography>
                            <Box
                                sx={{
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    px: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography
                                    noWrap
                                    sx={{
                                        fontSize: '14px',
                                        color: value
                                            ? 'text.primary'
                                            : 'text.secondary',
                                    }}
                                >
                                    {value ? value.format('D MMM, YYYY') : '—'}
                                </Typography>
                            </Box>
                        </Stack>
                    ))}
                </Stack>
            )}
            <Box sx={{ p: '16px', pb: '8px' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    {isSingle ? (
                        <DateCalendar
                            value={draftSingleDate}
                            onChange={(value) => setDraftSingleDate(value)}
                            minDate={dayjs(minDate || new Date())}
                        />
                    ) : (
                        <DateCalendar
                            value={null}
                            onChange={handleRangeDayClick}
                            minDate={dayjs(minDate || new Date())}
                            slots={{ day: RangeDayCell }}
                            slotProps={{
                                day: { rangeStart, rangeEnd },
                            }}
                        />
                    )}
                </LocalizationProvider>
            </Box>
            <Stack
                direction="row"
                gap="16px"
                sx={{
                    px: '16px',
                    pt: '12px',
                    pb: '16px',
                    boxShadow: '0px -1px 2px rgba(0, 0, 0, 0.05)',
                }}
            >
                <Stack
                    onClick={handleClose}
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
                        cursor: canConfirm ? 'pointer' : 'not-allowed',
                        opacity: canConfirm ? 1 : 0.5,
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
                        {t('Select')}
                    </Typography>
                </Stack>
            </Stack>
        </Box>
    )

    return (
        <Box sx={{ width: '100%' }}>
            {label && (
                <Typography
                    sx={{
                        mb: '6px',
                        fontSize: '16px',
                        color: 'text.primary',
                    }}
                >
                    {label}
                </Typography>
            )}
            <Box
                onClick={handleOpen}
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
                    borderColor: open
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
                        color: hasValue ? 'text.primary' : 'text.secondary',
                    }}
                >
                    {displayValue}
                </Typography>
                <CalendarMonthOutlinedIcon
                    sx={{
                        fontSize: 18,
                        color: 'text.secondary',
                        flexShrink: 0,
                    }}
                />
            </Box>
            {isMobile ? (
                <Drawer
                    anchor="bottom"
                    open={open}
                    onClose={handleClose}
                    sx={{ zIndex: (theme) => theme.zIndex.modal + 20 }}
                    PaperProps={{
                        sx: {
                            borderTopLeftRadius: '20px',
                            borderTopRightRadius: '20px',
                            maxHeight: '90vh',
                        },
                    }}
                >
                    {calendarContent}
                </Drawer>
            ) : (
                <Dialog
                    open={open}
                    onClose={handleClose}
                    maxWidth={false}
                    PaperProps={{
                        sx: { borderRadius: '16px', maxWidth: '96vw' },
                    }}
                >
                    {calendarContent}
                </Dialog>
            )}
        </Box>
    )
}

export default DateRangeField
