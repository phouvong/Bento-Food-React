import React, { useMemo } from 'react'
import { NoSsr, Stack } from '@mui/material'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'

import CustomContainer from '../../components/container'
import HomeGuard from '../../components/home-guard/HomeGuard'
import ScrollToTop from '../../components/scroll-top/ScrollToTop'
import HomeSidebarLayout from '@/components/home/home-sidebar/HomeSidebarLayout'
import FilterPanel from '@/components/home/filter-tabs/FilterPanel'
import { CategoryApi } from '@/hooks/react-query/config/categoryApi'
import { getData as getCuisines } from '@/hooks/react-query/cuisines/useGetCuisines'
import { onErrorResponse } from '@/components/ErrorResponse'
import SearchMobileHeader from '@/components/search-page/SearchMobileHeader'
import useFilterControls from '@/hooks/custom-hooks/useFilterControls'
import SearchResultsHeader from '@/components/search-page/SearchResultsHeader'
import SearchAllResults from '@/components/search-page/SearchAllResults'
import SearchFoodResults from '@/components/search-page/SearchFoodResults'
import SearchRestaurantResults from '@/components/search-page/SearchRestaurantResults'
import { toSearchFilters } from '@/components/search-page/helper'
import { useProductSearch } from '@/hooks/react-query/search/useProductSearch'
import { useExclusiveDealsRestaurants } from '@/hooks/react-query/restaurants/useExclusiveDealsRestaurants'
import { removeSpecialCharacters } from '@/utils/customFunctions'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'
import Meta from '@/components/Meta'

const VALID_TABS = ['all', 'foods', 'restaurants']

const flattenPages = (data) =>
    data?.pages?.flatMap((page) => page?.items ?? []) ?? []

const SearchPage = ({ configData, pathName, metaData, landingPageData }) => {
    const { t } = useTranslation()
    const router = useRouter()
    const { query, tab } = router.query

    const searchValue = removeSpecialCharacters(query ?? '')
    const activeTab = VALID_TABS.includes(tab) ? tab : 'all'
    const isAllTab = activeTab === 'all'

    const filterControls = useFilterControls()
    const { appliedFilters } = filterControls
    const filterData = useMemo(
        () => toSearchFilters(appliedFilters),
        [appliedFilters]
    )
    // Price is a foods-only filter — on the "all" tab both queries run at
    // once, so the restaurant query needs its own copy with price stripped
    // rather than sharing `filterData` and picking up a price param it has
    // no UI for.
    const restaurantFilterData = useMemo(
        () => ({ ...filterData, price: [] }),
        [filterData]
    )

    const { data: searchCategoriesData } = useQuery(
        ['search-categories', searchValue],
        () => CategoryApi.categories(searchValue),
        { staleTime: 1000 * 60 * 5, onError: onErrorResponse }
    )
    const searchCategories = searchCategoriesData?.data ?? []

    const { data: searchCuisinesData } = useQuery(
        ['search-cuisines', searchValue],
        () => getCuisines(searchValue),
        { staleTime: 1000 * 60 * 5, onError: onErrorResponse }
    )
    const searchCuisines = searchCuisinesData?.Cuisines ?? []

    const foodQuery = useProductSearch({
        searchType: 'products',
        searchValue,
        filterData,
        enabled: isAllTab || activeTab === 'foods',
    })

    const restaurantQuery = useProductSearch({
        searchType: 'restaurants',
        searchValue,
        filterData: restaurantFilterData,
        enabled: isAllTab || activeTab === 'restaurants',
    })

    const exclusiveDealsQuery = useExclusiveDealsRestaurants({
        enabled: isAllTab,
    })

    const foods = useMemo(() => flattenPages(foodQuery.data), [foodQuery.data])
    const restaurants = useMemo(
        () => flattenPages(restaurantQuery.data),
        [restaurantQuery.data]
    )

    const foodTotal = foodQuery.data?.pages?.[0]?.totalSize || foods.length
    const restaurantTotal =
        restaurantQuery.data?.pages?.[0]?.totalSize || restaurants.length

    const resultsCount =
        activeTab === 'foods'
            ? foodTotal
            : activeTab === 'restaurants'
            ? restaurantTotal
            : foodTotal + restaurantTotal

    const isResultsCountLoading =
        activeTab === 'foods'
            ? foodQuery.isLoading
            : activeTab === 'restaurants'
            ? restaurantQuery.isLoading
            : foodQuery.isLoading || restaurantQuery.isLoading

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

    const metadata = processMetadata(metaData, {
        title: query ? `${t('Search')} - ${query}` : 'Search Results',
        description: '',
        image:
            configData?.logo_full_url ||
            `${configData?.base_urls?.react_landing_page_images}/${landingPageData?.banner_section_full?.banner_section_img_full}`,
    })

    return (
        <>
            <Meta
                title={metadata.title}
                description={metadata.description}
                ogImage={metadata.image}
                pathName={pathName}
                robotsMeta={metadata.robotsMeta}
            />
            <NoSsr>
                <HomeGuard>
                    <ScrollToTop />
                    <CustomContainer>
                        <SearchMobileHeader
                            query={query}
                            filterCount={filterControls.filterCount}
                            onFilterClick={filterControls.openPanel}
                        />
                        <HomeSidebarLayout>
                            <Stack sx={{ gap: '16px' }}>
                                <SearchResultsHeader
                                    count={resultsCount}
                                    query={query ?? ''}
                                    activeTab={activeTab}
                                    onTabChange={handleTabChange}
                                    filterCount={filterControls.filterCount}
                                    onFilterClick={filterControls.openPanel}
                                    isLoading={isResultsCountLoading}
                                />

                                {isAllTab && (
                                    <SearchAllResults
                                        foods={foods}
                                        restaurants={restaurants}
                                        foodLoading={foodQuery.isLoading}
                                        restaurantLoading={
                                            restaurantQuery.isLoading
                                        }
                                        exclusiveDeals={
                                            exclusiveDealsQuery.data
                                        }
                                        exclusiveDealsLoading={
                                            exclusiveDealsQuery.isLoading
                                        }
                                    />
                                )}

                                {activeTab === 'foods' && (
                                    <SearchFoodResults
                                        foods={foods}
                                        isLoading={foodQuery.isLoading}
                                        hasNextPage={foodQuery.hasNextPage}
                                        isFetchingNextPage={
                                            foodQuery.isFetchingNextPage
                                        }
                                        fetchNextPage={foodQuery.fetchNextPage}
                                    />
                                )}

                                {activeTab === 'restaurants' && (
                                    <SearchRestaurantResults
                                        restaurants={restaurants}
                                        isLoading={restaurantQuery.isLoading}
                                        hasNextPage={
                                            restaurantQuery.hasNextPage
                                        }
                                        isFetchingNextPage={
                                            restaurantQuery.isFetchingNextPage
                                        }
                                        fetchNextPage={
                                            restaurantQuery.fetchNextPage
                                        }
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
                        showCategories
                        categories={searchCategories}
                        showCuisines
                        cuisines={searchCuisines}
                        anchorHorizontal="right"
                        showPriceRange={activeTab !== 'restaurants'}
                    />
                </HomeGuard>
            </NoSsr>
        </>
    )
}

export default SearchPage

export const getServerSideProps = async (context) => {
    return await getCommonServerSideProps(context, 'search_page')
}
