import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useQuery } from 'react-query'
import { Box, Divider, Skeleton, Stack, Typography, alpha } from '@mui/material'
import { styled } from '@mui/material/styles'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import { CategoryApi } from '@/hooks/react-query/config/categoryApi'
import { setFeaturedCategories } from '@/redux/slices/storedData'
import CustomImageContainer from '@/components/CustomImageContainer'
import { onErrorResponse } from '@/components/ErrorResponse'
import { NAVBAR_HEIGHT } from '@/components/navbar/navbarConstants'

// Desktop gap between the navbar / content column and the sidebar.
const SIDEBAR_GAP = 24

const SidebarShell = styled(Box)(({ theme }) => ({
    position: 'sticky',
    marginTop: `${SIDEBAR_GAP}px`,
    maxHeight: 'calc(92vh - 140px - 24px)',
    transition: 'top 0.25s ease, max-height 0.25s ease',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '4px',
    borderRadius: '16px',
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
        scrollbarColor: `${alpha(
            theme.palette.text.secondary,
            0.35
        )} transparent`,
    },
    '&:hover::-webkit-scrollbar-thumb': {
        backgroundColor: alpha(theme.palette.text.secondary, 0.35),
    },
}))

const GroupTitle = styled(Typography)(({ theme }) => ({
    fontSize: '18px',
    fontWeight: 700,
    letterSpacing: '-0.54px',
    lineHeight: 1.1,
    color: theme.palette.text.secondary,
    padding: '0 12px',
}))

const Row = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '4px',
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
    fontSize: '16px',
    fontWeight: 400,
    letterSpacing: '-0.48px',
    lineHeight: 1.1,
    textTransform: 'capitalize',
    color: theme.palette.text.primary,
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}))

const SubRow = styled(Row)(() => ({
    padding: '6px 12px 6px 44px',
}))

const SubRowLabel = styled(RowLabel)(() => ({
    fontSize: '14px',
}))

const ChevronToggle = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'isOpen',
})(({ theme, isOpen }) => ({
    width: 24,
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: '50%',
    transition: 'transform 0.15s ease, background-color 0.15s ease',
    transform: isOpen ? 'rotate(90deg)' : 'none',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
    },
}))

const Thumb = styled(Box)(({ theme }) => ({
    width: 24,
    height: 24,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: theme.palette.neutral[200],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}))

const IconWrap = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'iconColor',
})(({ theme, iconColor }) => ({
    width: 20,
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: iconColor ? iconColor(theme) : theme.palette.text.primary,
    '& i': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        fontSize: 18,
        lineHeight: 1,
    },
}))

const SidebarLink = ({ icon, label, iconColor, onClick, isActive }) => (
    <Row
        onClick={onClick}
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
        <IconWrap iconColor={iconColor}>{icon}</IconWrap>
        <RowLabel className="sb-row-label">{label}</RowLabel>
    </Row>
)

const SidebarGroup = ({ title, children }) => (
    <Box sx={{ mb: '6px' }}>
        {title && <GroupTitle sx={{ mb: '12px' }}>{title}</GroupTitle>}
        <Stack spacing={0.25}>{children}</Stack>
    </Box>
)

const CategoriesShimmer = () => (
    <Stack spacing={0.25}>
        {[...Array(8)].map((_, i) => (
            <Stack
                key={i}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ px: '12px', py: '8px' }}
            >
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton
                    variant="text"
                    width={`${50 + (i % 3) * 20}%`}
                    sx={{ fontSize: '16px' }}
                />
            </Stack>
        ))}
    </Stack>
)

const SidebarCategoryItem = ({
    category,
    onNavigate,
    onNavigateSubCategory,
    isActive,
    activeSubCategoryId,
    childes_count,
}) => {
    const hasChildren = childes_count > 0
    // Start expanded when this is the category the page is currently on —
    // e.g. landing here straight from a ?subCategory=<id> link should show
    // its sibling tabs already open, not require an extra click.
    const [isOpen, setIsOpen] = useState(isActive)

    useEffect(() => {
        if (isActive) setIsOpen(true)
    }, [isActive])

    // The arrow only toggles the sub-category list open/closed — it must
    // not also trigger the row's own navigate-to-category click.
    const handleToggle = (event) => {
        event.stopPropagation()
        setIsOpen((prev) => !prev)
    }

    // The categories API already returns sub-categories under `childes` —
    // no need to fetch them again on expand.
    const subCategories = category?.childes || []

    return (
        <>
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
                            width="24px"
                            height="24px"
                            borderRadius="50%"
                            objectFit="cover"
                            loading="lazy"
                        />
                    ) : null}
                </Thumb>
                <RowLabel className="sb-row-label">{category?.name}</RowLabel>
                {hasChildren && (
                    <ChevronToggle isOpen={isOpen} onClick={handleToggle}>
                        <ChevronRightIcon
                            sx={{
                                fontSize: 18,
                                color: (theme) =>
                                    isActive
                                        ? theme.palette.primary.main
                                        : theme.palette.text.secondary,
                            }}
                        />
                    </ChevronToggle>
                )}
            </Row>
            {hasChildren && isOpen && (
                <Stack spacing={0.25}>
                    {subCategories.map((subCategory) => {
                        const isSubActive =
                            String(
                                subCategory.slug || subCategory.id
                            ) === String(activeSubCategoryId)
                        return (
                            <SubRow
                                key={subCategory.id}
                                onClick={() =>
                                    onNavigateSubCategory(
                                        category,
                                        subCategory
                                    )
                                }
                                sx={
                                    isSubActive
                                        ? {
                                              backgroundColor: (theme) =>
                                                  alpha(
                                                      theme.palette.primary
                                                          .main,
                                                      0.1
                                                  ),
                                              '& .sb-row-label': {
                                                  color: (theme) =>
                                                      theme.palette.primary
                                                          .main,
                                                  fontWeight: 600,
                                              },
                                          }
                                        : undefined
                                }
                            >
                                <SubRowLabel className="sb-row-label">
                                    {subCategory?.name}
                                </SubRowLabel>
                            </SubRow>
                        )
                    })}
                </Stack>
            )}
        </>
    )
}

