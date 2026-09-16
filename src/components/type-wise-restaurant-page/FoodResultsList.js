import { ProductsApi } from '@/hooks/react-query/config/productsApi'
import { Box, Grid } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import CustomEmptyResult from '../empty-view/CustomEmptyResult'
import ProductList from '../products-page/ProductList'
import CardGridShimmer from './CardGridShimmer'
import FoodCardSkeleton from './FoodCardSkeleton'

const page_limit = 30
const FOOD_GRID_SIZES = { xs: 6, md: 2.4 }

const FoodResultsList = ({
    productType = 'latest',
    activeFilters,
    price,
    sortBy,
    categoryIds,
    cuisineIds,
    enabled = true,
    onCountChange,
    onLoadingChange,
}) => {
    const [offset, setOffset] = useState(1)
    const categoryIdsKey = (categoryIds ?? []).join(',')
    const cuisineIdsKey = (cuisineIds ?? []).join(',')
    const activeFiltersKey = (activeFilters ?? []).join(',')
    const priceKey = (price ?? []).join(',')

    const { data, isLoading } = useQuery(
        [
            'food-results-list',
            productType,
            offset,
            activeFilters,
            price,
            sortBy,
            categoryIdsKey,
            cuisineIdsKey,
        ],
        () =>
            ProductsApi.products(productType, offset, page_limit, 'all', {
                activeFilters,
                price,
                sortBy,
                categoryIds,
                cuisineIds,
            }),
        { enabled }
    )

    useEffect(() => {
        setOffset(1)
    }, [activeFiltersKey, priceKey, sortBy, categoryIdsKey, cuisineIdsKey])

    const products = data?.data?.products ?? []
    const totalSize = Number(data?.data?.total_size ?? products.length)

    useEffect(() => {
        if (enabled && data) onCountChange?.(totalSize)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, enabled])

    useEffect(() => {
        onLoadingChange?.(enabled && isLoading)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, enabled])

    return (
        <Box>
            {isLoading ? (
                <CardGridShimmer
                    CardSkeleton={FoodCardSkeleton}
                    gridSizes={FOOD_GRID_SIZES}
                />
            ) : products.length > 0 ? (
                <Grid item container spacing={{ xs: 2.5, md: 3 }}>
                    <ProductList
                        product_list={{ ...data?.data, total_size: totalSize }}
                        offset={offset}
                        page_limit={page_limit}
                        setOffset={setOffset}
                        gridSizes={FOOD_GRID_SIZES}
                    />
                </Grid>
            ) : (
                <CustomEmptyResult label="No food found" />
            )}

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '30px 0px 70px 0px',
                }}
            ></Box>
        </Box>
    )
}

export default FoodResultsList
