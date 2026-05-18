import GooglePlay from '@/assets/images/icons/GooglePlay'
import AppleIcon from '@/assets/images/icons/AppleIcon'
import { Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import CustomContainer from '../container'

const FooterTopSection = ({ landingPageData, isLoading }) => {
    const theme = useTheme()
    const { t } = useTranslation()

    const download_app_data = landingPageData?.download_app_section
    const playStoreStatus =
        download_app_data?.react_download_apps_play_store
            ?.react_download_apps_play_store_status === '1'
    const appStoreStatus =
        download_app_data?.react_download_apps_app_store
            ?.react_download_apps_link_status === '1'
    const playStoreLink =
        download_app_data?.react_download_apps_play_store
            ?.react_download_apps_play_store_link
    const appStoreLink =
        download_app_data?.react_download_apps_app_store
            ?.react_download_apps_link

    if (!playStoreStatus && !appStoreStatus) return null

    const badgeSx = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: { xs: '8px', sm: '12px' },
        padding: { xs: '8px 10px', sm: '11px 18px' },
        borderRadius: '12px',
        background: 'rgba(255,255,255,.04)',
        border: '1px solid rgba(255,255,255,.1)',
        color: '#fff',
        minWidth: { xs: 0, sm: '170px' },
        flex: { xs: 1, sm: 'unset' },
        textDecoration: 'none',
        transition: 'all .18s ease',
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
        '&:hover': {
            background: 'rgba(255,117,24,.1)',
            borderColor: theme.palette.primary.main,
            transform: 'translateY(-2px)',
        },
    }

    console.log({landingPageData});
    

    return (
        <Box
            sx={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                borderBottom: '1px solid rgba(255,255,255,.07)',
            }}
        >
            <CustomContainer>
                <Box
                    sx={{
                        py: '40px',
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1.3fr 1fr' },
                        gap: '40px',
                        alignItems: 'center',
                    }}
                >
                    {/* Left: heading + description */}
                    <Box>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '5px 11px',
                                borderRadius: '999px',
                                background: 'rgba(255,117,24,.12)',
                                border: '1px solid rgba(255,117,24,.28)',
                                color: theme.palette.primary.main,
                                fontSize: '11px',
                                fontWeight: 800,
                                letterSpacing: '.08em',
                                textTransform: 'uppercase',
                                mb: '12px',
                            }}
                        >
                            📱 {t('Mobile App')}
                        </Box>
                        <Typography
                            sx={{
                                color: '#fff',
                                fontSize: { xs: '20px', sm: '26px' },
                                fontWeight: 800,
                                mb: '8px',
                                letterSpacing: '-.01em',
                                lineHeight: 1.25,
                            }}
                        >
                            {t('Order in')}{' '}
                            <Box
                                component="span"
                                sx={{ color: theme.palette.primary.main }}
                            >
                                {t('taps')}
                            </Box>
                            {`, ${t('not tabs.')}`}
                        </Typography>
                        <Typography
                            sx={{
                                color: '#94A3B8',
                                fontSize: '14px',
                                maxWidth: '480px',
                                lineHeight: 1.55,
                                m: 0,
                            }}
                        >
                            {t(
                                'Download the app for exclusive offers, faster checkout and live order tracking — right in your pocket.'
                            )}
                        </Typography>
                    </Box>

                    {/* Right: app badges */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: { xs: '8px', sm: '12px' },
                            justifyContent: {
                                xs: 'space-between',
                                sm: 'flex-end',
                            },
                            flexWrap: { xs: 'nowrap', sm: 'wrap' },
                            width: '100%',
                        }}
                    >
                        {playStoreStatus && (
                            <Box
                                component="a"
                                href={playStoreLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={badgeSx}
                                onClick={(e) => {
                                    e.preventDefault()
                                    window.open(playStoreLink)
                                }}
                            >
                                <GooglePlay />
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: { xs: '9px', sm: '10.5px' },
                                            color: '#94A3B8',
                                            display: 'block',
                                            letterSpacing: '.04em',
                                            textTransform: 'uppercase',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {t('Get it on')}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: { xs: '12px', sm: '14px' },
                                            fontWeight: 700,
                                            color: '#fff',
                                            mt: '1px',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {t('Google Play')}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        {appStoreStatus && (
                            <Box
                                component="a"
                                href={appStoreLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={badgeSx}
                                onClick={(e) => {
                                    e.preventDefault()
                                    window.open(appStoreLink)
                                }}
                            >
                                <AppleIcon />
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: { xs: '9px', sm: '10.5px' },
                                            color: '#94A3B8',
                                            display: 'block',
                                            letterSpacing: '.04em',
                                            textTransform: 'uppercase',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {t('Download on the')}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: { xs: '12px', sm: '14px' },
                                            fontWeight: 700,
                                            color: '#fff',
                                            mt: '1px',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {t('App Store')}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </CustomContainer>
        </Box>
    )
}

export default FooterTopSection
