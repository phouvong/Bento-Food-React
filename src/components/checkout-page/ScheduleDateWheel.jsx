import React, { useEffect, useRef } from 'react'
import { Box, Typography } from '@mui/material'

const ITEM_HEIGHT = 40
const VISIBLE_ROWS = 3

// Figma 80:20339 — wheel-style date picker: the selected date sits in a
// white pill at the centre, neighbours fade out above and below.
// Purely presentational: `options` is already filtered/bounded by the parent.
const ScheduleDateWheel = ({ options = [], value, onChange }) => {
    const scrollRef = useRef(null)
    const scrollTimer = useRef(null)

    const selectedIndex = Math.max(
        0,
        options.findIndex((option) => option.value === value)
    )

    // Keep the wheel aligned when the value changes from outside (e.g. the
    // tab switch seeding today's date).
    useEffect(() => {
        const element = scrollRef.current
        if (!element) return
        const target = selectedIndex * ITEM_HEIGHT
        if (Math.abs(element.scrollTop - target) > 1) {
            element.scrollTo({ top: target })
        }
    }, [selectedIndex])

    useEffect(() => () => clearTimeout(scrollTimer.current), [])

    // Commit only once scrolling settles, so dragging past entries doesn't
    // fire a change for every row it passes.
    const handleScroll = () => {
        clearTimeout(scrollTimer.current)
        scrollTimer.current = setTimeout(() => {
            const element = scrollRef.current
            if (!element) return
            const index = Math.min(
                Math.max(Math.round(element.scrollTop / ITEM_HEIGHT), 0),
                options.length - 1
            )
            const next = options[index]
            if (next && next.value !== value) {
                onChange(next.value)
            }
        }, 120)
    }

    if (options.length === 0) return null

    return (
        <Box
            sx={{
                position: 'relative',
                px: '12px',
                py: '8px',
                borderRadius: '8px',
                backgroundColor: (theme) => theme.palette.neutral[1800],
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    left: '12px',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: `${ITEM_HEIGHT}px`,
                    borderRadius: '8px',
                    backgroundColor: 'background.paper',
                    pointerEvents: 'none',
                }}
            />
            <Box
                ref={scrollRef}
                onScroll={handleScroll}
                sx={{
                    position: 'relative',
                    height: `${VISIBLE_ROWS * ITEM_HEIGHT}px`,
                    py: `${ITEM_HEIGHT}px`,
                    overflowY: 'auto',
                    scrollSnapType: 'y mandatory',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                }}
            >
                {options.map((option, index) => {
                    const isSelected = index === selectedIndex
                    return (
                        <Box
                            key={option.value}
                            onClick={() => onChange(option.value)}
                            sx={{
                                height: `${ITEM_HEIGHT}px`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                scrollSnapAlign: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: isSelected ? '18px' : '14px',
                                    fontWeight: isSelected ? 700 : 400,
                                    lineHeight: 1.3,
                                    letterSpacing: isSelected
                                        ? '-0.72px'
                                        : 'normal',
                                    color: isSelected
                                        ? 'text.primary'
                                        : 'text.secondary',
                                    opacity: isSelected ? 1 : 0.5,
                                    transition:
                                        'font-size .12s ease, opacity .12s ease',
                                }}
                            >
                                {option.label}
                            </Typography>
                        </Box>
                    )
                })}
            </Box>
        </Box>
    )
}

export default ScheduleDateWheel
