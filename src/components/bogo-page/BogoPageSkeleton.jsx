import { NAVBAR_HEIGHT } from '@/components/navbar/navbarConstants'
import { Box, Skeleton, Stack, alpha } from '@mui/material'
import BogoOfferCardSkeleton from './BogoOfferCardSkeleton'

const skeletonBg = (theme) =>
    theme.palette.mode === 'dark' ? 'neutral.700' : 'neutral.400'

// Full-page placeholder shown while /bogo/home is in flight — mirrors
// BogoListPage's own layout (sticky hero column + offer-card grid) instead
// of a bare spinner, so the breadcrumb/hero shell doesn't pop in late.
const BogoPageSkeleton = () => {
    return (
        <Box
            sx={{
                display: { xs: 'flex', md: 'grid' },
                flexDirection: 'column',
                gridTemplateColumns: { md: '416px 1fr' },
                columnGap: { md: '32px' },
                rowGap: { xs: '12px', md: 0 },
                py: { xs: 0, md: '24px' },
            }}
        >
            <Stack sx={{ gap: { xs: '12px', md: '8px' } }}>
                <Skeleton
                    variant="text"
                    width={140}
                    sx={{
                        fontSize: { xs: '12px', md: '14px' },
                        bgcolor: skeletonBg,
                    }}
                />

                <Box
                    sx={(theme) => ({
                        backgroundColor: {
                            xs: 'transparent',
                            md: theme.palette.background.paper,
                        },
                        borderRadius: { md: '16px' },
                        boxShadow: {
                            md: `0px 0px 16px -1px ${alpha(
                                theme.palette.common.black,
                                0.1
                            )}`,
                        },
                        p: { xs: 0, md: '32px' },
                        position: { md: 'sticky' },
                        top: { md: `${NAVBAR_HEIGHT + 24}px` },
                    })}
                >
                    <Stack
                        alignItems="center"
                        sx={{ gap: { xs: '12px', md: '16px' } }}
                    >
                        <Skeleton
                            variant="circular"
                            sx={{
                                width: { xs: '79px', md: '100px' },
                                height: { xs: '79px', md: '100px' },
                                bgcolor: skeletonBg,
                            }}
                        />
                        <Stack
                            alignItems="center"
                            sx={{
                                gap: { xs: '6px', md: '12px' },
                                width: '100%',
                            }}
                        >
                            <Skeleton
                                variant="text"
                                width="60%"
                                sx={{
                                    fontSize: { xs: '18px', md: '24px' },
                                    bgcolor: skeletonBg,
                                }}
                            />
                            <Skeleton
                                variant="text"
                                width="80%"
                                sx={{
                                    fontSize: { xs: '12px', md: '14px' },
                                    bgcolor: skeletonBg,
                                }}
                            />
                        </Stack>
                    </Stack>
                </Box>
            </Stack>

            <Box
                sx={(theme) => ({
                    pt: { md: '24px' },
                    mx: { xs: `-${theme.spacing(2)}`, md: 0 },
                })}
            >
                <Box
                    sx={{
                        backgroundColor: (theme) =>
                            theme.palette.background.paper,
                        borderRadius: { xs: '16px', md: '16px' },
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        flexWrap: { md: 'wrap' },
                        gap: { xs: '20px', md: '20px' },
                        p: { xs: '16px', md: '20px' },
                    }}
                >
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Box
                            key={index}
                            sx={{
                                width: '100%',
                                flex: { md: '1 1 380px' },
                                minWidth: { md: '380px' },
                            }}
                        >
                            <BogoOfferCardSkeleton />
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    )
}

export default BogoPageSkeleton
