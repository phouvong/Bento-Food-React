import GooglePlay from '@/assets/images/icons/GooglePlay'
import AppleIcon from '@/assets/images/icons/AppleIcon'
import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import CustomContainer from '../container'
import { footerColors } from './Footer.style'

const FooterTopSection = ({ landingPageData, isLoading }) => {
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
        gap: '6px',
        padding: '8px 12px',
        borderRadius: '6px',
        background: footerColors.badgeBg,
        textDecoration: 'none',
        cursor: 'pointer',
    }

    const iconBoxSx = {
        width: '20px',
        height: '20px',
        flexShrink: 0,
        '& svg': { width: '100%', height: '100%' },
    }

    return (
        <CustomContainer>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    gap: { xs: '20px', md: '64px' },
                    width: '100%',
                }}
            >
                <Box
                    sx={{
                        flex: { md: '1 0 0' },
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        width: '100%',
                        textAlign: { xs: 'center', md: 'left' },
                    }}
                >
                    <Typography
                        sx={{
                            color: footerColors.text,
                            fontSize: { xs: '20px', md: '24px' },
                            fontWeight: 700,
                            letterSpacing: { xs: '-0.6px', md: '-1.2px' },
                            lineHeight: 1.1,
                        }}
                    >
                        {`${t('Order in')} ${t('taps')}, ${t('not tabs.')}`}
                    </Typography>
                    <Typography
                        sx={{
                            color: footerColors.text,
                            fontSize: '14px',
                            lineHeight: 1.2,
                            opacity: { xs: 1, md: 0.8 },
                        }}
                    >
                        {t(
                            'Download the app for exclusive offers, faster checkout and live order tracking — right in your pocket.'
                        )}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
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
                            <Box sx={iconBoxSx}>
                                <GooglePlay />
                            </Box>
                            <Typography
                                sx={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: footerColors.text,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {t('Google Play')}
                            </Typography>
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
                            <Box sx={iconBoxSx}>
                                <AppleIcon />
                            </Box>
                            <Typography
                                sx={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: footerColors.text,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {t('App Store')}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </CustomContainer>
    )
}

export default FooterTopSection
