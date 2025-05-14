import { Box, Stack, Tooltip, Typography } from '@mui/material'
import FileFormatInfo from '../file-format-text/FileFormatInfo'
import {
    FileUploadHeader,
    FileUploadTextContainer,
    ImageContainerFileUpload,
} from './FileUpload.style'
import { CustomTypographyGray } from '@/styled-components/CustomTypographies.style'
import { CustomDotBox } from '../file-previewer/FilePreviewer.style'
import BackupIcon from '@mui/icons-material/Backup'
import { t } from 'i18next'
import { useTheme } from '@mui/styles'
import ProfileImagePlaceholder from '@/assets/images/ProfileImagePlaceholder'

const FileUpload = (props) => {
    const {
        anchor,
        color,
        width,
        errorStatus,
        labelText,
        titleText,
        hintText,
        required,
    } = props
    const theme = useTheme()

    return (
        <Stack width="100%" spacing={3}>
            {titleText && (
                <FileUploadHeader>
                    <CustomTypographyGray variant="h5">
                        {titleText}
                    </CustomTypographyGray>
                </FileUploadHeader>
            )}
            <Stack alignItems="baseline" justifyContent="center" spacing={3}>
                <CustomDotBox
                    onClick={() => anchor.current.click()}
                    color={color}
                    component="label"
                    width={width}
                    errorStatus={required || errorStatus}
                    error={required}
                >
                    <Stack alignItems="center">
                        <Box>
                            <ProfileImagePlaceholder />
                        </Box>
                        <Typography
                            fontSize="12px"
                            textAlign="center"
                            color={theme.palette.text.info}
                        >
                            {t('Click to Upload')}
                        </Typography>
                    </Stack>
                </CustomDotBox>
                {hintText && <FileFormatInfo text={hintText} />}
            </Stack>
        </Stack>
    )
}

FileUpload.propTypes = {}

export default FileUpload
