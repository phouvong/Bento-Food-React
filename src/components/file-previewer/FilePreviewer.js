import React, { useEffect, useState } from 'react'
import {
    CustomBoxForFilePreviewer,
    CustomBoxImageText,
    FilePreviewerWrapper,
    IconButtonImagePreviewer,
} from './FilePreviewer.style'
import DeleteIcon from '@mui/icons-material/Delete'
import Typography from '@mui/material/Typography'
import { Grid, Stack, Box, useTheme } from '@mui/material'
import FileInputField from '../form-fields/FileInputField'
import pdfIcon from '../../assets/images/icons/pdf.png'
import docIcon from '../../assets/images/icons/docx.png'
import txtIcon from '../../assets/images/icons/txt-file.png'
import folderIcon from '../../assets/images/icons/folder.png'
import CustomImageContainer from '../CustomImageContainer'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import IconButton from '@mui/material/IconButton'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { HandleNext, HandlePrev } from '../CustomSliderIcon'

const FilePreviewer = (props) => {
    const {
        file,
        deleteImage,
        hintText,
        width,
        onChange,
        onDelete,
        errorStatus,
        acceptedFileInput,
        label,
        titleText,
height,
        fullWidth,
    } = props

    const [multipleImages, setMultipleImages] = useState([])
    const theme=useTheme()
    useEffect(() => {
        if (file?.length > 0) {
            const newImages = []

            file.forEach((image) => {
                // Check if the image is a valid File object
                if (image instanceof File) {
                    newImages.push({
                        url: URL.createObjectURL(image),
                        type: image.name.split('.').pop(),
                    })
                } else {
                    console.error('Invalid file object', image)
                }
            })

            setMultipleImages(newImages)
        } else {
        }
    }, [file])
    // Custom arrow components
    const CustomPrevArrow = ({ onClick }) => (
        <IconButton
            onClick={onClick}
            sx={{
                position: 'absolute',
                left: -15,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                width: 40,
                height: 40,
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                },
                '&:disabled': {
                    display: 'none',
                }
            }}
        >
            <ArrowBackIosIcon sx={{ fontSize: 18, color: '#666' }} />
        </IconButton>
    )

    const CustomNextArrow = ({ onClick }) => (
        <IconButton
            onClick={onClick}
            sx={{
                position: 'absolute',
                right: -15,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                width: 40,
                height: 40,
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                },
                '&:disabled': {
                    display: 'none',
                }
            }}
        >
            <ArrowForwardIosIcon sx={{ fontSize: 18, color: '#666' }} />
        </IconButton>
    )

    const sliderSettings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: multipleImages.length > 1.5 ? 1.5 : multipleImages.length,
        slidesToScroll: 1,
        nextArrow:  <HandleNext />,
              prevArrow:   <HandlePrev />,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: multipleImages.length > 1 ? 1.5 : multipleImages.length,
                    slidesToScroll: 1,
                    prevArrow: <CustomPrevArrow />,
                    nextArrow: <CustomNextArrow />,
                }
            },
            {
                breakpoint: 900,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    prevArrow: <CustomPrevArrow />,
                    nextArrow: <CustomNextArrow />,
                }
            }
        ]
    }

    const renderFilePreview = () => {
        if (file?.length > 0) {
            return (
                <Box sx={{ width: '100%' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={multipleImages.length > 0 ? 4 : 12}>
                            <Box sx={{ maxWidth: fullWidth ? '100%' : '600px' }}>
                                <FileInputField
                                    titleText={titleText}
                                    label={label}
                                    hintText={hintText}
                                    errorStatus={errorStatus}
                                    width
                                    onChange={onChange}
                                    acceptedFileInput={acceptedFileInput}
                                />
                            </Box>
                        </Grid>

                        {multipleImages.length > 0 && (
                            <Grid item xs={12} md={8}>
                                <Box sx={{
                                    width: '100%',
                                    position: 'relative',
                                    padding:"0 20px",
                                    '& .slick-slide': {
                                        padding: '0 8px',
                                    },
                                    '& .slick-list': {
                                        margin: '0 -8px',
                                    },
                                    '& .slick-track': {
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginTop:"6px",
                                       
                                    }
                                }}>
                                    <Slider {...sliderSettings}>
                                        {multipleImages.map((image, index) => (
                                            <Box key={index} sx={{ outline: 'none' }}>
                                                <CustomBoxForFilePreviewer
                                                    fullWidth={fullWidth}
                                                    width={width}
                                                    sx={{ margin: '0 4px',
                                                         border: `1px dashed ${theme.palette.neutral[400]}`,
                                                         borderRadius:"12px",

                                                     }}
                                                    height={height}
                                                >
                                                    {previewBasedOnType(image)}
                                                    <IconButtonImagePreviewer
                                                        onClick={() => onDelete(index)}
                                                    >
                                                        <CloseIcon
                                                            sx={{
                                                                fontSize: '1rem',
                                                                color: 'white',
                                                                cursor: 'pointer',
                                                                '&:hover': {
                                                                    color: 'red',
                                                                },
                                                            }}
                                                        />
                                                    </IconButtonImagePreviewer>
                                                </CustomBoxForFilePreviewer>
                                            </Box>
                                        ))}
                                    </Slider>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            )
        } else {
            const previewImage = {
                url: URL.createObjectURL(file),
                type: file.name.split('.').pop(),
            }
            return (
                <CustomBoxForFilePreviewer fullWidth={fullWidth}>
                    {previewBasedOnType(previewImage)}
                    <IconButtonImagePreviewer onClick={() => deleteImage()}>
                        <DeleteIcon />
                    </IconButtonImagePreviewer>
                </CustomBoxForFilePreviewer>
            )
        }
    }
    const previewBasedOnType = (file) => {
        if (
            file.type === 'jpg' ||
            file.type === 'jpeg' ||
            file.type === 'gif' ||
            file.type === 'png'
        ) {
            return (
                <FilePreviewerWrapper
                    fullWidth={fullWidth}
                    // onClick={() => anchor.current.click()}
                    // width={width}
                    borderRadius="10px"
                >
                    <CustomImageContainer
                        src={file.url}
                        alt="preview"
                        objectFit="cover"
                        borderRadius="10px"
                    />
                    {/*<img src={file.url} alt="preview" />*/}
                </FilePreviewerWrapper>
            )
        } else if (file.type === 'pdf') {
            return (
                <FilePreviewerWrapper
                    // onClick={() => anchor.current.click()}
                    objectFit
                // width={width}
                >
                    <CustomImageContainer src={pdfIcon.src} alt="pdf" />
                </FilePreviewerWrapper>
            )
        } else if (file.type === 'docx' || file.type === 'docx') {
            return (
                <FilePreviewerWrapper
                    // onClick={() => anchor.current.click()}
                    objectFit
                // width={width}
                >
                    <CustomImageContainer src={docIcon.src} alt="doc" />
                </FilePreviewerWrapper>
            )
        } else if (file.type === 'txt') {
            return (
                <FilePreviewerWrapper
                    // onClick={() => anchor.current.click()}
                    objectFit
                // width={width}
                >
                    <CustomImageContainer src={txtIcon.src} alt="text" />
                </FilePreviewerWrapper>
            )
        } else {
            return (
                <FilePreviewerWrapper
                    // onClick={() => anchor.current.click()}
                    objectFit
                // width={width}
                >
                    <CustomImageContainer src={folderIcon.src} alt="text" />
                </FilePreviewerWrapper>
            )
        }
    }
    return (
        <Stack width="100%" alignItems="center" spacing={3}>
            {renderFilePreview()}
            {hintText && (
                <CustomBoxImageText>
                    <Typography>{hintText}</Typography>
                </CustomBoxImageText>
            )}
        </Stack>
    )
}
FilePreviewer.propTypes = {}
export default FilePreviewer
