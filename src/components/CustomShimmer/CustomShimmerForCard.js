import React from 'react'
import { Stack } from '@mui/material'
import {
    CustomCardContent,
    CustomFoodCard,
    RatingWrapTypography,
    RatingStarIcon,
    PricingCardActions,
} from '../food-card/FoodCard.style'
import Skeleton from '@mui/material/Skeleton'

const CustomShimmerForCard = () => {
    return (
        <CustomFoodCard>
            <Stack>
                <Skeleton
                    variant="rectangular"
                    animation="pulse"
                    height={150}
                />
            </Stack>
            <CustomCardContent>
                <Skeleton variant="text" animation="wave" height={20} />

                <Skeleton
                    variant="text"
                    animation="wave"
                    height={20}
                    width="80%"
                />

                <RatingWrapTypography color="#808080">
                    0
                    <RatingStarIcon fontSize="small" color="#808080" />
                </RatingWrapTypography>
                <PricingCardActions>
                    <Skeleton
                        variant="text"
                        animation="wave"
                        width={70}
                        height={20}
                    />

                    <Skeleton
                        variant="text"
                        animation="wave"
                        width={70}
                        height={20}
                    />
                </PricingCardActions>
            </CustomCardContent>
        </CustomFoodCard>
    )
}

export default CustomShimmerForCard
