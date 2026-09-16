import { useTranslation } from 'react-i18next'
import { Box, IconButton, Stack, Typography, alpha, styled } from '@mui/material'
import { keyframes } from '@mui/system'

import CustomImageContainer from '@/components/CustomImageContainer'
import VerifiedBadge from '@/components/verified-badge/VerifiedBadge'

// ── Media / availability overlay — shared by both card variants ──

export const MediaInner = styled(Box)(() => ({
    position: 'absolute',
    inset: 0,
    borderRadius: 12,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
}))

// Bottom scrim revealed on card hover — matches the Figma hover state
// (shadow sits inside the image, not as an outer card drop-shadow).
export const ImgGradientOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    background: `linear-gradient(to bottom, ${alpha(
        theme.palette.common.black,
        0
    )} 11%, ${alpha(theme.palette.common.black, 0.55)} 100%)`,
    pointerEvents: 'none',
    zIndex: 1,
    opacity: 0,
    transition: 'opacity 0.3s ease',
}))

export const UnavailableOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    inset: 0,
    borderRadius: 12,
    backgroundColor: alpha(theme.palette.common.black, 0.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
    pointerEvents: 'none',
}))

export const UnavailableText = styled(Typography)(({ theme }) => ({
    color: theme.palette.common.white,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.02em',
    textAlign: 'center',
    padding: '4px 10px',
}))

// ── Veg/halal badges + wishlist + add-to-cart control ──

export const BadgeRow = styled(Stack)(() => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    position: 'absolute',
    top: 9,
    left: 9,
    zIndex: 3,
}))

export const TypeBadge = styled(Box)(({ theme }) => ({
    width: 24,
    height: 24,
    padding: 2,
    borderRadius: '50%',
    backgroundColor: theme.palette.background.paper,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: theme.shadows[1],
    '& svg': { width: '100%', height: '100%' },
}))

export const RatingInline = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    flexShrink: 0,
    '& i': {
        fontSize: 12,
        color: theme.palette.warning.main,
        position: 'relative',
        top: '1px',
    },
}))

export const WishBtn = styled(IconButton, {
    shouldForwardProp: (prop) => prop !== 'isactive',
})(({ theme, isactive }) => ({
    position: 'absolute',
    top: 9,
    right: 9,
    width: 26,
    height: 26,
    padding: 6,
    borderRadius: '50%',
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
    color: theme.palette.text.secondary,
    boxShadow: theme.shadows[2],
    opacity: isactive === 'true' ? 1 : 0,
    transform: isactive === 'true' ? 'scale(1)' : 'scale(0.85)',
    transition: 'opacity .18s ease, transform .18s ease, color .18s ease',
    zIndex: 3,
    // Flaticon glyphs carry their own baseline/line-height, which pushes the
    // icon off-centre inside the circular button — reset it and center the
    // glyph within its own box before the button's flex centering applies.
    '& i': {
        fontSize: 13,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    '&:hover': {
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        color: theme.palette.error.main,
    },
    [theme.breakpoints.down('sm')]: {
        opacity: 1,
        transform: 'scale(1)',
    },
}))

export const AddFab = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    left: '50%',
    bottom: 9,
    transform: 'translateX(-50%)',
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[2],
    zIndex: 4,
    transition: 'all .18s ease',
    // Flaticon glyphs carry their own baseline/line-height, which pushes the
    // icon off-centre inside the circular button — reset it and center the
    // glyph within its own box before the button's flex centering applies.
    '& i': {
        fontSize: 18,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
}))

// ── Store row (provider badge + name + rating) ──

export const StoreRow = styled(Stack)(() => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 6,
}))

export const StoreNameGroup = styled(Stack)(() => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 0,
}))

export const StoreName = styled(Typography)(({ theme }) => ({
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.3,
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}))

// Crossfade between the verified tick and the restaurant logo when both are
// present — mirrors the store-badge treatment already shipped on the mart
// storefront's product card, adapted to this project's VerifiedBadge asset.
const badgeCycleA = keyframes`
    0%, 40% { opacity: 1; transform: scale(1) rotate(0deg); }
    50%, 90% { opacity: 0; transform: scale(0.4) rotate(-25deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
`
const badgeCycleB = keyframes`
    0%, 40% { opacity: 0; transform: scale(0.4) rotate(25deg); }
    50%, 90% { opacity: 1; transform: scale(1) rotate(0deg); }
    100% { opacity: 0; transform: scale(0.4) rotate(25deg); }
`

const ProviderLogo = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'logoUrl',
})(({ theme, logoUrl }) => ({
    width: 14,
    height: 14,
    borderRadius: '50%',
    border: `1px solid ${theme.palette.divider}`,
    boxSizing: 'content-box',
    flexShrink: 0,
    backgroundColor: theme.palette.neutral[200],
    backgroundImage: logoUrl ? `url(${logoUrl})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
}))

// Verified tick and/or restaurant logo before the store name. Both present →
// animated crossfade loop; a single one renders static; neither → nothing.
export const ProviderBadge = ({ verified, logoUrl, name }) => {
    const { t } = useTranslation()

    const verifiedEl = <VerifiedBadge verified size={14} title={t('Verified restaurant')} />
    const logoEl = (
        <ProviderLogo logoUrl={logoUrl} role="img" aria-label={name} />
    )

    if (verified && logoUrl) {
        return (
            <Box
                sx={{
                    position: 'relative',
                    width: 14,
                    height: 14,
                    flexShrink: 0,
                    '& .provider-badge-layer': {
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                    '& .provider-badge-verified': {
                        animation: `${badgeCycleA} 5s ease-in-out infinite`,
                    },
                    '& .provider-badge-logo': {
                        animation: `${badgeCycleB} 5s ease-in-out infinite`,
                    },
                    '@media (prefers-reduced-motion: reduce)': {
                        '& .provider-badge-logo': { display: 'none' },
                        '& .provider-badge-verified': {
                            animation: 'none',
                            opacity: 1,
                            transform: 'none',
                        },
                    },
                }}
            >
                <Box className="provider-badge-layer provider-badge-verified">
                    {verifiedEl}
                </Box>
                <Box className="provider-badge-layer provider-badge-logo">
                    {logoEl}
                </Box>
            </Box>
        )
    }

    if (verified) return verifiedEl
    if (logoUrl) return logoEl
    return null
}

// ── Title / price / discount ──

export const TitleText = styled(Typography)(({ theme }) => ({
    margin: '0 0 6px',
    fontWeight: 400,
    fontSize: 16,
    lineHeight: 1.1,
    letterSpacing: '-0.48px',
    color: theme.palette.text.primary,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
}))

export const PriceRow = styled(Stack)(() => ({
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 6,
}))

export const PriceNow = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: '-0.54px',
}))

export const PriceOld = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: 14,
    textDecoration: 'line-through',
}))

export const DiscountChip = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignSelf: 'flex-start',
    alignItems: 'center',
    backgroundColor: theme.palette.error.pureRed,
    color: theme.palette.error.whiteText,
    padding: '2px 8px',
    borderRadius: 24,
    fontSize: 12,
    fontWeight: 600,
}))
