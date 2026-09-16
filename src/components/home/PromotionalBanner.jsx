import { Box, Stack, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import CustomImageContainer from '../CustomImageContainer'
import { HOME_SECTION_SPACING } from './homeSectionSpacing'

const SPACING = HOME_SECTION_SPACING.promotionalBanner

const PromotionalBanner = ({ global }) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    if (!global?.banner_data?.promotional_banner_image) return null
    return (
        <Box sx={{ pt: SPACING.pt, pb: SPACING.pb }}>
            <Stack
                sx={{
                    maxWidth: '100%',
                    width: '100%',
                    aspectRatio: '5 / 1',
                    overflow: 'hidden',
                    borderRadius: { xs: 0, sm: '16px' },
                }}
            >
                <CustomImageContainer
                    src={global?.banner_data?.promotional_banner_image_full_url}
                    alt={global?.banner_data?.promotional_banner_title}
                    width="100%"
                    height="100%"
                    maxWidth="100%"
                    objectFit="cover"
                    borderRadius={isMobile ? '0px' : '16px'}
                />
            </Stack>
        </Box>
    )
}

export default PromotionalBanner
