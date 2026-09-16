import { Box, Skeleton, Stack, alpha } from '@mui/material'

const skeletonSx = (theme) => ({
    background: alpha(theme.palette.neutral[800], 0.11),
})

const FoodCardHorizontalSkeleton = () => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            backgroundColor: 'background.paper',
            borderRadius: '12px',
            boxShadow: (theme) =>
                `0px 1px 4px 0px ${alpha(theme.palette.common.black, 0.05)}`,
            pl: '16px',
            pr: '12px',
            py: '12px',
        }}
    >
        <Box sx={{ flex: 1, minWidth: 0 }}>
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
            </Stack>

            <Skeleton
                variant="text"
                animation="pulse"
                width="80%"
                height={18}
                sx={[{ mb: '4px' }, skeletonSx]}
            />
            <Skeleton
                variant="text"
                animation="pulse"
                width="60%"
                height={18}
                sx={[{ mb: '8px' }, skeletonSx]}
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

        <Skeleton
            variant="rectangular"
            animation="pulse"
            sx={[
                {
                    flexShrink: 0,
                    width: { xs: 96, sm: 115 },
                    height: { xs: 96, sm: 115 },
                    borderRadius: '8px',
                },
                skeletonSx,
            ]}
        />
    </Box>
)

export default FoodCardHorizontalSkeleton
