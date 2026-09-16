import React, { useMemo, useState } from 'react'
import { CssBaseline, Stack } from '@mui/material'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import ResturantList from './ResturantList'
import FoodResultsList from './FoodResultsList'
import ResultsHeader from './ResultsHeader'
import CustomContainer from '../container'
import HomeSidebarLayout from '@/components/home/home-sidebar/HomeSidebarLayout'
import FilterTabs from '../home/filter-tabs/FilterTabs'
import FilterPanel from '../home/filter-tabs/FilterPanel'
import MobilePageHeader from '@/components/page-header/MobilePageHeader'
import useFilterControls from '@/hooks/custom-hooks/useFilterControls'

const RATING_LEVELS = { '5_plus': 5, '4_plus': 4, '3_plus': 3, '2_plus': 2 }

const toFilterBy = (appliedFilters) => {
    const type = appliedFilters?.type ? appliedFilters.type.split(',') : []
    const discover = appliedFilters?.discover
        ? appliedFilters.discover.split(',')
        : []

    const ratingLevel = appliedFilters?.rating
        ? Math.max(
              0,
              ...appliedFilters.rating
                  .split(',')
                  .map((token) => RATING_LEVELS[token] || 0)
          )
        : 0

    const filterBy = {}
    if (type.includes('veg')) filterBy.veg = true
    if (type.includes('nonVeg')) filterBy.non_veg = true
    if (discover.includes('popular') || discover.includes('topRated'))
        filterBy.popular = true
    if (ratingLevel) filterBy.rating = ratingLevel
    if (appliedFilters?.sort_by) filterBy.sort_by = appliedFilters.sort_by
    return filterBy
}

const toIdList = (value) =>
    value ? value.split(',').filter(Boolean).map(Number) : []

const toFilterByCuisine = (appliedFilters) =>
    appliedFilters?.cuisine_ids
        ? appliedFilters.cuisine_ids
              .split(',')
              .filter(Boolean)
              .map((id) => ({ id: Number(id) }))
        : []

const toFilterByCategory = (appliedFilters) =>
    appliedFilters?.category_ids
        ? appliedFilters.category_ids
              .split(',')
              .filter(Boolean)
              .map((id) => ({ id: Number(id) }))
        : []

const toFilterByTokens = (appliedFilters) => {
    const discover = appliedFilters?.discover
        ? appliedFilters.discover.split(',')
        : []
    const tokens = []
    if (discover.includes('popular') || discover.includes('topRated'))
        tokens.push('popular')
    if (discover.includes('newArrival')) tokens.push('new_arrivals')
    return tokens
}

const toActiveFilters = (appliedFilters) => {
    const type = appliedFilters?.type ? appliedFilters.type.split(',') : []
    const discover = appliedFilters?.discover
        ? appliedFilters.discover
              .split(',')
              .map((token) => (token === 'newArrival' ? 'new_arrivals' : token))
        : []

    const ratingLevel = appliedFilters?.rating
        ? Math.max(
              0,
              ...appliedFilters.rating
                  .split(',')
                  .map((token) => RATING_LEVELS[token] || 0)
          )
        : 0
    const ratingFilter =
        ratingLevel === 5
            ? 'rating5'
            : ratingLevel === 4
            ? 'rating4'
            : ratingLevel === 3
            ? 'rating3'
            : ratingLevel === 2
            ? 'rating2'
            : null

    return [...type, ...discover, ratingFilter].filter(Boolean)
}

const toPriceRange = (appliedFilters) => {
    const priceMax = Number(appliedFilters?.price_max)
    if (!Number.isFinite(priceMax)) return []
    return [Number(appliedFilters?.price_min) || 0, priceMax]
}

const ROUTE_FOOD_FILTERS = {
    offers: ['discounted'],
    'top-rated': ['top_rated'],
}

const ROUTE_HIDDEN_DISCOVER = {
    'top-rated': ['topRated'],
}

