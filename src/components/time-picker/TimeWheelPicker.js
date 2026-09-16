import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    Box,
    Dialog,
    Drawer,
    Stack,
    Typography,
    useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import useCloseOnBackButton from '@/hooks/custom-hooks/useCloseOnBackButton'

const pad = (unit) => String(unit).padStart(2, '0')

// Column-list time picker (hour / minute / meridiem) used instead of MUI's
// clock dial. Two reasons it exists: the dial makes minute-level precision
// fiddly, and MUI skips its onAccept callback when the value is untouched —
// so confirming a pre-filled time silently did nothing. Here whatever is
// highlighted IS the value, and Okay always reports it.
const TimeWheelPicker = ({
    open,
    onClose,
    value,
    onAccept,
    ampm = true,
    title,
}) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    useCloseOnBackButton(open, onClose)
    const itemHeight = isMobile ? 38 : 44
    const listHeight = isMobile ? 190 : 220

    const [hour, setHour] = useState(12)
    const [minute, setMinute] = useState(0)
    const [meridiem, setMeridiem] = useState('AM')

    const hourListRef = useRef(null)
    const minuteListRef = useRef(null)

    // 12-hour lists read 12, 01…11 (matching the design); 24-hour runs 00…23
    // and drops the meridiem column entirely.
    const hours = useMemo(
        () =>
            ampm
                ? [12, ...Array.from({ length: 11 }, (_, index) => index + 1)]
                : Array.from({ length: 24 }, (_, index) => index),
        [ampm]
    )
    const minutes = useMemo(
        () => Array.from({ length: 60 }, (_, index) => index),
        []
    )

    useEffect(() => {
        if (!open) return
        const base =
            value && dayjs(value).isValid() ? dayjs(value) : dayjs()
        const hour24 = base.hour()
        const nextMinute = base.minute()
        const nextHour = ampm
            ? hour24 % 12 === 0
                ? 12
                : hour24 % 12
            : hour24
        setHour(nextHour)
        setMinute(nextMinute)
        setMeridiem(hour24 >= 12 ? 'PM' : 'AM')

        // Scroll each column to its selection once the lists have painted.
        const frame = requestAnimationFrame(() => {
            const hourIndex = hours.indexOf(nextHour)
            if (hourListRef.current && hourIndex >= 0) {
                hourListRef.current.scrollTop = hourIndex * itemHeight
            }
            if (minuteListRef.current) {
                minuteListRef.current.scrollTop = nextMinute * itemHeight
            }
        })
        return () => cancelAnimationFrame(frame)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, itemHeight])

    const handleAccept = () => {
        let hour24 = hour
        if (ampm) {
            if (meridiem === 'AM') {
                hour24 = hour === 12 ? 0 : hour
            } else {
                hour24 = hour === 12 ? 12 : hour + 12
            }
        }
        const base =
            value && dayjs(value).isValid() ? dayjs(value) : dayjs()
        onAccept?.(base.hour(hour24).minute(minute).second(0).millisecond(0))
        onClose?.()
    }

    const renderColumn = ({ items, selected, onSelect, listRef, format }) => (
        <Box
            ref={listRef}
            sx={{
                flex: 1,
                minWidth: 0,
                height: `${listHeight}px`,
                overflowY: 'auto',
                px: '6px',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
            }}
        >
            {items.map((item) => {
                const isSelected = item === selected
                return (
                    <Box
                        key={item}
                        onClick={() => onSelect(item)}
                        sx={{
                            height: `${itemHeight}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            backgroundColor: isSelected
                                ? 'primary.main'
                                : 'transparent',
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: { xs: '14px', sm: '16px' },
                                fontWeight: isSelected ? 700 : 500,
                                letterSpacing: '-0.48px',
                                color: isSelected ? '#fff' : 'text.primary',
                            }}
                        >
                            {format(item)}
                        </Typography>
                    </Box>
                )
            })}
        </Box>
    )

    const content = (
        <Stack
            sx={{
                width: '100%',
                p: { xs: '12px', sm: '16px' },
                gap: { xs: '12px', sm: '16px' },
            }}
        >
            {title && (
                <Typography
                    sx={{
                        fontSize: { xs: '14px', sm: '16px' },
                        fontWeight: 700,
                        lineHeight: 1.1,
                        letterSpacing: '-0.48px',
                        color: 'text.primary',
                    }}
                >
                    {title}
                </Typography>
            )}
            <Stack
                direction="row"
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    '& > *:not(:last-of-type)': {
                        borderRight: '1px solid',
                        borderColor: 'divider',
                    },
                }}
            >
                {renderColumn({
                    items: hours,
                    selected: hour,
                    onSelect: setHour,
                    listRef: hourListRef,
                    format: pad,
                })}
                {renderColumn({
                    items: minutes,
                    selected: minute,
                    onSelect: setMinute,
                    listRef: minuteListRef,
                    format: pad,
                })}
                {ampm &&
                    renderColumn({
                        items: ['AM', 'PM'],
                        selected: meridiem,
                        onSelect: setMeridiem,
                        listRef: null,
                        format: (item) => item,
                    })}
            </Stack>
            <Stack
                onClick={handleAccept}
                alignItems="center"
                justifyContent="center"
                sx={{
                    height: '40px',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    backgroundColor: 'primary.main',
                }}
            >
                <Typography
                    sx={{
                        fontSize: { xs: '14px', sm: '16px' },
                        fontWeight: 700,
                        letterSpacing: '-0.48px',
                        color: '#fff',
                    }}
                >
                    {t('Okay')}
                </Typography>
            </Stack>
        </Stack>
    )

    if (isMobile) {
        return (
            <Drawer
                anchor="bottom"
                open={Boolean(open)}
                onClose={onClose}
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: '20px',
                        borderTopRightRadius: '20px',
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
                    borderRadius: '16px',
                    width: '300px',
                    maxWidth: '92vw',
                },
            }}
        >
            {content}
        </Dialog>
    )
}

export default TimeWheelPicker
