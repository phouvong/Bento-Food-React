import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CustomImageContainer from '../CustomImageContainer'
import CloseIcon from '@mui/icons-material/Close'
import { alpha, Typography, Stack } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { CustomStackForFoodModal } from './FoodModalStyle'
import { CustomFavICon } from '../food-card/FoodCard.style'
import IconButton from '@mui/material/IconButton'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FoodRating from '../food-card/FoodRating'
import { useRouter } from 'next/router'
import CustomNextImage from '@/components/CustomNextImage'
import React from 'react'
import { handleBadge } from '@/utils/customFunctions'
import VerifiedBadge from '@/components/verified-badge/VerifiedBadge'

const FoodModalTopSection = ({
    product,
    image,
    handleModalClose,
    isInList,
    addToFavorite,
    deleteWishlistItem,
    global
}) => {
    console.log({ product })
    const router = useRouter()
    let languageDirection = undefined
    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }
    const theme = useTheme()
    const handleClick = () => {
        router.push(`/restaurants/${product?.restaurant_slug || product?.restaurant_id}`)
        handleModalClose()
    }
    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint

    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }
    return (
        <CustomStackFullWidth
            sx={{
                position: 'relative',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 167,
            }}
        >
            <IconButton
                onClick={handleModalClose}
                sx={{
                    zIndex: '999',
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '50%',
                    padding: "6px",
                    '&:hover': {
                        backgroundColor: alpha('rgba(255, 255, 255, 0.7)', 0.5),
                    },
                }}
            >
                <CloseIcon sx={{ fontSize: '14px', fontWeight: 'bold' }} />
            </IconButton>
            <CustomNextImage
                src={image}
                width="475"
                height="167"
                borderRadius="5px"
                objectFit={image ? "cover" : "contain"}
                errorWidth={80}
                errorHeight={80}
                alt="Food Image"
            />
              <Stack
                        position="absolute"
                        top="2%"
                        left=""
                        zIndex="999"
                    >
                        {handleBadge(
                            product,
                            currencySymbol,
                            currencySymbolDirection,
                            digitAfterDecimalPoint,

                        )}
                    </Stack>
            <CustomStackForFoodModal width="100%" spacing={2}>
                <Stack
                    spacing={1.4}
                    alignItems={languageDirection === 'rtl' ? 'end' : 'start'}
                >
                    {!product?.available_date_ends && (
                        <FoodRating product_avg_rating={product?.avg_rating} />
                    )}
                  

                    {(() => {
                        // Field name varies by API endpoint; check the
                        // common variants like ReorderCard.tsx does.
                        const isVerified =
                            product?.restaurant_verified ??
                            product?.verified_seller ??
                            product?.is_verified
                        return router.pathname !== `/restaurants/[id]` ? (
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                            >
                                <Typography
                                    sx={{
                                        cursor: 'pointer',
                                        transition:
                                            'background 1s, color 1s',
                                        '&:hover': {
                                            color: (theme) =>
                                                theme.palette.primary.main,
                                        },
                                    }}
                                    fontSize="14px"
                                    fontWeight="400"
                                    color={
                                        theme.palette.whiteContainer.main
                                    }
                                    onClick={handleClick}
                                >
                                    {product?.restaurant_name}
                                </Typography>
                                <VerifiedBadge
                                    verified={isVerified}
                                    sx={{ mb: '1px' }}
                                />
                            </Stack>
                        ) : (
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                            >
                                <Typography
                                    fontSize="14px"
                                    fontWeight="400"
                                    color={
                                        theme.palette.whiteContainer.main
                                    }
                                >
                                    {product?.restaurant_name}
                                </Typography>
                                <VerifiedBadge
                                    verified={isVerified}
                                    sx={{ mb: '1px' }}
                                />
                            </Stack>
                        )
                    })()}
                </Stack>
                {!product?.available_date_ends && (
                    <>
                        {!isInList(product?.id) ? (
                            <CustomFavICon
                                languageDirection={languageDirection}
                            >
                                <IconButton onClick={addToFavorite}>
                                    <FavoriteBorderIcon color="primary" />
                                </IconButton>
                            </CustomFavICon>
                        ) : (
                            <CustomFavICon
                                languageDirection={languageDirection}
                            >
                                <IconButton
                                    onClick={() =>
                                        deleteWishlistItem(product.id)
                                    }
                                >
                                    <FavoriteIcon color="primary" />
                                </IconButton>
                            </CustomFavICon>
                        )}
                    </>
                )}
            </CustomStackForFoodModal>
        </CustomStackFullWidth >
    )
}

export default FoodModalTopSection
