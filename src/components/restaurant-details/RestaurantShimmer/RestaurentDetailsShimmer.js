import React from 'react'
import { Box, Skeleton, alpha } from '@mui/material'
import FoodCardSkeleton from '../../type-wise-restaurant-page/FoodCardSkeleton'
import FoodCardHorizontalSkeleton from '../../type-wise-restaurant-page/FoodCardHorizontalSkeleton'
import CustomEmptyResult from '../../empty-view/CustomEmptyResult'
import { noFoodFoundImage } from '@/utils/LocalImages'

const titleSkeletonSx = (theme) => ({
    background: alpha(theme.palette.neutral[800], 0.11),
})

const SectionTitleSkeleton = () => (
    <Skeleton
        variant="text"
        animation="pulse"
        width="160px"
        height={24}
        sx={[{ mb: '10px' }, titleSkeletonSx]}
    />
)

const RestaurantDetailsShimmer = ({ showComponent }) => {
    return (
        <>
            {showComponent ? (
                <Box sx={{ paddingTop: '1rem' }}>
                    <Box sx={{ mb: 3 }}>
                        <SectionTitleSkeleton />
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 2,
                                overflow: 'hidden',
                            }}
                        >
                            {[...Array(4)].map((_, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        flex: '0 0 auto',
                                        width: { xs: '42%', sm: '22%' },
                                    }}
                                >
                                    <FoodCardSkeleton />
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Box>
                        <SectionTitleSkeleton />
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 2,
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, 1fr)',
                                },
                            }}
                        >
                            {[...Array(6)].map((_, index) => (
                                <FoodCardHorizontalSkeleton key={index} />
                            ))}
                        </Box>
                    </Box>
                </Box>
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