const HomeSidebar = ({ embedded = false, onItemClick, bogoActive = true }) => {
    const { t } = useTranslation()
    const router = useRouter()
    const dispatch = useDispatch()
    const { featuredCategories } = useSelector((state) => state.storedData)

    const stickyTop = NAVBAR_HEIGHT + SIDEBAR_GAP

    const {
        data,
        refetch,
        isFetching: categoriesLoading,
    } = useQuery(['category', ''], () => CategoryApi.categories(''), {
        enabled: false,
        staleTime: 1000 * 60 * 8,
        cacheTime: 8 * 60 * 1000,
        onError: onErrorResponse,
    })

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

    const goCategory = (category) => {
        router.push({
            pathname: `/category/${category?.slug || category?.id}`,
            query: { name: category?.name },
        })
        onItemClick?.()
    }

    const goSubCategory = (category, subCategory) => {
        router.push({
            pathname: `/category/${category?.slug || category?.id}`,
            query: {
                name: category?.name,
                page: 1,
                subCategory: subCategory?.slug || subCategory?.id,
            },
        })
        onItemClick?.()
    }

    const goSection = (section) => {
        router.push(`/home/${section}`)
        onItemClick?.()
    }

    const handleNearbyClick = () => goSection('nearby')
    const handleOffersClick = () => goSection('offers')
    const handleTopRatedClick = () => goSection('top-rated')
    const handleFreeDeliveryClick = () => goSection('free-delivery')
    const handleBogoClick = () => router.push('/bogo-list')

    const activeSection =
        router.pathname === '/home/[...slug]' &&
        Array.isArray(router.query.slug)
            ? router.query.slug[0]
            : undefined

    const Shell = embedded ? Box : SidebarShell

    const shellSx = embedded
        ? { width: '100%' }
        : {
              top: `${stickyTop}px`,
              maxHeight: `calc(92vh - ${stickyTop}px - 24px)`,
              height: 'auto',
          }

    return (
        <Shell component={embedded ? 'div' : 'aside'} sx={shellSx}>
            <Stack sx={{ py: '12px' }} spacing={0}>
                <SidebarLink
                    icon={<i className="fi fi-ss-marker" />}
                    iconColor={(theme) => theme.palette.info.main}
                    label={t('Nearby')}
                    onClick={handleNearbyClick}
                    isActive={activeSection === 'nearby'}
                />
                <SidebarLink
                    icon={<i className="fi fi-sr-badge-percent" />}
                    iconColor={(theme) => theme.palette.error.main}
                    label={t('Offers')}
                    onClick={handleOffersClick}
                    isActive={activeSection === 'offers'}
                />
                <SidebarLink
                    icon={<i className="fi fi-sr-star" />}
                    iconColor={(theme) => theme.palette.warning.main}
                    label={t('Top Rated')}
                    onClick={handleTopRatedClick}
                    isActive={activeSection === 'top-rated'}
                />
                <SidebarLink
                    icon={<i className="fi fi-sr-biking-mountain" />}
                    iconColor={(theme) => theme.palette.success.main}
                    label={t('Free Delivery')}
                    onClick={handleFreeDeliveryClick}
                    isActive={activeSection === 'free-delivery'}
                />
                {bogoActive && (
                    <SidebarLink
                        icon={<i className="fi fi-sr-badge-percent" />}
                        iconColor={(theme) => theme.palette.error.main}
                        label={t('BOGO')}
                        onClick={handleBogoClick}
                        isActive={router.pathname === '/bogo-list'}
                    />
                )}
            </Stack>

            <Divider
                sx={{
                    borderColor: (theme) => theme.palette.neutral[200],
                }}
            />

            <Box sx={{ pt: '16px', pb: '12px' }}>
                <SidebarGroup title={t('Categories')}>
                    {(!featuredCategories || featuredCategories.length === 0) &&
                        categoriesLoading && <CategoriesShimmer />}
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
                                onNavigateSubCategory={goSubCategory}
                                isActive={isActive}
                                activeSubCategoryId={
                                    isActive
                                        ? router.query?.subCategory
                                        : undefined
                                }
                                childes_count={category?.childes_count}
                            />
                        )
                    })}
                </SidebarGroup>
            </Box>
        </Shell>
    )
}

export default HomeSidebar
