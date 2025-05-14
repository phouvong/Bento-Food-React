import React, { useState } from 'react'
import { Grid, Typography, Box, Stack } from '@mui/material'
import CustomRatings from '@/components/custom-ratings/CustomRatings'
import { getDateFormat, handleBadge } from '@/utils/customFunctions'
import { ReadMore } from '@/components/landingpage/ReadMore'
import CustomImageContainer from '@/components/CustomImageContainer'
import { useTheme } from '@mui/styles'
import { RTL } from '@/components/RTL/RTL'
import dynamic from 'next/dynamic'
const FoodDetailModal = dynamic(() =>
    import('@/components/foodDetail-modal/FoodDetailModal')
)
import { useSelector } from 'react-redux'

const ReviewContent = ({ review, restaurantName }) => {
    const theme = useTheme()
    const [openModal, setOpenModal] = useState(false)
    const { global } = useSelector((state) => state.globalSettings)

    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint

    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }
    const handleModalClose = () => {
        setOpenModal(false)
    }
    const languageDirection = localStorage.getItem('direction')
    return (
        <>
            <Grid
                container
                key={review?.id}
                padding="10px"
                spacing={2}
                justifyContent="space-between"
            >
                <Grid item xs={8} sm={8} md={9.5}>
                    <Stack gap={0.4} justifyContent="flex-end">
                        <Typography
                            fontSize="14px"
                            fontWeight="500"
                            color={theme.palette.text.primary}
                        >
                            {review?.customer_name}
                        </Typography>
                        <CustomRatings
                            readOnly
                            ratingValue={review.rating}
                            fontSize={'1.2rem'}
                        />
                        <Typography
                            fontSize="12px"
                            fontWeight="400"
                            color="text.secondary"
                        >
                            {getDateFormat(review.created_at)}
                        </Typography>
                        <ReadMore
                            color={theme.palette.neutral[600]}
                            limits="160"
                        >
                            {review?.comment}
                        </ReadMore>
                    </Stack>
                </Grid>
                <Grid item xs={4} sm={4} md={2.5}>
                    <Stack justifyContent="center" spacing={0.5}>
                        <Stack
                            padding="7px"
                            borderRadius="8px"
                            sx={{
                                border: '.8px solid',
                                borderColor: (theme) =>
                                    theme.palette.neutral[300],
                            }}
                            onClick={() => setOpenModal(true)}
                        >
                            <CustomImageContainer
                                src={review.food_image_full_url}
                                objectFit="cover"
                                height="74px"
                                borderRadius="8px"
                            />
                        </Stack>
                        <Typography
                            textAlign="center"
                            color={theme.palette.neutral[600]}
                            fontSize="10px"
                            fontWeight="400"
                        >
                            {review.food_name}
                        </Typography>
                    </Stack>
                </Grid>
                {review.reply ? (
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                background: theme.palette.background.paper,
                                padding: '10px',
                                borderRadius: '9px',
                            }}
                        >
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Typography
                                    fontSize="12px"
                                    fontWeight="500"
                                    color={theme.palette.text.primary}
                                >
                                    {restaurantName}
                                </Typography>
                                <Typography
                                    fontSize="10px"
                                    fontWeight="400"
                                    color="text.secondary"
                                >
                                    {getDateFormat(review.updated_at)}
                                </Typography>
                            </Stack>
                            <Stack mt="5px">
                                <ReadMore
                                    color={theme.palette.text.secondary}
                                    limits="160"
                                >
                                    {review.reply}
                                </ReadMore>
                            </Stack>
                        </Box>
                    </Grid>
                ) : (
                    ''
                )}
            </Grid>
            {openModal && (
                <RTL direction={languageDirection}>
                    <FoodDetailModal
                        product={{ id: review?.food_id }}
                        open={openModal}
                        handleModalClose={handleModalClose}
                        setOpen={setOpenModal}
                        currencySymbolDirection={currencySymbolDirection}
                        currencySymbol={currencySymbol}
                        digitAfterDecimalPoint={digitAfterDecimalPoint}
                        handleBadge={handleBadge}
                    />
                </RTL>
            )}
        </>
    )
}

export default ReviewContent
