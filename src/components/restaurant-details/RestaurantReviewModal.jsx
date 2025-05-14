import { onErrorResponse } from '@/components/ErrorResponse'
import CustomRatings from '@/components/custom-ratings/CustomRatings'
import DotSpin from '@/components/home/restaurant/DotSpin'
import { ReviewApi } from '@/hooks/react-query/config/reviewlist'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { getNumberWithConvertedDecimalPoint } from '@/utils/customFunctions'
import { Grid, Typography, alpha, Box, Stack } from '@mui/material'
import LinearProgress, {
    linearProgressClasses,
} from '@mui/material/LinearProgress'
import { styled } from '@mui/material/styles'
import { useTheme } from '@mui/styles'
import { t } from 'i18next'
import React, { useEffect } from 'react'
import { useQuery } from 'react-query'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'
import ReviewContent from '@/components/restaurant-details/ReviewContent'

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 8,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor:
            theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
        backgroundColor: theme.palette.primary.main,
    },
}))

const RestaurantReviewModal = ({
    product_avg_rating,
    rating_count,
    reviews_comments_count,
    id,
    restaurantDetails,
}) => {
    const theme = useTheme()
    const { isLoading, data } = useQuery(
        [`review-list`, id],
        () => ReviewApi.reviewList(id),
        {
            onError: onErrorResponse,
        }
    )

    const getStart = () => {
        const ratingCounts = {
            one_star: 0,
            two_star: 0, // Corrected typo from "start" to "star"
            three_star: 0, // Corrected typo from "start" to "star"
            four_star: 0, // Corrected typo from "start" to "star"
            five_star: 0, // Corrected typo from "start" to "star"
            totalCount: 0,
        }

        data?.data?.forEach((item) => {
            switch (item?.rating) {
                case 1:
                    ratingCounts.one_star += 1
                    ratingCounts.totalCount += 1
                    break
                case 2:
                    ratingCounts.two_star += 1
                    ratingCounts.totalCount += 1
                    break
                case 3:
                    ratingCounts.three_star += 1
                    ratingCounts.totalCount += 1
                    break
                case 4:
                    ratingCounts.four_star += 1
                    ratingCounts.totalCount += 1
                    break
                case 5:
                    ratingCounts.five_star += 1
                    ratingCounts.totalCount += 1
                    break
                default:
                    break
            }
        })
    }
    useEffect(() => {
        if (data) {
            getStart()
        }
    }, [data])
    const getPercentOfNumber = (percentRate) => {
        const total = restaurantDetails?.ratings.reduce(
            (sum, current) => sum + current,
            0
        )

        return percentRate ? ((percentRate / total) * 100).toFixed(1) : 0
    }
    return (
        <CustomStackFullWidth
            sx={{
                padding: {
                    xs: '1rem',
                    sm: '1rem',
                    md: '1.2rem',
                },
            }}
        >
            <SimpleBar style={{ maxHeight: '60vh' }}>
                <CustomStackFullWidth
                    backgroundColor={alpha(theme.palette.neutral[400], 0.1)}
                    padding="2rem"
                    borderRadius="8px"
                    color={theme.palette.text.primary}
                >
                    <Grid container gap={{ xs: 2, md: 0 }}>
                        <Grid item xs={12} sm={12} md={6}>
                            <Stack>
                                <Typography
                                    component="span"
                                    fontSize="50px"
                                    color={theme.palette.primary.main}
                                    fontWeight="500"
                                >
                                    {getNumberWithConvertedDecimalPoint(
                                        product_avg_rating,
                                        // digitAfterDecimalPoint
                                        1
                                    )}
                                    <Typography
                                        component="span"
                                        fontSize="35px"
                                        color={theme.palette.primary.light}
                                        fontWeight="500"
                                    >
                                        /5
                                    </Typography>
                                </Typography>
                                <CustomRatings
                                    readOnly
                                    ratingValue={product_avg_rating}
                                />
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    marginTop=".8rem"
                                >
                                    <Typography
                                        fontSize="13px"
                                        color={theme.palette.neutral[600]}
                                        backgroundColor={alpha(
                                            theme.palette.neutral[500],
                                            0.2
                                        )}
                                        padding="2px 6px"
                                        borderRadius="4px"
                                    >
                                        {JSON.stringify(rating_count)}{' '}
                                        {t('Ratings')}
                                    </Typography>
                                    <Typography
                                        fontSize="13px"
                                        color={theme.palette.neutral[600]}
                                        backgroundColor={alpha(
                                            theme.palette.neutral[500],
                                            0.2
                                        )}
                                        padding="2px 6px"
                                        borderRadius="4px"
                                    >
                                        {JSON.stringify(reviews_comments_count)}{' '}
                                        {t('Reviews')}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6}>
                            <Stack gap={1.5}>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                >
                                    <Typography fontSize="14px">5</Typography>
                                    <Box flexGrow={1}>
                                        <BorderLinearProgress
                                            variant="determinate"
                                            value={
                                                restaurantDetails?.ratings[0]
                                            }
                                        />
                                    </Box>
                                    <Typography
                                        fontSize="14px"
                                        color={theme.palette.neutral[600]}
                                    >
                                        {getPercentOfNumber(
                                            restaurantDetails?.ratings[0]
                                        )}
                                        %
                                    </Typography>
                                </Stack>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                >
                                    <Typography fontSize="14px">4</Typography>
                                    <Box flexGrow={1}>
                                        <BorderLinearProgress
                                            variant="determinate"
                                            value={
                                                restaurantDetails?.ratings[1]
                                            }
                                        />
                                    </Box>
                                    <Typography
                                        fontSize="14px"
                                        color={theme.palette.neutral[600]}
                                    >
                                        {getPercentOfNumber(
                                            restaurantDetails?.ratings[1]
                                        )}
                                        %
                                    </Typography>
                                </Stack>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                >
                                    <Typography fontSize="14px">3</Typography>
                                    <Box flexGrow={1}>
                                        <BorderLinearProgress
                                            variant="determinate"
                                            value={
                                                restaurantDetails?.ratings[2]
                                            }
                                        />
                                    </Box>
                                    <Typography
                                        fontSize="14px"
                                        color={theme.palette.neutral[600]}
                                    >
                                        {getPercentOfNumber(
                                            restaurantDetails?.ratings[2]
                                        )}
                                        %
                                    </Typography>
                                </Stack>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                >
                                    <Typography fontSize="14px">2</Typography>
                                    <Box flexGrow={1}>
                                        <BorderLinearProgress
                                            variant="determinate"
                                            value={
                                                restaurantDetails?.ratings[3]
                                            }
                                        />
                                    </Box>
                                    <Typography
                                        fontSize="14px"
                                        color={theme.palette.neutral[600]}
                                    >
                                        {getPercentOfNumber(
                                            restaurantDetails?.ratings[3]
                                        )}
                                        %
                                    </Typography>
                                </Stack>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                >
                                    <Typography fontSize="14px">1</Typography>
                                    <Box flexGrow={1}>
                                        <BorderLinearProgress
                                            variant="determinate"
                                            value={
                                                restaurantDetails?.ratings[4]
                                            }
                                        />
                                    </Box>
                                    <Typography
                                        fontSize="14px"
                                        color={theme.palette.neutral[600]}
                                    >
                                        {getPercentOfNumber(
                                            restaurantDetails?.ratings[4]
                                        )}
                                        %
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Grid>
                    </Grid>
                </CustomStackFullWidth>

                {data &&
                    data?.data?.map((review) => (
                        <ReviewContent
                            review={review}
                            restaurantName={restaurantDetails?.name}
                        />
                    ))}
                {isLoading && (
                    <Stack marginTop="2rem">
                        <DotSpin />
                    </Stack>
                )}
            </SimpleBar>
        </CustomStackFullWidth>
    )
}

export default RestaurantReviewModal
