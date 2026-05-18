import React from 'react'
import { useTranslation } from 'react-i18next'
import InputLabel from '@mui/material/InputLabel'
import { Box, Stack, Typography, useTheme } from '@mui/material'
import ImageUploaderWithPreview from '../single-file-uploader-with-preview/ImageUploaderWithPreview'
import { useSelector } from 'react-redux'

const ImageSection = ({
    RestaurantJoinFormik,
    singleFileUploadHandlerForImage,
    imageOnchangeHandlerForImage,
    singleFileUploadHandlerForCoverPhoto,
    imageOnchangeHandlerForCoverPhoto,
}) => {
    const { t } = useTranslation()
    const theme = useTheme()
    const languageDirection = localStorage.getItem('direction')

    return (
        <>
            <Stack direction="row" flexWrap="wrap" gap={3}>
                <Stack flexGrow={1} flexBasis="45%">
                    <Box
                        sx={{
                            bgcolor: theme.palette.neutral[200],
                            p: '1rem',
                            borderRadius: '8px',
                        }}
                    >
                        <InputLabel
                            sx={{
                                fontWeight: '500',
                                fontSize: '14px',
                                mb: '15px',
                                color: (theme) => theme.palette.neutral[500],
                            }}
                        >
                            {t('Restaurant Cover Photo')}
                            <span style={{ color: 'red', fontSize: '12px' }}>*</span>
                        </InputLabel>

                        <ImageUploaderWithPreview
                            type="file"
                            height="6rem"
                            labelText={t('Click to upload')}
                            hintText="Image format -jpg, png, jpeg,Webp, gif Image Size - maximum size 2 MB Image Ratio - 1:1"
                            file={RestaurantJoinFormik.values.cover_photo ?? ''}
                            onChange={singleFileUploadHandlerForCoverPhoto}
                            imageOnChange={imageOnchangeHandlerForCoverPhoto}
                            error={
                                RestaurantJoinFormik.touched.cover_photo &&
                                RestaurantJoinFormik.errors.cover_photo
                            }
                        />

                        {/* Error message */}
                        {RestaurantJoinFormik.touched.cover_photo &&
                            RestaurantJoinFormik.errors.cover_photo && (
                                <Typography
                                    fontSize="12px"
                                    color="error.main" // MUI theme error color
                                    mt={1}
                                >
                                    {RestaurantJoinFormik.errors.cover_photo?.replace(
                                        'cover_photo',
                                        t('Restaurant Cover Photo')
                                    )}
                                </Typography>
                            )}

                        <Typography
                            fontSize="12px"
                            textAlign="center"
                            sx={{
                                color: (theme) => theme.palette.neutral[1000],
                                mt: '1rem',
                            }}
                        >
                            {t(
                                'jpg, png, jpeg,Webp, gif Image Size - maximum size 2 MB (Ratio 2:1)'
                            )}
                        </Typography>
                    </Box>

                </Stack>
                <Stack flexGrow={1} flexBasis="45%">
                    <Box
                        sx={{
                            pr: languageDirection === 'rtl' && '20px',
                            bgcolor: theme.palette.neutral[200],
                            p: '1rem',
                            borderRadius: '8px',
                        }}
                    >
                        <InputLabel
                            sx={{
                                fontWeight: '500',
                                fontSize: '14px',
                                mb: '15px',
                                color: (theme) => theme.palette.neutral[500],
                            }}
                        >
                            {t('Logo')}
                            <span style={{ color: 'red', fontSize: '12px' }}>
                                *
                            </span>
                        </InputLabel>

                        <ImageUploaderWithPreview
                            type="file"
                            height="6rem"
                            width="7rem"
                            labelText={t('Click to upload')}
                            hintText={
                                'Image format - jpg, png, jpeg,Webp, gif Image Size - maximum size 2 MB Image Ratio - 1:1'
                            }
                            file={RestaurantJoinFormik?.values?.logo ?? ''}
                            onChange={singleFileUploadHandlerForImage}
                            imageOnChange={imageOnchangeHandlerForImage}
                            error={
                                RestaurantJoinFormik.touched.logo &&
                                RestaurantJoinFormik.errors.logo
                            }
                        />

                        {RestaurantJoinFormik.touched.logo &&
                            RestaurantJoinFormik.errors.logo && (
                                <Typography
                                    fontSize="12px"
                                    color="error.main" // MUI theme error color
                                    mt={1}
                                >
                                    {RestaurantJoinFormik.errors.logo}
                                </Typography>
                            )}

                        <Typography
                            fontSize="12px"
                            textAlign="center"
                            sx={{
                                color: (theme) => theme.palette.neutral[1000],
                            }}
                            marginTop="1rem"
                        >
                            {t(
                                'jpg, png, jpeg,Webp, gif Image Size Less Than 2MB (Ratio 1:1)'
                            )}
                        </Typography>
                    </Box>
                </Stack>
            </Stack>
        </>
    )
}
export default ImageSection
