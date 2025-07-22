import React from 'react'
import {
    FilePreviewerWrapper,
    CustomBoxForFilePreviewer,
} from '../file-previewer/FilePreviewer.style'
import ImageUploaderThumbnail from './ImageUploaderThumbnail'
import CustomImageContainer from '../CustomImageContainer'
import pdfIcon from '../../assets/images/icons/pdf.png'
import docIcon from '../../assets/images/icons/docx.png'
import txtIcon from '../../assets/images/icons/txt-file.png'
import folderIcon from '../../assets/images/icons/folder.png'

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
    // Function to determine the file type
    const getFileType = (file) => {
        if (typeof window !== 'undefined' && (file instanceof Blob || file instanceof File)) {
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

    return (
        <>
            <CustomBoxForFilePreviewer height={height}>
                {previewImage ? (
                    <FilePreviewerWrapper
                        onClick={() => anchor.current.click()}
                        width={width}
                        height={height}
                        objectFit
                        borderRadius={borderRadius}
                    >
                        {fileType === 'image' ? (
                            <CustomImageContainer
                                src={previewImage?.url}
                                alt="preview"
                                objectFit="cover"
                            />
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
                        height="100px"
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
                            height={height}
                        />
                    </FilePreviewerWrapper>
                )}
            </CustomBoxForFilePreviewer>
        </>
    )
}

export default ImagePreviewer
