import React, { useState } from 'react'
import {
    FilePreviewerWrapper,
    CustomBoxForFilePreviewer,
} from '../file-previewer/FilePreviewer.style'
import ImageUploaderThumbnail from './ImageUploaderThumbnail'
import CustomImageContainer from '../CustomImageContainer'
import pdfIcon from '../../assets/images/icons/pdf.png'
import docIcon from '../../assets/images/icons/docx.png'
import txtIcon from '../../assets/images/icons/txt-file.png'
import { Box, IconButton, Modal, Stack, alpha, useTheme } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import CloseIcon from '@mui/icons-material/Close'

const ImagePreviewer = ({
    required,
    anchor,
    file,
    label,
    width,
    imageUrl,
    borderRadius,
    error,
    isIcon,
    height,
}) => {
    const theme = useTheme()
    const [isHovered, setIsHovered] = useState(false)
    const [openModal, setOpenModal] = useState(false)

    // Function to determine the file type
    const getFileType = (file) => {
        if (
            typeof window !== 'undefined' &&
            (file instanceof Blob || file instanceof File)
        ) {
            const fileType = file.type.split('/')[0]
            if (fileType === 'image') {
                return 'image'
            } else if (file.type === 'application/pdf') {
                return 'pdf'
            } else if (
                file.type === 'application/msword' ||
                file.type ===
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ) {
                return 'doc'
            } else if (file.type === 'text/plain') {
                return 'txt'
            } else {
                return 'other'
            }
        } else if (typeof file === 'string' && file !== '') {
            // Assume string is an image URL if not empty (or check extension if possible, but for now safe to assume image context)
            return 'image'
        }
        return 'other' // Fallback for non-file values
    }

    // Determine the file type
    let fileType = getFileType(file)
    let previewImage

    // If file is a Blob or File, create an object URL for the preview image
    if (file && (file instanceof Blob || file instanceof File)) {
        previewImage = {
            url: URL.createObjectURL(file),
        }
    } else previewImage = file

    const handleEdit = (e) => {
        e.stopPropagation()
        anchor.current.click()
    }

    const handlePreview = (e) => {
        e.stopPropagation()
        setOpenModal(true)
    }

    const handleCloseModal = () => {
        setOpenModal(false)
    }
    const fallbackHeight = height || '8.75rem'

    return (
        <>
            <CustomBoxForFilePreviewer height={height}>
                {previewImage ? (
                    <FilePreviewerWrapper
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onClick={
                            fileType === 'image'
                                ? undefined
                                : () => anchor.current.click()
                        }
                        width={width}
                        height={height}
                        objectFit
                        borderRadius={borderRadius}
                        sx={{ position: 'relative' }}
                    >
                        {fileType === 'image' ? (
                            <>
                                <CustomImageContainer
                                    src={
                                        typeof previewImage === 'string'
                                            ? previewImage
                                            : previewImage?.url
                                    }
                                    alt="preview"
                                    objectFit="cover"
                                />
                                {isHovered && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            backgroundColor: alpha(
                                                theme.palette.neutral[900],
                                                0.5
                                            ),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1,
                                            zIndex: 10,
                                            borderRadius: borderRadius,
                                        }}
                                    >
                                        <IconButton
                                            onClick={handleEdit}
                                            sx={{
                                                bgcolor:
                                                    theme.palette.background
                                                        .profileBackground,
                                                color: theme.palette.info.main,
                                                border: '1px solid',
                                                borderColor:
                                                    theme.palette.info.main,
                                                borderRadius: '.25rem',
                                                width: '2rem',
                                                height: '2rem',
                                                svg: {
                                                    fontSize: '1rem',
                                                },
                                                '&:hover': {
                                                    bgcolor:
                                                        theme.palette
                                                            .neutral[100],
                                                },
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={handlePreview}
                                            sx={{
                                                bgcolor:
                                                    theme.palette.neutral[100],
                                                color: theme.palette.info.main,
                                                border: '1px solid',
                                                borderColor:
                                                    theme.palette.info.main,
                                                borderRadius: '.25rem',
                                                width: '2rem',
                                                height: '2rem',
                                                svg: {
                                                    fontSize: '1rem',
                                                },
                                                '&:hover': {
                                                    bgcolor:
                                                        theme.palette
                                                            .neutral[100],
                                                },
                                            }}
                                        >
                                            <RemoveRedEyeIcon />
                                        </IconButton>
                                    </Box>
                                )}
                            </>
                        ) : fileType === 'pdf' ? (
                            <CustomImageContainer
                                src={pdfIcon?.src}
                                alt="preview"
                                objectFit="cover"
                            />
                        ) : fileType === 'doc' ? (
                            <CustomImageContainer
                                src={docIcon?.src}
                                alt="preview"
                                objectFit="cover"
                            />
                        ) : fileType === 'txt' ? (
                            <CustomImageContainer
                                src={txtIcon?.src}
                                alt="preview"
                                objectFit="cover"
                            />
                        ) : (
                            <CustomImageContainer
                                src={txtIcon?.src}
                                alt="preview"
                                objectFit="cover"
                            />
                        )}
                    </FilePreviewerWrapper>
                ) : (
                    <FilePreviewerWrapper
                        onClick={() => anchor.current.click()}
                        width={width}
                        height={fallbackHeight}
                        objectFit
                        borderRadius={borderRadius}
                    >
                        <ImageUploaderThumbnail
                            required={required}
                            label={label}
                            width={width}
                            error={error}
                            isIcon={isIcon}
                            borderRadius={borderRadius}
                            height={fallbackHeight}
                        />
                    </FilePreviewerWrapper>
                )}
            </CustomBoxForFilePreviewer>

            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 'auto',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 2,
                        borderRadius: '8px',
                        outline: 'none',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 'max-content',
                        minWidth: '300px',
                    }}
                >
                    <IconButton
                        onClick={handleCloseModal}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: (theme) =>
                                alpha(theme.palette.neutral[100], 0.5),
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Stack
                        justifyContent="center"
                        alignItems="center"
                        sx={{ minHeight: '200px' }}
                    >
                        <img
                            src={
                                typeof previewImage === 'string'
                                    ? previewImage
                                    : previewImage?.url
                            }
                            alt="Preview"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                objectFit: 'contain',
                            }}
                        />
                    </Stack>
                </Box>
            </Modal>
        </>
    )
}

export default ImagePreviewer
