import React from 'react'
import { Box, Grid } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import NewFoodCard from '@/components/new-food-card/NewFoodCard'
import CustomEmptyResult from '../empty-view/CustomEmptyResult'
import CardGridShimmer from '../type-wise-restaurant-page/CardGridShimmer'
import FoodCardSkeleton from '../type-wise-restaurant-page/FoodCardSkeleton'
import SectionTitle from './SectionTitle'
import InfiniteScrollSentinel from './InfiniteScrollSentinel'

// 5 per row on desktop, matching Figma node 515:66861.
export const FOOD_GRID_SIZES = { xs: 6, md: 2.4 }

// Mirrors ProductList's guard: items whose variations still need a selection
// can't be rendered as a quick-add card.
export const isRenderableProduct = (product) =>
    product?.variations === null ||
    product?.variations?.[0]?.values ||
    product?.variations?.length === 0

// Data is owned by the search page so the All tab's already-fetched first page
// is reused here instead of refetched.
const SearchFoodResults = ({
    foods = [],
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    showTitle = true,
}) => {
    const { t } = useTranslation()
    const { global } = useSelector((state) => state.globalSettings)

    if (isLoading) {
        return (
            <Box>
                {showTitle && <SectionTitle>{t('Foods')}</SectionTitle>}
                <CardGridShimmer
                    CardSkeleton={FoodCardSkeleton}
                    gridSizes={FOOD_GRID_SIZES}
                />
            </Box>
        )
    }

    if (foods.length === 0) {
        return <CustomEmptyResult label="No food found" />
    }

    return (
        <Box>
            {showTitle && <SectionTitle>{t('Foods')}</SectionTitle>}
            <Grid item container spacing={{ xs: 2.5, md: 3 }}>
                {foods.filter(isRenderableProduct).map((product) => (
                    <Grid item {...FOOD_GRID_SIZES} key={product?.id}>
                        <NewFoodCard
                            product={product}
                            productImageUrl={
                                global?.base_urls?.product_image_url
                            }
                        />
                    </Grid>
                ))}
            </Grid>
            <InfiniteScrollSentinel
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
            />
        </Box>
    )
}

export default SearchFoodResults
