import React from 'react'
import { CustomDotBox } from '../file-previewer/FilePreviewer.style'
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined'
import { Box, IconButton, Stack, Typography, useTheme } from '@mui/material'
import ProfileImagePlaceholder from '../../assets/images/ProfileImagePlaceholder'
import { t } from 'i18next'

const ImageUploaderThumbnail = ({
    required,
    label,
    maxWidth,
    width,
    error,
    borderRadius,
    isIcon,
    height,
}) => {
    const theme = useTheme()

    return (
        <CustomDotBox width={error} borderRadius={borderRadius} height={height}>
            <Stack alignItems="center">
                <Box>
                    <ProfileImagePlaceholder />
                </Box>
                <Typography
                    fontSize="12px"
                    textAlign="center"
                    color={theme.palette.text.info}
                >
                    {label}
                </Typography>
            </Stack>
            {isIcon && (
                <Stack
                    sx={{
                        position: 'absolute',
                        bottom: '0px',
                        right: '-15px',
                        filter: 'drop-shadow(0px 0px 10px rgba(199, 198, 198, 0.25))',
                    }}
                >
                    <IconButton
                        sx={{
                            height: '39px',
                            width: '39px',
                            backgroundColor: theme.palette.neutral[100],
                        }}
                    >
                        <CreateOutlinedIcon
                            sx={{ color: theme.palette.info.main }}
                        />
                    </IconButton>
                </Stack>
            )}
        </CustomDotBox>
    )
}
export default ImageUploaderThumbnail
