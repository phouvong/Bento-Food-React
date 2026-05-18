import React, { useRef } from 'react'
import ImagePreviewer from './ImagePreviewer'
import toast from 'react-hot-toast'

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
                    const file = e.target.files?.[0]
                    if (!file) return

                    const MAX_SIZE = 2 * 1024 * 1024 // 2MB

                    if (!file.type.startsWith('image/')) {
                        toast.error('Only image can be uploaded')
                        e.target.value = ''
                        return
                    }

                    if (file.size > MAX_SIZE) {
                        toast.error('Image size must be less than 2 MB')
                        e.target.value = '' // reset input
                        return
                    }

                    onChange(e)
                }}
            />

        </>
    )
}

export default ImageUploaderWithPreview
