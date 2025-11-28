import React, { memo } from 'react'
import { Stack, Box, Typography } from '@mui/material'
import ImageNotFound from '../../../public/static/no-image-found.svg'
import { useTheme } from '@mui/material/styles'
import HeroLocationForm from './HeroLocationForm'
import CustomContainer from '../container'
import CustomNextImage from '@/components/CustomNextImage'

const HeroSection = (props) => {
    const {
        handleModalClose,
        banner_section_title,
        banner_section_subTitle,
        banner_section_image,
        place_holder_search_text
    } = props
    const theme = useTheme();

    return (
        <CustomContainer>
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginTop: { xs: '56px', md: '76px' },
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        zIndex: -1,
                        width: '100%',
                        height: '100%',
                        top: 0,
                        left: 0,
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.40)',
                        },
                        img: {
                            height: '100%',
                        },
                    }}
                >
                    <CustomNextImage
                        src={banner_section_image}
                        altSrc={ImageNotFound}
                        width={1920}
                        height={370}
                        priority={true}
                    />
                </Box>
                <Stack
                    minHeight="320px"
                    width="100%"
                    paddingBottom="80px"
                    justifyContent="center"
                    alignItems="center"
                    paddingTop="30px"
                >
                    <CustomContainer>
                        <Typography
                            fontSize={{ xs: '25px', sm: '45px' }}
                            fontWeight="700"
                            component="h1"
                            color={theme.palette.whiteText.main}
                            letterSpacing="0.05em"
                            textAlign="center"
                            marginBottom="10px"
                            sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {banner_section_title}
                        </Typography>
                        <Box
                            sx={{
                                backgroundColor: theme.palette.background.paper,
                                maxWidth: 742,
                                marginInline: 'auto',
                                borderRadius: '1rem',
                                padding: { xs: '1.5rem 1rem', sm: '1.8rem' },
                            }}
                        >
                            <Typography
                                fontSize={{ xs: '16px', sm: '20px' }}
                                component="h3"
                                fontWeight={500}
                                textAlign="center"
                                color={theme.palette.text.primary}
                                sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {banner_section_subTitle}
                            </Typography>

                            <HeroLocationForm
                                fromHero="true"
                                height="41px"
                                mobileview="true"
                                handleModalClose={handleModalClose}
                                place_holder_search_text={
                                    place_holder_search_text
                                }
                            />
                        </Box>
                    </CustomContainer>
                </Stack>
            </Box>
        </CustomContainer>
    )
}

export default memo(HeroSection)
