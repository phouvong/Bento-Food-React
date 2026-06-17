import React from 'react'
import { Box, Stack, Typography } from '@mui/material'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import CustomNextImage from '@/components/CustomNextImage'

// Only the fields actually rendered are listed. Extra fields on the source
// restaurant object are silently ignored — we don't need a full domain type
// just to render this card.
interface Restaurant {
    name?: string
    logo_full_url?: string
    avg_rating?: number
    rating_count?: number
    delivery_time?: string
}

interface RestaurantInfoCardProps {
    restaurant: Restaurant
    t: (key: string) => string
}

type NeutralPalette = Record<string, Record<number, string>>

const RestaurantInfoCard: React.FC<RestaurantInfoCardProps> = ({
    restaurant,
    t,
}) => {
    const rating = restaurant?.avg_rating ?? 0
    const ratingCount = restaurant?.rating_count ?? 0

    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            sx={{
                mx: 2,
                mb: 1.5,
                px: 1.5,
                py: 1.25,
                borderRadius: '12px',
                backgroundColor: (theme) =>
                    (theme.palette as unknown as NeutralPalette).neutral[200],
            }}
        >
            <Box
                sx={{
                    width: 38,
                    height: 38,
                    flexShrink: 0,
                    borderRadius: '50%',
                    overflow: 'hidden',
                }}
            >
                <CustomNextImage
                    src={restaurant?.logo_full_url}
                    width={38}
                    height={38}
                    objectFit="cover"
                    borderRadius="50%"
                    aspectRatio="1"
                />
            </Box>
            <Stack spacing={0.25} minWidth={0} flex={1}>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Typography fontSize="14px" fontWeight={700} noWrap>
                        {restaurant?.name}
                    </Typography>
                    {rating > 0 && (
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.3}
                            flexShrink={0}
                        >
                            <StarRoundedIcon
                                sx={{ fontSize: 14, color: '#F59E0B' }}
                            />
                            <Typography fontSize="12px" fontWeight={700}>
                                {Number(rating).toFixed(1)}
                            </Typography>
                            {ratingCount > 0 && (
                                <Typography
                                    fontSize="12px"
                                    color="text.secondary"
                                >
                                    ({ratingCount})
                                </Typography>
                            )}
                        </Stack>
                    )}
                </Stack>
                {restaurant?.delivery_time && (
                    <Typography fontSize="12px" color="text.secondary">
                        {t('Estimated Delivery')} : {restaurant.delivery_time}
                    </Typography>
                )}
            </Stack>
        </Stack>
    )
}

export default RestaurantInfoCard
