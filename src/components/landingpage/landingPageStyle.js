import { styled } from '@mui/material/styles'
import { alpha, Typography, Box } from '@mui/material'

export const LandingPageTypography = styled(Typography)(
    ({ theme, fontWeight, fontSize, color }) => ({
        color: color ? color : theme.palette.neutral[1000],
        fontWeight: fontWeight ? fontWeight : '400',
        fontSize: fontSize ? fontSize : '14px',
        textAlign: 'left',
    })
)

export const DiscountBannerBox = styled(Box)(({ theme }) => ({
    position: 'relative',
    zIndex: 1,
    padding: '10px',
    width: '100%',
    height: '250px',
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    borderRadius: '5px',
    [theme.breakpoints.down('sm')]: {
        height: '68px',
    },
    '&::after': {
        content: '" "',
        position: 'absolute',
        width: '100%',
        height: 'calc(100% - 2px)',
        left: '0',
        backgroundColor: alpha(theme.palette.primary.dark, 0.1),
        zIndex: '-1',
        top: '1px',
    },
}))

export const LandingHeroBox = styled(Box)(
    ({ theme, heroImg, ImageNotFound, isXSmall }) => ({
        backgroundImage: `url(${heroImg ? heroImg : ImageNotFound.src})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        backgroundPosition: 'center',
        marginInline: isXSmall && '15px',
        borderRadius: isXSmall && '5px',
        paddingTop: isXSmall ? '0px' : '83px',
    })
)
