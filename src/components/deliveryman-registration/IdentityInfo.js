import {
    Grid,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import ProfileImagePlaceholder from '@/assets/images/ProfileImagePlaceholder'

import { t } from 'i18next'
import RoomIcon from '@mui/icons-material/Room'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
// import { CustomBoxFullWidth } from "styled-components/CustomStyles.style";
import BadgeIcon from '@mui/icons-material/Badge'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DescriptionIcon from '@mui/icons-material/Description'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import React, { useEffect, useState } from 'react'
// import ImageUploaderWithPreview from "components/single-file-uploader-with-preview/ImageUploaderWithPreview";
import { alpha, Box, display } from '@mui/system'
import { IDENTITY_TYPE } from './constants'
import { useTheme } from '@emotion/react'
import InputLabel from '@mui/material/InputLabel'
import CustomSelectWithFormik from '../custom-select/CustomSelectWithFormik'
import CustomTextFieldWithFormik from '../form-fields/CustomTextFieldWithFormik'
import { CustomBoxFullWidth } from '@/styled-components/CustomStyles.style'
import ImageUploaderWithPreview from '../single-file-uploader-with-preview/ImageUploaderWithPreview'
import CustomDateRangePicker from '../custom-date-range-picker/CustomDateRangePicker'
import Calendar from '../custom-date-range-picker/CustomMobileDateRangePicker'
import MultiFileUploader from '../multi-file-uploader/MultiFileUploader'
import Groups2Icon from '@mui/icons-material/Groups2'
import TodayIcon from '@mui/icons-material/Today'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import DialpadIcon from '@mui/icons-material/Dialpad'
import { IMAGE_SUPPORTED_FORMATS } from '@/components/store-resgistration/StoreRegistrationForm'
import toast from 'react-hot-toast'
const acceptedFileInputFormat =
    'application/pdf,image/*,text/plain,.doc, .docx,.txt'
const supportedFormatMultiImages = [
    'jpg',
    'jpeg',
    'gif',
    'png',
    'pdf',
    'doc',
    'docx',
    'deb',
    'webp',
]
const IdentityInfo = ({
    deliveryManFormik,
    identityImage,
    setIdentityImage,
    handleFieldChange,
}) => {
    const theme = useTheme()
    const [key, setKey] = useState(0)
    useEffect(() => {
        typeof identityImage !== 'string' &&
            handleFieldChange('identity_image', identityImage)
        setKey((prev) => prev + 1)
    }, [identityImage])

    const fileInputRef = React.useRef(null)
    const [uploadTarget, setUploadTarget] = useState({ index: null })

    const triggerFileSelect = (index = null) => {
        setUploadTarget({ index })
        fileInputRef.current.click()
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const fileExtension = file.name.split('.').pop().toLowerCase()
        if (!supportedFormatMultiImages.includes(fileExtension)) {
            toast.error(t('Unsupported file format!'))
            return
        }

        if (file.size > 1 * 1024 * 1024) {
            toast.error(t('File size too large'))
            return
        }

        const currentFiles = Array.isArray(identityImage)
            ? [...identityImage]
            : identityImage
                ? [identityImage]
                : []

        if (uploadTarget.index !== null) {
            currentFiles[uploadTarget.index] = file
        } else {
            currentFiles.push(file)
        }

        setIdentityImage(currentFiles)
        e.target.value = ''
    }

    const handleRemoveFile = (index) => {
        const newFiles = [...identityImage]
        newFiles.splice(index, 1)
        setIdentityImage(newFiles)
    }

    return (
        <>
            <CustomBoxFullWidth>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Stack
                            sx={{
                                borderRadius: '.3125rem',
                                background: theme.palette.neutral[200],
                                p: '1.5rem 1rem 1rem',
                                height: '100%',
                            }}
                        >
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Box
                                        sx={{
                                            borderRadius: '10px',
                                        }}
                                    >
                                        <CustomSelectWithFormik
                                            required
                                            selectFieldData={IDENTITY_TYPE}
                                            fieldSetGap="10px"
                                            inputLabel={t('Identity Type')}
                                            passSelectedValue={(value) => {
                                                handleFieldChange(
                                                    'identity_type',
                                                    value
                                                )
                                            }}
                                            background={
                                                theme.palette.neutral[100]
                                            }
                                            borderRadius="10px"
                                            touched={
                                                deliveryManFormik.touched
                                                    .identity_type
                                            }
                                            errors={
                                                deliveryManFormik.errors
                                                    .identity_type
                                            }
                                            fieldProps={deliveryManFormik.getFieldProps(
                                                'identity_type'
                                            )}
                                            height="45px"
                                            startIcon={
                                                <BadgeIcon
                                                    sx={{
                                                        color:
                                                            deliveryManFormik
                                                                .touched
                                                                .identity_type &&
                                                                !deliveryManFormik
                                                                    .errors
                                                                    .identity_type
                                                                ? theme.palette
                                                                    .primary
                                                                    .main
                                                                : alpha(
                                                                    theme
                                                                        .palette
                                                                        .neutral[400],
                                                                    0.7
                                                                ),
                                                        fontSize: '18px',
                                                    }}
                                                />
                                            }
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <CustomTextFieldWithFormik
                                        required
                                        placeholder={t('Identity Number')}
                                        type="number"
                                        label={t('Identity Number')}
                                        borderRadius="10px"
                                        touched={
                                            deliveryManFormik.touched
                                                .identity_number
                                        }
                                        errors={
                                            deliveryManFormik.errors
                                                .identity_number
                                        }
                                        fieldProps={deliveryManFormik.getFieldProps(
                                            'identity_number'
                                        )}
                                        onChangeHandler={(value) => {
                                            handleFieldChange(
                                                'identity_number',
                                                value
                                            )
                                        }}
                                        value={
                                            deliveryManFormik.values
                                                .identity_number
                                        }
                                        startIcon={
                                            <InputAdornment position="start">
                                                <DialpadIcon
                                                    sx={{
                                                        color:
                                                            deliveryManFormik
                                                                .touched
                                                                .identity_number &&
                                                                !deliveryManFormik
                                                                    .errors
                                                                    .identity_number
                                                                ? theme.palette
                                                                    .primary
                                                                    .main
                                                                : alpha(
                                                                    theme
                                                                        .palette
                                                                        .neutral[400],
                                                                    0.7
                                                                ),
                                                        fontSize: '18px',
                                                    }}
                                                />
                                            </InputAdornment>
                                        }
                                    />
                                </Grid>
                            </Grid>
                        </Stack>
                    </Grid>
                    <Grid item xs={12}>
                        <Stack
                            sx={{
                                borderRadius: '.3125rem',
                                background: theme.palette.neutral[200],
                                p: '1.5rem 1rem 1rem',
                                height: '100%',
                            }}
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                flexWrap="wrap"
                                gap="5px"
                                mb=".75rem"
                            >
                                <InputLabel
                                    sx={{
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        color: (theme) =>
                                            theme.palette.text.primary,
                                    }}
                                >
                                    {t('Identity Image')}{' '}
                                    <span
                                        style={{
                                            color: 'red',
                                            fontSize: '12px',
                                        }}
                                    >
                                        *
                                    </span>
                                </InputLabel>
                                <Typography
                                    fontSize="12px"
                                    sx={{
                                        color: (theme) =>
                                            theme.palette.neutral[400],
                                    }}
                                >
                                    {t(
                                        'JPG, JPEG, PNG ,WEBP, Less Than 1MB (Ratio 2:1)'
                                    )}
                                </Typography>
                            </Stack>

                            <input
                                ref={fileInputRef}
                                type="file"
                                hidden
                                accept=".jpg, .jpeg, .png, .webp"
                                onChange={handleFileUpload}
                            />
                            <Stack
                                direction="row"
                                flexWrap="wrap"
                                gap={2}
                                width="100%"
                            >
                                <Box
                                    onClick={() => triggerFileSelect(null)}
                                    sx={{
                                        width: '100%',
                                        maxWidth: { xs: '100%', md: '200px' },
                                        height: '100px',
                                        border: '2px dashed #aaa',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        backgroundColor: (theme) =>
                                            theme.palette.neutral[100],
                                        '&:hover': {
                                            backgroundColor: (theme) =>
                                                theme.palette.neutral[200],
                                            borderColor: (theme) =>
                                                theme.palette.primary.main,
                                        },
                                    }}
                                >
                                    <ProfileImagePlaceholder />
                                    <Typography
                                        fontSize="12px"
                                        color="info.main"
                                        mt={1}
                                    >
                                        {t('Click to upload')}
                                    </Typography>
                                </Box>

                                {Array.isArray(identityImage) &&
                                    identityImage.map((file, index) => {
                                        const isImage =
                                            file?.type?.startsWith('image/') ||
                                            (typeof file === 'string' &&
                                                (file.endsWith('.jpg') ||
                                                    file.endsWith('.png') ||
                                                    file.endsWith('.jpeg') ||
                                                    file.endsWith('.webp')))
                                        const fileName =
                                            file?.name ||
                                            (typeof file === 'string'
                                                ? file.split('/').pop()
                                                : 'Unknown File')
                                        const fileUrl =
                                            typeof file === 'string'
                                                ? file
                                                : URL.createObjectURL(file)

                                        return (
                                            <Box
                                                key={index}
                                                sx={{
                                                    width: '100%',
                                                    maxWidth: {
                                                        xs: '100%',
                                                        md: '200px',
                                                    },
                                                    height: '100px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '8px',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    backgroundColor: (theme) =>
                                                        theme.palette.background
                                                            .paper,
                                                }}
                                            >
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleRemoveFile(index)
                                                    }}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 5,
                                                        right: 5,
                                                        backgroundColor: (
                                                            theme
                                                        ) =>
                                                            theme.palette.error
                                                                .main,
                                                        color: '#fff',
                                                        zIndex: 10,
                                                        '&:hover': {
                                                            backgroundColor: (
                                                                theme
                                                            ) =>
                                                                theme.palette.error
                                                                    .dark,
                                                        },
                                                    }}
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>

                                                {isImage ? (
                                                    <Box
                                                        sx={{
                                                            width: '100%',
                                                            height: '100%',
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            justifyContent:
                                                                'center',
                                                        }}
                                                        onClick={() =>
                                                            triggerFileSelect(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        <img
                                                            src={fileUrl}
                                                            alt={fileName}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit:
                                                                    'cover',
                                                            }}
                                                        />
                                                    </Box>
                                                ) : (
                                                    <Stack
                                                        height="100%"
                                                        justifyContent="space-between"
                                                        onClick={() =>
                                                            window.open(
                                                                fileUrl,
                                                                '_blank'
                                                            )
                                                        }
                                                        sx={{
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                height: '60%',
                                                                backgroundColor:
                                                                    (theme) =>
                                                                        theme
                                                                            .palette
                                                                            .neutral[200],
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                                justifyContent:
                                                                    'center',
                                                            }}
                                                        >
                                                            {file?.type ===
                                                                'application/pdf' ||
                                                                (typeof file ===
                                                                    'string' &&
                                                                    file.endsWith(
                                                                        '.pdf'
                                                                    )) ? (
                                                                <>
                                                                    <embed
                                                                        src={
                                                                            fileUrl
                                                                        }
                                                                        type="application/pdf"
                                                                        width="100%"
                                                                        height="100%"
                                                                        style={{
                                                                            pointerEvents:
                                                                                'none',
                                                                        }}
                                                                    />
                                                                    <Box
                                                                        sx={{
                                                                            position:
                                                                                'absolute',
                                                                            top: 0,
                                                                            left: 0,
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            backgroundColor:
                                                                                'rgba(0, 0, 0, 0.1)',
                                                                        }}
                                                                    />
                                                                </>
                                                            ) : (
                                                                <DescriptionIcon
                                                                    sx={{
                                                                        fontSize:
                                                                            '40px',
                                                                        color: (
                                                                            theme
                                                                        ) =>
                                                                            theme
                                                                                .palette
                                                                                .neutral[500],
                                                                    }}
                                                                />
                                                            )}
                                                        </Box>
                                                        <Stack
                                                            direction="row"
                                                            alignItems="center"
                                                            spacing={1}
                                                            sx={{
                                                                height: '40%',
                                                                px: 1,
                                                                backgroundColor:
                                                                    (theme) =>
                                                                        theme
                                                                            .palette
                                                                            .neutral[100],
                                                                position:
                                                                    'relative',
                                                                zIndex: 1,
                                                            }}
                                                        >
                                                            <DescriptionIcon
                                                                sx={{
                                                                    fontSize:
                                                                        '16px',
                                                                    color: (
                                                                        theme
                                                                    ) =>
                                                                        theme
                                                                            .palette
                                                                            .text
                                                                            .secondary,
                                                                }}
                                                            />
                                                            <Stack overflow="hidden">
                                                                <Typography
                                                                    fontSize="10px"
                                                                    noWrap
                                                                    title={
                                                                        fileName
                                                                    }
                                                                >
                                                                    {fileName}
                                                                </Typography>
                                                                <Typography
                                                                    fontSize="9px"
                                                                    color="primary"
                                                                >
                                                                    {t(
                                                                        'Click to view'
                                                                    )}
                                                                </Typography>
                                                            </Stack>
                                                        </Stack>
                                                    </Stack>
                                                )}
                                            </Box>
                                        )
                                    })}
                            </Stack>

                            {deliveryManFormik.errors.identity_image && (
                                <Typography
                                    sx={{
                                        fontSize: '12px',
                                        ml: '10px',
                                        fontWeight: 'inherit',
                                        color: (theme) =>
                                            theme.palette.error.main,
                                    }}
                                >
                                    {
                                        deliveryManFormik.errors
                                            .identity_image
                                    }
                                </Typography>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            </CustomBoxFullWidth>
        </>
    )
}

export default IdentityInfo
