import { Box, Skeleton, Stack, alpha } from '@mui/material'

// The theme's MuiSkeleton override paints the default "wave" shimmer as a
// near-white gradient (barely visible on a light background) — override it
// with a plain, clearly-visible gray "pulse" instead.
const skeletonSx = (theme) => ({
    background: alpha(theme.palette.neutral[800], 0.11),
})

// Mirrors NewFoodCardVertical: 1:1 image, provider badge + store name row,
// title, price row — wrapped in a light card border so the placeholder
// reads as a card, not a loose stack of bars.
const FoodCardSkeleton = () => (
    <Box
        sx={{
            width: '100%',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: '12px',
            p: '8px',
        }}
    >
        <Skeleton
            variant="rectangular"
            animation="pulse"
            sx={[
                {
                    width: '100%',
                    height: 'auto',
                    aspectRatio: '1 / 1',
                    borderRadius: '10px',
                    mb: '10px',
                },
                skeletonSx,
            ]}
        />

        <Stack direction="row" alignItems="center" gap="4px" sx={{ mb: '6px' }}>
            <Skeleton
                variant="circular"
                animation="pulse"
                width={14}
                height={14}
                sx={skeletonSx}
            />
            <Skeleton
                variant="text"
                animation="pulse"
                width="55%"
                height={14}
                sx={skeletonSx}
            />
            <Skeleton
                variant="text"
                animation="pulse"
                width={24}
                height={14}
                sx={[{ ml: 'auto' }, skeletonSx]}
            />
        </Stack>

        <Skeleton
            variant="text"
            animation="pulse"
            width="85%"
            height={18}
            sx={[{ mb: '6px' }, skeletonSx]}
        />

        <Stack direction="row" alignItems="baseline" gap="6px">
            <Skeleton
                variant="text"
                animation="pulse"
                width={48}
                height={20}
                sx={skeletonSx}
            />
            <Skeleton
                variant="text"
                animation="pulse"
                width={36}
                height={14}
                sx={skeletonSx}
            />
        </Stack>
    </Box>
)

export default FoodCardSkeleton
