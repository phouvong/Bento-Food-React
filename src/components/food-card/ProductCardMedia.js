import React from 'react'
import {
    Typography,
    useMediaQuery,
    styled,
    useTheme,
    Box,
    Stack,
} from '@mui/material'
import { t } from 'i18next'
import CustomImageContainer from '../CustomImageContainer'
import { useSelector } from 'react-redux'
import { isAvailable } from '@/utils/customFunctions'
import {
    CustomOverLay,
    CustomOverlayBox,
} from '@/styled-components/CustomStyles.style'
import { CustomStackForFoodModal } from '../foodDetail-modal/FoodModalStyle'
import FoodRating from './FoodRating'
import QuickView from './QuickView'
import { useRouter } from 'next/router'
const CardWrapper = styled(Box)(({ theme }) => ({
    position: 'relative',
    maxHeight: '160px',
    [theme.breakpoints.down('sm')]: {
        maxHeight: '140px',
    },
    img: {
        transition: 'all ease 0.4s',
    },
    borderRadius: '8px',
    overflow: 'hidden',
    '&:hover': {
        img: {
            transform: 'scale(1.04)',
        },
    },
}))

const ProductCardMedia = (props) => {
    const {
        id,
        image,
        onClick,
        available_time_starts,
        available_time_ends,
        available_date_ends,
        imageUrl,
        alt,
        addToFavorite,
        isInList,
        deleteWishlistItem,
        handleBadge,
        product,
        isInCart,
        incrOpen,
        getQuantity,
        setIncrOpen,
        handleClickQuantityButton,
        addToCart,
        isTransformed,
        isRestaurantDetails,
        rating_count,
        horizontal,
    } = props

    const { global } = useSelector((state) => state.globalSettings)
    const theme = useTheme()
    const router = useRouter()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint

    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }

    return (
        <>
            {!image && (
                <Stack sx={{ overflow: 'hidden' }}>
                    <CardWrapper>
                        {isAvailable(
                            available_time_starts,
                            available_time_ends
                        ) && (
                            <Stack
                                position="absolute"
                                bottom="10%"
                                left="0"
                                zIndex="1"
                            >
                                {handleBadge(
                                    product,
                                    currencySymbol,
                                    currencySymbolDirection,
                                    digitAfterDecimalPoint,
                                    available_date_ends
                                )}
                            </Stack>
                        )}
                        {isRestaurantDetails &&
                            isSmall &&
                            product?.avg_rating !== 0 &&
                            isAvailable(
                                available_time_starts,
                                available_time_ends
                            ) && (
                                <Stack
                                    position="absolute"
                                    top="5%"
                                    right="5%"
                                    zIndex="1"
                                >
                                    <FoodRating
                                        product_avg_rating={rating_count}
                                    />
                                </Stack>
                            )}
                        {!isAvailable(
                            available_time_starts,
                            available_time_ends
                        ) ? (
                            <CustomOverlayBox>
                                <Typography align="center" variant="h5">
                                    {t('Not Available now')}
                                </Typography>
                            </CustomOverlayBox>
                        ) : (
                            <CustomOverLay
                                hover={isTransformed}
                                border_radius="10px"
                            >
                                <QuickView
                                    id={id}
                                    isInList={isInList}
                                    quickViewHandleClick={onClick}
                                    addToWishlistHandler={addToFavorite}
                                    removeFromWishlistHandler={
                                        deleteWishlistItem
                                    }
                                    isInCart={isInCart}
                                    product={product}
                                    getQuantity={getQuantity}
                                    handleClickQuantityButton={
                                        handleClickQuantityButton
                                    }
                                    setIncrOpen={setIncrOpen}
                                    incrOpen={incrOpen}
                                    addToCart={addToCart}
                                    horizontal={horizontal}
                                />
                            </CustomOverLay>
                        )}
                        <CustomImageContainer
                            src={imageUrl}
                            alt={alt}
                            width="100%"
                            height="160px"
                            borderRadius="8px"
                            objectFit="cover"
                            smHeight="130px"
                        />
                        {router.pathname !== `/restaurant/[id]` && (
                            <CustomStackForFoodModal
                                padding="12px"
                                direction="row"
                                width="100%"
                                right="0"
                                spacing={1}
                                justifyContent="flex-end"
                                alignItems="flex-end"
                            >
                                <Typography
                                    fontSize="12px"
                                    fontWeight={500}
                                    color={theme.palette.whiteContainer.main}
                                >
                                    {product?.min_delivery_time}-
                                    {product?.max_delivery_time} {t('min')}
                                </Typography>
                            </CustomStackForFoodModal>
                        )}
                    </CardWrapper>
                </Stack>
            )}
        </>
    )
}

export default ProductCardMedia
