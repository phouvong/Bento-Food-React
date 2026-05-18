import { Box, Grid, Skeleton, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import CustomContainer from '../container'
import LogoSide from '../navbar/second-navbar/LogoSide'
import ContactInfo from './ContactInfo'
import { OtherData } from './OtherData'
import { QuickLinkData } from './QuickLinkData'
import { QuickLinkData1 } from './QuickLinkData1'
import RouteLinks from './RouteLinks'
import SocialLinks from './SocialLinks'

const FooterMiddle = ({ landingPageData, isLoading }) => {
    const { global } = useSelector((state) => state.globalSettings)
    const { token } = useSelector((state) => state.userToken)
    let zoneid = undefined
    if (typeof window !== 'undefined') {
        zoneid = localStorage.getItem('zoneid')
    }
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const businessLogo = global?.logo_full_url

    return (
        <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
            <CustomContainer>
                <Grid
                    container
                    spacing={{ xs: 3, md: 4 }}
                    sx={{ py: { xs: '2rem', md: '3rem' } }}
                >
                    {/* Brand column */}
                    <Grid
                        item
                        xs={12}
                        sm={12}
                        md={4}
                        sx={{
                            display: 'flex',
                            justifyContent: {
                                xs: 'center',
                                sm: 'center',
                                md: 'flex-start',
                            },
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: {
                                    xs: 'center',
                                    sm: 'center',
                                    md: 'flex-start',
                                },
                                textAlign: {
                                    xs: 'center',
                                    sm: 'center',
                                    md: 'left',
                                },
                                gap: '16px',
                                width: '100%',
                                '& a > div': {
                                    maxWidth: 'none',
                                    width: '140px',
                                    height: '30px',
                                },
                            }}
                        >
                            {global ? (
                                <Link href={zoneid ? '/home' : '/'}>
                                    <LogoSide
                                        global={global}
                                        businessLogo={businessLogo}
                                        width="140px"
                                        objectFit="contain"
                                        height="30px"
                                    />
                                </Link>
                            ) : (
                                <Skeleton
                                    variant="rectangular"
                                    width={200}
                                    height={40}
                                    sx={{ background: 'rgba(255,255,255,0.1)' }}
                                />
                            )}

                            {isLoading ? (
                                <Box>
                                    <Skeleton
                                        width={200}
                                        sx={{
                                            background: 'rgba(255,255,255,0.1)',
                                        }}
                                    />
                                    <Skeleton
                                        width={140}
                                        sx={{
                                            background: 'rgba(255,255,255,0.1)',
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Typography
                                    sx={{
                                        color: '#94A3B8',
                                        fontSize: '13.5px',
                                        lineHeight: 1.6,
                                        maxWidth: '340px',
                                        textAlign: {
                                            xs: 'center',
                                            sm: 'center',
                                            md: 'left',
                                        },
                                    }}
                                >
                                    {landingPageData?.footer_data}
                                </Typography>
                            )}

                            <ContactInfo global={global} />

                            <SocialLinks global={global} />
                        </Box>
                    </Grid>

                    {/* Quick Links */}
                    <Grid
                        item
                        xs={6}
                        sm={4}
                        md={2.6}
                        sx={{ display: 'flex', justifyContent: 'center' }}
                    >
                        <RouteLinks
                            token={token}
                            global={global}
                            title="Quick Links"
                            RouteLinksData={QuickLinkData}
                        />
                    </Grid>

                    {/* Explore */}
                    <Grid
                        item
                        xs={6}
                        sm={4}
                        md={2.6}
                        sx={{ display: 'flex', justifyContent: 'center' }}
                    >
                        <RouteLinks
                            token={token}
                            global={global}
                            title="Explore"
                            RouteLinksData={QuickLinkData1}
                        />
                    </Grid>

                    {/* Other / Legal */}
                    <Grid
                        item
                        xs={12}
                        sm={4}
                        md={2.6}
                        sx={{
                            display: 'flex',
                            justifyContent: {
                                xs: 'center',
                                sm: 'center',
                                md: 'flex-start',
                            },
                        }}
                    >
                        <RouteLinks
                            token={token}
                            global={global}
                            title="Other"
                            RouteLinksData={OtherData}
                            isCenter={isSmall}
                        />
                    </Grid>
                </Grid>
            </CustomContainer>
        </Box>
    )
}

export default FooterMiddle
