import { Grid, Stack } from '@mui/material'
import DownloadComponent from './DownloadComponent'
import CustomImageContainer from '../CustomImageContainer'
import { imageNotFoundPlaceholder } from '@/utils/LocalImages'
import { useTranslation } from 'react-i18next'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CustomContainer from '../container'
import CustomNextImage from '@/components/CustomNextImage'

const DownloadSection = ({ landing_page_links, download_app_data }) => {
    const { t } = useTranslation()
    return (
        <CustomContainer>
            <CustomStackFullWidth
                sx={{ marginBottom: '60px', marginTop: '60px' }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6} align="center">
                        <Stack
                            direction="row"
                            width="100%"
                            justifyContent="center"
                            sx={{ paddingInline: '10px', img: {height: 'auto'} }}
                        >
                            <CustomNextImage
                                src={download_app_data?.react_download_apps_image_full_url}
                                altSrc={imageNotFoundPlaceholder}
                                height={471}
                                width={430}
                                objectFit="cover"
                                alt={t('App View')}
                            />
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={6} align="center">
                        {download_app_data && (
                            <DownloadComponent
                                className="download-component"
                                download_app_data={download_app_data}
                                landing_page_links={landing_page_links}
                            />
                        )}
                    </Grid>
                </Grid>
            </CustomStackFullWidth>
        </CustomContainer>
    )
}

export default DownloadSection
