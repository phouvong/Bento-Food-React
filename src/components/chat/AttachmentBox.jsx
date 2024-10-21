import React from 'react'
import DescriptionIcon from '@mui/icons-material/Description'
import { IconButton, Stack, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useTheme } from '@mui/styles'

const AttachmentBox = ({ item, removeImage, view }) => {
    const theme = useTheme()
    const formatFileSize = (sizeInBytes) => {
        const sizeInKB = (sizeInBytes / 1024).toFixed(2)
        return `${sizeInKB} KB`
    }
    return (
        <Stack
            direction="row"
            alignItems="center"
            sx={{
                borderRadius: '.5rem',
                justifyContent: 'center',
                padding: '6px',
                backgroundColor: theme.palette.neutral[300],
            }}
        >
            <DescriptionIcon
                fontSize="medium"
                sx={{ color: (theme) => theme.palette.neutral[400] }}
            />
            <Stack>
                <Typography
                    variant="caption"
                    sx={{
                        marginLeft: '5px',
                        color: (theme) => theme.palette.footerCenterBg,
                        fontSize: '10px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: '1',
                        WebkitBoxOrient: 'vertical',
                        width: view ? '100px' : '70px',
                        wordBreak: 'break-all',
                    }}
                >
                    {item.name}
                </Typography>
                {!view && (
                    <Typography
                        variant="caption"
                        sx={{
                            marginLeft: '5px',
                            color: (theme) => theme.palette.neutral[400],
                            fontSize: '10px',
                        }}
                    >
                        {formatFileSize(item.size)}
                    </Typography>
                )}
            </Stack>
            {!view && (
                <IconButton
                    sx={{
                        padding: '0px',
                        //paddingBottom: '10px',
                        borderRadius: '0px',
                        marginLeft: '5px',
                        marginBottom: '14px',
                        color: (theme) => theme.palette.neutral[400],
                    }}
                    onClick={() => removeImage(item.name)}
                >
                    <CloseIcon
                        sx={{
                            color: theme.palette.neutral[400],
                            fontWeight: '700',
                            width: '16px',
                            height: '16px',
                        }}
                    />
                </IconButton>
            )}
        </Stack>
    )
}

export default AttachmentBox
