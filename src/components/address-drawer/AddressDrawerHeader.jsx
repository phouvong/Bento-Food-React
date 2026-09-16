import { Box, IconButton, Stack, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloseIcon from '@mui/icons-material/Close'

const AddressDrawerHeader = ({ title, subtitle, onBack, onClose, titleSx }) => {
    return (
        <Stack
            direction="row"
            alignItems="center"
            gap={{ xs: '8px', sm: '12px' }}
            sx={{
                px: { xs: '12px', sm: '24px' },
                py: { xs: '8px', sm: '12px' },
                flexShrink: 0,
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                backgroundColor: (theme) => theme.palette.background.paper,
            }}
        >
            {onBack && (
                <IconButton
                    onClick={onBack}
                    aria-label="back"
                    sx={{
                        width: { xs: 32, sm: 40 },
                        height: { xs: 32, sm: 40 },
                        p: '8px',
                        borderRadius: '12px',
                    }}
                >
                    <ArrowBackIcon
                        sx={{
                            fontSize: { xs: 18, sm: 21 },
                            color: (theme) => theme.palette.text.primary,
                        }}
                    />
                </IconButton>
            )}

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    component="h2"
                    sx={{
                        fontSize: { xs: '15px', sm: '20px' },
                        fontWeight: 700,
                        lineHeight: 1.1,
                        letterSpacing: '-0.6px',
                        color: (theme) => theme.palette.text.primary,
                        ...titleSx,
                    }}
                >
                    {title}
                </Typography>
                {subtitle && (
                    <Typography
                        sx={{
                            mt: { xs: '2px', sm: '8px' },
                            fontSize: { xs: '11px', sm: '14px' },
                            lineHeight: 1.3,
                            color: (theme) => theme.palette.text.secondary,
                        }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </Box>

            <IconButton
                onClick={onClose}
                aria-label="close"
                sx={{
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                    p: '8px',
                    borderRadius: '12px',
                }}
            >
                <CloseIcon
                    sx={{
                        fontSize: { xs: 16, sm: 20 },
                        color: (theme) => theme.palette.text.primary,
                    }}
                />
            </IconButton>
        </Stack>
    )
}

export default AddressDrawerHeader
