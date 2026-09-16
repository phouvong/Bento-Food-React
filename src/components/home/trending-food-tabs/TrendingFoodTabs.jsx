import React, { memo, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
    Box,
    IconButton,
    Stack,
    Typography,
    alpha,
    styled,
    useMediaQuery,
    useTheme,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import NewFoodCard from '@/components/new-food-card/NewFoodCard'
import FoodCardShimmer from '@/components/food-card/FoodCarShimmer'
import useDragScroll from '@/hooks/useDragScroll'
import { SECTION_GUTTER_PX } from '@/components/container/Section'
import { HOME_SECTION_SPACING } from '../homeSectionSpacing'

const SPACING = HOME_SECTION_SPACING.trendingFoodTabs
import { SLIDE_GAP } from '../Banner'

const NavBtn = styled(IconButton)(({ theme }) => ({
    width: 36,
    height: 36,
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
    '& svg': { fontSize: 18 },
}))

const TabBar = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    padding: 4,
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    flexShrink: 0,
    maxWidth: '100%',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
    [theme.breakpoints.down('sm')]: {
        width: 'auto',
        flexShrink: 1,
        gap: 0,
        padding: 3,
        scrollSnapType: 'x mandatory',
        '& > *': { scrollSnapAlign: 'start' },
    },
}))

const TabBtn = styled('button', {
    shouldForwardProp: (p) => p !== 'isactive',
})(({ theme, isactive }) => ({
    border: 'none',
    cursor: 'pointer',
    padding: '9px 18px',
    lineHeight: 1.2,
    borderRadius: 6,
    fontSize: 12.5,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'all .18s ease',
    [theme.breakpoints.down('sm')]: {
        padding: '7px 10px',
        fontSize: 11.5,
    },
    backgroundColor:
        isactive === 'true' ? theme.palette.primary.main : 'transparent',
    color:
        isactive === 'true'
            ? theme.palette.primary.contrastText
            : theme.palette.text.secondary,
    boxShadow:
        isactive === 'true'
            ? `0 2px 6px ${alpha(theme.palette.primary.main, 0.28)}`
            : 'none',
    '&:hover': isactive === 'true' ? {} : { color: theme.palette.primary.main },
}))

const ScrollRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: SLIDE_GAP,
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollSnapType: 'x mandatory',
    scrollBehavior: 'smooth',
    padding: '4px 2px 0px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
    '& > .scroll-item': {
        flex: '0 0 187px',
        scrollSnapAlign: 'start',
        minWidth: 0,
    },
    [theme.breakpoints.down('sm')]: {
        gap: 12,
        '& > .scroll-item': { flex: '0 0 140px' },
    },
}))

const TabHead = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    [theme.breakpoints.down('sm')]: {
        alignItems: 'flex-start',
        flexDirection: 'column',
    },
}))

