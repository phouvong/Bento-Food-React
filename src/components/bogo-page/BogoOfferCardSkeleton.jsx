import { Box, Skeleton, Stack } from '@mui/material'

// Mirrors BogoOfferCard's layout exactly (image aspect-ratio box + title +
// subtitle + description lines) so the grid doesn't jump when real cards
// swap in.
const BogoOfferCardSkeleton = () => {
    return (
        <Stack sx={{ width: '100%', gap: { xs: '8px', md: '12px' } }}>
            <Box
                sx={{
                    width: '100%',
                    aspectRatio: '354 / 118',
                    borderRadius: '12px',
                    overflow: 'hidden',
                }}
            >
                <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    sx={{
                        bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'neutral.700'
                                : 'neutral.400',
                    }}
                />
            </Box>

            <Stack sx={{ gap: { xs: '6px', md: '8px' }, px: '4px' }}>
                <Stack sx={{ gap: '2px' }}>
                    <Skeleton
                        variant="text"
                        width="65%"
                        sx={{
                            fontSize: { xs: '16px', md: '18px' },
                            bgcolor: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? 'neutral.700'
                                    : 'neutral.400',
                        }}
                    />
                    <Skeleton
                        variant="text"
                        width="35%"
                        sx={{
                            fontSize: { xs: '12px', md: '16px' },
                            bgcolor: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? 'neutral.700'
                                    : 'neutral.400',
                        }}
                    />
                </Stack>

                <Skeleton
                    variant="text"
                    width="90%"
                    sx={{
                        fontSize: '14px',
                        bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'neutral.700'
                                : 'neutral.400',
                    }}
                />
            </Stack>
        </Stack>
    )
}

export default BogoOfferCardSkeleton
