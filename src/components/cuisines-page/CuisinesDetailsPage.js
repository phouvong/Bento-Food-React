import React, { useEffect, useRef } from 'react'
import { Box, CssBaseline, Grid, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import NewStoreCard from '../new-store-card/NewStoreCard'
import CustomEmptyResult from '../empty-view/CustomEmptyResult'
import { noRestaurantsImage } from '@/utils/LocalImages'
import CustomNextImage from '@/components/CustomNextImage'
import Slider from '@/components/slider/SlickToSwiper'
import { HandleNext, HandlePrev } from '../CustomSliderIcon'
import { useGetCuisines } from '@/hooks/react-query/cuisines/useGetCuisines'
import { setCuisines } from '@/redux/slices/storedData'
import CustomContainer from '../container'
import MobilePageHeader from '@/components/page-header/MobilePageHeader'
import FilterChip from '../home/filter-tabs/FilterChip'
import FilterPanel from '../home/filter-tabs/FilterPanel'
import ResultsHeader from '../type-wise-restaurant-page/ResultsHeader'
import CardGridShimmer from '../type-wise-restaurant-page/CardGridShimmer'
import RestaurantCardSkeleton from '../type-wise-restaurant-page/RestaurantCardSkeleton'
import CustomePagination from '../pagination/Pagination'
import useFilterControls from '@/hooks/custom-hooks/useFilterControls'

const RESTAURANT_GRID_SIZES = { xs: 12, sm: 6, md: 3 }

// FilterPanel writes `type`/`discover`/`rating` as CSV (its buildOutput shape)
// — map the values it knows about onto getData's filterByData keys.
const toFilterByData = (appliedFilters) => {
    const type = appliedFilters?.type ? appliedFilters.type.split(',') : []
    const discover = appliedFilters?.discover
        ? appliedFilters.discover.split(',')
        : []
    const rating = appliedFilters?.rating
        ? appliedFilters.rating.split(',')
        : []
    const ratingValue = rating.includes('5_plus')
        ? 5
        : rating.includes('4_plus')
        ? 4
        : rating.includes('3_plus')
        ? 3
        : rating.includes('2_plus')
        ? 2
        : 0

    return {
        veg: type.includes('veg'),
        non_veg: type.includes('nonVeg'),
        popular: discover.includes('popular') || discover.includes('topRated'),
        new: discover.includes('newArrival'),
        rating: ratingValue,
        sort_by: appliedFilters?.sort_by,
    }
}

const CuisinesDetailsPage = ({
    data,
    isLoading,
    offset,
    setOffset,
    page_limit,
    setFilterByData,
}) => {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const theme = useTheme()
    const router = useRouter()
    const { id } = router.query
    const sliderRef = useRef(null)
    const filterControls = useFilterControls()
    const { appliedFilters } = filterControls
    const { cuisines } = useSelector((state) => state.storedData)
    const { data: cuisinesData, refetch } = useGetCuisines()

    useEffect(() => {
        if (!cuisines?.length) {
            refetch()
        }
    }, [cuisines?.length, refetch])

    useEffect(() => {
        if (cuisinesData) {
            dispatch(setCuisines(cuisinesData?.Cuisines))
        }
    }, [cuisinesData, dispatch])

    useEffect(() => {
        if (!cuisines?.length || !id) return
        const activeIndex = cuisines.findIndex(
            (cuisine) =>
                String(cuisine?.id) === String(id) ||
                String(cuisine?.slug) === String(id)
        )
        if (activeIndex >= 0) {
            sliderRef.current?.slickGoTo(activeIndex)
        }
    }, [cuisines, id])

    // Sync filter chips/panel state up to parent for the API call.
    useEffect(() => {
        setFilterByData(toFilterByData(appliedFilters))
        setOffset(1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appliedFilters])

    const activeCuisine = cuisines?.find(
        (cuisine) =>
            String(cuisine?.id) === String(id) ||
            String(cuisine?.slug) === String(id)
    )
    const cuisineName = activeCuisine?.name || t('Cuisine')

    const handleCuisineClick = (cuisine) => {
        router.push(
            { pathname: `/cuisines/${cuisine?.slug || cuisine?.id}` },
            undefined,
            { shallow: true }
        )
    }

    const cuisineSliderSettings = {
        dots: false,
        infinite: cuisines?.length > 6,
        speed: 600,
        slidesToShow: 'auto',
        autoplay: false,
        arrows: true,
        nextArrow: <HandleNext right="-1.6%" />,
        prevArrow: <HandlePrev left="-1.6%" />,
    }

    return (
        <>
            <CssBaseline />
            <CustomContainer>
                <MobilePageHeader
                    title={cuisineName}
                    filterCount={filterControls.filterCount}
                    onFilterClick={filterControls.openPanel}
                />
                <Box sx={{ minWidth: 0 }}>
                    <Stack sx={{ gap: '16px' }}>
                        {cuisines?.length > 0 && (
                            <Box
                                sx={{
                                    position: 'relative',
                                    overflow: 'visible',
                                    mt: { xs: 0, md: '20px' },
                                    px: { xs: 0, md: 1 },
                                    // Sliders render on Swiper now — `.swiper` clips on
                                    // purpose, so give the hover-lift shadow room by
                                    // padding `.swiper-wrapper` instead (grows the
                                    // slider's own auto-height box from the inside).
                                    '& .swiper-wrapper': {
                                        py: { xs: '10px', sm: '10px' },
                                    },
                                    '& .swiper-slide': {
                                        width: 'auto',
                                    },
                                }}
                            >
                                <Slider
                                    {...cuisineSliderSettings}
                                    ref={sliderRef}
                                >
                                    {cuisines.map((cuisine) => {
                                        const isActiveCuisine =
                                            String(cuisine?.slug) ===
                                                String(id) ||
                                            String(cuisine?.id) === String(id)
                                        const isDarkMode =
                                            theme.palette.mode === 'dark'
                                        return (
                                            <Box
                                                key={cuisine?.id}
                                                onClick={() =>
                                                    handleCuisineClick(cuisine)
                                                }
                                                sx={{
                                                    cursor: 'pointer',
                                                    borderRadius: '10px',
                                                    backgroundColor: isDarkMode
                                                        ? theme.palette
                                                              .neutral[800]
                                                        : theme.palette
                                                              .neutral[100],
                                                    border: isActiveCuisine
                                                        ? `1.5px solid ${theme.palette.primary.main}`
                                                        : '1.5px solid transparent',
                                                    width: {
                                                        xs: '84px',
                                                        sm: '104px',
                                                        md: '120px',
                                                    },
                                                    height: {
                                                        xs: '78px',
                                                        sm: '88px',
                                                        md: '96px',
                                                    },
                                                    boxShadow: isActiveCuisine
                                                        ? isDarkMode
                                                            ? '0px 8px 20px rgba(0,0,0,0.6)'
                                                            : '0px 8px 20px rgba(78,80,84,0.22)'
                                                        : isDarkMode
                                                        ? '0px 8px 18px rgba(0,0,0,0.45)'
                                                        : '0px 3px 6px rgb(159 159 159 / 12%)',
                                                    px: {
                                                        xs: '8px',
                                                        md: '16px',
                                                    },
                                                    py: {
                                                        xs: '8px',
                                                        md: '10px',
                                                    },
                                                    transition:
                                                        'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                                                    '&:hover': {
                                                        transform:
                                                            'translateY(-2px)',
                                                        boxShadow:
                                                            '0px 14px 28px rgba(16,24,40,0.12)',
                                                    },
                                                }}
                                            >
                                                <Stack
                                                    spacing={1}
                                                    alignItems="center"
                                                    justifyContent="center"
                                                >
                                                    <Box
                                                        sx={{
                                                            width: {
                                                                xs: '38px',
                                                                sm: '44px',
                                                                md: '50px',
                                                            },
                                                            height: {
                                                                xs: '38px',
                                                                sm: '44px',
                                                                md: '50px',
                                                            },
                                                            borderRadius: '50%',
                                                            overflow: 'hidden',
                                                            backgroundColor:
                                                                isDarkMode
                                                                    ? theme
                                                                          .palette
                                                                          .neutral[700]
                                                                    : theme
                                                                          .palette
                                                                          .neutral[200],
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            justifyContent:
                                                                'center',
                                                        }}
                                                    >
                                                        <CustomNextImage
                                                            src={
                                                                cuisine?.image_full_url
                                                            }
                                                            alt={cuisine?.name}
                                                            width={92}
                                                            height={92}
                                                            objectFit="cover"
                                                            borderRadius="50%"
                                                        />
                                                    </Box>
                                                    <Typography
                                                        fontSize={{
                                                            xs: '12px',
                                                            sm: '13px',
                                                            md: '14px',
                                                        }}
                                                        fontWeight="500"
                                                        color={
                                                            isActiveCuisine
                                                                ? theme.palette
                                                                      .primary
                                                                      .main
                                                                : theme.palette
                                                                      .neutral[1000]
                                                        }
                                                        textAlign="center"
                                                        sx={{
                                                            overflow: 'hidden',
                                                            textOverflow:
                                                                'ellipsis',
                                                            display:
                                                                '-webkit-box',
                                                            WebkitLineClamp: 1,
                                                            WebkitBoxOrient:
                                                                'vertical',
                                                        }}
                                                    >
                                                        {cuisine?.name}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                        )
                                    })}
                                </Slider>
                            </Box>
                        )}

                        <ResultsHeader
                            count={data?.total_size ?? 0}
                            activeTab="restaurants"
                            sectionTitle={cuisineName}
                            showTabs={false}
                            extraCrumb={{
                                label: t('Cuisine'),
                                href: '/cuisines',
                            }}
                            endSlot={
                                <FilterChip
                                    active={filterControls.filterActive}
                                    count={filterControls.filterCount}
                                    onOpen={filterControls.openPanel}
                                    onReset={filterControls.resetFilters}
                                />
                            }
                        />

                        <Grid container spacing={{ xs: 2.5, md: 3 }}>
                            {isLoading ? (
                                <CardGridShimmer
                                    CardSkeleton={RestaurantCardSkeleton}
                                    gridSizes={RESTAURANT_GRID_SIZES}
                                />
                            ) : data?.restaurants?.length > 0 ? (
                                data.restaurants.map((restaurant) => (
                                    <Grid
                                        item
                                        {...RESTAURANT_GRID_SIZES}
                                        key={restaurant?.id}
                                    >
                                        <NewStoreCard
                                            restaurant={{
                                                ...restaurant,
                                                opening_time:
                                                    restaurant?.current_opening_time,
                                            }}
                                        />
                                    </Grid>
                                ))
                            ) : (
                                <CustomEmptyResult
                                    image={noRestaurantsImage}
                                    label="No Cuisine Restaurant Found"
                                />
                            )}
                        </Grid>

                        {data?.restaurants?.length > 0 && (
                            <CustomePagination
                                total_size={data?.total_size}
                                page_limit={page_limit}
                                offset={offset}
                                setOffset={setOffset}
                            />
                        )}
                    </Stack>
                </Box>
            </CustomContainer>

            <FilterPanel
                anchorEl={filterControls.anchorEl}
                onClose={filterControls.closePanel}
                onApply={filterControls.applyFilters}
                filterValue={appliedFilters}
                anchorHorizontal="right"
                showCategories={false}
                categories={[]}
                showPriceRange={false}
            />
        </>
    )
}

export default CuisinesDetailsPage
