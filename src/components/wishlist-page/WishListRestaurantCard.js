import React, { useState } from 'react'
import { Grid, IconButton, Typography, Stack } from '@mui/material'
import { IconButtonGrid, WishlistBox } from './WishList.style'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import CustomImageContainer from '../CustomImageContainer'
import CustomPopover from '../custom-popover/CustomPopover'
import WishListImage from '../../assets/images/WishListImage'
import CustomPopoverWithItem from '../custom-popover/CustomPopoverWithItem'
import DeleteIcon from '../../assets/images/icons/DeleteIcon'
import { useRouter } from 'next/router'
import FoodRating from '../food-card/FoodRating'
import CustomNextImage from '@/components/CustomNextImage'

const WishListRestaurantCard = ({ restaurant, deleteWishlistRes }) => {
    const theme = useTheme()
    const [anchorEl, setAnchorEl] = useState(null)
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const router = useRouter()
    const { name, logo_full_url, id, address, slug, zone_id } = restaurant

    const imageUrl = logo_full_url
    const handleClick = () => {
        deleteWishlistRes(id)
    }
    const handleClickDelete = (event) => {
        event.stopPropagation()
        setAnchorEl(event.currentTarget)
    }
    const handleClose = (event) => {
        setAnchorEl(null)
    }

    const routeToRestaurant = () => {
        router.push({
            pathname: `/restaurant/[id]`,
            query: {
                id: `${slug ? slug : id}`,
                restaurant_zone_id: zone_id,
            },
        })
    }

    return (
        <WishlistBox sx={{ cursor: 'pointer' }}>
            <Grid
                container
                item
                md={12}
                xs={12}
                spacing={{ xs: 1 }}
                onClick={routeToRestaurant}
            >
                <Grid item md={4} sm={4} xs={4}>
                    <CustomNextImage
                        src={imageUrl}
                        alt={name}
                        width={isXSmall? '80px' : '120'}
                        height={isXSmall? '80px' : '120'}
                        objectFit={imageUrl?"cover":"contain"}
                        borderRadius=".7rem"

                    />
                </Grid>
                <Grid item md={7} sm={6} xs={6} alignSelf="center">
                    <Stack padding=".6rem">
                        <Typography variant={isXSmall ? 'h6' : 'h5'}>
                            {name}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: '14px',
                                color: '#9B9B9B',

                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: '1',
                                WebkitBoxOrient: 'vertical',
                            }}
                        >
                            {address}
                        </Typography>
                        <Typography>
                            {parseInt(restaurant?.avg_rating) !== 0 ? (
                                <FoodRating
                                    product_avg_rating={restaurant?.avg_rating}
                                />
                            ) : (
                                ''
                            )}
                        </Typography>
                    </Stack>
                </Grid>
                <IconButtonGrid item md={1} xs={2}>
                    <IconButton
                        onClick={handleClickDelete}
                        sx={{ height: '35px' }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </IconButtonGrid>
            </Grid>
            <CustomPopover
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                maxWidth="421px"
                padding="20px 35px 25px"
            >
                <CustomPopoverWithItem
                    icon={<WishListImage />}
                    deleteItem={handleClick}
                    handleClose={handleClose}
                    confirmButtonText="Yes , Remove"
                    cancelButtonText="Cancel"
                    title="Remove this restaurant"
                    subTitle="Are you sure you want to  delete this item?"
                />
            </CustomPopover>
        </WishlistBox>
    )
}

export default WishListRestaurantCard
