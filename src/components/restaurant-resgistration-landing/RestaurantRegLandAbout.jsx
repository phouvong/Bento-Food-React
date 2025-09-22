import CustomContainer from '../container'
import { Stack ,useTheme} from '@mui/system'
import { Typography } from '@mui/material'
import { t } from 'i18next'
import Grid from '@mui/material/Grid'
import CustomNextImage from '@/components/CustomNextImage'

const RestaurantRegLanBanner = ({stepper}) => {
    const theme=useTheme()
    const stepsArray = Object.values(stepper);

    return (
        <>
            {stepsArray?.length > 0 && (
                <Stack my={8} >
                    <CustomContainer>
                        <Stack mb={5}>
                            <Typography
                                variant="h2"
                                textAlign="center"
                                sx={{ fontSize: { xs: 24, sm: 32 } }}
                                color={theme.palette.neutral[1000]}
                            >
                                {t('We Make it Simple and Easy')}
                            </Typography>
                        </Stack>

                        <Grid container spacing={5}>
                            {stepsArray?.map((item, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Stack sx={{ maxWidth: '300px', mx: 'auto' }}>
                                        <Stack
                                            justifyContent="center"
                                            alignItems="center"
                                        >
                                            <CustomNextImage
                                                src={item?.image_full_url}
                                                height={140}
                                                width={140}
                                            />
                                        </Stack>
                                        <Typography
                                            mt={4}
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
                                </Grid>
                            ))}
                        </Grid>
                    </CustomContainer>
                </Stack>

            )}
        </>
    )
}

export default RestaurantRegLanBanner;