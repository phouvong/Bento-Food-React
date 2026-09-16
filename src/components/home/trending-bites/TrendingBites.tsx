import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import {
    alpha,
    Avatar,
    Box,
    IconButton,
    Skeleton,
    Stack,
    Typography,
    useMediaQuery,
} from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FoodStoriesIcon } from './TrendingIcon'
import ReelsModal, { TrendingBiteItem } from './ReelsModal'
import useGetReelsList, {
    Reel,
} from '@/hooks/react-query/reels/useGetReelsList'
import { getGuestId } from '@/components/checkout-page/functions/getGuestUserId'
import MainApi from '@/api/MainApi'
import VerifiedBadge from '@/components/verified-badge/VerifiedBadge'
import { SECTION_GUTTER_PX } from '@/components/container/Section'
import { HOME_SECTION_SPACING } from '../homeSectionSpacing'
import useDragScroll from '@/hooks/useDragScroll'

const SPACING = HOME_SECTION_SPACING.trendingBites

const GAP = { xs: '16px', md: '20px' }
const CARD_WIDTH = { xs: '160px', md: '215px' }
const CARD_HEIGHT = { xs: '284.67px', md: '382.52px' }
const CARD_FLEX = { xs: '0 0 160px', md: '0 0 215px' }
const PAGE_LIMIT = 10
const REELS_LIST_API = '/api/v1/customer/reels/list'

const formatViewCount = (count: number): string => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return String(count)
}

const NavBtn = styled(IconButton)(({ theme }) => ({
    width: 32,
    height: 32,
    padding: 0,
    borderRadius: '50%',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    transition: 'all .15s ease',
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderColor: theme.palette.primary.main,
    },
    '&.Mui-disabled': {
        opacity: 0.4,
    },
    '& svg': { fontSize: 16 },
}))

interface TrendingBiteCardProps {
    item: TrendingBiteItem
    onClick: () => void
}

const TrendingBiteCard: React.FC<TrendingBiteCardProps> = ({
    item,
    onClick,
}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)

    const handleMouseEnter = () => {
        videoRef.current?.play().catch(() => undefined)
    }

    const handleMouseLeave = () => {
        const v = videoRef.current
        if (!v) return
        v.pause()
        v.currentTime = 0
    }

    return (
        <Box
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                flex: CARD_FLEX,
                width: CARD_WIDTH,
                minWidth: 0,
                height: CARD_HEIGHT,
                cursor: 'pointer',
                backgroundColor: '#000',
                flexShrink: 0,
                '& .card-hover-overlay': {
                    opacity: 0,
                    transition: 'opacity 0.25s ease',
                },
                '&:hover .card-hover-overlay': { opacity: 1 },
            }}
        >
            {item.videoUrl ? (
                <video
                    ref={videoRef}
                    src={item.videoUrl}
                    poster={item.foodImage}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                    }}
                />
            ) : (
                <Box
                    component="img"
                    src={item.foodImage}
                    alt={item.dishName}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.src = '/static/no-image-found.png'
                    }}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                    }}
                />
            )}

            <Box
                className="card-hover-overlay"
                sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: alpha('#000000', 0.18),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 3,
                    pointerEvents: 'none',
                }}
            >
                <Box
                    sx={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        backgroundColor: alpha('#ffffff', 0.2),
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <i
                        className="fi fi-sr-play"
                        style={{
                            fontSize: '22px',
                            lineHeight: 1,
                            display: 'flex',
                            color: 'white',
                        }}
                    />
                </Box>
            </Box>

            <Box
                sx={{
                    position: 'absolute',
                    top: '10px',
                    insetInlineEnd: '10px',
                    backgroundColor: alpha('#000000', 0.5),
                    borderRadius: '20px',
                    px: 1,
                    py: 0.3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                }}
            >
                <i
                    className="fi fi-rr-eye"
                    style={{
                        fontSize: '13px',
                        lineHeight: 1,
                        display: 'flex',
                        color: 'white',
                    }}
                />
                <Typography
                    sx={{
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 500,
                        lineHeight: 1,
                    }}
                >
                    {item.viewCount}
                </Typography>
            </Box>

            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background:
                        'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)',
                    px: 1.5,
                    pt: 4,
                    pb: 1.5,
                }}
            >
                <Stack direction="row" alignItems="center" gap={0.8} mb={0.4}>
                    <Avatar
                        src={item.storeLogo}
                        alt={item.storeName}
                        sx={{
                            width: 14,
                            height: 14,
                            border: '1px solid white',
                        }}
                    />
                    <Typography
                        sx={{
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '14px',
                            lineHeight: 1.1,
                            letterSpacing: '-0.42px',
                            textTransform: 'capitalize',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            minWidth: 0,
                        }}
                    >
                        {item.storeName}
                    </Typography>
                    <VerifiedBadge
                        verified={item.storeVerified}
                        size={14}
                        sx={{ marginInlineStart: '0px' }}
                    />
                </Stack>
                <Typography
                    sx={{
                        color: alpha('#ffffff', 0.8),
                        fontSize: '11px',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {item.dishName}
                </Typography>
            </Box>
        </Box>
    )
}