const TrendingFoodTabs = ({
    campaignIsLoading,
    popularIsLoading,
    bestReviewedIsLoading,
}) => {
    const { t } = useTranslation()
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const isRtl = theme.direction === 'rtl'
    const PrevIcon = isRtl ? ChevronRightIcon : ChevronLeftIcon
    const NextIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon
    const dragScroll = useDragScroll()
    const scrollRef = dragScroll.ref

    const { global } = useSelector((state) => state.globalSettings)
    const { campaignFoods, popularFood, bestReviewedFoods } = useSelector(
        (state) => state.storedData
    )

    const tabs = useMemo(() => {
        const list = [
            {
                value: 'todays-trends',
                title: t("Today's Trends"),
                data: campaignFoods,
                isLoading: campaignIsLoading,
                isCampaign: true,
                imageUrl: global?.base_urls?.campaign_image_url,
            },
            {
                value: 'popular-foods',
                title: t('Popular Foods'),
                data: popularFood,
                isLoading: popularIsLoading,
                isCampaign: false,
                imageUrl: global?.base_urls?.product_image_url,
                enabled: Boolean(global?.popular_food),
            },
            {
                value: 'best-reviewed',
                title: t('Best Reviewed'),
                data: bestReviewedFoods,
                isLoading: bestReviewedIsLoading,
                isCampaign: false,
                imageUrl: global?.base_urls?.product_image_url,
                enabled: Boolean(global?.most_reviewed_foods),
            },
        ]
        return list.filter(
            (tab) =>
                tab.enabled !== false &&
                ((tab.data?.length ?? 0) > 0 || tab.isLoading)
        )
    }, [
        t,
        campaignFoods,
        popularFood,
        bestReviewedFoods,
        campaignIsLoading,
        popularIsLoading,
        bestReviewedIsLoading,
        global,
    ])

    const [active, setActive] = useState(null)
    const [isScrollable, setIsScrollable] = useState(false)

    useEffect(() => {
        if (!tabs.length) return
        if (!active || !tabs.some((tb) => tb.value === active)) {
            setActive(tabs[0].value)
        }
    }, [tabs, active])

    const current = tabs.find((tb) => tb.value === active) || tabs[0]
    const products = current?.data ?? []

    useEffect(() => {
        const el = scrollRef.current
        const check = () => {
            if (!el) {
                setIsScrollable(false)
                return
            }
            setIsScrollable(el.scrollWidth > el.clientWidth + 1)
        }
        const id = setTimeout(check, 0)
        window.addEventListener('resize', check)
        return () => {
            clearTimeout(id)
            window.removeEventListener('resize', check)
        }
    }, [current?.data, current?.isLoading])

    if (!tabs.length) return null

    const scrollByAmount = (dir) => {
        const el = scrollRef.current
        if (!el) return
        el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' })
    }

    return (
        <Box sx={{ pl: SECTION_GUTTER_PX, pt: SPACING.pt, pb: SPACING.pb }}>
            <TabHead sx={{ pr: SECTION_GUTTER_PX, mb: SPACING.headerGap }}>
                <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                    <Typography
                        component="h2"
                        sx={{
                            fontSize: { xs: 16, md: 22 },
                            fontWeight: { xs: 700, md: 800 },
                            letterSpacing: '-0.02em',
                            lineHeight: 1.2,
                            color: (th) => th.palette.text.primary,
                        }}
                    >
                        {t('Items You Will Love')}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: { xs: 12, md: 13.5 },
                            color: (th) => th.palette.text.secondary,
                        }}
                    >
                        {t("What everyone's watching and ordering")}
                    </Typography>
                </Stack>

                <Stack
                    direction="row"
                    alignItems="center"
                    gap={1.5}
                    sx={{
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: 0,
                    }}
                >
                    {!isSmall && isScrollable && (
                        <Stack direction="row" alignItems="center" gap={1}>
                            <NavBtn
                                aria-label="Previous"
                                onClick={() => scrollByAmount(isRtl ? 1 : -1)}
                            >
                                <PrevIcon />
                            </NavBtn>
                            <NavBtn
                                aria-label="Next"
                                onClick={() => scrollByAmount(isRtl ? -1 : 1)}
                            >
                                <NextIcon />
                            </NavBtn>
                        </Stack>
                    )}
                    {tabs.length > 1 && (
                        <TabBar role="tablist">
                            {tabs.map((tab) => (
                                <TabBtn
                                    key={tab.value}
                                    role="tab"
                                    type="button"
                                    isactive={
                                        active === tab.value
                                            ? 'true'
                                            : 'false'
                                    }
                                    onClick={() => setActive(tab.value)}
                                >
                                    {tab.title}
                                </TabBtn>
                            ))}
                        </TabBar>
                    )}
                </Stack>
            </TabHead>

            {current?.isLoading ? (
                <ScrollRow>
                    {[...Array(5)].map((_, i) => (
                        <Box key={i} className="scroll-item">
                            <FoodCardShimmer
                                cardWidth="100%"
                                cardHeight="230px"
                            />
                        </Box>
                    ))}
                </ScrollRow>
            ) : (
                <ScrollRow {...dragScroll} sx={{ cursor: 'grab' }}>
                    {products.map((product) => {
                        const valid =
                            product?.variations === null ||
                            product?.variations?.[0]?.values ||
                            product?.variations?.length === 0
                        if (!valid) return null
                        return (
                            <Box key={product?.id} className="scroll-item">
                                <NewFoodCard
                                    product={product}
                                    productImageUrl={current?.imageUrl}
                                    campaign={current?.isCampaign}
                                />
                            </Box>
                        )
                    })}
                </ScrollRow>
            )}
        </Box>
    )
}

export default memo(TrendingFoodTabs)
