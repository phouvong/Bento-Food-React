import React, { useRef, useState } from 'react'
import {
    alpha,
    Box,
    IconButton,
    Popover,
    Stack,
    Typography,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
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
    itemImages: string[]
    onAddMore: () => void
    onViewCart: () => void
    onRemoveGroup: () => void
    t: (key: string) => string
}

const CartGroupCard: React.FC<CartGroupCardProps> = ({
    restaurantName,
    restaurantLogo,
    restaurantVerified,
    itemImages,
    onAddMore,
    onViewCart,
    onRemoveGroup,
    t,
}) => {
    console.log({restaurantLogo,itemImages});
    
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
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                width: '100%',
            }}
        >
            {/* ── Header ── */}
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ px: 1.5, pt: 1.5, pb: 1 }}
            >
                {/* Restaurant logo */}
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flexShrink: 0,
                        backgroundColor: p(theme.palette).neutral[200],
                    }}
                >
                    {restaurantLogo ? (
                        <CustomNextImage
                            src={restaurantLogo}
                            width={36}
                            height={36}
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

                {/* Restaurant name + verified badge — wrapped so the badge
                    stays adjacent to the name instead of being pushed to the
                    right by the Typography's flex: 1 fill. */}
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ flex: 1, minWidth: 0 }}
                >
                    <Typography
                        fontSize="14px"
                        fontWeight={600}
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

                {/* Three-dot menu */}
                <IconButton size="small" onClick={openPopover}>
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            </Stack>

            {/* ── Gray body (images + inset footer card) ──
                The gray band extends past the image strip so the footer can
                sit on it as a separate inset white card — matches the
                screenshot's two-card visual rhythm. */}
            <Box
                sx={{
                    px: 1.25,
                    pt: 1.25,
                    pb: 1.25,
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'dark'
                            ? theme.palette.action.hover
                            : '#F3F4F6',
                }}
            >
                {/* Food image strip — directly on the gray band. */}
                <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{
                        overflowX: 'auto',
                        '&::-webkit-scrollbar': { display: 'none' },
                        scrollbarWidth: 'none',
                        mb: 1.25,
                        ml:"1rem"
                    }}
                >
                    {itemImages.map((url, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                width: 50,
                                height: 50,
                                flexShrink: 0,
                                borderRadius: '5px',
                                overflow: 'hidden',
                                backgroundColor: p(theme.palette).neutral[200],
                            }}
                        >
                            <CustomNextImage
                                src={url}
                                alt=""
                                width={50}
                                height={50  }
                                objectFit="cover"
                                borderRadius="5px"
                                aspectRatio="1"
                            />
                        </Box>
                    ))}
                </Stack>

                {/* Footer — inset white rounded card sitting on the gray band. */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: '12px',
                        px: 1.5,
                        py: 1.25,
                    }}
                >
                    {/* Add More Items */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.75}
                        onClick={onAddMore}
                        sx={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                        <AddCircleOutlineIcon
                            sx={{
                                fontSize: 22,
                                color: theme.palette.primary.main,
                            }}
                        />
                        <Typography
                            fontSize="14px"
                            fontWeight={400}
                            color={theme.palette.primary.main}
                        >
                            {t('Add More Items')}
                        </Typography>
                    </Stack>

                    {/* View cart */}
                    <PrimaryButton
                        variant="contained"
                        size="small"
                        onClick={onViewCart}
                        sx={{
                            borderRadius: '5px',
                            px: 2.25,
                            py: 0.9,
                            fontSize: '13px',
                            fontWeight: 600,
                            textTransform: 'none',
                            minWidth: 0,
                        }}
                    >
                        {t('View cart')}
                    </PrimaryButton>
                </Stack>
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
                    onClick={() => { closePopover(); onRemoveGroup() }}
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
