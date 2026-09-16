import { Box, styled } from '@mui/material'
import { BOTTOM_OVERLAY_HEIGHT_VAR } from '@/components/navbar/navbarConstants'

export const footerColors = {
    background: '#303030',
    heading: '#FFFFFF',
    text: '#F3F3F3',
    iconTileDark: 'rgba(0,0,0,.3)',
    iconTileLight: 'rgba(255,255,255,.05)',
    badgeBg: 'rgba(0,0,0,.7)',
    scrim: 'rgba(0,0,0,.15)',
}

export const StyledFooterBackground = styled(Box)(({ theme }) => ({
    width: '100%',
    background: footerColors.background,
    color: footerColors.text,
    position: 'relative',
    [theme.breakpoints.down('md')]: {
        paddingBottom: BOTTOM_OVERLAY_HEIGHT_VAR,
    },
}))
