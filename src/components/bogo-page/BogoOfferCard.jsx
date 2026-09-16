import { Box, CircularProgress, Stack, Typography, alpha } from '@mui/material'
import { useTranslation } from 'react-i18next'
import CustomImageContainer from '@/components/CustomImageContainer'

const BogoOfferCard = ({ item, onClick, loading = false }) => {
    const { t } = useTranslation()

    return (
        <Stack
            onClick={loading ? undefined : onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            aria-busy={loading || undefined}
            onKeyDown={
                onClick
                    ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') onClick()
                      }
                    : undefined
            }
            sx={{
                width: '100%',
                gap: { xs: '8px', md: '12px' },
                cursor: loading ? 'default' : onClick ? 'pointer' : 'default',
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '354 / 118',
                    borderRadius: '12px',
                    overflow: 'hidden',
                }}
            >
                <CustomImageContainer
                    src={item.image_full_url}
                    alt={item.title}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                    borderRadius="12px"
                    loading="lazy"
                />
                {loading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: (theme) =>
                                alpha(theme.palette.common.black, 0.35),
                        }}
                    >
                        <CircularProgress
                            size={28}
                            sx={{ color: (theme) => theme.palette.common.white }}
                        />
                    </Box>
                )}
            </Box>

            <Stack sx={{ gap: { xs: '6px', md: '8px' }, px: '4px' }}>
                <Stack sx={{ gap: '2px' }}>
                    <Typography
                        sx={{
                            fontSize: { xs: '16px', md: '18px' },
                            fontWeight: 700,
                            lineHeight: 1.1,
                            letterSpacing: '-0.54px',
                            color: (theme) => theme.palette.text.primary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {item.title}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: { xs: '12px', md: '16px' },
                            fontWeight: 500,
                            lineHeight: 1.2,
                            letterSpacing: '-0.36px',
                            color: (theme) => theme.palette.info.main,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {t('Buy {{buy}} Get {{get}}', {
                            buy: item?.buy_qty,
                            get: item?.get_qty,
                        })}
                    </Typography>
                </Stack>

                <Typography
                    sx={{
                        fontSize: '14px',
                        lineHeight: 1.3,
                        color: (theme) => theme.palette.text.secondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {item.description}
                </Typography>
            </Stack>
        </Stack>
    )
}

export default BogoOfferCard
