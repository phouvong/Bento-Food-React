import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import { Badge, Box, Grid, IconButton } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import NewStoreCard from '@/components/new-store-card/NewStoreCard'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import CustomePagination from '../pagination/Pagination'

import { noRestaurantsImage } from '@/utils/LocalImages'
import { Stack } from '@mui/system'
import CustomShimmerRestaurant from '../CustomShimmer/CustomShimmerRestaurant'
import { onErrorResponse } from '../ErrorResponse'
import CustomPageTitleSubtitle from '../CustomPageTitleSubtitle'
import CustomSearch from '../custom-search/CustomSearch'
import CustomEmptyResult from '../empty-view/CustomEmptyResult'
import FilterPanel from '../home/filter-tabs/FilterPanel'
import { useGetCuisines } from '@/hooks/react-query/cuisines/useGetCuisines'
import { setCuisines } from '@/redux/slices/storedData'
import {
    RESTAURANT_LIST_FILTER_BY_OPTIONS,
    RESTAURANT_LIST_ORDER_TYPE_OPTIONS,
    RESTAURANT_LIST_TYPE_OPTIONS,
    RESTAURANT_RATING_OPTIONS,
    RESTAURANT_SORT_OPTIONS,
    toRestaurantListFilterState,
    toRestaurantListPanelValue,
} from './restaurantListFilterOptions'

const RestaurantList = () => {
    const { t } = useTranslation()
    const theme = useTheme()
    const dispatch = useDispatch()
    const [filterByData, setFilterByData] = useState({})
    const [cuisineIds, setCuisineIds] = useState([])
    const [page_limit, setPageLimit] = useState(20)
    const [offset, setOffset] = useState(1)
    const [searchKey, setSearchKey] = useState('')
    const [anchorEl, setAnchorEl] = useState(null)
    const { global } = useSelector((state) => state.globalSettings)
    const { cuisines } = useSelector((state) => state.storedData)

    const { data: cuisinesData, refetch: refetchCuisines } = useGetCuisines()
    useEffect(() => {
        if (!cuisines?.length) refetchCuisines()
    }, [cuisines?.length, refetchCuisines])
    useEffect(() => {
        if (cuisinesData?.Cuisines?.length) {
            dispatch(setCuisines(cuisinesData.Cuisines))
        }
    }, [cuisinesData, dispatch])

    useEffect(() => {
        const url = `/restaurants?page=${offset}`
        window.history.replaceState(null, '', url)
    }, [offset])

    const { isFetched, data } = useQuery(
        ['all-restaurants', offset, page_limit, searchKey, filterByData, cuisineIds],
        () =>
            RestaurantsApi.restaurants({
                offset,
                page_limit,
                searchKey,
                filterByData: { ...filterByData, cuisine: cuisineIds },
            }),
        {
            onError: onErrorResponse,
        }
    )

    const handleSearchResult = async (values) => {
        setOffset(1)
        setSearchKey(values)
    }

    const handleDropClick = (event) => setAnchorEl(event.currentTarget)
    const handleDropClose = () => setAnchorEl(null)

    const filterPanelValue = toRestaurantListPanelValue({
        filterByData,
        cuisineIds,
    })
    const activeFilterCount = Object.keys(filterPanelValue).length

    const handleApplyFilters = (panelValue) => {
        const nextState = toRestaurantListFilterState(panelValue)
        setFilterByData(nextState.filterByData)
        setCuisineIds(nextState.cuisineIds)
        setOffset(1)
    }

    return (
        <Box mb="1rem">
            <Grid
                container
                spacing={{ xs: 1, sm: 2, md: 2 }}
                alignItems="center"
                justifyContent="center"
            >
                <Grid item md={12} sm={12} xs={12}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'stretch', md: 'center' },
                            gap: { xs: 2, md: 3 },
                        }}
                    >
                        <CustomPageTitleSubtitle
                            title={t('Restaurants')}
                            subtitle={t(
                                'Browse and discover restaurants — filter, explore, and order your favorites.'
                            )}
                            mb={0}
                            hideTitle={{ xs: true, md: false }}
                        />
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="stretch"
                            sx={{ width: { xs: '100%', md: 'auto' } }}
                        >
                            <Box
                                sx={{
                                    flex: '1 1 auto',
                                    minWidth: 0,
                                    width: { md: '260px' },
                                }}
                            >
                                <CustomSearch
                                    handleSearchResult={handleSearchResult}
                                    label="Search restaurants..."
                                    backgroundColor={
                                        theme.palette.background.paper
                                    }
                                    borderRadius="12px"
                                />
                            </Box>
                            <Badge
                                color="primary"
                                badgeContent={activeFilterCount}
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
                                            activeFilterCount
                                                ? theme.palette.primary.main
                                                : theme.palette.divider
                                        }`,
                                        color: activeFilterCount
                                            ? theme.palette.primary.main
                                            : theme.palette.neutral[1000],
                                        transition: 'all 120ms ease',
                                        '&:hover': {
                                            borderColor:
                                                theme.palette.primary.main,
                                            color: theme.palette.primary.main,
                                            backgroundColor:
                                                theme.palette.background
                                                    .paper,
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
                    </Box>
                </Grid>

                <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    container
                    spacing={{ xs: 1, sm: 2, md: 3 }}
                    marginTop={{ xs: '0rem', md: '.1rem' }}
                >
                    {!isFetched && <CustomShimmerRestaurant />}

                    {isFetched &&
                        data?.data?.restaurants?.map((restaurantData) => {
                            if (!restaurantData) return null
                            return (
                                <Grid
                                    item
                                    xs={12}
                                    sm={4}
                                    md={3}
                                    key={restaurantData?.id}
                                >
                                    <NewStoreCard
                                        restaurant={{
                                            ...restaurantData,
                                            opening_time:
                                                restaurantData?.current_opening_time,
                                        }}
                                    />
                                </Grid>
                            )
                        })}

                    {isFetched && data?.data?.restaurants?.length === 0 && (
                        <CustomEmptyResult
                            label="No Restaurants found"
                            image={noRestaurantsImage}
                        />
                    )}
                </Grid>

                {isFetched && data?.data?.restaurants?.length > 0 && (
                    <Grid item xs={12} sm={12} md={12}>
                        <CustomePagination
                            total_size={data?.data?.total_size}
                            page_limit={page_limit}
                            offset={offset}
                            setOffset={setOffset}
                        />
                    </Grid>
                )}
            </Grid>

            <FilterPanel
                anchorEl={anchorEl}
                onClose={handleDropClose}
                onApply={handleApplyFilters}
                filterValue={filterPanelValue}
                anchorHorizontal="right"
                sortOptions={RESTAURANT_SORT_OPTIONS}
                showType={global?.toggle_veg_non_veg !== false}
                typeOptions={RESTAURANT_LIST_TYPE_OPTIONS}
                showOrderType
                orderTypeOptions={RESTAURANT_LIST_ORDER_TYPE_OPTIONS}
                orderTypeLabel="Order Type"
                discoverOptions={RESTAURANT_LIST_FILTER_BY_OPTIONS}
                discoverLabel="Filter By"
                ratingOptions={RESTAURANT_RATING_OPTIONS}
                showCategories={false}
                showCuisines
                cuisines={cuisines}
                showPriceRange={false}
            />
        </Box>
    )
}

export default RestaurantList
