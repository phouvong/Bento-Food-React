import React, { useEffect, useRef, useState } from 'react'
import { Badge, Grid, IconButton, Typography, Box, Stack } from '@mui/material'
import { useSelector } from 'react-redux'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { CategoryButton } from './restaurant-details.style'
import { styled, useTheme } from '@mui/material/styles'
import FilterPanel from '../home/filter-tabs/FilterPanel'
import {
    RESTAURANT_DETAILS_FILTER_BY_OPTIONS,
    RESTAURANT_DETAILS_SORT_OPTIONS,
    RESTAURANT_RATING_OPTIONS,
    getRestaurantTypeOptions,
} from './restaurantFilterOptions'
import { RTL } from '../RTL/RTL'
import { useInView } from 'react-intersection-observer'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import CustomSearch from '../custom-search/CustomSearch'
import { t } from 'i18next'
import { NAVBAR_HEIGHT } from '../navbar/navbarConstants'

const CustomBox = styled(Box)(({ theme }) => ({
    width: '100%',
    overflow: 'auto',
    cursor: 'pointer',
    scrollBehavior: 'smooth',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
        display: 'none',
    },
}))

const RestaurantCategoryBar = (props) => {
    const {
        data,
        selectedId,
        handleClick,
        isSmall,
        searchKey,
        isHidden,
        setRemoveStickyBanner,
        removeStickyBanner,
        highestPrice,
        filterValue,
        onApplyFilters,
        activeFilters,
        handleSearchResult,
    } = props
    const theme = useTheme()
    const { global } = useSelector((state) => state.globalSettings)

    const [anchorEl, setAnchorEl] = useState(null)
    const refs = useRef([])
    const scrollerRef = useRef(null)
    const [showLeftBtn, setShowLeftBtn] = useState(false)
    const [showRightBtn, setShowRightBtn] = useState(false)
    const handleDropClick = (event) => {
        setAnchorEl(event.currentTarget)
    }
    const handleDropClose = () => {
        setAnchorEl(null)
    }
    useEffect(() => {
        if (selectedId && refs.current[selectedId]) {
            const selectedButton = refs.current[selectedId]
            const scrollerLeft =
                scrollerRef.current.getBoundingClientRect().left
            const buttonLeft = selectedButton.getBoundingClientRect().left
            const offset =
                buttonLeft -
                scrollerLeft +
                scrollerRef.current.scrollLeft
            scrollerRef.current.scrollTo({
                left: Math.max(0, offset),
                behavior: 'smooth',
            })
        }
    }, [selectedId])

    const updateScrollButtonVisibility = () => {
        const scroller = scrollerRef.current
        if (!scroller) return

        const { scrollLeft, scrollWidth, clientWidth } = scroller
        const maxScrollLeft = scrollWidth - clientWidth

        setShowLeftBtn(scrollLeft > 0)
        // Only show right button when content overflows and we are not at the end
        setShowRightBtn(maxScrollLeft > 2 && scrollLeft < maxScrollLeft - 2)
    }

    useEffect(() => {
        updateScrollButtonVisibility()

        const currentScroller = scrollerRef.current
        if (currentScroller) {
            currentScroller.addEventListener(
                'scroll',
                updateScrollButtonVisibility
            )
            window.addEventListener('resize', updateScrollButtonVisibility)
        }

        return () => {
            if (currentScroller) {
                currentScroller.removeEventListener(
                    'scroll',
                    updateScrollButtonVisibility
                )
                window.removeEventListener('resize', updateScrollButtonVisibility)
            }
        }
    }, [])

    // Recalculate when categories change (e.g., after API load)
    useEffect(() => {
        const raf = requestAnimationFrame(updateScrollButtonVisibility)
        return () => cancelAnimationFrame(raf)
    }, [data])

    let languageDirection = undefined
    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }

    const isActiveCategoryBar = (item, index) => {
        if (selectedId !== null) {
            if (selectedId === item?.id) {
                return 'true'
            } else {
                return 'false'
            }
        } else {
            if (index === 0) {
                return 'true'
            }
        }
    }
    const { ref, inView } = useInView({
        rootMargin: '-130px 0px 0px 0px',
    })

    useEffect(() => {
        // Skip the sticky-banner-removal dance on mobile — the banner is no longer
        // fixed there, so this state isn't read by TopBanner on small viewports.
        if (isSmall) return
        if (inView) {
            setRemoveStickyBanner(false)
        } else {
            setRemoveStickyBanner(true)
        }
    }, [inView, isSmall])


    return (
        <RTL direction={languageDirection}>
            <Grid
                container
                spacing={{ xs: 0, sm: 2 }}
                rowSpacing={{ xs: 0.5, sm: 0 }}
                ref={ref}
                sx={{
                    position: 'sticky',
                    // Mobile: sticks below the sticky MobilePageHeader (~58px)
                    // since the global navbar is hidden on this route.
                    top: {
                        xs: '58px',
                        md: `${NAVBAR_HEIGHT}px`,
                    },
                    // Same token as the page shell (WrapperForApp), so the
                    // bar blends with the page yet masks content scrolling
                    // beneath it.
                    background: (theme) => theme.palette.neutral[1800],
                    // Side padding carries the mobile content inset (the page
                    // container has no gutters below md) — it must live on
                    // the sticky bar itself, not a wrapper, so the bar keeps
                    // room to travel and its bg spans edge to edge.
                    padding: {
                        xs: '10px 24px 4px',
                        sm: '10px 32px 4px',
                        md: '10px 0px 5px',
                    },
                    zIndex: 100,
                }}
                alignItems="center"
            >
                <Grid
                    item
                    xs={12}
                    sm={9}
                    md={7}
                    order={{ xs: 2, sm: 1 }}
                    sx={{ position: 'relative' }}
                >
                    <CustomBox ref={scrollerRef}>
                            {showLeftBtn && (
                                <IconButton
                                    sx={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        backgroundColor:
                                            theme.palette.background.paper,
                                        boxShadow:
                                            '0px 1px 4px rgba(0, 0, 0, 0.15)',
                                        position: 'absolute',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        left: '-4px',
                                        zIndex: 9,
                                        '&:hover': {
                                            backgroundColor:
                                                theme.palette.background.paper,
                                        },
                                    }}
                                    onClick={() => {
                                        if (scrollerRef.current) {
                                            scrollerRef.current.scrollBy({
                                                left: -200,
                                                behavior: 'smooth',
                                            })
                                        }
                                    }}
                                >
                                    <ChevronLeftIcon
                                        sx={{
                                            fontSize: 18,
                                            color: theme.palette
                                                .neutral[1000],
                                        }}
                                    />
                                </IconButton>
                            )}
                            <CustomStackFullWidth
                                direction="row"
                                alignItems="center"
                                gap={2.5}
                            >
                                {data?.map((item, index) => {
                                    const active = isActiveCategoryBar(
                                        item,
                                        index
                                    )
                                    return (
                                        <CategoryButton
                                            key={item?.id}
                                            id={item?.id}
                                            ref={(el) =>
                                                (refs.current[item?.id] = el)
                                            }
                                            onClick={() =>
                                                handleClick(item?.id)
                                            }
                                            active={active}
                                        >
                                            <Typography
                                                fontSize={{
                                                    xs: '15px',
                                                    md: '16px',
                                                }}
                                                fontWeight={
                                                    active === 'true'
                                                        ? 700
                                                        : 400
                                                }
                                                sx={{
                                                    lineHeight: 1.2,
                                                    letterSpacing:
                                                        active === 'true'
                                                            ? '-0.48px'
                                                            : '-0.32px',
                                                    color:
                                                        active === 'true'
                                                            ? theme.palette
                                                                  .primary.main
                                                            : theme.palette
                                                                  .text.primary,
                                                    transition:
                                                        'color 120ms ease',
                                                }}
                                            >
                                                {item?.name}
                                            </Typography>
                                        </CategoryButton>
                                    )
                                })}
                            </CustomStackFullWidth>
                            {showRightBtn && (
                                <IconButton
                                    sx={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        backgroundColor:
                                            theme.palette.background.paper,
                                        boxShadow:
                                            '0px 1px 4px rgba(0, 0, 0, 0.15)',
                                        position: 'absolute',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        left: 'auto',
                                        right: '-4px',
                                        zIndex: 9,
                                        '&:hover': {
                                            backgroundColor:
                                                theme.palette.background.paper,
                                        },
                                    }}
                                    onClick={() => {
                                        if (scrollerRef.current) {
                                            scrollerRef.current.scrollBy({
                                                left: 200,
                                                behavior: 'smooth',
                                            })
                                        }
                                    }}
                                >
                                    <ChevronRightIcon
                                        sx={{
                                            fontSize: 18,
                                            color: theme.palette
                                                .neutral[1000],
                                        }}
                                    />
                                </IconButton>
                            )}
                    </CustomBox>
                </Grid>

                <Grid
                    item
                    xs={12}
                    sm={3}
                    md={5}
                    order={{ xs: 1, sm: 2 }}
                    align={languageDirection === 'rtl' ? 'left' : 'right'}
                >
                    <Stack
                        direction="row"
                        width="100%"
                        spacing={2}
                        alignItems="center"
                        justifyContent="flex-end"
                        sx={{ marginInlineStart: 'auto' }}
                    >
                        <Box
                            sx={{
                                width: '100%',
                                // In dark mode the inner InputBase carries its
                                // own 8px-radius navy background that pokes
                                // out of the rounded shell — flatten it so
                                // only the shell surface shows.
                                '& .MuiInputBase-root': {
                                    backgroundColor: 'transparent',
                                    borderRadius: '8px',
                                },
                                // Doubled class ups specificity over the
                                // shared StyledInputBase rules, which tie at
                                // two classes and win on insertion order.
                                '& .MuiInputBase-input.MuiInputBase-input': {
                                    fontSize: '16px',
                                    padding: '9px 16px 9px 12px',
                                    '&::placeholder': {
                                        color: theme.palette.neutral[400],
                                        opacity: 1,
                                    },
                                },
                                '& .MuiInputAdornment-root': {
                                    marginInlineStart: '16px',
                                },
                                '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                                    color: theme.palette.neutral[1000],
                                },
                            }}
                        >
                            <CustomSearch
                                handleSearchResult={handleSearchResult}
                                label={t('Search from here')}
                                searchFrom="restaurantDetails"
                                selectedValue={searchKey}
                                backgroundColor={
                                    theme.palette.background.paper
                                }
                                borderRadius="8px"
                                border={`1px solid ${theme.palette.divider}`}
                            />
                        </Box>

                        <Badge
                            color="primary"
                            badgeContent={activeFilters?.length || 0}
                            sx={{
                                '& .MuiBadge-badge': {
                                    fontSize: '10px',
                                    height: 16,
                                    minWidth: 16,
                                },
                            }}
                        >
                            <IconButton
                                onClick={handleDropClick}
                                aria-label={t('Filter')}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '8px',
                                    backgroundColor:
                                        theme.palette.background.paper,
                                    border: `1px solid ${
                                        activeFilters?.length
                                            ? theme.palette.primary.main
                                            : theme.palette.divider
                                    }`,
                                    // neutral[700] is near-invisible on the
                                    // dark paper bg — neutral[1000] flips
                                    // correctly between modes.
                                    color: activeFilters?.length
                                        ? theme.palette.primary.main
                                        : theme.palette.neutral[1000],
                                    transition: 'all 120ms ease',
                                    '&:hover': {
                                        borderColor:
                                            theme.palette.primary.main,
                                        color: theme.palette.primary.main,
                                        backgroundColor:
                                            theme.palette.background.paper,
                                    },
                                }}
                            >
                                <i
                                    className="fi fi-rr-filter"
                                    style={{
                                        fontSize: 20,
                                        lineHeight: 1,
                                        display: 'flex',
                                    }}
                                />
                            </IconButton>
                        </Badge>
                    </Stack>
                </Grid>
            </Grid>
            <FilterPanel
                anchorEl={anchorEl}
                onClose={handleDropClose}
                onApply={onApplyFilters}
                filterValue={filterValue}
                anchorHorizontal="right"
                sortOptions={RESTAURANT_DETAILS_SORT_OPTIONS}
                typeOptions={getRestaurantTypeOptions(
                    global?.toggle_veg_non_veg !== false
                )}
                discoverOptions={RESTAURANT_DETAILS_FILTER_BY_OPTIONS}
                discoverLabel="Filter By"
                ratingOptions={RESTAURANT_RATING_OPTIONS}
                showCategories={false}
                showCuisines={false}
                showPriceRange
                priceRangeMax={highestPrice}
                currencySymbol={global?.currency_symbol}
            />
        </RTL>
    )
}

export default RestaurantCategoryBar
