import { Grid, Stack, Typography, useMediaQuery } from '@mui/material'
import DownloadComponent from './DownloadComponent'

import { useTranslation } from 'react-i18next'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CustomContainer from '../container'
import CustomNextImage from '@/components/CustomNextImage'
import { useTheme } from '@mui/styles'
import QRCodeClient from '@/components/landingpage/QRCodeClient'

const DownloadSection = ({ landing_page_links, download_app_data }) => {
    const { t } = useTranslation()
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    return (
        <CustomContainer>
            <CustomStackFullWidth
                sx={{ marginBottom: '60px', marginTop: '60px' }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid
                        item
                        xs={12}
                        md={6}
                        align="center"
                        justifyItems={{ xs: 'center', sm: 'flex-start' }}
                    >
                        {download_app_data && (
                            <DownloadComponent
                                className="download-component"
                                download_app_data={download_app_data}
                                landing_page_links={landing_page_links}
                            />
                        )}
                    </Grid>
                    <Grid item xs={12} md={6} align="center">
                        <Stack
                            gap="1.3rem"
                            width="100%"
                            justifyContent="center"
                            sx={{ img: { height: 'auto' } }}
                            bgcolor={theme.palette.neutral[200]}
                            borderRadius="20px"
                            padding="30px 20px"
                        >
                            <Stack
                                bgcolor={theme.palette.neutral[100]}
                                padding="1rem"
                                borderRadius="10px"
                                direction="row"
                                alignItems="center"
                                gap="1rem"
                            >
                                <QRCodeClient
                                    size={isSmall ? 70 : 100}
                                    playStoreLink={
                                        download_app_data
                                            ?.react_download_apps_play_store
                                            ?.react_download_apps_play_store_link
                                    }
                                    appStoreLink={"https://www.apple.com/store"}
                                />
                                <Stack>
                                    <Typography
                                        fontSize={{ xs: '20px', sm: '30px' }}
                                        textAlign="left"
                                        fontWeight="500"
                                    >
                                        {t('For Android')}
                                    </Typography>
                                    <Typography
                                        textAlign="left"
                                        fontSize={{ xs: '14px', sm: '20px' }}
                                        color={theme.palette.neutral[500]}
                                    >
                                        {t('Scan to DownLoad')}
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Stack
                                bgcolor={theme.palette.neutral[100]}
                                padding="1rem"
                                borderRadius="10px"
                                direction="row"
                                alignItems="center"
                                gap="1rem"
                            >
                                <QRCodeClient
                                    playStoreLink={
                                        download_app_data
                                            ?.react_download_apps_app_store
                                            ?.react_download_apps_link
                                    }

                                    size={isSmall ? 70 : 100}
                                />
                                <Stack>
                                    <Typography
                                        textAlign="left"
                                        fontSize={{ xs: '20px', sm: '30px' }}
                                        fontWeight="500"
                                    >
                                        {t('For Apple')}
                                    </Typography>
                                    <Typography
                                        textAlign="left"
                                        fontSize={{ xs: '14px', sm: '20px' }}
                                        color={theme.palette.neutral[500]}
                                    >
                                        {t('Scan to DownLoad')}
                                    </Typography>
                                </Stack>
                            </Stack>
                            {/*<CustomNextImage*/}
                            {/*    src={download_app_data?.react_download_apps_image_full_url}*/}
                            {/*    altSrc={imageNotFoundPlaceholder}*/}
                            {/*    height={471}*/}
                            {/*    width={430}*/}
                            {/*    objectFit="cover"*/}
                            {/*    alt={t('App View')}*/}
                            {/*/>*/}
                        </Stack>
                    </Grid>
                </Grid>
            </CustomStackFullWidth>
        </CustomContainer>
    )
}

export default DownloadSection
