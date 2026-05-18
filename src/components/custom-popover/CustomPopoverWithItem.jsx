import React, { useEffect, useState } from 'react'
import { Box, Button, Stack, Typography, alpha } from '@mui/material'
import { useTranslation } from 'react-i18next'
import LoadingButton from '@mui/lab/LoadingButton'
import { useTheme } from '@mui/material/styles'

const CustomPopoverWithItem = ({
    title,
    subTitle,
    icon,
    handleClose,
    deleteItem,
    confirmButtonText,
    cancelButtonText,
    isLoading,
}) => {
    const [mapImg, setMapImg] = useState()
    const { t } = useTranslation()
    const theme = useTheme()

    useEffect(() => {
        setMapImg(icon)
    }, [])

    return (
        <Stack alignItems="center" spacing={2.25}>
            {mapImg && (
                <Box
                    sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        color: theme.palette.error.main,
                    }}
                >
                    {mapImg}
                </Box>
            )}

            <Stack spacing={0.75} alignItems="center" textAlign="center">
                <Typography
                    sx={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                    }}
                >
                    {t(title)}
                </Typography>
                <Typography
                    sx={{
                        fontSize: '13px',
                        fontWeight: 400,
                        color: theme.palette.text.secondary,
                        maxWidth: 280,
                    }}
                >
                    {t(subTitle)}
                </Typography>
            </Stack>

            <Stack
                direction="row"
                spacing={1.5}
                width="100%"
                justifyContent="center"
            >
                <Button
                    onClick={handleClose}
                    sx={{
                        flex: 1,
                        maxWidth: 150,
                        py: 1,
                        borderRadius: '8px',
                        fontWeight: 600,
                        textTransform: 'none',
                        backgroundColor: 'transparent',
                        color: theme.palette.text.primary,
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                            backgroundColor: alpha(
                                theme.palette.text.primary,
                                0.04
                            ),
                            borderColor: theme.palette.text.secondary,
                        },
                    }}
                >
                    {t(cancelButtonText)}
                </Button>
                <LoadingButton
                    loading={isLoading}
                    onClick={(e) => deleteItem(e)}
                    variant="contained"
                    sx={{
                        flex: 1,
                        maxWidth: 150,
                        py: 1,
                        borderRadius: '8px',
                        fontWeight: 600,
                        textTransform: 'none',
                        backgroundColor: theme.palette.error.main,
                        color: '#fff !important',
                        boxShadow: `0 4px 12px ${alpha(
                            theme.palette.error.main,
                            0.25
                        )}`,
                        '&:hover': {
                            backgroundColor: theme.palette.error.dark,
                            boxShadow: `0 6px 16px ${alpha(
                                theme.palette.error.main,
                                0.32
                            )}`,
                        },
                        '& .MuiLoadingButton-loadingIndicator': {
                            color: '#fff',
                        },
                    }}
                >
                    {t(confirmButtonText)}
                </LoadingButton>
            </Stack>
        </Stack>
    )
}

export default CustomPopoverWithItem
