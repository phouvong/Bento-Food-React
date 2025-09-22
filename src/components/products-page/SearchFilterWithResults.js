import React from 'react';
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style';
import { Grid, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import FoodOrRestaurant from './FoodOrRestaurant';
import ProductList from './ProductList';
import RestaurantsData from '../category/RestaurantsData';
import CustomEmptyResult from '../empty-view/CustomEmptyResult';
import { AnimationDots } from './AnimationDots';
import { noFoodFoundImage, noRestaurantsImage } from '@/utils/LocalImages';

const SearchFilterWithResults = ({
                                     searchValue,
                                     count,
                                     foodOrRestaurant,
                                     setFoodOrRestaurant,
                                     data,
                                     isLoading,
                                     offset,
                                     page_limit,
                                     setOffset,
                                     global,
                                     isNetworkCalling,
                                     page,
                                     restaurantType,
                                     filterData,
                                 }) => {
    return (
        <CustomStackFullWidth
            spacing={2}
            sx={{
                minHeight: '53vh',
                marginTop: page || restaurantType ? '0px' : '20px',
            }}
        >
            <Grid container gap="15px">
                <Grid item xs={12} sm={12} md={12} align="center">
                    {!page && !restaurantType && (
                        <FoodOrRestaurant
                            filterData={filterData}
                            foodOrRestaurant={foodOrRestaurant}
                            setFoodOrRestaurant={setFoodOrRestaurant}
                        />
                    )}
                </Grid>

                <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    container
                    spacing={2}
                    paddingTop="1rem"
                >
                    {/* Products Section */}
                    {(foodOrRestaurant === 'products' || page) && (
                        <>
                            {isLoading || isNetworkCalling ? (
                                <Stack width="100%" minHeight="500px">
                                    <AnimationDots align="center" />
                                </Stack>
                            ) : (
                                <>
                                    {data?.data?.products?.length > 0 && (
                                        <ProductList
                                            product_list={data?.data}
                                            offset={offset}
                                            page_limit={page_limit}
                                            setOffset={setOffset}
                                        />
                                    )}
                                    {data?.data?.products?.length === 0 && (
                                        <CustomEmptyResult
                                            label="No food found"
                                            image={noFoodFoundImage}
                                        />
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* Restaurants Section */}
                    {foodOrRestaurant === 'restaurants' && (
                        <>
                            {isLoading || isNetworkCalling ? (
                                <Stack width="100%" minHeight="500px">
                                    <AnimationDots align="center" />
                                </Stack>
                            ) : (
                                <>
                                    {data && !isLoading && (
                                        <RestaurantsData
                                            resData={data}
                                            offset={offset}
                                            page_limit={page_limit}
                                            setOffset={setOffset}
                                            global={global}
                                            restaurantType={restaurantType}
                                        />
                                    )}
                                    {data?.data?.restaurants?.length === 0 && (
                                        <CustomEmptyResult
                                            label="No restaurant found"
                                            image={noRestaurantsImage}
                                        />
                                    )}
                                </>
                            )}
                        </>
                    )}
                </Grid>
            </Grid>
        </CustomStackFullWidth>
    );
};

SearchFilterWithResults.propTypes = {};

export default SearchFilterWithResults;