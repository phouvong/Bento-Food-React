import { Box, Skeleton } from '@mui/material'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import CustomContainer from '../container'
import CustomImageContainer from '../CustomImageContainer'
import ContactInfo from './ContactInfo'
import { OtherData } from './OtherData'
import { QuickLinkData } from './QuickLinkData'
import { QuickLinkData1 } from './QuickLinkData1'
import RouteLinks from './RouteLinks'

const FooterMiddle = ({ landingPageData, isLoading }) => {
    const { global } = useSelector((state) => state.globalSettings)
    const { token } = useSelector((state) => state.userToken)
    let zoneid = undefined
    if (typeof window !== 'undefined') {
        zoneid = localStorage.getItem('zoneid')
    }
    const businessLogo = global?.logo_full_url

    return (
        <CustomContainer>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'center', md: 'flex-start' },
                    gap: { xs: '20px', md: '32px' },
                    width: '100%',
                }}
            >
                {/* Logo (mobile only, standalone row) */}
                <Box
                    sx={{
                        display: { xs: 'flex', md: 'none' },
                        justifyContent: 'center',
                        width: '100%',
                    }}
                >
                    {global ? (
                        <Link href={zoneid ? '/home' : '/'} style={{ display: 'inline-flex' }}>
                            <CustomImageContainer
                                src={businessLogo}
                                alt="logo"
                                width="200px"
                                height="44px"
                                objectFit="contain"
                            />
                        </Link>
                    ) : (
                        <Skeleton
                            variant="rectangular"
                            width={200}
                            height={44}
                            sx={{ background: 'rgba(255,255,255,0.1)' }}
                        />
                    )}
                </Box>

                {/* Logo (desktop) + Contact */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: { xs: 'center', md: 'flex-start' },
                        gap: '24px',
                        flex: { md: '1 0 0' },
                        width: '100%',
                    }}
                >
                    <Box
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            width: '182px',
                            height: '40px',
                        }}
                    >
                        {global ? (
                            <Link href={zoneid ? '/home' : '/'} style={{ display: 'inline-flex' }}>
                                <CustomImageContainer
                                    src={businessLogo}
                                    alt="logo"
                                    width="182px"
                                    height="40px"
                                    objectFit="contain"
                                />
                            </Link>
                        ) : (
                            <Skeleton
                                variant="rectangular"
                                width={182}
                                height={40}
                                sx={{ background: 'rgba(255,255,255,0.1)' }}
                            />
                        )}
                    </Box>

                    <ContactInfo global={global} />
                </Box>

                {/* Link columns */}
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: { xs: 'wrap', md: 'nowrap' },
                        justifyContent: 'center',
                        gap: '32px',
                        flex: { md: '1 0 0' },
                        width: '100%',
                        pt: { xs: '16px', md: 0 },
                    }}
                >
                    <Box sx={{ flex: '1 0 0', minWidth: '120px' }}>
                        <RouteLinks
                            token={token}
                            global={global}
                            title="Quick Links"
                            RouteLinksData={QuickLinkData}
                        />
                    </Box>

                    <Box sx={{ flex: '1 0 0', minWidth: '120px' }}>
                        <RouteLinks
                            token={token}
                            global={global}
                            title="Explore"
                            RouteLinksData={QuickLinkData1}
                        />
                    </Box>

                    <Box sx={{ flex: '1 0 0', minWidth: '120px' }}>
                        <RouteLinks
                            token={token}
                            global={global}
                            title="Other"
                            RouteLinksData={OtherData}
                        />
                    </Box>
                </Box>
            </Box>
        </CustomContainer>
    )
}

export default FooterMiddle
