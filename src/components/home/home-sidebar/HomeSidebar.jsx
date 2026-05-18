import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useQuery } from 'react-query'
import {
    Box,
    Skeleton,
    Stack,
    Typography,
    alpha,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import RecommendOutlinedIcon from '@mui/icons-material/RecommendOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined'

import { CategoryApi } from '@/hooks/react-query/config/categoryApi'
import { setFeaturedCategories } from '@/redux/slices/storedData'
import CustomImageContainer from '@/components/CustomImageContainer'
import { onErrorResponse } from '@/components/ErrorResponse'
import useHideOnScroll from '@/hooks/custom-hooks/useHideOnScroll'
import { getToken } from '@/utils/localStorage'

const SidebarShell = styled(Box)(({ theme }) => ({
    position: 'sticky',
    marginTop: '20px',
    height: 'calc(100dvh - 160px)',
    maxHeight: 'calc(100vh - 160px)',
    transition: 'top 0.25s ease, max-height 0.25s ease',
    overflowY: 'auto',
    padding: '12px 14px',
    borderRadius: '14px',
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    scrollbarGutter: 'stable',
    scrollbarWidth: 'thin',
    scrollbarColor: 'transparent transparent',
    '&::-webkit-scrollbar': { width: 6 },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'transparent',
        borderRadius: 999,
        transition: 'background-color 0.2s ease',
    },
    '&:hover': {
        scrollbarColor: `${alpha(theme.palette.text.secondary, 0.35)} transparent`,
    },
    '&:hover::-webkit-scrollbar-thumb': {
        backgroundColor: alpha(theme.palette.text.secondary, 0.35),
    },
}))

const GroupTitle = styled(Typography)(({ theme }) => ({
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: theme.palette.text.secondary,
    padding: '6px 10px',
    marginTop: '4px',
}))

const Row = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color 0.15s ease, color 0.15s ease',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        color: theme.palette.primary.main,
    },
    '&:hover .sb-row-label': {
        color: theme.palette.primary.main,
    },
}))

const RowLabel = styled(Typography)(({ theme }) => ({
    fontSize: '13.5px',
    fontWeight: 400,
    color: theme.palette.text.primary,
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}))

const CountText = styled(Typography)(({ theme }) => ({
    fontSize: '12px',
    fontWeight: 400,
    color: theme.palette.text.secondary,
    marginLeft: 'auto',
}))

const Thumb = styled(Box)(({ theme }) => ({
    width: 30,
    height: 30,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}))

const IconWrap = styled(Box)(({ theme }) => ({
    width: 26,
    height: 26,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: theme.palette.text.primary,
    '& svg': { fontSize: 18 },
}))

const SidebarLink = ({ icon, label, onClick }) => (
    <Row onClick={onClick}>
        <IconWrap>{icon}</IconWrap>
        <RowLabel className="sb-row-label">{label}</RowLabel>
    </Row>
)

const SidebarGroup = ({ title, children }) => (
    <Box sx={{ mb: '6px' }}>
        <GroupTitle>{title}</GroupTitle>
        <Stack spacing={0}>{children}</Stack>
    </Box>
)

const SidebarCategoryItem = ({ category, onNavigate, isActive,childes_count }) => {
    // const { data: childesData } = useQuery(
    //     ['sidebar-category-childes', category?.id],
    //     () => CategoryApi.categoriesChildes(category?.id),
    //     {
    //         enabled: !!category?.id,
    //         staleTime: 1000 * 60 * 30,
    //         cacheTime: 1000 * 60 * 30,
    //         retry: false,
    //     }
    // )
    const hasChildren = childes_count>0

    return (
        <Row
            onClick={() => onNavigate(category)}
            sx={
                isActive
                    ? {
                          backgroundColor: (theme) =>
                              alpha(theme.palette.primary.main, 0.1),
                          '& .sb-row-label': {
                              color: (theme) => theme.palette.primary.main,
                              fontWeight: 600,
                          },
                      }
                    : undefined
            }
        >
            <Thumb>
                {category?.image_full_url ? (
                    <CustomImageContainer
                        src={category.image_full_url}
                        width="30px"
                        height="30px"
                        borderRadius="50%"
                        objectFit="cover"
                        loading="lazy"
                    />
                ) : null}
            </Thumb>
            <RowLabel className="sb-row-label">{category?.name}</RowLabel>
            {hasChildren && (
                <ChevronRightIcon
                    sx={{
                        fontSize: 18,
                        color: (theme) =>
                            isActive
                                ? theme.palette.primary.main
                                : theme.palette.text.secondary,
                    }}
                />
            )}
        </Row>
    )
}

