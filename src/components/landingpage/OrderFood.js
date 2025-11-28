import { Grid, Stack, Typography, useMediaQuery } from '@mui/material'
import CustomContainer from '../container'
import 'simplebar/dist/simplebar.min.css'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { useTheme } from '@emotion/react'
import CustomNextImage from '@/components/CustomNextImage'
import { Box } from '@mui/system'
import { useTranslation } from 'react-i18next'
import CustomizedTimeline from '@/components/landingpage/CustomizedTimeline'

const OrderFood = ({ stepperSection }) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))

    return (
        <CustomContainer>
            <Grid container spacing={2} alignItems="center" justifyContent="center" mt={2} mb={2}>
                <Grid item xs={12}>
                    <Typography
                        fontSize={{ xs: '1.5rem', md: '30px' }}
                        fontWeight={{ xs: '600', md: '700' }}
                        color={theme.palette.neutral[1000]}

                        component="h2"
                    >
                        {t('Order Food in few Second')}
                    </Typography>
                </Grid>

                <Grid item xs={12} md={5} align="center">
                    <Stack>
                        <CustomizedTimeline stepper_content={stepperSection?.stepper_content} />
                    </Stack>
                </Grid>
                <Grid item xs={12} md={7} align="center" >
                    {stepperSection?.stepper_image_section?.stepper_upload_image_type === 'single' ? (
                        <Stack mt="1rem" mb="2rem" width="100%" alignItems="flex-end" justifyContent="flex-end" sx={{
                            img: {
                                maxWidth: "500px",
                                width: "100%",
                                transition: 'transform 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'scale(1.02)'
                                }
                            }
                        }} >
                            <CustomNextImage objectFit="cover" borderRadius="10px" src={stepperSection?.stepper_image_section?.stapper_single_image_full_url} width={500} height={350} />
                        </Stack>

                    ) : (
                        <Box
                            bgcolor={theme.palette.neutral[200]}
                            borderRadius="20px"
                            sx={{
                                maxWidth: '600px',
                                width: '100%',
                                marginInlineStart: "auto",
                                padding: '0 16px 16px 0',
                                img: {
                                    borderRadius: '10px',
                                    height: "auto",
                                    maxHeight: '100%',
                                    objectPosition: 'center',
                                    overflow: 'hidden',
                                    transition: 'transform 0.3s ease-in-out',
                                    '&:hover': {
                                        transform: 'scale(1.02)'
                                    }
                                }
                            }}
                        >
                            <Grid container columnSpacing={2}>
                                <Grid item xs={6}>
                                    <Stack
                                        sx={{
                                            position: 'relative',
                                            insetInlineStart: isSmall ? 0 : '-64px',
                                            top: "20px",
                                            width: isSmall ? "initial" : 'calc(100% + 64px)',
                                            maxHeight: "84px",
                                        }}>
                                        <CustomNextImage src={stepperSection?.stepper_image_section?.stapper_multiple_image_1_full_url} width={356} height={84} />
                                    </Stack>
                                    <Stack mt={5} maxHeight="332px">
                                        <CustomNextImage src={stepperSection?.stepper_image_section?.stapper_multiple_image_3_full_url} width={308} height={332} />
                                    </Stack>
                                </Grid>
                                <Grid item xs={6}>
                                    <Stack alignItems="flex-end">
                                        <Stack maxHeight="204px">
                                            <CustomNextImage src={stepperSection?.stepper_image_section?.stapper_multiple_image_2_full_url} width={237} height={204} />
                                        </Stack>
                                        <Stack mt={3} maxHeight="260px">
                                            <CustomNextImage src={stepperSection?.stepper_image_section?.stapper_multiple_image_4_full_url} width={260} height={260} />
                                        </Stack>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                </Grid>
            </Grid>
        </CustomContainer>
    )
}

export default OrderFood;
