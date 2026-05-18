import React, { useEffect, useState } from 'react'
import { IconButton, Stack, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

const navBtnSx = {
    width: 36,
    height: 36,
    border: (theme) => `1px solid ${theme.palette.divider}`,
    color: (theme) => theme.palette.text.primary,
    backgroundColor: (theme) => theme.palette.background.paper,
    transition: 'all .15s ease',
    '&:hover': {
        backgroundColor: (theme) => theme.palette.primary.main,
        color: '#fff',
        borderColor: (theme) => theme.palette.primary.main,
        boxShadow: '0 8px 16px -4px rgba(255,117,24,.38)',
        transform: 'translateY(-1px)',
    },
    '&.Mui-disabled': {
        opacity: 0.45,
    },
}

const SliderSectionHeader = ({
    title,
    subtitle,
    titleIcon,
    titleComponent = 'h2',
    sliderRef,
    showArrows = true,
    disablePrev = false,
    disableNext = false,
    itemsCount,
    viewAllText,
    onViewAll,
    sx,
}) => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const [isScrollable, setIsScrollable] = useState(true)
    const isRtl = theme.direction === 'rtl'
    const PrevIcon = isRtl ? ChevronRightIcon : ChevronLeftIcon
    const NextIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon

    useEffect(() => {
        if (typeof itemsCount !== 'number' || !sliderRef) return
        const check = () => {
            const inner = sliderRef.current?.innerSlider
            if (!inner) {
                setIsScrollable(true)
                return
            }
            const slidesToShow = inner.props?.slidesToShow ?? 1
            setIsScrollable(itemsCount > slidesToShow)
        }
        const id = setTimeout(check, 0)
        window.addEventListener('resize', check)
        return () => {
            clearTimeout(id)
            window.removeEventListener('resize', check)
        }
    }, [itemsCount, sliderRef])

    const showArrowsResolved =
        showArrows && !isSmall && !!sliderRef && isScrollable

    if (!title && !subtitle && !viewAllText && !showArrowsResolved) return null

    return (
        <Stack
            direction="row"
            alignItems={subtitle ? 'flex-end' : 'center'}
            justifyContent="space-between"
            spacing={1.5}
            sx={{ width: '100%', mb: { xs: 2, md: 2.5 }, ...sx }}
        >
            <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                {(title || titleIcon) && (
                    <Stack direction="row" spacing={1} alignItems="center">
                        {titleIcon}
                        {title && (
                            <Typography
                                component={titleComponent}
                                sx={{
                                    fontSize: { xs: '16px', md: '22px' },
                                    fontWeight: { xs: 700, md: 800 },
                                    letterSpacing: '-0.02em',
                                    color: (theme) =>
                                        theme.palette.text.primary,
                                    lineHeight: 1.2,
                                }}
                            >
                                {title}
                            </Typography>
                        )}
                    </Stack>
                )}
                {subtitle && (
                    <Typography
                        sx={{
                            fontSize: { xs: '12px', md: '13.5px' },
                            color: (theme) => theme.palette.text.secondary,
                        }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </Stack>

            <Stack
                direction="row"
                alignItems="center"
                spacing={{ xs: 1, md: 1.5 }}
                flexShrink={0}
            >
                {viewAllText && onViewAll && (
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.75}
                        onClick={onViewAll}
                        sx={{
                            cursor: 'pointer',
                            color: (theme) => theme.palette.primary.main,
                            '&:hover': { textDecoration: 'underline' },
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: { xs: 12, md: 13 },
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {viewAllText}
                        </Typography>
                        <ArrowForwardIcon
                            sx={{
                                fontSize: 14,
                                transform: isRtl ? 'scaleX(-1)' : 'none',
                            }}
                        />
                    </Stack>
                )}
                {showArrowsResolved && (
                    <>
                        <IconButton

                            aria-label="Previous"
                            size="small"
                            sx={navBtnSx}
                            disabled={disablePrev}
                            onClick={() => sliderRef.current?.slickPrev()}
                        >
                            <PrevIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                            aria-label="Next"
                            size="small"
                            sx={navBtnSx}
                            disabled={disableNext}
                            onClick={() => sliderRef.current?.slickNext()}
                        >
                            <NextIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </>
                )}
            </Stack>
        </Stack>
    )
}

export default SliderSectionHeader
