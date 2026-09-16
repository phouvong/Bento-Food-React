import React, { useEffect, useRef, useState } from 'react'
import { Box, Grid, NoSsr } from '@mui/material'
import { useQuery } from 'react-query'
import { useSelector } from 'react-redux'

import { CategoryApi } from '@/hooks/react-query/config/categoryApi'
import FoodNavigation from '../restaurant-details/foodSection/FoodNavigation'
import ProductList from '../products-page/ProductList'
import RestaurantsData from './RestaurantsData'
import CustomEmptyResult from '../empty-view/CustomEmptyResult'
import { noFoodFoundImage, noRestaurantsImage } from '@/utils/LocalImages'
import CardGridShimmer from '../type-wise-restaurant-page/CardGridShimmer'
import FoodCardSkeleton from '../type-wise-restaurant-page/FoodCardSkeleton'
import RestaurantCardSkeleton from '../type-wise-restaurant-page/RestaurantCardSkeleton'

const FOOD_GRID_SIZES = { xs: 6, md: 2.4 }
const RESTAURANT_GRID_SIZES = { xs: 12, sm: 6, md: 4 }

const CategoryDetailsPage = ({
    data,
    id,
    category_id,
    setCategoryId,
    subCategoryParam,
    resData,
    offset,
    page_limit,
    setOffset,
    activeTab,
}) => {
    const [catetoryMenus, setCategoryMenus] = useState([])
    const { global } = useSelector((state) => state.globalSettings)

    const { data: childesData } = useQuery([`category-Childes`, id], () =>
        CategoryApi.categoriesChildes(id)
    )

    const lastSyncedRef = useRef({ id: null, subCategoryParam: null })
    useEffect(() => {
        if (!childesData) return
        if (id?.length > 0) {
            setCategoryMenus(childesData.data)
        }
        const alreadySynced =
            lastSyncedRef.current.id === id &&
            lastSyncedRef.current.subCategoryParam === subCategoryParam
        if (alreadySynced) return
        lastSyncedRef.current = { id, subCategoryParam }

        const matchedMenu = childesData?.data?.find(
            (menu) =>
                String(menu.slug) === String(subCategoryParam) ||
                String(menu.id) === String(subCategoryParam)
        )
        // A single sub-category has no "All" tab to fall back to, and some
        // products/restaurants may be assigned directly to the parent
        // category with no sub-category at all — so it must still fetch
        // through the parent category id to include those.
        const isOnlySubCategory = childesData?.data?.length === 1
        setCategoryId(
            matchedMenu && !isOnlySubCategory
                ? matchedMenu.slug || matchedMenu.id
                : id
        )
    }, [childesData, id, subCategoryParam])

    // Reset paging when the selected (sub)category changes.
    const isInitialMount = useRef(true)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }
        setOffset(1)
    }, [id])

    const isFoods = activeTab === 'foods'

    return (
        <NoSsr>
            {catetoryMenus?.length > 0 && (
                <Box sx={{ minWidth: 0, maxWidth: '100%' }}>
                    <FoodNavigation
                        catetoryMenus={catetoryMenus}
                        setCategoryId={setCategoryId}
                        category_id={category_id}
                        id={id}
                    />
                </Box>
            )}

            {isFoods &&
                (data?.data ? (
                    <Grid item container spacing={{ xs: 2.5, md: 3 }}>
                        {data?.data?.products?.length > 0 ? (
                            <ProductList
                                product_list={data?.data}
                                offset={offset}
                                page_limit={page_limit}
                                setOffset={setOffset}
                                gridSizes={FOOD_GRID_SIZES}
                            />
                        ) : (
                            <CustomEmptyResult
                                image={noFoodFoundImage}
                                label="No Food Found"
                            />
                        )}
                    </Grid>
                ) : (
                    <CardGridShimmer
                        CardSkeleton={FoodCardSkeleton}
                        gridSizes={FOOD_GRID_SIZES}
                    />
                ))}

            {!isFoods &&
                (resData?.data ? (
                    <Grid item container spacing={{ xs: 2.5, md: 3 }}>
                        {resData?.data?.restaurants?.length > 0 ? (
                            <RestaurantsData
                                resData={resData}
                                offset={offset}
                                page_limit={page_limit}
                                setOffset={setOffset}
                                global={global}
                                gridSizes={RESTAURANT_GRID_SIZES}
                            />
                        ) : (
                            <CustomEmptyResult
                                image={noRestaurantsImage}
                                label="No Restaurants Found"
                            />
                        )}
                    </Grid>
                ) : (
                    <CardGridShimmer
                        CardSkeleton={RestaurantCardSkeleton}
                        gridSizes={RESTAURANT_GRID_SIZES}
                    />
                ))}
        </NoSsr>
    )
}

export default CategoryDetailsPage
