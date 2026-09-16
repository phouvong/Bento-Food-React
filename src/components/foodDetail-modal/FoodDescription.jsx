import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Food description clamped to `lines` (2 by default) with a centered
 * "See More / See Less" toggle. Text is left-aligned and muted; the toggle is
 * a centered blue link with a chevron, matching the food-detail modal design.
 */
const FoodDescription = ({ text, lines = 2 }) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const [expanded, setExpanded] = useState(false)
    // Whether the clamped text actually overflows — the toggle only appears
    // when there is something hidden to reveal.
    const [isOverflowing, setIsOverflowing] = useState(false)
    const textRef = useRef(null)

    // Only meaningful while collapsed: an expanded element never overflows.
    useLayoutEffect(() => {
        if (expanded) return
        const el = textRef.current
        if (!el) return
        setIsOverflowing(el.scrollHeight > el.clientHeight + 1)
    }, [text, lines, expanded])

    // The modal can be resized (or the font swapped in) after the first
    // measurement, which changes how much of the text fits.
    useEffect(() => {
        const el = textRef.current
        if (!el || typeof ResizeObserver === 'undefined') return
        const observer = new ResizeObserver(() => {
            if (expanded) return
            setIsOverflowing(el.scrollHeight > el.clientHeight + 1)
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [expanded])

    if (!text) return null

    return (
        <Stack spacing={0.75}>
            <Typography
                ref={textRef}
                sx={{
                    fontSize: { xs: '13px', md: '14px' },
                    fontWeight: 400,
                    lineHeight: 1.6,
                    color: theme.palette.neutral[500],
                    ...(expanded
                        ? {}
                        : {
                              display: '-webkit-box',
                              WebkitBoxOrient: 'vertical',
                              WebkitLineClamp: lines,
                              overflow: 'hidden',
                          }),
                }}
            >
                {text}
            </Typography>

            {isOverflowing && (
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    spacing={0.25}
                    onClick={() => setExpanded((v) => !v)}
                    sx={{
                        cursor: 'pointer',
                        color: theme.palette.info.main,
                        '&:hover': { textDecoration: 'underline' },
                    }}
                >
                    <Typography
                        component="span"
                        sx={{ fontSize: '13px', fontWeight: 600 }}
                    >
                        {expanded ? t('See Less') : t('See More')}
                    </Typography>
                    {expanded ? (
                        <KeyboardArrowUpIcon sx={{ fontSize: '18px' }} />
                    ) : (
                        <KeyboardArrowDownIcon sx={{ fontSize: '18px' }} />
                    )}
                </Stack>
            )}
        </Stack>
    )
}

export default FoodDescription
