import React from 'react'
import { alpha, Grid, Stack, Typography, useMediaQuery } from '@mui/material'
import { CustomCard, PrimaryButton } from './Linksection.style'
import CustomContainer from '../../container'
import bg from '../../../../public/static/join.png'
import { useTheme } from '@mui/material/styles'
import bg1 from '../../../../public/static/deliveryjoin.png'
import CustomImageContainer from '../../CustomImageContainer'
import { router } from 'next/client'
import { landingPagedata } from '@/hooks/react-query/landing-page/useGetLandingPageData'
import CustomNextImage from '@/components/CustomNextImage'
import { minWidth } from '@mui/system'

const LinkSection = ({
    self_registration_restaurant,
    self_registration_deliveryMan,
}) => {
    const theme = useTheme()
    const isSm = useMediaQuery(theme.breakpoints.down('sm'))
    const deliveryManRegister = () => {
        const delivery_section_link ="/deliveryman-registration"
        router.push(delivery_section_link)
    }
    const RestaurantRegister = () => {
        const restaurant_section_link ='/restaurant-registration-landing'
        router.push(`${restaurant_section_link}`)
    }

    return (
        <CustomContainer>
            <Grid container spacing={2} className="link-section">
                <Grid item xs={12} sm={12} md={6}>
                    <CustomCard
                        sx={{
                            background: `url(${bg?.src}) no-repeat center center/cover`,
                            position: 'relative',
                            zIndex: 1,
                            '&::after': {
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                content: "''",
                                backgroundColor: `${alpha(
                                    theme.palette.primary.light,
                                    0.07
                                )}`,
                                zIndex: -1,
                                borderRadius: '.5rem',
                            },
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={{ xs: 1, sm: 2, md: 2 }}
                            padding={{ xs: '10px', sm: '1rem' }}
                            sx={{ '> img': { minWidth: isSm ? 80 : 140 } }}
                        >
                            <CustomNextImage
                                src={
                                    self_registration_restaurant?.react_restaurant_section_image_full_url
                                }
                                width={isSm ? 80 : 140}
                                height={isSm ? 80 : 140}
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
                                            self_registration_restaurant?.react_restaurant_section_title
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
                                            self_registration_restaurant?.react_restaurant_section_sub_title
                                        }
                                    </Typography>
                                </Stack>
                                {self_registration_restaurant
                                    ?.react_restaurant_section_link_data
                                    ?.react_restaurant_section_button_status ===
                                    '1' && (
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
                                                self_registration_restaurant?.react_restaurant_section_button_name
                                            }
                                        </Typography>
                                    </PrimaryButton>
                                )}
                            </Stack>
                        </Stack>
                    </CustomCard>
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                    <CustomCard
                        sx={{
                            background: `url(${bg1?.src}) no-repeat center center/cover`,
                            position: 'relative',
                            zIndex: 1,
                            '&::after': {
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                content: "''",
                                backgroundColor: `${alpha(
                                    theme.palette.primary.light,
                                    0.07
                                )}`,
                                zIndex: -1,
                                borderRadius: '.5rem',
                            },
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={{ xs: 1, sm: 2, md: 2 }}
                            padding={{ xs: '10px', sm: '1rem' }}
                            sx={{ '> img': { minWidth: isSm ? 80 : 140 } }}
                        >
                            <CustomNextImage
                                src={
                                    self_registration_deliveryMan?.react_delivery_section_image_full_url
                                }
                                width={isSm ? 80 : 140}
                                height={isSm ? 80 : 140}
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
                                            self_registration_deliveryMan?.react_delivery_section_title
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
                                            self_registration_deliveryMan?.react_delivery_section_sub_title
                                        }
                                    </Typography>
                                </Stack>
                                {self_registration_deliveryMan
                                    ?.react_delivery_section_link_data
                                    ?.react_delivery_section_button_status ===
                                    '1' && (
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
                                                self_registration_deliveryMan?.react_delivery_section_button_name
                                            }
                                        </Typography>
                                    </PrimaryButton>
                                )}
                            </Stack>
                        </Stack>
                    </CustomCard>
                </Grid>
            </Grid>
        </CustomContainer>
    )
}

export default LinkSection
