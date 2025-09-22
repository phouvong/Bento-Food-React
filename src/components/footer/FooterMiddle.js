import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { alpha } from '@mui/material'
import { Box, Grid, Stack, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import CustomContainer from '../container'
import AppLinks from '../landingpage/AppLinks'
import LogoSide from '../navbar/second-navbar/LogoSide'
import ContactInfo, { CustomSkelenton } from './ContactInfo'
import { OtherData } from './OtherData'
import { QuickLinkData } from './QuickLinkData'
import { QuickLinkData1 } from './QuickLinkData1'
import RouteLinks from './RouteLinks'

const FooterMiddle = ({ landingPageData, isLoading }) => {
    const { global } = useSelector((state) => state.globalSettings)
    const { token } = useSelector((state) => state.userToken)
    const { t } = useTranslation()
    let zoneid = undefined
    if (typeof window !== 'undefined') {
        zoneid = localStorage.getItem('zoneid')
    }
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const isXSmall = useMediaQuery(theme.breakpoints.down('md'))
    const businessLogo = global?.logo_full_url
    return (
        <CustomStackFullWidth
            alignItems="center"
            pt={{ xs: '1rem', sm: '2rem' }}
        >
            <CustomContainer>
                <Grid
                    container
                    spacing={{ xs: 3, md: 4 }}
                    justifyContent="space-between"
                >
                    <Grid
                        item
                        xs={12}
                        sm={12}
                        md={4}
                        align={isSmall && 'center'}
                    >
                        <CustomStackFullWidth
                            spacing={{ xs: 1, sm: 2, md: 4 }}
                            alignItems={{
                                xs: 'center',
                                sm: 'center',
                                md: 'flex-start',
                            }}
                            justifyContent="flex-start"
                        >
                            {global ? (
                                <Link href={zoneid ? '/home' : '/'}>
                                    <LogoSide
                                        global={global}
                                        businessLogo={businessLogo}
                                    />
                                </Link>
                            ) : (
                                <CustomSkelenton width={200} height={40} />
                            )}
                            {isLoading ? (
                                <>
                                    <Box>
                                        <CustomSkelenton width={200} />
                                        <CustomSkelenton width={140} />
                                    </Box>
                                </>
                            ) : (
                                <Typography
                                    fontSize="14px"
                                    color={alpha(
                                        theme.palette.whiteContainer.main,
                                        0.8
                                    )}
                                >
                                    {landingPageData?.footer_data}
                                </Typography>
                            )}
                            <ContactInfo global={global} />
                            {isLoading ? (
                                <Stack direction="row" gap={1}>
                                    <CustomSkelenton width={140} height={40} />
                                    <CustomSkelenton width={140} height={40} />
                                </Stack>
                            ) : (
                                <AppLinks
                                    isFooter={true}
                                    global={global}
                                    width="140px"
                                    download_app_data={
                                        landingPageData?.download_app_section
                                    }
                                />
                            )}
                        </CustomStackFullWidth>
                    </Grid>
                    <Grid
                        item
                        xs={6}
                        sm={4}
                        md={2.6}
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <Box>
                            <RouteLinks
                                token={token}
                                global={global}
                                title="Quick Links"
                                RouteLinksData={QuickLinkData}
                            />
                        </Box>
                    </Grid>
                    <Grid
                        item
                        xs={6}
                        sm={4}
                        md={2.6}
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <Box>
                            <RouteLinks
                                token={token}
                                global={global}
                                title="Quick Links"
                                RouteLinksData={QuickLinkData1}
                            />
                        </Box>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={4}
                        md={2.6}
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <Box alignItems="center" justifyContent="center">
                            <RouteLinks
                                token={token}
                                global={global}
                                title="Other"
                                RouteLinksData={OtherData}
                                isCenter={isSmall && true}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </CustomContainer>
        </CustomStackFullWidth>
    )
}

FooterMiddle.propTypes = {}

export default FooterMiddle
