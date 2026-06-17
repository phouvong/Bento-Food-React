import React from 'react'
import { Grid } from '@mui/material'
import FoodCardShimmer from '../../food-card/FoodCarShimmer'
import CustomEmptyResult from '../../empty-view/CustomEmptyResult'
import { noFoodFoundImage } from '@/utils/LocalImages'

const RestaurantDetailsShimmer = ({ showComponent }) => {
    return (
        <>
            {showComponent ? (
                <Grid container spacing={2} paddingTop="1rem">
                    {[...Array(6)].map((_, index) => (
                        <Grid item md={2.4} key={index}>
                            <FoodCardShimmer />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <CustomEmptyResult
                    label="No Food Found"
                    objectfit="contain"
                    image={noFoodFoundImage}
                />
            )}
        </>
    )
}

export default RestaurantDetailsShimmer
