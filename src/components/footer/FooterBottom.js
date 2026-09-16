import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import CustomContainer from '../container'
import SocialLinks from './SocialLinks'
import { footerColors } from './Footer.style'

const FooterBottom = () => {
    const { global } = useSelector((state) => state.globalSettings)
    const { t } = useTranslation()

    return (
        <Box
            sx={{
                width: '100%',
                background: footerColors.scrim,
            }}
        >
            <CustomContainer>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column-reverse', md: 'row' },
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: { xs: '16px', md: '32px' },
                        py: '12px',
                    }}
                >
                    <Typography
                        sx={{
                            flex: { md: '1 0 0' },
                            color: footerColors.text,
                            fontSize: '14px',
                            lineHeight: 1.2,
                            textAlign: { xs: 'center', md: 'left' },
                        }}
                    >
                        {t('Copyright')} ©{'  '}
                        {global?.footer_text || ''}
                    </Typography>

                    <Box
                        sx={{
                            flex: { md: '1 0 0' },
                            display: 'flex',
                            justifyContent: { xs: 'center', md: 'flex-end' },
                        }}
                    >
                        <SocialLinks global={global} />
                    </Box>
                </Box>
            </CustomContainer>
        </Box>
    )
}

export default FooterBottom
