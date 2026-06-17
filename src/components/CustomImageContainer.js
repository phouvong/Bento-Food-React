import React, { useEffect, useRef, useState } from 'react'
import { CustomImageContainerStyled } from '@/styled-components/CustomStyles.style'
import placeholder from '../../public/static/notimage.png'

const CustomImageContainer = ({
    cursor,
    mdHeight,
    maxWidth,
    height,
    width,
    objectFit,
    minwidth,
    src,
    alt,
    borderRadius,
    marginBottom,
    smHeight,
    smMb,
    smMaxWidth,
    smWidth,
    test_image,
    aspectRatio,
    boxShadow,
    loading,
    fetchPriority='auto',
    errorWidth,
    errorHeight,
}) => {
    // const [imageFile, setState] = useState(null)
    // const [newObjectFit, setNewObjectFit] = useState(objectFit)
    // useEffect(() => {
    //     if (src) {
    //         setState(src)
    //     } else {
    //         // setState(placeholder?.src)
    //         setState(placeholder?.src)
    //         setNewObjectFit('contain')
    //     }
    // }, [src])

    // for avoid warnings
    const imgRef = useRef(null)
    useEffect(() => {
        if (imgRef.current) {
            imgRef.current.setAttribute('fetchpriority', fetchPriority)
        }
    }, [fetchPriority])


    const showFallback = !src
    const fallbackImgStyle =
        showFallback && (errorWidth || errorHeight)
            ? {
                  width: errorWidth,
                  height: errorHeight,
                  margin: 'auto',
              }
            : undefined

    return (
        <CustomImageContainerStyled
            height={height}
            width={width}
            objectFit={src ? objectFit : 'contain'}
            minwidth={minwidth}
            borderRadu={borderRadius}
            marginBottom={marginBottom}
            smHeight={smHeight}
            smMb={smMb}
            maxWidth={maxWidth}
            smMaxWidth={smMaxWidth}
            smWidth={smWidth}
            mdHeight={mdHeight}
            cursor={cursor}
            aspectRatio={aspectRatio}
            boxShadow={boxShadow}
            sx={
                showFallback && (errorWidth || errorHeight)
                    ? {
                          justifyContent: 'center',
                          alignItems: 'center',
                      }
                    : undefined
            }
        >
            <img
                ref={imgRef}
                src={src || placeholder?.src}
                alt={alt}
                onError={(e) => {
                    // currentTarget.onerror = null; // prevents looping
                    // setState(placeholder?.src)
                    // e.target.style =
                    //     'objectFit:contain !important;width:auto !important;'
                    // e.target.style.margin = 'auto'
                }}
                loading={loading || 'lazy'}
                style={fallbackImgStyle}
            />
        </CustomImageContainerStyled>
    )
}
export default CustomImageContainer