const HomeSidebar = ({ embedded = false, onItemClick }) => {
    const { t } = useTranslation()
    const router = useRouter()
    const dispatch = useDispatch()
    const { featuredCategories } = useSelector((state) => state.storedData)
    const { token } = useSelector((state) => state.userToken)
    const restaurantIsSticky = useSelector(
        (state) => state.scrollPosition.restaurantIsSticky
    )
    const isNavHidden = useHideOnScroll({ threshold: 50 })
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        setIsLoggedIn(Boolean(token || getToken()))
    }, [token])

    const stickyTop = restaurantIsSticky
        ? isNavHidden
            ? 78
            : 118
        : 140

    const { data, refetch } = useQuery(
        ['category', ''],
        () => CategoryApi.categories(''),
        {
            enabled: false,
            staleTime: 1000 * 60 * 8,
            cacheTime: 8 * 60 * 1000,
            onError: onErrorResponse,
        }
    )

    useEffect(() => {
        if (!featuredCategories || featuredCategories.length === 0) {
            refetch()
        }
    }, [])

    useEffect(() => {
        if (data?.data) {
            dispatch(setFeaturedCategories(data.data))
        }
    }, [data])

    const go = (path) => {
        router.push(path)
        onItemClick?.()
    }

    const goCategory = (category) => {
        router.push({
            pathname: `/category/${category?.slug || category?.id}`,
            query: { name: category?.name },
        })
        onItemClick?.()
    }

    const Shell = embedded ? Box : SidebarShell
    const shellSx = embedded
        ? { width: '100%' }
        : {
              top: `${stickyTop}px`,
              maxHeight: `calc(100vh - ${stickyTop + 20}px)`,
              height: `calc(100dvh - ${stickyTop + 20}px)`,
          }

    return (
        <Shell
            component={embedded ? 'div' : 'aside'}
            sx={shellSx}
        >
            <SidebarGroup title={t('Your Offers')}>
                {isLoggedIn && (
                    <SidebarLink
                        icon={<LocalOfferOutlinedIcon />}
                        label={t('Coupons')}
                        onClick={() => go('/coupons')}
                    />
                )}
                
                <SidebarLink
                    icon={<CardGiftcardOutlinedIcon />}
                    label={t('Offers')}
                    onClick={() => go('/campaigns')}
                />
            </SidebarGroup>

            <SidebarGroup title={t('Instant Access')}>
                <SidebarLink
                    icon={<StorefrontOutlinedIcon />}
                    label={t('Restaurants Near You')}
                    onClick={() => go('/restaurants/nearby')}
                />
                <SidebarLink
                    icon={<RecommendOutlinedIcon />}
                    label={t('Recommended Store')}
                    onClick={() => go('/restaurants/recommended')}
                />
            </SidebarGroup>

            {isLoggedIn && (
                <SidebarGroup title={t('Your Cravings')}>
                    <SidebarLink
                        icon={<HistoryOutlinedIcon />}
                        label={t('Recently Ordered')}
                        onClick={() => go('/order-history')}
                    />
                    <SidebarLink
                        icon={<FavoriteBorderOutlinedIcon />}
                        label={t('Wishlist')}
                        onClick={() => go('/wishlist')}
                    />
                </SidebarGroup>
            )}

            <SidebarGroup title={t('Categories')}>
                {(!featuredCategories || featuredCategories.length === 0) &&
                    [0, 1, 2, 3].map((i) => (
                        <Stack
                            key={i}
                            direction="row"
                            alignItems="center"
                            spacing={1.25}
                            sx={{ px: '10px', py: '6px' }}
                        >
                            <Skeleton
                                variant="circular"
                                width={30}
                                height={30}
                            />
                            <Skeleton
                                variant="text"
                                sx={{ flex: 1, fontSize: '13.5px' }}
                            />
                        </Stack>
                    ))}
                {featuredCategories?.map((category) => {
                    const activeParam = router.query?.id
                    const isActive =
                        router.pathname === '/category/[id]' &&
                        (String(activeParam) === String(category?.slug) ||
                            String(activeParam) === String(category?.id))
                    return (
                        <SidebarCategoryItem
                            key={category?.id}
                            category={category}
                            onNavigate={goCategory}
                            isActive={isActive}
                            childes_count={category?.childes_count}
                        />
                    )
                })}
            </SidebarGroup>
        </Shell>
    )
}

export default HomeSidebar
