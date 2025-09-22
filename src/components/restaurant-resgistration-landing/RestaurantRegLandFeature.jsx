import CustomContainer from '../container'
import { Stack } from '@mui/system'
import { Typography, useTheme } from '@mui/material'
import { t } from 'i18next'
import Grid from '@mui/material/Grid'
import CustomImageContainer from '@/components/CustomImageContainer'
import CustomNextImage from '@/components/CustomNextImage'
import { SliderCustom } from '@/styled-components/CustomStyles.style'
import Slider from 'react-slick'
import CuisinesCard from '@/components/home/cuisines/CuisinesCard'
import React, { useRef, useState } from 'react'
import { HandleNext, HandlePrev } from '@/components/CustomSliderIcon'

const RestaurantRegLanFeature = ({opportunities,business_name,configData}) => {
    const theme = useTheme();
    const [hoverOn, setHoverOn] = useState(false);
    const sliderRef = useRef(null);
    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 2,
        nextArrow: hoverOn && <HandleNext overLay={true} />,
        prevArrow: hoverOn && <HandlePrev />,
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
                            onMouseEnter={() => setHoverOn(true)}
                            onMouseLeave={() => setHoverOn(false)}
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
                            )}
                        </Stack>
                    </CustomContainer>
                </Stack>
            )}
        </>
    )
}

export default RestaurantRegLanFeature;