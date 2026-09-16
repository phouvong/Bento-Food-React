import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import ClearIcon from '@mui/icons-material/Clear'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import {
    Box,
    Button,
    Chip,
    IconButton,
    Paper,
    Portal,
    Stack,
    Typography,
    alpha,
    useMediaQuery,
} from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import {
    CustomStackFullWidth,
    SliderCustom,
} from '@/styled-components/CustomStyles.style'
import { CustomTypography } from '../custom-tables/Tables.style'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import SearchIcon from '@mui/icons-material/Search'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { Scrollbar } from '../Scrollbar'
import SearchSuggestionsShimmer from './SearchSuggestionsShimmer'
import { useGetSuggestSearchResult } from '@/hooks/react-query/search/useGetSuggestSearchResult'
import { useGetTrendingSearches } from '@/hooks/react-query/search/useGetTrendingSearches'
import { openSearchProductModal } from '@/redux/slices/searchProductModal'
import {
    handleRestaurantRedirect,
    removeSpecialCharacters,
} from '@/utils/customFunctions'
import CustomImageContainer from '../CustomImageContainer'
import NewStoreCard from '../new-store-card/NewStoreCard'
import Slider from '@/components/slider/SlickToSwiper'

const CustomPaper = styled(Paper)(({ theme, display }) => ({
    padding: 0,
    display: display ? display : 'inherit',
    overflow: 'hidden',
}))

const MOBILE_BOTTOM_RESERVE = 84

const featuredRestaurantSliderSettings = {
    dots: false,
    infinite: false,
    speed: 400,
    slidesToShow: 1.8,
    slidesToScroll: 1,
    responsive: [
        {
            breakpoint: 900,
            settings: { slidesToShow: 1.5 },
        },
        {
            breakpoint: 600,
            settings: { slidesToShow: 1.2 },
        },
    ],
}

const topRestaurantSliderSettings = {
    dots: false,
    infinite: false,
    speed: 400,
    slidesToShow: 5.3,
    responsive: [
        {
            breakpoint: 900,
            settings: { slidesToShow: 4.3 },
        },
        {
            breakpoint: 600,
            settings: { slidesToShow: 3.2 },
        },
    ],
}

const sectionTitleSx = (theme) => ({
    fontSize: '18px',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.54px',
    color: theme.palette.text.primary,
})

const sectionDividerSx = (theme) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingBottom: '12px',
})

