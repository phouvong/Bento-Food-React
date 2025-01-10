import React from 'react'
import { useTranslation } from 'react-i18next'
import InputLabel from '@mui/material/InputLabel'
import { Box, Grid, Typography } from '@mui/material'
import ImageUploaderWithPreview from '../single-file-uploader-with-preview/ImageUploaderWithPreview'

const ImageSection = ({
    RestaurantJoinFormik,
    singleFileUploadHandlerForImage,
    imageOnchangeHandlerForImage,
    singleFileUploadHandlerForCoverPhoto,
    imageOnchangeHandlerForCoverPhoto,
}) => {
    const { t } = useTranslation()
    const languageDirection = localStorage.getItem('direction')
    return (
        <>
            <Grid
                container
                spacing={3}
                sx={{
                    '& > .MuiGrid-item': {
                        padding: '0px', // Override the padding for Grid items
                    },
                }}
            >
                <Grid item xs={10} sm={10} md={6}>
                    <InputLabel
                        sx={{
                            fontWeight: '500',
                            mb: '15px',
                            color: (theme) => theme.palette.neutral[500],
                        }}
                    >
                        {t('Cover Photo')}
                    </InputLabel>
                    <ImageUploaderWithPreview
                        type="file"
                        height="7rem"
                        labelText={t('Click to upload')}
                        hintText="Image format - jpg, png, jpeg, gif Image Size - maximum size 2 MB Image Ratio - 1:1"
                        file={RestaurantJoinFormik.values.cover_photo ?? ''}
                        onChange={singleFileUploadHandlerForCoverPhoto}
                        imageOnChange={imageOnchangeHandlerForCoverPhoto}
                        error={
                            RestaurantJoinFormik.touched.cover_photo &&
                            RestaurantJoinFormik.errors.cover_photo
                        }
                    />
                    <Typography
                        fontSize="12px"
                        sx={{ color: (theme) => theme.palette.neutral[1000] }}
                        marginTop="1rem"
                    >
                        {t('JPG, JPEG, PNG Less Than 1MB (Ratio 2:1)')}
                    </Typography>
                </Grid>
                <Grid
                    item
                    xs={10}
                    sm={10}
                    md={4}
                    sx={{
                        pl: {
                            xs: '0px',
                            md: '24px !important',
                        },
                    }}
                >
                    <Box
                        sx={{
                            pr: languageDirection === 'rtl' && '20px',
                        }}
                    >
                        <InputLabel
                            sx={{
                                fontWeight: '500',
                                mb: '15px',
                                color: (theme) => theme.palette.neutral[500],
                            }}
                        >
                            {t('Logo')}
                        </InputLabel>

                        <ImageUploaderWithPreview
                            type="file"
                            height="7rem"
                            labelText={t('Click to upload')}
                            hintText="Image format - jpg, png, jpeg, gif Image Size - maximum size 2 MB Image Ratio - 1:1"
                            file={RestaurantJoinFormik?.values?.logo ?? ''}
                            onChange={singleFileUploadHandlerForImage}
                            imageOnChange={imageOnchangeHandlerForImage}
                            error={
                                RestaurantJoinFormik.touched.logo &&
                                RestaurantJoinFormik.errors.logo
                            }
                        />
                    </Box>
                    <Typography
                        fontSize="12px"
                        sx={{ color: (theme) => theme.palette.neutral[1000] }}
                        marginTop="1rem"
                    >
                        {t('JPG, JPEG, PNG Less Than 1MB (Ratio 1:1)')}
                    </Typography>
                </Grid>
            </Grid>
        </>
    )
}
export default ImageSection
