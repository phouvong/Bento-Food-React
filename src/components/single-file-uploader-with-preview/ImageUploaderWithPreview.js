import React, { useRef } from 'react'
import ImagePreviewer from './ImagePreviewer'

const ImageUploaderWithPreview = ({
    required,
    file,
    labelText,
    hintText,
    onChange,
    width,
    imageUrl,
    borderRadius,
    error,
    isIcon,
    acceptedFileInput = 'image/*',
    height,
}) => {
    const imageContainerRef = useRef()

    return (
        <>
            <ImagePreviewer
                required={required}
                anchor={imageContainerRef}
                file={file}
                label={labelText}
                hintText={hintText}
                width={width}
                imageUrl={imageUrl}
                borderRadius={borderRadius}
                error={error}
                isIcon={isIcon}
                height={height}
            />
            <input
                ref={imageContainerRef}
                required={required}
                id="file"
                name="file"
                type="file"
                accept={acceptedFileInput}
                hidden
                onChange={(e) => {
                    onChange(e)
                }}
            />
        </>
    )
}

export default ImageUploaderWithPreview
