import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import CustomContainer from '../container'
import Router from 'next/router'

const FooterBottom = () => {
    const { global } = useSelector((state) => state.globalSettings)
    const { t } = useTranslation()

    const legalLinks = [
        { label: 'Privacy', href: '/privacy-policy' },
        { label: 'Terms', href: '/terms-and-conditions' },
       // { label: 'Sitemap', href: '/' },
    ]

    return (
        <Box
            sx={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                borderTop: '1px solid rgba(255,255,255,.07)',
            }}
        >
            <CustomContainer>
                <Box
                    sx={{
                        py: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '18px',
                        flexWrap: 'wrap',
                        fontSize: '12.5px',
                        color: '#64748B',
                    }}
                >
                    {/* Copyright */}
                    <Typography
                        sx={{
                            color: '#94A3B8',
                            fontWeight: 500,
                            fontSize: '12.5px',
                        }}
                    >
                        {t('Copyright')} ©{'  '}
                        {global?.footer_text || ''}
                    </Typography>

                    {/* Legal links */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center',
                            color: '#475569',
                        }}
                    >
                        {legalLinks.map((link, index) => (
                            <Box
                                key={link.label}
                                sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                            >
                                {index > 0 && (
                                    <Box
                                        component="span"
                                        sx={{ color: '#334155', fontWeight: 700 }}
                                    >
                                        ·
                                    </Box>
                                )}
                                <Box
                                    component="span"
                                    onClick={() => Router.push(link.href)}
                                    sx={{
                                        color: '#94A3B8',
                                        fontSize: '12.5px',
                                        cursor: 'pointer',
                                        transition: 'color .15s ease',
                                        '&:hover': { color: 'primary.main' },
                                    }}
                                >
                                    {t(link.label)}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </CustomContainer>
        </Box>
    )
}

export default FooterBottom