const SearchSuggestionsBottom = (props) => {
    const {
        routeHandler,
        handleFocus,
        inputValue,
        searchRef,
        onClose,
        setSelectedValue,
        resetSearch,
        onFetchingStateChange,
    } = props

    const handleSelect = (value) => {
        if (!value) return
        setSelectedValue?.(value)
        routeHandler?.(value)
        onClose?.()
    }
    const dispatch = useDispatch()
    const theme = useTheme()
    const router = useRouter()
    const [list, setList] = useState([])
    const { t } = useTranslation()
    const placeholderRef = useRef(null)
    const [paperPos, setPaperPos] = useState(null)
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    // Desktop anchors the panel to the input's box; mobile spans the full
    // viewport (Figma node 115:31940) since the bar itself is edge-to-edge.
    useLayoutEffect(() => {
        if (!placeholderRef.current) return
        const parent = placeholderRef.current?.parentElement
        if (!parent) return
        const updatePos = () => {
            const r = parent.getBoundingClientRect()
            setPaperPos({
                top: r.bottom + 8,
                left: isMobile ? 0 : r.left,
                width: isMobile ? '100%' : r.width,
            })
        }
        updatePos()
        window.addEventListener('scroll', updatePos, true)
        window.addEventListener('resize', updatePos)
        const resizeObserver = new ResizeObserver(updatePos)
        resizeObserver.observe(parent)
        return () => {
            window.removeEventListener('scroll', updatePos, true)
            window.removeEventListener('resize', updatePos)
            resizeObserver.disconnect()
        }
    }, [isMobile])

    const { data: trendingSearchesRes, isLoading: isTrendingSearchesLoading } =
        useGetTrendingSearches()
    const trendingKeywords = trendingSearchesRes?.data?.trending_searches || []
    // SEARCH_API
    const [isSearchResultStale, setIsSearchResultStale] = useState(false)
    const {
        data,
        refetch: searchResultRefetch,
        isLoading,
    } = useGetSuggestSearchResult(removeSpecialCharacters(inputValue))

    useEffect(() => {
        if (inputValue) {
            setIsSearchResultStale(true)
            searchResultRefetch().finally(() => setIsSearchResultStale(false))
        }
    }, [inputValue])

    const isFetchingSuggestions = isSearchResultStale || isLoading
    const hasShownSkeletonRef = useRef(false)
    const showSkeleton =
        inputValue !== '' && isFetchingSuggestions && !hasShownSkeletonRef.current
    const showFetchingSpinner =
        inputValue !== '' && isFetchingSuggestions && hasShownSkeletonRef.current

    useEffect(() => {
        if (showSkeleton) hasShownSkeletonRef.current = true
    }, [showSkeleton])

    useEffect(() => {
        onFetchingStateChange?.(showFetchingSpinner)
    }, [showFetchingSpinner])

    useEffect(() => {
        return () => onFetchingStateChange?.(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const {
        data: popularRestaurantsRes,
        isLoading: isPopularRestaurantsLoading,
    } = useQuery(
        'search-suggestions-popular-restaurants',
        () => RestaurantsApi.popularRestaurants(),
        { enabled: inputValue === '', staleTime: 5 * 60 * 1000 }
    )
    const popularRestaurants = popularRestaurantsRes?.data || []

    const {
        data: featuredRestaurantsRes,
        isLoading: isFeaturedRestaurantsLoading,
    } = useQuery(
        'search-suggestions-featured-restaurants',
        () => RestaurantsApi.featuredRestaurants(),
        { enabled: inputValue === '', staleTime: 5 * 60 * 1000 }
    )
    const featuredRestaurants = featuredRestaurantsRes?.data?.restaurants || []

    useEffect(() => {
        let getItem = JSON.parse(localStorage.getItem('searchedValues'))
            ?.reverse()
            ?.slice(0, 5)
        if (getItem && getItem.length > 0) {
            setList(getItem)
        }
    }, [])
    const handleDeleteAble = (value) => {
        let getItem = JSON.parse(localStorage.getItem('searchedValues'))
        if (getItem && getItem.length > 0) {
            let newItems = getItem.filter((item) => item !== value)
            setList(newItems)
            localStorage.setItem('searchedValues', JSON.stringify(newItems))
        }
    }
    const clearAll = () => {
        setList([])
        localStorage.setItem('searchedValues', JSON.stringify([]))
    }

    const handleTopRestaurantClick = (item) => {
        resetSearch?.()
        onClose?.()
        handleRestaurantRedirect(router, item?.slug, item?.id)
    }

    const handleSuggestedFoodClick = (item) => {
        if (!item?.id) {
            handleSelect(item?.name)
            return
        }
        resetSearch?.()
        onClose?.()
        dispatch(openSearchProductModal(item))
    }

    const highlightMatch = (text, query) => {
        if (!text || !query) return text
        const index = text.toLowerCase().indexOf(query.toLowerCase())
        if (index === -1) return text
        return (
            <>
                {text.slice(0, index)}
                <Typography
                    component="span"
                    sx={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                    }}
                >
                    {text.slice(index, index + query.length)}
                </Typography>
                {text.slice(index + query.length)}
            </>
        )
    }

    const recentSearchesHandler = () => {
        return (
            <>
                {list.length > 0 && (
                    <Stack
                        spacing={1.5}
                        width="100%"
                        sx={sectionDividerSx(theme)}
                    >
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <CustomTypography sx={sectionTitleSx(theme)}>
                                {t('Recent Searches')}
                            </CustomTypography>
                            <Button
                                onClick={clearAll}
                                // Sits on the same gutter as the row delete
                                // buttons below it.
                                sx={{
                                    padding: '4px',
                                    minWidth: 0,
                                    marginInlineEnd: '-4px',
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        letterSpacing: '-0.48px',
                                        color: theme.palette.error.pureRed,
                                    }}
                                >
                                    {t('Clear All')}
                                </Typography>
                            </Button>
                        </Stack>
                        <Stack gap="10px" flexGrow={1}>
                            {list.map((item, index) => {
                                return (
                                    <CustomStackFullWidth
                                        key={index}
                                        justifyContent="space-between"
                                        direction="row"
                                        alignItems="center"
                                    >
                                        <Stack
                                            sx={{ cursor: 'pointer' }}
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            onClick={() => handleSelect(item)}
                                        >
                                            <AccessTimeIcon
                                                style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    color: theme.palette
                                                        .neutral[600],
                                                }}
                                            />
                                            <Typography
                                                fontSize="14px"
                                                color={
                                                    theme.palette.neutral[1200]
                                                }
                                            >
                                                {item}
                                            </Typography>
                                        </Stack>
                                        <IconButton
                                            onClick={() =>
                                                handleDeleteAble(item)
                                            }
                                            // Negative inline-end cancels the
                                            // button's own padding so the glyph
                                            // sits on the section gutter rather
                                            // than inset from it.
                                            sx={{
                                                padding: '4px',
                                                marginInlineEnd: '-4px',
                                            }}
                                        >
                                            <ClearIcon
                                                style={{
                                                    width: '16px',
                                                    height: '16px',
                                                }}
                                            />
                                        </IconButton>
                                    </CustomStackFullWidth>
                                )
                            })}
                        </Stack>
                    </Stack>
                )}
            </>
        )
    }

    const trendingSearchesHandler = () => {
        return (
            <>
                {trendingKeywords?.length > 0 && (
                    <Stack spacing={1.5} sx={sectionDividerSx(theme)}>
                        <CustomTypography sx={sectionTitleSx(theme)}>
                            {t('Trending Searches')}
                        </CustomTypography>
                        <Stack direction="row" flexWrap="wrap" gap="8px">
                            {trendingKeywords.map((item, index) => (
                                <Chip
                                    key={index}
                                    label={item?.keyword}
                                    onClick={() => handleSelect(item?.keyword)}
                                    sx={{
                                        cursor: 'pointer',
                                        height: 'auto',
                                        borderRadius: '999px',
                                        backgroundColor: 'transparent',
                                        border: `1px solid ${theme.palette.divider}`,
                                        '& .MuiChip-label': {
                                            padding: '4px 8px',
                                            fontSize: '14px',
                                            lineHeight: 1.2,
                                            color: theme.palette.text.primary,
                                        },
                                    }}
                                    variant="outlined"
                                />
                            ))}
                        </Stack>
                    </Stack>
                )}
                {isTrendingSearchesLoading && <SearchSuggestionsShimmer />}
            </>
        )
    }

    const topRestaurantsHandler = () => {
        return (
            <>
                {popularRestaurants?.length > 0 && (
                    <Stack spacing={1.5} sx={sectionDividerSx(theme)}>
                        <CustomTypography sx={sectionTitleSx(theme)}>
                            {t('Top Restaurants')}
                        </CustomTypography>
                        <SliderCustom gap="16px">
                            <Slider
                                {...topRestaurantSliderSettings}
                                gap="16px"
                                arrows={false}
                                className="slick__slider"
                            >
                                {popularRestaurants
                                    .slice(0, 8)
                                    .map((item, index) => (
                                        <Stack
                                            key={index}
                                            alignItems="center"
                                            justifyContent="center"
                                            spacing={1}
                                            sx={{
                                                cursor: 'pointer',
                                                width: '100px',
                                                padding: '12px 8px',
                                                borderRadius: '8px',
                                                backgroundColor:
                                                    theme.palette.neutral[1800],
                                            }}
                                            onClick={() =>
                                                handleTopRestaurantClick(item)
                                            }
                                        >
                                            <Stack
                                                alignItems="center"
                                                justifyContent="center"
                                                sx={{
                                                    width: '76px',
                                                    height: '76px',
                                                    borderRadius: '50%',
                                                    overflow: 'hidden',
                                                    backgroundColor:
                                                        theme.palette.background
                                                            .paper,
                                                    border: `1px solid ${theme.palette.divider}`,
                                                }}
                                            >
                                                <CustomImageContainer
                                                    src={item?.logo_full_url}
                                                    width="64px"
                                                    height="64px"
                                                    borderRadius="50%"
                                                    objectFit="cover"
                                                />
                                            </Stack>
                                            <Typography
                                                fontSize="14px"
                                                align="center"
                                                noWrap
                                                sx={{
                                                    width: '100%',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {item?.name}
                                            </Typography>
                                        </Stack>
                                    ))}
                            </Slider>
                        </SliderCustom>
                    </Stack>
                )}
                {isPopularRestaurantsLoading && <SearchSuggestionsShimmer />}
            </>
        )
    }

    const featuredRestaurantsHandler = () => {
        return (
            <>
                {featuredRestaurants?.length > 0 && (
                    <Stack spacing={1.5}>
                        <CustomTypography sx={sectionTitleSx(theme)}>
                            {t('Featured Restaurants')}
                        </CustomTypography>
                        <SliderCustom gap="16px">
                            <Slider
                                {...featuredRestaurantSliderSettings}
                                gap="16px"
                                arrows={false}
                                className="slick__slider"
                            >
                                {featuredRestaurants.map(
                                    (restaurant, index) => (
                                        <NewStoreCard
                                            key={index}
                                            restaurant={restaurant}
                                            onCardClick={onClose}
                                        />
                                    )
                                )}
                            </Slider>
                        </SliderCustom>
                    </Stack>
                )}
                {isFeaturedRestaurantsLoading && <SearchSuggestionsShimmer />}
            </>
        )
    }

    // SimpleBar only scrolls when it has a bound of its own — a percentage
    // against the Paper's auto height resolves to nothing — so the panel's
    // cap is shared by both. Mobile also keeps clear of BottomNav.
    const panelMaxHeight = isMobile
        ? `min(60dvh, calc(100dvh - ${
              paperPos?.top ?? 0
          }px - ${MOBILE_BOTTOM_RESERVE}px))`
        : '550px'

    return (
        <>
            <span ref={placeholderRef} style={{ display: 'none' }} />
            <Portal>
                {/* Mobile-only scrim. Starts at the panel's top edge so the
                    search bar above stays readable, and sits below the panel
                    so only the area under it dims. It swallows taps and scroll
                    gestures aimed at the page behind, and dismisses the panel:
                    blurring first so the soft keyboard closes with it. */}
                {isMobile && paperPos && (
                    <Box
                        onPointerDown={(e) => {
                            e.preventDefault()
                            document.activeElement?.blur?.()
                            onClose?.()
                        }}
                        sx={{
                            position: 'fixed',
                            top: paperPos.top,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: (theme) =>
                                alpha(theme.palette.common.black, 0.5),
                            touchAction: 'none',
                            zIndex: 99998,
                        }}
                    />
                )}
                <CustomPaper
                    ref={searchRef}
                    elevation={8}
                    onMouseEnter={() => handleFocus()}
                    onMouseDown={(e) => e.preventDefault()}
                    sx={{
                        position: 'fixed',
                        top: paperPos?.top ?? -9999,
                        left: paperPos?.left ?? 0,
                        width: paperPos?.width ?? '100%',
                        maxHeight: panelMaxHeight,
                        // Mobile is edge-to-edge, so only its bottom corners
                        // round; desktop floats free and rounds all four.
                        borderRadius: isMobile ? '0 0 20px 20px' : '8px',
                        zIndex: 99999,
                    }}
                >
                    <CustomStackFullWidth>
                        <Scrollbar style={{ maxHeight: panelMaxHeight }}>
                            <CustomStackFullWidth
                                spacing={3}
                                sx={{ padding: '1rem' }}
                            >
                                {inputValue === '' ? (
                                    <>
                                        {recentSearchesHandler()}
                                        {trendingSearchesHandler()}
                                        {topRestaurantsHandler()}
                                        {featuredRestaurantsHandler()}
                                    </>
                                ) : (
                                    <>
                                        {data &&
                                            (!isSearchResultStale ||
                                                hasShownSkeletonRef.current) && (
                                            <>
                                                {(data?.foods?.length > 0 ||
                                                    data?.restaurants?.length >
                                                        0) && (
                                                    <Stack
                                                        spacing={1.5}
                                                        sx={{
                                                            paddingTop: '10px',
                                                        }}
                                                    >
                                                        <CustomTypography
                                                            sx={sectionTitleSx(
                                                                theme
                                                            )}
                                                        >
                                                            {t(
                                                                'Search Suggested'
                                                            )}
                                                        </CustomTypography>
                                                        <Stack gap="10px">
                                                            {data?.foods
                                                                ?.slice(0, 5)
                                                                ?.map(
                                                                    (
                                                                        item,
                                                                        index
                                                                    ) => (
                                                                        <Stack
                                                                            key={`food-${index}`}
                                                                            direction="row"
                                                                            alignItems="center"
                                                                            spacing={
                                                                                1.5
                                                                            }
                                                                            sx={{
                                                                                cursor: 'pointer',
                                                                            }}
                                                                            onClick={() =>
                                                                                handleSuggestedFoodClick(
                                                                                    item
                                                                                )
                                                                            }
                                                                        >
                                                                            <i
                                                                                className="fi fi-rr-room-service"
                                                                                style={{
                                                                                    fontSize:
                                                                                        '16px',
                                                                                    color: theme
                                                                                        .palette
                                                                                        .text
                                                                                        .secondary,
                                                                                }}
                                                                            />
                                                                            <Typography
                                                                                sx={{
                                                                                    flex: 1,
                                                                                    fontSize:
                                                                                        '14px',
                                                                                    color: theme
                                                                                        .palette
                                                                                        .text
                                                                                        .secondary,
                                                                                }}
                                                                            >
                                                                                {highlightMatch(
                                                                                    item?.name,
                                                                                    inputValue
                                                                                )}
                                                                            </Typography>
                                                                            <OpenInNewIcon
                                                                                sx={{
                                                                                    fontSize:
                                                                                        '16px',
                                                                                    color: theme
                                                                                        .palette
                                                                                        .text
                                                                                        .secondary,
                                                                                }}
                                                                            />
                                                                        </Stack>
                                                                    )
                                                                )}
                                                            {data?.restaurants
                                                                ?.slice(0, 5)
                                                                ?.map(
                                                                    (
                                                                        item,
                                                                        index
                                                                    ) => (
                                                                        <Stack
                                                                            key={`restaurant-${index}`}
                                                                            direction="row"
                                                                            alignItems="center"
                                                                            spacing={
                                                                                1.5
                                                                            }
                                                                            sx={{
                                                                                cursor: 'pointer',
                                                                            }}
                                                                            onClick={() =>
                                                                                handleTopRestaurantClick(
                                                                                    item
                                                                                )
                                                                            }
                                                                        >
                                                                            <i
                                                                                className="fi fi-rr-shop"
                                                                                style={{
                                                                                    fontSize:
                                                                                        '16px',
                                                                                    color: theme
                                                                                        .palette
                                                                                        .text
                                                                                        .secondary,
                                                                                }}
                                                                            />
                                                                            <Typography
                                                                                sx={{
                                                                                    flex: 1,
                                                                                    fontSize:
                                                                                        '14px',
                                                                                    color: theme
                                                                                        .palette
                                                                                        .text
                                                                                        .secondary,
                                                                                }}
                                                                            >
                                                                                {highlightMatch(
                                                                                    item?.name,
                                                                                    inputValue
                                                                                )}
                                                                            </Typography>
                                                                            <OpenInNewIcon
                                                                                sx={{
                                                                                    fontSize:
                                                                                        '16px',
                                                                                    color: theme
                                                                                        .palette
                                                                                        .text
                                                                                        .secondary,
                                                                                }}
                                                                            />
                                                                        </Stack>
                                                                    )
                                                                )}
                                                        </Stack>
                                                    </Stack>
                                                )}
                                                <Stack
                                                    gap="10px"
                                                    sx={{
                                                        paddingTop: '10px',
                                                        borderTop: `1px solid ${theme.palette.divider}`,
                                                    }}
                                                >
                                                    <Stack
                                                        direction="row"
                                                        alignItems="center"
                                                        spacing={1.5}
                                                        sx={{
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() =>
                                                            handleSelect(
                                                                inputValue
                                                            )
                                                        }
                                                    >
                                                        <SearchIcon
                                                            sx={{
                                                                fontSize:
                                                                    '16px',
                                                                color: theme
                                                                    .palette
                                                                    .text
                                                                    .secondary,
                                                            }}
                                                        />
                                                        <Typography
                                                            sx={{
                                                                flex: 1,
                                                                fontSize:
                                                                    '14px',
                                                                color: theme
                                                                    .palette
                                                                    .text
                                                                    .secondary,
                                                            }}
                                                        >
                                                            <Typography
                                                                component="span"
                                                                sx={{
                                                                    fontSize:
                                                                        '14px',
                                                                    fontWeight: 600,
                                                                    color: theme
                                                                        .palette
                                                                        .text
                                                                        .primary,
                                                                }}
                                                            >
                                                                {inputValue}
                                                            </Typography>
                                                            {` ${t('Near Me')}`}
                                                        </Typography>
                                                        <OpenInNewIcon
                                                            sx={{
                                                                fontSize:
                                                                    '16px',
                                                                color: theme
                                                                    .palette
                                                                    .text
                                                                    .secondary,
                                                            }}
                                                        />
                                                    </Stack>
                                                    <Stack
                                                        direction="row"
                                                        alignItems="center"
                                                        spacing={1.5}
                                                        sx={{
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() =>
                                                            handleSelect(
                                                                inputValue
                                                            )
                                                        }
                                                    >
                                                        <SearchIcon
                                                            sx={{
                                                                fontSize:
                                                                    '16px',
                                                                color: theme
                                                                    .palette
                                                                    .text
                                                                    .secondary,
                                                            }}
                                                        />
                                                        <Typography
                                                            sx={{
                                                                flex: 1,
                                                                fontSize:
                                                                    '14px',
                                                                color: theme
                                                                    .palette
                                                                    .text
                                                                    .secondary,
                                                            }}
                                                        >
                                                            {`${t(
                                                                'Search For'
                                                            )} `}
                                                            <Typography
                                                                component="span"
                                                                sx={{
                                                                    fontSize:
                                                                        '14px',
                                                                    fontWeight: 600,
                                                                    color: theme
                                                                        .palette
                                                                        .text
                                                                        .primary,
                                                                }}
                                                            >
                                                                {inputValue}
                                                            </Typography>
                                                        </Typography>
                                                        <OpenInNewIcon
                                                            sx={{
                                                                fontSize:
                                                                    '16px',
                                                                color: theme
                                                                    .palette
                                                                    .text
                                                                    .secondary,
                                                            }}
                                                        />
                                                    </Stack>
                                                </Stack>
                                            </>
                                        )}
                                        {showSkeleton && (
                                            <SearchSuggestionsShimmer />
                                        )}
                                    </>
                                )}
                            </CustomStackFullWidth>
                        </Scrollbar>
                    </CustomStackFullWidth>
                </CustomPaper>
            </Portal>
        </>
    )
}

SearchSuggestionsBottom.propTypes = {}

export default SearchSuggestionsBottom
