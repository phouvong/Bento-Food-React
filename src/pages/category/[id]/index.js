import React, { useEffect, useMemo, useState } from 'react'
import { NoSsr, Stack } from '@mui/material'
import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import Meta from '../../../components/Meta.js'
import CategoryDetailsPage from '../../../components/category/CategoryDetailsPage'
import { CategoryApi } from '@/hooks/react-query/config/categoryApi'
import CustomContainer from '../../../components/container'
import HomeGuard from '../../../components/home-guard/HomeGuard'
import HomeSidebarLayout from '@/components/home/home-sidebar/HomeSidebarLayout'
import FilterTabs from '@/components/home/filter-tabs/FilterTabs'
import FilterPanel from '@/components/home/filter-tabs/FilterPanel'
import MobilePageHeader from '@/components/page-header/MobilePageHeader'
import useFilterControls from '@/hooks/custom-hooks/useFilterControls'
import ResultsHeader from '@/components/type-wise-restaurant-page/ResultsHeader'
import { toCategoryFilters } from '@/components/category/helper'
import { setFoodOrRestaurant } from '@/redux/slices/searchFilter'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'

const index = ({ metaData, pathName, configData, landingPageData }) => {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const router = useRouter()
    const { id, name, tab, subCategory } = router.query

    const [type] = useState('all')
    const [offset, setOffset] = useState(1)
    const [category_id, setCategoryId] = useState(id)
    const filterControls = useFilterControls()
    const { appliedFilters } = filterControls
    const { cuisines } = useSelector((state) => state.storedData)

    const activeTab = tab === 'restaurants' ? 'restaurants' : 'foods'
    const isFoods = activeTab === 'foods'
    const page_limit = isFoods ? 30 : 20

    const { filterByData, priceAndRating } = useMemo(
        () => toCategoryFilters(appliedFilters),
        [appliedFilters]
    )

    const { data, isLoading: isFoodsLoading } = useQuery(
        [
            `category-details`,
            category_id,
            offset,
            page_limit,
            type,
            filterByData,
            priceAndRating,
        ],
        () =>
            CategoryApi.categoriesDetails(
                category_id,
                type,
                offset,
                page_limit,
                filterByData,
                priceAndRating,
                name
            ),
        { enabled: Boolean(category_id) && isFoods }
    )

    const { data: resData, isLoading: isResLoading } = useQuery(
        [
            `category-detailsRes`,
            category_id,
            offset,
            page_limit,
            type,
            filterByData,
            priceAndRating,
        ],
        () =>
            CategoryApi.categoriesDetailsForRes(
                category_id,
                type,
                offset,
                page_limit,
                filterByData,
                priceAndRating,
                name
            ),
        { enabled: Boolean(category_id) && !isFoods }
    )

    const resultsCount = isFoods
        ? data?.data?.total_size ?? 0
        : resData?.data?.total_size ?? 0
    const isResultsLoading = isFoods ? isFoodsLoading : isResLoading

    // Keep the shared search-filter slice aligned with the URL tab — other
    // pages (search results) still read it as their food/restaurant mode.
    useEffect(() => {
        dispatch(setFoodOrRestaurant(isFoods ? 'products' : 'restaurants'))
    }, [isFoods, dispatch])

    useEffect(() => {
        setOffset(1)
    }, [activeTab, appliedFilters])

    const handleTabChange = (nextTab) => {
        if (nextTab === 'restaurants') filterControls.clearPriceRange()
        router.replace(
            { pathname: router.pathname, query: { ...router.query, tab: nextTab } },
            undefined,
            { shallow: true }
        )
    }

    // Keep the sub-category tab reflected in the URL so a reload (or a
    // direct link with ?subCategory=<id>) re-selects it — "All" clears
    // the param instead of writing the parent category's own id.
    const handleCategoryChange = (nextCategoryId) => {
        setCategoryId(nextCategoryId)
        const nextQuery = { ...router.query }
        if (String(nextCategoryId) === String(id)) {
            delete nextQuery.subCategory
        } else {
            nextQuery.subCategory = nextCategoryId
        }
        router.replace(
            { pathname: router.pathname, query: nextQuery },
            undefined,
            { shallow: true }
        )
    }

    const tempMetadata = processMetadata(metaData, {
        title: name,
        description: '',
        image: `${landingPageData?.banner_section_full?.banner_section_img_full}`,
    })

    return (
        <>
            <Meta
                title={tempMetadata.title}
                description={tempMetadata.description}
                ogImage={tempMetadata.image}
                pathName={pathName}
                robotsMeta={tempMetadata.robotsMeta}
            />
            <NoSsr>
                <HomeGuard>
                    <CustomContainer>
                        <MobilePageHeader
                            title={name || t('Category')}
                            filterCount={filterControls.filterCount}
                            onFilterClick={filterControls.openPanel}
                        />
                        <HomeSidebarLayout>
                            <Stack sx={{ gap: '16px' }}>
                                <FilterTabs
                                    controls={filterControls}
                                    hideOnMobile
                                />
                                <ResultsHeader
                                    count={resultsCount}
                                    activeTab={activeTab}
                                    onTabChange={handleTabChange}
                                    sectionTitle={name || t('Category')}
                                    isLoading={isResultsLoading}
                                />
                                <CategoryDetailsPage
                                    id={id}
                                    data={data}
                                    category_id={category_id}
                                    setCategoryId={handleCategoryChange}
                                    subCategoryParam={subCategory}
                                    resData={resData}
                                    offset={offset}
                                    page_limit={page_limit}
                                    setOffset={setOffset}
                                    activeTab={activeTab}
                                />
                            </Stack>
                        </HomeSidebarLayout>
                    </CustomContainer>

                    <FilterPanel
                        anchorEl={filterControls.anchorEl}
                        onClose={filterControls.closePanel}
                        onApply={filterControls.applyFilters}
                        filterValue={appliedFilters}
                        showCategories={false}
                        categories={[]}
                        showCuisines
                        cuisines={cuisines}
                        showPriceRange={isFoods}
                    />
                </HomeGuard>
            </NoSsr>
        </>
    )
}

export default index

export const getServerSideProps = async (context) => {
    const { id } = context.params
    return await getCommonServerSideProps(context, 'category_list', id)
}
