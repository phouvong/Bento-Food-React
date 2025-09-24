import {
    Grid,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from '@mui/material'

import { t } from 'i18next'
import RoomIcon from '@mui/icons-material/Room'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
// import { CustomBoxFullWidth } from "styled-components/CustomStyles.style";
import BadgeIcon from '@mui/icons-material/Badge'
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
]
const IdentityInfo = ({
    deliveryManFormik,
    identityHandler,
    identityNumberHandler,
    handleIdentityImageUpload,
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

    const singleFileUploadHandlerForImage = (value) => {
        setIdentityImage(value.currentTarget.files[0])
    }
    const imageOnchangeHandlerForImage = (value) => {
        setIdentityImage(value)
    }
    const [dateRange, setDateRange] = useState([])

    const handleDateRange = (value) => {
        setDateRange(val)
    }
    const fileImagesHandler = (files) => {
        setIdentityImage(files)
    }
    const [selectedDate, setSelectedDate] = useState(null)

    const handleDateChange = (date) => {
        setSelectedDate(moment(date?.$d).format('YYYY-MM-DD'))
    }

    return (
        <>
            <CustomBoxFullWidth>
                <Grid container spacing={2}>
                    <Grid item xs={12} lg={6}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        borderRadius: '10px',
                                    }}
                                >
                                    <CustomSelectWithFormik
                                        selectFieldData={IDENTITY_TYPE}
                                        fieldSetGap="10px"
                                        inputLabel={t('Identity Type')}
                                        passSelectedValue={(value) => {
                                            handleFieldChange(
                                                'identity_type',
                                                value
                                            )
                                        }}
                                        background={theme.palette.neutral[100]}
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
                                                                  .primary.main
                                                            : alpha(
                                                                  theme.palette
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
                            <Grid item xs={12}>
                                <CustomTextFieldWithFormik
                                    placeholder={t('Identity Number')}
                                    type="number"
                                    label={t('Identity Number')}
                                    borderRadius="10px"
                                    touched={
                                        deliveryManFormik.touched
                                            .identity_number
                                    }
                                    errors={
                                        deliveryManFormik.errors.identity_number
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
                                        deliveryManFormik.values.identity_number
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
                                                                  .primary.main
                                                            : alpha(
                                                                  theme.palette
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
                    </Grid>
                    <Grid item xs={12} md={6} lg={6}>
                        <Box key={key}>
                            <Stack
                                alignItems="start"
                                justifyContent="flex-start"
                                spacing={2}
                                sx={{ mb: 5 }}
                            >
                                <Stack
                                    direction="row"
                                    width="100%"
                                    spacing={1}
                                    alignItems="center"
                                    gap="5px"
                                >
                                    <InputLabel
                                        sx={{
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            color: (theme) =>
                                                theme.palette.neutral[500],
                                        }}
                                    >
                                        {t('Identity Image')}
                                    </InputLabel>
                                    <Typography
                                        fontSize="12px"
                                        sx={{
                                            color: (theme) =>
                                                theme.palette.neutral[400],
                                        }}
                                    >
                                        {t(
                                            'JPG, JPEG, PNG Less Than 1MB (Ratio 2:1)'
                                        )}
                                    </Typography>
                                </Stack>

                                <MultiFileUploader
                                    fileImagesHandler={fileImagesHandler}
                                    totalFiles={identityImage}
                                    maxFileSize={20000000}
                                    supportedFileFormats={
                                        supportedFormatMultiImages
                                    }
                                    acceptedFileInputFormat={
                                        acceptedFileInputFormat
                                    }
                                    errors={
                                        deliveryManFormik.errors.identity_image
                                    }
                                    errorAlert={
                                        deliveryManFormik.errors.identity_image
                                    }
                                    delivery={true}
                                    width="8.75rem"
                                    height="100px"
                                    gridControl="true"
                                />

                                {deliveryManFormik.touched.identity_image &&
                                    deliveryManFormik.errors.identity_image && (
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
                            {/* LICENSE */}
                            {/* <Stack alignItems="start" justifyContent="flex-start" spacing={2} sx={{mt:"5px"}}>
              <Stack
                direction="row"
                width="100%"
                spacing={1}
                alignItems="center"
                justifyContent='start'
              >
                <InputLabel
                  sx={{
                    fontWeight: "600",
                    color: (theme) => theme.palette.neutral[1000],
                  }}
                >
                  {t("License Document")}
                </InputLabel>
                <Typography fontSize="12px">
                  {t("pdf, doc Less Than 1MB")}
                </Typography>
              </Stack>
              <ImageUploaderWithPreview
                type="file"
                labelText={t("Profile Image")}
                hintText="Image format - jpg, png, jpeg, gif Image Size - maximum size 2 MB Image Ratio - 1:1"
                file={''}
                // file={identityImage}
                // onChange={singleFileUploadHandlerForImage}
                // imageOnChange={imageOnchangeHandlerForImage}
                width="8.75rem"
                
                // error={deliveryManFormik.errors.identity_image}
                // borderRadius={borderRadius ?? "50%"}
              />
            </Stack> */}
                        </Box>
                    </Grid>
                </Grid>
            </CustomBoxFullWidth>
        </>
    )
}

export default IdentityInfo