const Searchresturant = ({
    restaurantType,
    filterData,
    sectionTitle,
    showTabs = true,
    routeSection,
}) => {
    const { t } = useTranslation()
    const router = useRouter()
    const filterControls = useFilterControls()
    const { appliedFilters } = filterControls
    const [resultsCount, setResultsCount] = useState(0)
    const [resultsLoading, setResultsLoading] = useState(true)
    const { featuredCategories, cuisines } = useSelector(
        (state) => state.storedData
    )

    const activeTab = !showTabs
        ? 'restaurants'
        : router.query.tab === 'restaurants'
        ? 'restaurants'
        : 'foods'

    // Stable references: recreating these arrays on every render (e.g. from
    // onCountChange/onLoadingChange bubbling up) was tripping FoodResultsList's
    // filter-change reset effect and snapping pagination back to page 1.
    const activeFoodFilters = useMemo(
        () => [
            ...(ROUTE_FOOD_FILTERS[routeSection] ?? []),
            ...toActiveFilters(appliedFilters),
        ],
        [routeSection, appliedFilters]
    )
    const foodPriceRange = useMemo(
        () => toPriceRange(appliedFilters),
        [appliedFilters]
    )

    const handleTabChange = (nextTab) => {
        if (nextTab === 'restaurants') filterControls.clearPriceRange()
        router.replace(
            {
                pathname: router.pathname,
                query: { ...router.query, tab: nextTab },
            },
            undefined,
            { shallow: true }
        )
    }

    return (
        <>
            <CssBaseline />
            <CustomContainer>
                <MobilePageHeader
                    title={sectionTitle || t('Filter')}
                    filterCount={filterControls.filterCount}
                    onFilterClick={filterControls.openPanel}
                />
                <HomeSidebarLayout>
                    <Stack sx={{ gap: '16px' }}>
                        <FilterTabs controls={filterControls} hideOnMobile />
                        <ResultsHeader
                            count={resultsCount}
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            sectionTitle={sectionTitle}
                            showTabs={showTabs}
                            isLoading={resultsLoading}
                        />
                        {activeTab === 'foods' ? (
                            <FoodResultsList
                                productType={restaurantType}
                                activeFilters={activeFoodFilters}
                                price={foodPriceRange}
                                sortBy={appliedFilters?.sort_by}
                                categoryIds={toIdList(
                                    appliedFilters?.category_ids
                                )}
                                cuisineIds={toIdList(
                                    appliedFilters?.cuisine_ids
                                )}
                                onCountChange={setResultsCount}
                                onLoadingChange={setResultsLoading}
                            />
                        ) : (
                            <ResturantList
                                restaurantType={restaurantType}
                                filterData={{
                                    ...filterData,
                                    filterBy: {
                                        ...filterData?.filterBy,
                                        ...toFilterBy(appliedFilters),
                                    },
                                    filterByCuisine: [
                                        ...(filterData?.filterByCuisine ?? []),
                                        ...toFilterByCuisine(appliedFilters),
                                    ],
                                    filterByCategory: [
                                        ...(filterData?.filterByCategory ?? []),
                                        ...toFilterByCategory(appliedFilters),
                                    ],
                                    filterBy_list: [
                                        ...(filterData?.filterBy_list ?? []),
                                        ...toFilterByTokens(appliedFilters),
                                    ],
                                }}
                                onCountChange={setResultsCount}
                                onLoadingChange={setResultsLoading}
                            />
                        )}
                    </Stack>
                </HomeSidebarLayout>
            </CustomContainer>

            <FilterPanel
                anchorEl={filterControls.anchorEl}
                onClose={filterControls.closePanel}
                onApply={filterControls.applyFilters}
                filterValue={appliedFilters}
                hiddenDiscover={ROUTE_HIDDEN_DISCOVER[routeSection] ?? []}
                showCategories
                categories={featuredCategories}
                showCuisines
                cuisines={cuisines}
                showPriceRange={activeTab === 'foods'}
            />
        </>
    )
}

export default Searchresturant
