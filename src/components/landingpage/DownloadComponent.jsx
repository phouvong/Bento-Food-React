import React from 'react'
import { Stack, Typography } from '@mui/material'
import { LandingPageTypography } from './landingPageStyle'
import { useSelector } from 'react-redux'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import AppLinks from './AppLinks'
import { useTheme } from '@mui/material/styles'

const DownloadComponent = ({ download_app_data }) => {
    const theme = useTheme()
    const { global } = useSelector((state) => state.globalSettings)

    return (
        <>
            <CustomStackFullWidth
                alignItems="center"
                justifyContent="center"
                gap="15px"
            >
                <Stack alignItems="center" justifyContent="center" gap="5px">
                    <LandingPageTypography
                        fontSize={{ xs: '20', sm: '25', md: '29px' }}
                        fontWeight="700"
                        component="h2"
                    >
                        {download_app_data?.react_download_apps_title}
                    </LandingPageTypography>
                    <Stack>
                        <Typography
                            fontSize={{ xs: '12px', sm: '18px', md: '18px' }}
                            fontWeight="500"
                            color={theme.palette.primary.main}
                            component="p"
                        >
                            {download_app_data?.react_download_apps_sub_title}
                        </Typography>
                        <Typography
                            sx={{ fontWeight: '400' }}
                            fontSize={{ xs: '14px', sm: '16px' }}
                            color={theme.palette.neutral[400]}
                            component="p"
                        >
                            {download_app_data?.react_download_apps_tag}
                        </Typography>
                    </Stack>
                </Stack>
                <AppLinks
                    global={global}
                    download_app_data={download_app_data}
                    width="172px"
                />
            </CustomStackFullWidth>
        </>
    )
}

export default DownloadComponent