const TrendingBites: React.FC = () => {
    const { t } = useTranslation()
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    const isRtl = theme.direction === 'rtl'
    const PrevIcon = isRtl ? ChevronRightIcon : ChevronLeftIcon
    const NextIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon
    const [showLeft, setShowLeft] = useState(false)
    const [showRight, setShowRight] = useState(false)
    const [reelsOpen, setReelsOpen] = useState(false)
    const [activeReelIndex, setActiveReelIndex] = useState(0)
    const [items, setItems] = useState<TrendingBiteItem[]>([])
    const [totalSize, setTotalSize] = useState(0)
    const [nextOffset, setNextOffset] = useState(2)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [isInitialLoading, setIsInitialLoading] = useState(true)
    const dragScroll = useDragScroll<HTMLDivElement>()
    const trackRef = dragScroll.ref

    const mapReel = (reel: Reel): TrendingBiteItem => ({
        id: reel.reel_id,
        foodImage: reel.thumbnail_full_url || '/static/no-image-found.png',
        storeLogo:
            reel.restaurant_logo_full_url || '/static/no-image-found.png',
        storeName: reel.restaurant_name || '',
        storeId: reel.restaurant_id,
        storeSlug: reel.restaurant_slug,
        storeVerified: reel.store_verified ?? reel.verified_seller,
        dishName: reel.description || '',
        viewCount: formatViewCount(reel.stats?.total_views ?? 0),
        foodId: reel.food_id,
    })

    const handleSuccess = (data: {
        reels?: Reel[]
        total_size?: number | string
    }) => {
        setIsInitialLoading(false)
        if (data?.reels) {
            setItems(data.reels.map(mapReel))
            setTotalSize(Number(data?.total_size ?? 0))
            setNextOffset(2)
        }
    }

    const { refetch, isError } = useGetReelsList(handleSuccess, {
        limit: PAGE_LIMIT,
        offset: 1,
        guest_id: getGuestId(),
    })

    useEffect(() => {
        if (isError) setIsInitialLoading(false)
    }, [isError])

    const showViewAll = totalSize > PAGE_LIMIT
    const hasMoreReels = items.length < totalSize

    const loadMoreReels = useCallback(async () => {
        if (isLoadingMore || items.length >= totalSize) return
        setIsLoadingMore(true)
        try {
            const guestId = getGuestId()
            const url = `${REELS_LIST_API}?limit=${PAGE_LIMIT}&offset=${nextOffset}${
                guestId ? `&guest_id=${guestId}` : ''
            }`
            const { data } = await MainApi.get<{
                reels?: Reel[]
                total_size?: number | string
            }>(url)
            const newReels: Reel[] = data?.reels ?? []
            if (newReels.length) {
                setItems((prev) => {
                    const existingIds = new Set(prev.map((p) => p.id))
                    const fresh = newReels
                        .map(mapReel)
                        .filter((r) => !existingIds.has(r.id))
                    return [...prev, ...fresh]
                })
                setNextOffset((prev) => prev + 1)
            }
            if (data?.total_size != null) setTotalSize(Number(data.total_size))
        } catch {
            // silent — user can retry by clicking next again
        } finally {
            setIsLoadingMore(false)
        }
    }, [nextOffset, isLoadingMore, items.length, totalSize])

    useEffect(() => {
        refetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const updateArrows = useCallback(() => {
        const el = trackRef.current
        if (!el) return
        const scrolled = Math.abs(el.scrollLeft)
        const maxScroll = el.scrollWidth - el.clientWidth
        setShowLeft(scrolled > 4)
        setShowRight(scrolled < maxScroll - 4)
    }, [])

    useEffect(() => {
        const el = trackRef.current
        if (!el) return
        updateArrows()
        el.addEventListener('scroll', updateArrows, { passive: true })
        const ro = new ResizeObserver(updateArrows)
        ro.observe(el)
        return () => {
            el.removeEventListener('scroll', updateArrows)
            ro.disconnect()
        }
    }, [items, updateArrows])

    const scroll = (dir: 'left' | 'right') => {
        const el = trackRef.current
        if (!el) return
        const card = el.querySelector<HTMLElement>('[data-card]')
        const gapPx = parseFloat(getComputedStyle(el).columnGap) || 16
        const step = (card ? card.offsetWidth + gapPx : 220) * 2
        const delta = dir === 'right' ? step : -step
        el.scrollBy({
            left: isRtl ? -delta : delta,
            behavior: 'smooth',
        })
    }

    const openReel = useCallback((index: number) => {
        setActiveReelIndex(index)
        setReelsOpen(true)
    }, [])

    const closeReel = useCallback(() => setReelsOpen(false), [])

    const goNext = useCallback(() => {
        setActiveReelIndex((prev) => {
            const next = Math.min(prev + 1, items.length - 1)
            if (hasMoreReels && items.length - next <= 2) {
                loadMoreReels()
            }
            return next
        })
    }, [items.length, hasMoreReels, loadMoreReels])

    const goPrev = useCallback(() => {
        setActiveReelIndex((prev) => Math.max(prev - 1, 0))
    }, [])

    const handleViewAll = () => {
        openReel(0)
        if (hasMoreReels) loadMoreReels()
    }

    if (!isInitialLoading && items.length === 0) return null

    if (isInitialLoading) {
        return (
            <Box sx={{
                    width: '100%',
                    pl: SECTION_GUTTER_PX,
                    pt: SPACING.pt,
                    pb: SPACING.pb,
                }}>
                <Stack alignItems="center" width="100%">
                    <Stack
                        alignItems="center"
                        justifyContent="space-between"
                        direction="row"
                        width="100%"
                        sx={{ mb: SPACING.headerGap }}
                    >
                        <Stack direction="row" alignItems="center" gap={1}>
                            <Skeleton
                                variant="rectangular"
                                sx={{
                                    width: { xs: 24, md: 32 },
                                    height: { xs: 24, md: 32 },
                                    borderRadius: '8px',
                                    bgcolor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'neutral.700'
                                            : 'neutral.400',
                                }}
                            />
                            <Stack gap={0.5}>
                                <Skeleton
                                    variant="text"
                                    width={110}
                                    height={24}
                                    sx={{
                                        bgcolor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? 'neutral.700'
                                                : 'neutral.400',
                                    }}
                                />
                                <Skeleton
                                    variant="text"
                                    width={200}
                                    height={18}
                                    sx={{
                                        bgcolor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? 'neutral.700'
                                                : 'neutral.400',
                                    }}
                                />
                            </Stack>
                        </Stack>
                    </Stack>

                    <Box
                        sx={{
                            display: 'flex',
                            gap: GAP,
                            width: '100%',
                            overflowX: 'auto',
                            scrollSnapType: 'x mandatory',
                            scrollbarWidth: 'none',
                            '&::-webkit-scrollbar': { display: 'none' },
                        }}
                    >
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Box
                                key={i}
                                sx={{
                                    scrollSnapAlign: 'start',
                                    flexShrink: 0,
                                    flex: CARD_FLEX,
                                    width: CARD_WIDTH,
                                    minWidth: 0,
                                    height: CARD_HEIGHT,
                                }}
                            >
                                <Skeleton
                                    variant="rectangular"
                                    width="100%"
                                    height="100%"
                                    sx={{
                                        borderRadius: '8px',
                                        bgcolor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? 'neutral.700'
                                                : 'neutral.400',
                                    }}
                                />
                            </Box>
                        ))}
                    </Box>
                </Stack>
            </Box>
        )
    }

    return (
        <>
            <Box
                sx={{
                    width: '100%',
                    pl: SECTION_GUTTER_PX,
                    pt: SPACING.pt,
                    pb: SPACING.pb,
                }}
            >
                <Stack alignItems="center" width="100%">
                    <Stack
                        alignItems="center"
                        justifyContent="space-between"
                        direction="row"
                        width="100%"
                        sx={{ mb: SPACING.headerGap }}
                    >
                        <Stack direction="row" alignItems="center" gap={1}>
                            <Box
                                sx={{
                                    width: { xs: 24, md: 32 },
                                    height: { xs: 24, md: 32 },
                                    flexShrink: 0,
                                    color: (theme) =>
                                        (theme.palette.error as any)
                                            .pureRed,
                                    '& svg': {
                                        width: '100%',
                                        height: '100%',
                                    },
                                }}
                            >
                                <FoodStoriesIcon />
                            </Box>
                            <Stack gap={0.25} sx={{ minWidth: 0 }}>
                                <Typography
                                    component="h2"
                                    sx={{
                                        fontSize: { xs: '16px', md: '22px' },
                                        fontWeight: { xs: 700, md: 800 },
                                        letterSpacing: '-0.02em',
                                        lineHeight: 1.2,
                                        textAlign: 'start',
                                        color: 'text.primary',
                                    }}
                                >
                                    {t('Food Stories')}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: { xs: '12px', md: '13.5px' },
                                        textAlign: 'start',
                                        color: 'text.secondary',
                                    }}
                                >
                                    {t(
                                        "What everyone's watching and ordering"
                                    )}
                                </Typography>
                            </Stack>
                        </Stack>

                        {!isSmall && items.length > 0 && (
                            <Stack direction="row" alignItems="center" gap={1}>
                                <NavBtn
                                    aria-label={t('Previous')}
                                    onClick={() => scroll('left')}
                                    disabled={!showLeft}
                                >
                                    <PrevIcon />
                                </NavBtn>
                                <NavBtn
                                    aria-label={t('Next')}
                                    onClick={() => scroll('right')}
                                    disabled={!showRight}
                                >
                                    <NextIcon />
                                </NavBtn>
                            </Stack>
                        )}
                    </Stack>

                    <Box sx={{ width: '100%' }}>
                        <Box
                            ref={trackRef}
                            onPointerDown={dragScroll.onPointerDown}
                            onPointerMove={dragScroll.onPointerMove}
                            onPointerUp={dragScroll.onPointerUp}
                            onPointerCancel={dragScroll.onPointerCancel}
                            onClickCapture={dragScroll.onClickCapture}
                            onDragStart={dragScroll.onDragStart}
                            onMouseDown={dragScroll.onMouseDown}
                            sx={{
                                display: 'flex',
                                gap: GAP,
                                overflowX: 'auto',
                                scrollSnapType: 'x mandatory',
                                WebkitOverflowScrolling: 'touch',
                                scrollbarWidth: 'none',
                                cursor: 'grab',
                                '&:active': { cursor: 'grabbing' },
                                '&::-webkit-scrollbar': { display: 'none' },
                            }}
                        >
                            {items.map((item, index) => (
                                <Box
                                    key={item.id}
                                    data-card
                                    sx={{
                                        scrollSnapAlign: 'start',
                                        flexShrink: 0,
                                        flex: CARD_FLEX,
                                        width: CARD_WIDTH,
                                        minWidth: 0,
                                    }}
                                >
                                    <TrendingBiteCard
                                        item={item}
                                        onClick={() => openReel(index)}
                                    />
                                </Box>
                            ))}

                            {showViewAll && (
                                <Box
                                    data-card
                                    onClick={handleViewAll}
                                    sx={{
                                        scrollSnapAlign: 'start',
                                        flexShrink: 0,
                                        flex: '0 0 110px',
                                        width: '110px',
                                        height: CARD_HEIGHT,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1.5,
                                        backgroundColor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? theme.palette.action.hover
                                                : '#F5F5F5',
                                        transition: 'background-color 0.2s',
                                        '&:hover': {
                                            backgroundColor: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? theme.palette.action
                                                          .selected
                                                    : '#EEEEEE',
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: '50%',
                                            backgroundColor: 'primary.main',
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <VisibilityOutlinedIcon />
                                    </Box>
                                    <Typography
                                        fontWeight={700}
                                        fontSize="16px"
                                        color="text.primary"
                                    >
                                        {t('View All')}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Stack>
            </Box>

            <ReelsModal
                open={reelsOpen}
                onClose={closeReel}
                items={items}
                activeIndex={activeReelIndex}
                onNext={goNext}
                onPrev={goPrev}
                onViewCountUpdate={(reelId, count) => {
                    setItems((prev) =>
                        prev.map((item) =>
                            item.id === reelId
                                ? {
                                      ...item,
                                      viewCount: formatViewCount(count),
                                  }
                                : item
                        )
                    )
                }}
            />
        </>
    )
}

export default TrendingBites
