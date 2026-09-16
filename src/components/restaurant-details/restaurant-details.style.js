import {
    alpha,
    Box,
    Button,
    IconButton,
    Stack,
    Grid,
    styled,
    Typography,
} from '@mui/material'

// ── 6amMart store-details style primitives ──────────────────────────────
// Visual shells only; all data/logic stays in the consuming components.

export const HeroCard = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: '16px',
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
    [theme.breakpoints.down('md')]: {
        borderRadius: '0 0 16px 16px',
        border: 'none',
        width: '100%',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    },
}))

export const LogoBox = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '68px',
    height: '68px',
    borderRadius: '12px',
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('md')]: {
        width: '44px',
        height: '44px',
        borderRadius: '10px',
    },
}))

export const BannerWrapper = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: '180px',
    overflow: 'hidden',
    borderRadius: '16px 0 0 16px',
    [theme.breakpoints.down('md')]: {
        minHeight: '160px',
        borderRadius: '0 0 8px 8px',
    },
}))

export const FloatingIconButton = styled(IconButton)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    boxShadow: '0px 2px 6px rgba(0,0,0,0.12)',
    '&:hover': {
        backgroundColor: theme.palette.background.paper,
    },
}))

export const COUPON_PRO_ACCENT = '#2A61BA'

export const CouponCard = styled(Box)(({ theme, variant }) => {
    const isDark = theme.palette.mode === 'dark'
    const bg = {
        pro: isDark ? alpha('#2A61BA', 0.18) : '#F1F6FD',
        discount: isDark ? alpha(theme.palette.warning.main, 0.14) : '#FFFBEB',
        ticket: isDark ? alpha(theme.palette.error.main, 0.14) : '#FEE9E7',
    }
    return {
        position: 'relative',
        width: 300,
        height: '100%',
        minHeight: 100,
        flexShrink: 0,
        borderRadius: '16px',
        border: `2px solid ${theme.palette.background.paper}`,
        backgroundColor: bg[variant] || bg.discount,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        overflow: variant === 'ticket' ? 'visible' : 'hidden',
        cursor: 'pointer',
        [theme.breakpoints.down('md')]: {
            width: '100%',
        },
    }
})

export const PromoCouponCard = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '300px',
    height: '100%',
    minHeight: 100,
    flexShrink: 0,
    borderRadius: '16px',
    border: `2px solid ${theme.palette.background.paper}`,
    backgroundColor:
        theme.palette.mode === 'dark'
            ? alpha(theme.palette.error.main, 0.14)
            : '#FEE9E7',
    overflow: 'hidden',
    [theme.breakpoints.down('md')]: {
        width: '100%',
    },
}))

export const TicketCutOut = styled(Box)(({ theme, side }) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: theme.palette.background.default,
    border: `2px solid ${theme.palette.background.paper}`,
    ...(side === 'left' ? { left: -10 } : { right: -10 }),
}))

export const StatPill = styled(Stack)(({ theme }) => ({
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Dark palette's neutral[300] is a LIGHT grey, which made the pill's
    // white value text invisible — use a translucent white surface instead.
    backgroundColor:
        theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.06)'
            : theme.palette.background.secondary || '#F2F2F2',
    borderRadius: '10px',
    padding: theme.spacing(1.1),
}))

export const CategoryButton = styled(Button)(({ theme, active }) => ({
    cursor: 'pointer',
    minWidth: 'auto',
    height: '40px',
    padding: '8px 4px',
    borderRadius: '0px',
    whiteSpace: 'nowrap',
    borderBottom:
        active === 'true'
            ? `3px solid ${theme.palette.primary.main}`
            : '3px solid transparent',
    transition: 'border-color 120ms ease, color 120ms ease',
    '&:hover': {
        backgroundColor: 'transparent',
        '& .MuiTypography-root': {
            color: theme.palette.primary.main,
        },
    },
    [theme.breakpoints.down('sm')]: {
        minWidth: 'auto',
        padding: '8px 10px',
    },
}))

export const DiscountImageGrid = styled(Grid)(
    ({ theme, discountBanner, ImageNotFound }) => ({
        backgroundImage: `url(${
            discountBanner ? discountBanner.src : ImageNotFound.src
        })`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        borderRadius: '5px',
        position: 'relative',
        zIndex: 1,
        marginBottom: '.5rem',
        '&::after': {
            content: '" "',
            position: 'absolute',
            width: '100%',
            height: 'calc(100% - 2px)',
            left: '0',
            // Paper-colored wash fades the background image (a CSS
            // background can't take opacity directly).
            backgroundColor: alpha(theme.palette.background.paper, 0.6),
            zIndex: '-1',
            top: '1px',
        },
    })
)
export const RestaurantCommonTypography = styled(Typography)(
    ({ theme, fontSize, smFontSize, fontWeight }) => ({
        fontSize: fontSize ? fontSize : '1.4rem',
        fontWeight: fontWeight ? fontWeight : '800',
        color: alpha(theme.palette.neutral[900], 0.9),
        [theme.breakpoints.down('md')]: {
            // styles
            fontSize: smFontSize ? smFontSize : '1rem',
        },
    })
)

export const RestaurantCouponStack = styled(Stack)(({ theme, isSmall }) => ({
    maxWidth: isSmall ? '400px' : '373px',
    width: '100%',
    position: !isSmall && 'absolute',
    bottom: '2%',
    left: 'unset',
    right: '1%',
    borderRadius: '5px',
}))
export const CouponStack = styled(Stack)(({ theme }) => ({
    background: alpha(theme.palette.neutral[200], 0.9),
    boxShadow: '0px 2px 10px -3px rgba(27, 127, 237, 0.1)',
    backdropFilter: 'blur(5px)',
    padding: '1rem',
    borderRadius: '5px',
    width: '100%',
}))
export const CouponCodeBorderBox = styled(Stack)(({ theme, borderColor }) => ({
    paddingLeft: '14px',
    paddingRight: '14px',
    paddingTop: '18px',
    paddingBottom: '5px',
    border: `1px solid ${borderColor}`,
    minWidth: '111px',
    background: (theme) => theme.palette.neutral[100],
    position: 'relative',
    borderRadius: '5px',
    flexWrap: 'wrap',
}))
