import React from 'react'
import { Grid } from '@mui/material'
import CustomResturantShimmer from './CustomResturantShimmer'
const CustomShimmerPopular = () => {
    return (
        <Grid item md={6} xs={12} className="md">
            <CustomResturantShimmer />
            <CustomResturantShimmer />
            <CustomResturantShimmer />
            <CustomResturantShimmer />
            <CustomResturantShimmer />
            <CustomResturantShimmer />
            <CustomResturantShimmer />
            <CustomResturantShimmer />
        </Grid>
    )
}

export default CustomShimmerPopular
