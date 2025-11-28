import React from 'react'
import {
    alpha,
    Box,
    Grid,
    Stack,
    Typography,
    useMediaQuery,
} from '@mui/material'
import { CustomCard, PrimaryButton } from './Linksection.style'
import CustomContainer from '../../container'

import { useTheme } from '@mui/material/styles'
import { router } from 'next/client'
import CustomNextImage from '@/components/CustomNextImage'
import { t } from 'i18next'
import QRCodeClient from '@/components/landingpage/QRCodeClient'

const LinkSection = ({ restaurant_section }) => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    const isSm = useMediaQuery(theme.breakpoints.down('sm'))
    const deliveryManRegister = () => {
        const delivery_section_link = '/deliveryman-registration'
        router.push(delivery_section_link)
    }
    const RestaurantRegister = () => {
        const restaurant_section_link = '/restaurant-registration-landing'
        router.push(`${restaurant_section_link}`)
    }

    return (
        <CustomContainer>
            <Grid
                container
                spacing={2}
                className="link-section"
                sx={{
                    backgroundColor: alpha(theme.palette.neutral[200], 0.4),
                    paddingBlock: '1.8rem',
                    borderRadius: '12px',
                }}
            >
                <Grid item xs={12}>
                    <Typography
                        fontSize={{ xs: '1.5rem', md: '30px' }}
                        fontWeight="700"
                        color={theme.palette.neutral[1000]}
                        textAlign="center"
                        component="h2"
                        mb={1}
                    >
                        {restaurant_section?.react_restaurant_earn_money?.title}
                    </Typography>
                    <Typography
                        fontSize={{ xs: '14px', md: '16px' }}
                        fontWeight="400"
                        color={theme.palette.neutral[400]}
                        textAlign="center"
                        component="p"
                        mb={2}
                    >
                        {
                            restaurant_section?.react_restaurant_earn_money
                                ?.description
                        }
                    </Typography>
                </Grid>
                {restaurant_section?.react_restaurant_section?.status === 1 ? (
                    <Grid item xs={12} sm={12} md={6}>
                        <CustomCard>
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                spacing={{ xs: 1, sm: 2, md: 2 }}
                                padding={{ xs: '10px', sm: '1rem' }}
                                sx={{ '> img': { minWidth: isSm ? 80 : 90 } }}
                            >
                                <CustomNextImage
                                    src={
                                        restaurant_section?.react_restaurant_section?.react_restaurant_section_image_full_url
                                    }
                                    width={isSm ? 80 : 90}
                                    height={isSm ? 80 : 90}
                                    objectFit="cover"
                                />
                                <Stack
                                    direction="row"
                                    flexWrap="wrap"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    flexGrow={1}
                                    gap={1}
                                >
                                    <Stack>
                                        <Typography
                                            fontSize={{
                                                xs: '11px',
                                                sm: '18px',
                                                md: '18px',
                                            }}
                                            fontWeight="600"
                                            textAlign="left"
                                            component="h2"
                                        >
                                            {
                                                restaurant_section
                                                    ?.react_restaurant_section
                                                    ?.title
                                            }
                                        </Typography>
                                        <Typography
                                            fontSize={{
                                                xs: '10px',
                                                sm: '14px',
                                                md: '14px',
                                            }}
                                            textAlign="left"
                                            color={theme.palette.neutral[600]}
                                            component="p"
                                        >
                                            {
                                                restaurant_section
                                                    ?.react_restaurant_section
                                                    ?.sub_title
                                            }
                                        </Typography>
                                    </Stack>
                                    {restaurant_section?.react_restaurant_section
                                        ?.status === 1 && (
                                            <PrimaryButton
                                                onClick={RestaurantRegister}
                                                sx={{
                                                    borderRadius: '40px',
                                                    paddingY: {
                                                        xs: '5px',
                                                        sm: '10px',
                                                        md: '10px',
                                                    },
                                                    paddingX: {
                                                        xs: '10px',
                                                        sm: '30px',
                                                        md: '35px',
                                                    },
                                                    marginLeft: '0px',
                                                    
                                                }}
                                            >
                                                <Typography
                                                    fontSize={{
                                                        xs: '12px',
                                                        sm: '14px',
                                                        md: '16px',
                                                    }}
                                                    fontWeight="500"
                                                    color={
                                                        theme.palette.whiteContainer
                                                            .main
                                                    }
                                                   
                                                >
                                                    {
                                                        restaurant_section
                                                            ?.react_restaurant_section
                                                            ?.button_name
                                                    }
                                                </Typography>
                                            </PrimaryButton>
                                        )}
                                </Stack>
                            </Stack>
                        </CustomCard>
                    </Grid>
                ) : null}
                {restaurant_section?.react_delivery_app_download?.status === 1 ? (
                    <Grid item xs={12} sm={12} md={6}>
                        <CustomCard>
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                spacing={{ xs: 1, sm: 2, md: 2 }}
                                padding={{ xs: '10px', sm: '1rem' }}
                                sx={{ '> img': { minWidth: isSm ? 80 : 90 } }}
                            >
                                <CustomNextImage
                                    src={
                                        restaurant_section
                                            ?.react_delivery_registration_section
                                            ?.react_delivery_section_image_full_url
                                    }
                                    width={isSm ? 80 : 90}
                                    height={isSm ? 80 : 90}
                                    objectFit="cover"
                                />
                                <Stack
                                    direction="row"
                                    flexWrap="wrap"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    flexGrow={1}
                                    gap={1}
                                >
                                    <Stack>
                                        <Typography
                                            fontSize={{
                                                xs: '12px',
                                                sm: '18px',
                                                md: '18px',
                                            }}
                                            fontWeight="600"
                                            textAlign="left"
                                            component="h2"
                                        >
                                            {
                                                restaurant_section
                                                    ?.react_delivery_registration_section
                                                    ?.title
                                            }
                                        </Typography>
                                        <Typography
                                            fontSize={{
                                                xs: '10px',
                                                sm: '14px',
                                                md: '14px',
                                            }}
                                            textAlign="left"
                                            color={theme.palette.neutral[600]}
                                            component="p"
                                        >
                                            {
                                                restaurant_section
                                                    ?.react_delivery_registration_section
                                                    ?.sub_title
                                            }
                                        </Typography>
                                    </Stack>
                                    {restaurant_section
                                        ?.react_delivery_registration_section
                                        ?.status === 1 && (
                                            <PrimaryButton
                                                onClick={deliveryManRegister}
                                                sx={{
                                                    borderRadius: '40px',
                                                    paddingY: {
                                                        xs: '5px',
                                                        sm: '10px',
                                                        md: '10px',
                                                    },
                                                    paddingX: {
                                                        xs: '10px',
                                                        sm: '30px',
                                                        md: '35px',
                                                    },
                                                    marginLeft: '0px',
                                                }}
                                            >
                                                <Typography
                                                    fontSize={{
                                                        xs: '12px',
                                                        sm: '14px',
                                                        md: '16px',
                                                    }}
                                                    fontWeight="500"
                                                    color={
                                                        theme.palette.whiteContainer
                                                            .main
                                                    }
                                                >
                                                    {' '}
                                                    {
                                                        restaurant_section
                                                            ?.react_delivery_registration_section
                                                            ?.button_name
                                                    }
                                                </Typography>
                                            </PrimaryButton>
                                        )}
                                </Stack>
                            </Stack>
                        </CustomCard>
                    </Grid>
                ) : null}

                <Grid item xs={12} sm={12} md={6}>
                    {restaurant_section?.react_restaurant_app_download
                        ?.status === 1 ? (
                        <CustomCard>
                            <Stack
                                padding={{ xs: '10px', sm: '1.4rem' }}
                                direction={{ xs: 'column', sm: 'row' }} // ✅ Stack vertically on mobile
                                justifyContent="space-between"
                                alignItems="center"
                                flexWrap="wrap"
                                gap={2}
                            >
                                <Stack textAlign={{ xs: 'center', sm: 'left' }}>
                                    <Typography
                                        fontSize={{ xs: '18px', sm: '20px' }}
                                        fontWeight="500"
                                    >
                                        {
                                            restaurant_section
                                                ?.react_restaurant_app_download
                                                ?.title
                                        }
                                    </Typography>
                                    <Typography
                                        color={theme.palette.neutral[400]}
                                        fontSize={{ xs: '14px', sm: '16px' }}
                                        fontWeight="400"
                                    >
                                        {
                                            restaurant_section
                                                ?.react_restaurant_app_download
                                                ?.sub_title
                                        }
                                    </Typography>
                                </Stack>
                                <Stack direction="row" gap={1} flexWrap="wrap">

                                    <Box
                                        sx={{

                                            borderRadius: '10px',

                                        }}
                                    >
                                        <Box
                                            sx={{
                                                border: '1px solid',
                                                borderColor:
                                                    theme.palette.neutral[400],
                                                borderRadius: '10px',
                                                padding: '2px',
                                                backgroundColor:
                                                    theme.palette.neutral[100],
                                            }}
                                        >
                                            <QRCodeClient
                                                size={isSmall ? 60 : 70}
                                                playStoreLink={
                                                    restaurant_section
                                                        ?.react_restaurant_app_download
                                                        ?.download_link
                                                }
                                                appStoreLink={
                                                    restaurant_section
                                                        ?.react_restaurant_app_download
                                                        ?.download_link_for_ios
                                                }
                                            />
                                        </Box>
                                    </Box>
                                </Stack>
                            </Stack>
                        </CustomCard>
                    ) : null}
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                    {restaurant_section?.react_delivery_app_download?.status ===
                        1 ? (
                        <CustomCard>
                            <Stack
                                padding={{ xs: '10px', sm: '1.4rem' }}
                                direction={{ xs: 'column', sm: 'row' }} // ✅ Stack vertically on mobile
                                justifyContent="space-between"
                                alignItems="center"
                                flexWrap="wrap"
                                gap={2}
                            >
                                <Stack textAlign={{ xs: 'center', sm: 'left' }}>
                                    <Typography
                                        fontSize={{ xs: '18px', sm: '20px' }}
                                        fontWeight="500"
                                    >
                                        {
                                            restaurant_section
                                                ?.react_delivery_app_download
                                                ?.title
                                        }
                                    </Typography>
                                    <Typography
                                        color={theme.palette.neutral[400]}
                                        fontSize={{ xs: '14px', sm: '16px' }}
                                        fontWeight="400"
                                    >
                                        {
                                            restaurant_section
                                                ?.react_delivery_app_download
                                                ?.sub_title
                                        }
                                    </Typography>
                                </Stack>
                                <Stack direction="row" gap={1} flexWrap="wrap">
                                    <Box
                                        sx={{

                                            borderRadius: '10px',

                                        }}
                                    >
                                        <Box
                                            sx={{
                                                border: '1px solid',
                                                borderColor:
                                                    theme.palette.neutral[400],
                                                borderRadius: '10px',
                                                padding: '2px',

                                            }}
                                        >
                                            <QRCodeClient
                                                size={isSmall ? 60 : 70}
                                                playStoreLink={
                                                    restaurant_section
                                                        ?.react_restaurant_app_download
                                                        ?.download_link
                                                }
                                                appStoreLink={

                                                    restaurant_section
                                                        ?.react_restaurant_app_download
                                                        ?.download_link_for_ios
                                                }
                                            />
                                        </Box>
                                    </Box>

                                </Stack>
                            </Stack>
                        </CustomCard>
                    ) : null}
                </Grid>
            </Grid>
        </CustomContainer>
    )
}

export default LinkSection
