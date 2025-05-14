import React from 'react'
import { CssBaseline } from '@mui/material'
import ResturantList from './ResturantList'
import { CustomPaperBigCard } from '@/styled-components/CustomStyles.style'
import CustomPageTitle from '../CustomPageTitle'
import CustomContainer from '../container'

const Searchresturant = ({ restaurantType, title, description }) => {
    return (
        <>
            <CssBaseline />
            <CustomContainer>
                <CustomPaperBigCard sx={{ marginTop: '5rem' }}>
                    <CustomPageTitle title={title} />
                    <ResturantList restaurantType={restaurantType} />
                </CustomPaperBigCard>
            </CustomContainer>
        </>
    )
}

export default Searchresturant
