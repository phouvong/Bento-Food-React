import { Box, Skeleton, Stack, alpha } from '@mui/material'

// The theme's MuiSkeleton override paints the default "wave" shimmer as a
// near-white gradient (barely visible on a light background) — override it
// with a plain, clearly-visible gray "pulse" instead.
const skeletonSx = (theme) => ({
    background: alpha(theme.palette.neutral[800], 0.11),
})

// Mirrors NewStoreCard's default layout: 2:1 media, name + rating row,
// cuisine line, meta row — wrapped in a light card border so the
// placeholder reads as a card, not a loose stack of bars.
const RestaurantCardSkeleton = () => (
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
                    aspectRatio: '2 / 1',
                    borderRadius: '10px',
                },
                skeletonSx,
            ]}
        />

        <Stack sx={{ gap: '6px', pt: 1 }}>
            <Stack direction="row" alignItems="center" gap="16px">
                <Skeleton
                    variant="text"
                    animation="pulse"
                    width="65%"
                    height={22}
                    sx={skeletonSx}
                />
                <Skeleton
                    variant="text"
                    animation="pulse"
                    width={32}
                    height={22}
                    sx={[{ ml: 'auto' }, skeletonSx]}
                />
            </Stack>
            <Skeleton
                variant="text"
                animation="pulse"
                width="45%"
                height={14}
                sx={skeletonSx}
            />
            <Stack direction="row" alignItems="center" gap="8px">
                <Skeleton
                    variant="text"
                    animation="pulse"
                    width={70}
                    height={16}
                    sx={skeletonSx}
                />
                <Skeleton
                    variant="text"
                    animation="pulse"
                    width={60}
                    height={16}
                    sx={skeletonSx}
                />
            </Stack>
        </Stack>
    </Box>
)

export default RestaurantCardSkeleton
