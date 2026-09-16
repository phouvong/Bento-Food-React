import React, { useState } from 'react'
import {
    alpha,
    Box,
    IconButton,
    Popover,
    Stack,
    Typography,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useTheme } from '@mui/material/styles'
// neutral is a custom palette extension; cast avoids TypeScript strict-mode error
const p = (palette: unknown) => palette as Record<string, Record<number, string>>
import { PrimaryButton } from '../products-page/FoodOrRestaurant'
import CustomNextImage from '@/components/CustomNextImage'
import VerifiedBadge from '@/components/verified-badge/VerifiedBadge'

// itemImages comes directly from the API: restaurant.item_images[].image_full_url
// Using string[] keeps the component decoupled from any specific cart item shape.
interface CartGroupCardProps {
    restaurantName: string
    restaurantLogo?: string
    // boolean | number because the source API returns 0/1 in some endpoints.
    restaurantVerified?: boolean | number
    deliveryTime?: string
    itemImages: string[]
    // Already formatted by the caller, which owns the currency settings.
    priceText?: string
    // Only set when the group actually has a discount, so the strike-through
    // never shows an identical number next to the payable one.
    originalPriceText?: string
    onAddMore: () => void
    onViewCart: () => void
    onRemoveGroup: () => void
    t: (key: string) => string
}

const CartGroupCard: React.FC<CartGroupCardProps> = ({
    restaurantName,
    restaurantLogo,
    restaurantVerified,
    deliveryTime,
    itemImages,
    priceText,
    originalPriceText,
    onAddMore,
    onViewCart,
    onRemoveGroup,
    t,
}) => {
    const theme = useTheme()
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

    const openPopover = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        // Capture the target synchronously — defensive against React reusing
        // the synthetic event before setState commits.
        const target = e.currentTarget
        setAnchorEl(target)
    }
    const closePopover = () => setAnchorEl(null)

    return (
        <Box
            sx={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: '14px',
                border: `1px solid ${theme.palette.divider}`,
                overflow: 'hidden',
                width: '100%',
            }}
        >
            {/* ── Header band: restaurant, delivery time, actions ── */}
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                    px: 1.25,
                    py: 1.25,
                    backgroundColor:
                        theme.palette.mode === 'dark'
                            ? theme.palette.action.hover
                            : '#F7F7F8',
                }}
            >
                {/* Restaurant logo */}
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flexShrink: 0,
                        backgroundColor: p(theme.palette).neutral[200],
                    }}
                >
                    {restaurantLogo ? (
                        <CustomNextImage
                            src={restaurantLogo}
                            width={40}
                            height={40}
                            objectFit="cover"
                            borderRadius="50%"
                            aspectRatio="1"
                        />
                    ) : (
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: theme.palette.primary.light,
                                color: theme.palette.primary.main,
                                fontSize: 16,
                                fontWeight: 700,
                            }}
                        >
                            {restaurantName?.[0] ?? '?'}
                        </Box>
                    )}
                </Box>

                {/* Name + verified badge, delivery time underneath */}
                <Stack spacing={0.15} sx={{ flex: 1, minWidth: 0 }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                        sx={{ minWidth: 0 }}
                    >
                        <Typography
                            fontSize="15px"
                            fontWeight={700}
                            noWrap
                            sx={{ minWidth: 0 }}
                        >
                            {restaurantName}
                        </Typography>
                        <VerifiedBadge
                            verified={restaurantVerified}
                            sx={{ mb: '1px' }}
                        />
                    </Stack>
                    {deliveryTime && (
                        <Typography
                            fontSize="13px"
                            noWrap
                            color={p(theme.palette).neutral[500]}
                        >
                            {deliveryTime}
                        </Typography>
                    )}
                </Stack>

                <PrimaryButton
                    variant="contained"
                    onClick={onViewCart}
                    sx={{
                        flexShrink: 0,
                        borderRadius: '8px',
                        px: 1.75,
                        py: 0.85,
                        fontSize: '14px',
                        fontWeight: 600,
                        textTransform: 'none',
                        minWidth: 0,
                        boxShadow: 'none',
                        '&:hover': { boxShadow: 'none' },
                    }}
                >
                    {t('View Cart')}
                </PrimaryButton>

                {/* Three-dot menu — squared off to match the button beside it */}
                <IconButton
                    onClick={openPopover}
                    aria-label={t('More options')}
                    sx={{
                        flexShrink: 0,
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.background.paper,
                    }}
                >
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            </Stack>

            {/* ── Body: item thumbnails + add-more, then the price ── */}
            <Box sx={{ px: 1.75, py: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    {/* Overlapping thumbnails: each tile slides slightly under
                        the next one, and the paper-colored border draws the
                        separation line between them. The row scrolls
                        horizontally when the cart is long. */}
                    <Stack
                        direction="row"
                        spacing={0}
                        sx={{
                            overflowX: 'auto',
                            overflowY: 'hidden',
                            '&::-webkit-scrollbar': { display: 'none' },
                            scrollbarWidth: 'none',
                            minWidth: 0,
                        }}
                    >
                        {itemImages.map((url, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    flexShrink: 0,
                                    overflow: 'hidden',
                                    borderRadius: '10px',
                                    border: `2px solid ${theme.palette.background.paper}`,
                                    backgroundColor: p(theme.palette)
                                        .neutral[200],
                                    '&:not(:first-of-type)': { ml: '-8px' },
                                }}
                            >
                                <CustomNextImage
                                    src={url}
                                    alt=""
                                    width={36}
                                    height={36}
                                    objectFit="cover"
                                    borderRadius="8px"
                                    aspectRatio="1"
                                />
                            </Box>
                        ))}
                    </Stack>

                    <IconButton
                        onClick={onAddMore}
                        aria-label={t('Add More Items')}
                        sx={{
                            flexShrink: 0,
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)',
                            color: theme.palette.text.primary,
                            '&:hover': {
                                backgroundColor: theme.palette.background.paper,
                                boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.12)',
                            },
                        }}
                    >
                        <AddIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                </Stack>

                {priceText && (
                    <Stack
                        direction="row"
                        alignItems="baseline"
                        spacing={1}
                        sx={{ mt: 2 }}
                    >
                        <Typography fontSize="20px" fontWeight={700}>
                            {priceText}
                        </Typography>
                        {originalPriceText && (
                            <Typography
                                fontSize="16px"
                                color={p(theme.palette).neutral[400]}
                                sx={{ textDecoration: 'line-through' }}
                            >
                                {originalPriceText}
                            </Typography>
                        )}
                    </Stack>
                )}
            </Box>

            {/* ── Three-dot popover ── */}
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={closePopover}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                // Drawer (containing this card) uses MUI's modal z-index;
                // bump the Popover above it so it isn't hidden by the
                // drawer's stacking context / backdrop.
                sx={{ zIndex: (theme) => theme.zIndex.modal + 100 }}
                PaperProps={{
                    elevation: 4,
                    sx: { borderRadius: '10px', minWidth: 160 },
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    onClick={() => {
                        closePopover()
                        onRemoveGroup()
                    }}
                    sx={{
                        px: 2,
                        py: 1.25,
                        cursor: 'pointer',
                        color: theme.palette.error.main,
                        '&:hover': {
                            backgroundColor: alpha(
                                theme.palette.error.main,
                                0.08
                            ),
                        },
                    }}
                >
                    <DeleteOutlineIcon fontSize="small" />
                    <Typography fontSize="14px" fontWeight={500}>
                        {t('Remove')}
                    </Typography>
                </Stack>
            </Popover>
        </Box>
    )
}

export default CartGroupCard
