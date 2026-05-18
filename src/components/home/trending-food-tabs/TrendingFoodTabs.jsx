import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
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
    borderRadius: 999,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    flexShrink: 0,
    maxWidth: '100%',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
    [theme.breakpoints.down('sm')]: {
        width: '100%',
        flexShrink: 1,
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
    borderRadius: 999,
    fontSize: 12.5,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'all .18s ease',
    [theme.breakpoints.down('sm')]: {
        padding: '7px 14px',
        fontSize: 12,
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
    '&:hover':
        isactive === 'true'
            ? {}
            : { color: theme.palette.primary.main },
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
        flex: '0 0 185px',
        scrollSnapAlign: 'start',
        minWidth: 0,
    },
    [theme.breakpoints.down('sm')]: {
        gap: 12,
        '& > .scroll-item': { flex: '0 0 46%' },
    },
}))

const TabHead = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
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
    const scrollRef = useRef(null)

    const { global } = useSelector((state) => state.globalSettings)
    const { campaignFoods, popularFood, bestReviewedFoods } = useSelector(
        (state) => state.storedData
    )

    const tabs = useMemo(() => {
        const list = [
            {
                value: 'todays-trends',
                title: t("Today's Trends"),
                subtitle: t('Hot sellers and crowd favorites right now.'),
                data: campaignFoods,
                isLoading: campaignIsLoading,
                isCampaign: true,
                imageUrl: global?.base_urls?.campaign_image_url,
            },
            {
                value: 'popular-foods',
                title: t('Popular Foods'),
                subtitle: t('Most-loved picks near you.'),
                data: popularFood,
                isLoading: popularIsLoading,
                isCampaign: false,
                imageUrl: global?.base_urls?.product_image_url,
            },
            {
                value: 'best-reviewed',
                title: t('Best Reviewed'),
                subtitle: t('Top-rated by real diners.'),
                data: bestReviewedFoods,
                isLoading: bestReviewedIsLoading,
                isCampaign: false,
                imageUrl: global?.base_urls?.product_image_url,
            },
        ]
        return list.filter(
            (tab) => (tab.data?.length ?? 0) > 0 || tab.isLoading
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

    useEffect(() => {
        if (!tabs.length) return
        if (!active || !tabs.some((tb) => tb.value === active)) {
            setActive(tabs[0].value)
        }
    }, [tabs, active])

    const current = tabs.find((tb) => tb.value === active) || tabs[0]

    if (!tabs.length) return null

    const scrollByAmount = (dir) => {
        const el = scrollRef.current
        if (!el) return
        el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' })
    }

    const products = current?.data ?? []

    return (
        <Box>
            <TabHead>
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
                        {current?.title}
                    </Typography>
                    {current?.subtitle && (
                        <Typography
                            sx={{
                                fontSize: { xs: 12, md: 13.5 },
                                color: (th) => th.palette.text.secondary,
                            }}
                        >
                            {current.subtitle}
                        </Typography>
                    )}
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
                    <TabBar role="tablist">
                        {tabs.map((tab) => (
                            <TabBtn
                                key={tab.value}
                                role="tab"
                                type="button"
                                isactive={
                                    active === tab.value ? 'true' : 'false'
                                }
                                onClick={() => setActive(tab.value)}
                            >
                                {tab.title}
                            </TabBtn>
                        ))}
                    </TabBar>
                    {!isSmall && products.length > 0 && (
                        <Stack direction="row" alignItems="center" gap={1}>
                            <NavBtn
                                aria-label="Previous"
                                onClick={() =>
                                    scrollByAmount(isRtl ? 1 : -1)
                                }
                            >
                                <PrevIcon />
                            </NavBtn>
                            <NavBtn
                                aria-label="Next"
                                onClick={() =>
                                    scrollByAmount(isRtl ? -1 : 1)
                                }
                            >
                                <NextIcon />
                            </NavBtn>
                        </Stack>
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
                <ScrollRow ref={scrollRef}>
                    {products.map((product) => {
                        const valid =
                            product?.variations === null ||
                            product?.variations?.[0]?.values ||
                            product?.variations?.length === 0
                        if (!valid) return null
                        return (
                            <Box
                                key={product?.id}
                                className="scroll-item"
                            >
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
