import React, { memo } from 'react'
import { Stack, Box } from '@mui/material'
import ImageNotFound from '../../../public/static/no-image-found.png'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { HeroCardTypography } from './Landingpage.style'
import HeroLocationForm from './HeroLocationForm'
import CustomContainer from '../container'
import { LandingHeroBox } from './landingPageStyle'

const HeroSection = (props) => {
    const {
        handleModalClose,
        isLoading,
        banner_section_title,
        banner_section_subTitle,
        banner_section_image,
        banner_section_image_base_url,
    } = props
    const heroImg = banner_section_image

    const theme = useTheme()
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))

    return (
        <>
            {!isLoading && (
                <LandingHeroBox
                    banner_section_image_base_url={
                        banner_section_image_base_url
                    }
                    heroImg={heroImg}
                    isXSmall={isXSmall}
                    ImageNotFound={ImageNotFound}
                >
                    <Box
                        sx={{
                            flexGrow: '1',
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        }}
                    ></Box>
                    <CustomContainer>
                        {isLoading ? (
                            <Stack
                                width="100%"
                                paddingTop={{ xs: '30px', md: '60px' }}
                                sx={{
                                    height: {
                                        xs: '137px',
                                        sm: '300px',
                                        md: '300px',
                                    },
                                }}
                            >
                                <Skeleton
                                    variant="rectangular"
                                    animation="pulse"
                                    width="100%"
                                    height="100%"
                                />
                            </Stack>
                        ) : (
                            <Stack
                                height={{
                                    xs: '137px',
                                    sm: '300px',
                                    md: '320px',
                                }}
                                width="100%"
                                paddingY="20px"
                                paddingX={isXSmall && '1rem'}
                                justifyContent="center"
                                alignItems="center"
                            >
                                <HeroCardTypography
                                    fontSize={{ xs: '24px', sm: '48px' }}
                                    fontWeight="700"
                                    component="h1"
                                >
                                    {banner_section_title}
                                </HeroCardTypography>
                                <HeroCardTypography
                                    fontSize={{ xs: '12px', sm: '18px' }}
                                    component="h2"
                                >
                                    {banner_section_subTitle}
                                </HeroCardTypography>
                                {!isXSmall && (
                                    <HeroLocationForm
                                        mobileview="false"
                                        handleModalClose={handleModalClose}
                                    />
                                )}
                            </Stack>
                        )}
                    </CustomContainer>
                    <Box
                        sx={{
                            flexGrow: '1',
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        }}
                    ></Box>
                </LandingHeroBox>
            )}
            {isXSmall && (
                <HeroLocationForm
                    mobileview="true"
                    handleModalClose={handleModalClose}
                />
            )}
            {isLoading && (
                <Skeleton width="100%" height="250px" variant="rectangular" />
            )}
        </>
    )
}

export default memo(HeroSection)
