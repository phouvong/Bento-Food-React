import CustomContainer from '../container'
import { Stack } from '@mui/system'
import { Typography, useTheme, IconButton, useMediaQuery } from '@mui/material'
import { t } from 'i18next'
import CustomNextImage from '@/components/CustomNextImage'
import { SliderCustom } from '@/styled-components/CustomStyles.style'
import Slider from 'react-slick'
import React, { useRef } from 'react'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

const RestaurantRegLanFeature = ({opportunities,business_name,configData}) => {
    const theme = useTheme();
    const sliderRef = useRef(null);

    const isXl = useMediaQuery('(min-width: 1200px)');
    const isLg = useMediaQuery('(min-width: 992px)');
    const isMd = useMediaQuery('(min-width: 768px)');

    const getCurrentSlidesToShow = () => {
        if (isXl) return 4;
        if (isLg) return 3;
        if (isMd) return 2;
        return 1;
    };

    const currentSlidesToShow = getCurrentSlidesToShow();
    const shouldShowButtons = opportunities?.length > currentSlidesToShow;

    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: false,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 4,
                },
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                },
            },

            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                },
            }
        ],
    }

    return (
        <>
            {opportunities?.length > 0 && (
                <Stack backgroundColor="rgba(255, 117, 0, 0.04)" py={8}>
                    <CustomContainer>
                        <Stack mb={4}>
                            <Typography
                                variant="h2"
                                textAlign="center"
                                sx={{ fontSize: { xs: 24, sm: 32 } }}
                                color={theme.palette.neutral[1000]}
                            >
                                {
                                    `${business_name} ${t("Brings new Opportunities")}`
                                }
                            </Typography>
                        </Stack>

                        <Stack
                            sx={{
                                '& .slick-track': {
                                    gap: '20px !important',
                                    height: '100%',
                                },
                                '& .slick-slide': {
                                    height: 'auto',
                                },
                                '& .slick-slide > div': {
                                    height: '100%',
                                },
                            }}
                        >
                            {opportunities && opportunities?.length > 0 && (
                                <>
                                    <SliderCustom>
                                        <Slider {...settings} ref={sliderRef}>
                                            {opportunities?.map((item) => (
                                                <Stack
                                                    sx={{
                                                        backgroundColor:
                                                            theme.palette.background
                                                                .paper,
                                                        borderRadius: '.5rem',
                                                        padding: '2rem 1rem',
                                                        height: '100%',
                                                    }}
                                                    key={item?.id}
                                                >
                                                    <Stack
                                                        justifyContent="center"
                                                        alignItems="center"
                                                    >
                                                        <CustomNextImage
                                                            src={
                                                                item?.image_full_url
                                                            }
                                                            borderRadius="50%"
                                                            width={50}
                                                            height={50}
                                                        />
                                                    </Stack>
                                                    <Typography
                                                        mt={3}
                                                        variant="h4"
                                                        textAlign="center"
                                                        color={theme.palette.neutral[1000]}
                                                    >
                                                        {item?.title}
                                                    </Typography>
                                                    <Typography
                                                        mt={2}
                                                        variant="body2"
                                                        textAlign="center"
                                                        color={theme.palette.neutral[1000]}
                                                    >
                                                        {item?.sub_title}
                                                    </Typography>
                                                </Stack>
                                            ))}
                                        </Slider>
                                    </SliderCustom>
                                    {shouldShowButtons && (
                                        <Stack
                                            direction="row"
                                            gap={1}
                                            justifyContent="center"
                                            mt={3}
                                        >
                                            <IconButton
                                                onClick={() => sliderRef.current?.slickPrev()}
                                                sx={{
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    borderRadius: '50%',
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.primary.main,
                                                        color: 'white',
                                                    }
                                                }}
                                            >
                                                <ChevronLeftIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => sliderRef.current?.slickNext()}
                                                sx={{
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    borderRadius: '50%',
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.primary.main,
                                                        color: 'white',
                                                    }
                                                }}
                                            >
                                                <ChevronRightIcon />
                                            </IconButton>
                                        </Stack>
                                    )}
                                </>
                            )}
                        </Stack>
                    </CustomContainer>
                </Stack>
            )}
        </>
    )
}

export default RestaurantRegLanFeature;