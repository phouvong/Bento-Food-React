import { Box, Grid, Stack } from '@mui/material'
import { useEffect } from 'react'

import { useSelector } from 'react-redux'

import { setFoodOrRestaurant } from '@/redux/slices/searchFilter'
import { CustomPaperBigCard } from '@/styled-components/CustomStyles.style'
import { noFoodFoundImage, noRestaurantsImage } from '@/utils/LocalImages'
import { useTheme } from '@emotion/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import Meta from '../Meta'
import CustomEmptyResult from '../empty-view/CustomEmptyResult'
import NewFoodCard from '../new-food-card/NewFoodCard'
import NewStoreCard from '../new-store-card/NewStoreCard'
import FoodOrRestaurant from '../products-page/FoodOrRestaurant'
import WishListShimmer from './WishListShimmer'

const WishlistPage = ({ noCard = false }) => {
    const { foodOrRestaurant } = useSelector((state) => state.searchFilterStore)
    const theme = useTheme()
    const { global } = useSelector((state) => state.globalSettings)
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const { wishLists } = useSelector((state) => state.wishList)

    useEffect(() => {}, [wishLists])

    const content = (
        <Box sx={{ width: '100%' }}>
            <FoodOrRestaurant
                foodOrRestaurant={foodOrRestaurant}
                setFoodOrRestaurant={setFoodOrRestaurant}
            />
            {wishLists ? (
                <>
                    {foodOrRestaurant === 'products' && (
                        <Grid
                            container
                            spacing={2}
                            sx={{ paddingBlockStart: '1rem' }}
                        >
                            {wishLists?.food?.map((product) => (
                                <Grid
                                    item
                                    md={6}
                                    sm={6}
                                    xs={12}
                                    key={product?.id}
                                >
                                    <NewFoodCard
                                        product={product}
                                        variant="horizontal"
                                        productImageUrl={
                                            global?.base_urls
                                                ?.product_image_url
                                        }
                                    />
                                </Grid>
                            ))}
                            {wishLists?.food?.length === 0 && (
                                <Stack
                                    alignItems="center"
                                    width="100%"
                                    justifyContent="center"
                                    minHeight="30vh"
                                    pt={{ xs: '40px', md: '110px' }}
                                >
                                    <CustomEmptyResult
                                        label="No Favourite Food Found"
                                        image={noFoodFoundImage}
                                        height={160}
                                        width={160}
                                    />
                                </Stack>
                            )}
                        </Grid>
                    )}
                    {foodOrRestaurant === 'restaurants' && (
                        <Grid
                            container
                            spacing={2}
                            sx={{ paddingBlockStart: '1rem' }}
                        >
                            {wishLists?.restaurant?.map((restaurantItem) => (
                                <Grid
                                    item
                                    md={4}
                                    sm={6}
                                    xs={12}
                                    key={restaurantItem?.id}
                                >
                                    <NewStoreCard restaurant={restaurantItem} />
                                </Grid>
                            ))}
                            {wishLists?.restaurant?.length === 0 && (
                                <Stack
                                    alignItems="center"
                                    width="100%"
                                    justifyContent="center"
                                    minHeight="30vh"
                                    pt={{ xs: '60px', md: '110px' }}
                                >
                                    <CustomEmptyResult
                                        label="No Favourite Restaurant Found"
                                        image={noRestaurantsImage}
                                        height={120}
                                        width={120}
                                    />
                                </Stack>
                            )}
                        </Grid>
                    )}
                </>
            ) : (
                <WishListShimmer />
            )}
        </Box>
    )

    return (
        <>
            <Meta
                title={` My Wish List-${global?.business_name}`}
                description=""
                keywords=""
            />
            {noCard ? (
                content
            ) : (
                <CustomPaperBigCard
                    padding={isXSmall ? '10px 10px' : '30px 40px'}
                    border={false}
                    sx={{
                        minHeight: !isXSmall && '558px',
                        boxShadow: isXSmall && 'unset',
                    }}
                >
                    {content}
                </CustomPaperBigCard>
            )}
        </>
    )
}

export default WishlistPage
