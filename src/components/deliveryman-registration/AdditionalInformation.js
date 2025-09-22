import { CustomBoxFullWidth } from '@/styled-components/CustomStyles.style'
import {
    alpha,
    Box,
    Checkbox,
    FormControlLabel,
    FormGroup,
    FormLabel,
    Grid,
    InputAdornment,
    InputLabel,
    Stack,
    Typography,
} from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { useTheme } from '@emotion/react'
import CustomTextFieldWithFormik from '../form-fields/CustomTextFieldWithFormik'
import { t } from 'i18next'
import Groups2Icon from '@mui/icons-material/Groups2'
import TodayIcon from '@mui/icons-material/Today'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import ImageUploaderWithPreview from '../single-file-uploader-with-preview/ImageUploaderWithPreview'
import MultiFileUploader from '../multi-file-uploader/MultiFileUploader'
import { capitalize } from '@/utils/capitalize'
import CustomPhoneInput from '../CustomPhoneInput'
import moment from 'moment'
import { concat } from 'lodash'
import DeliverymanForm from '../rate-and-review/DeliverymanForm'
import dayjs from 'dayjs'
import { getAcceptedFileInputFormat } from '@/utils/getAcceptedFileInputFormat'
import { CustomTextFieldStyle } from '../form-fields/CustomTextField.style'
import { Calendar } from 'react-date-range'
import { format } from 'date-fns'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { formatPhoneNumber } from '@/utils/customFunctions'
// const acceptedFileInputFormat =
//     'application/pdf,image/*,text/plain,.doc, .docx,.txt'
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
const AdditionalInformation = ({
    deliveryManFormik,
    additionalImage,
    setAdditionalImage,
    configData,
}) => {
    const theme = useTheme()

    const singleFileUploadHandlerForImage = (value, index, inputData) => {
        const file = value.currentTarget.files[0]

        if (file) {
            // Dynamically set the field value in Formik
            deliveryManFormik.setFieldValue(inputData, file)
        }
    }

    const imageOnchangeHandlerForImage = (value) => {
        setAdditionalImage(value)
    }
    const [dateRange, setDateRange] = useState([])

    const handleDateRange = (value) => {
        setDateRange(val)
    }
    const fileImagesHandler = (files, key) => {
        setAdditionalImage(files)
        deliveryManFormik.setFieldValue('additional_documents', files)
    }
    useEffect(() => {
        if (additionalImage && Object.keys(additionalImage).length > 0) {
            // Iterate through configData and update Formik values
            configData?.deliveryman_additional_join_us_page_data?.data.forEach(
                (item) => {
                    if (item.field_type === 'file') {
                        const fileData = additionalImage[item.input_data]
                        if (fileData) {
                            deliveryManFormik.setFieldValue(
                                item.input_data,
                                fileData
                            )
                        }
                    }
                }
            )
        }
    }, [additionalImage, deliveryManFormik, configData])

    const newFileTypes =
        configData?.deliveryman_additional_join_us_page_data?.data
            ?.filter((item) => item?.field_type === 'file')
            .map((item) => ({ ...item }))

    const acceptedFileInputFormat = getAcceptedFileInputFormat(
        configData?.deliveryman_additional_join_us_page_data?.data
    )

    const [openCalendars, setOpenCalendars] = useState({}) // State to track open calendars
    const calendarRefs = useRef({}) // Refs for each calendar

    const toggleCalendar = (key) => {
        setOpenCalendars((prev) => ({
            ...prev,
            [key]: !prev[key], // Toggle calendar for the specific key
        }))
    }

    const closeAllCalendars = () => {
        setOpenCalendars({})
    }

    const handleDateChange = (date, key) => {
        const formattedDate = format(date, 'yyyy-MM-dd')
        const updatedAdditionalData = {
            ...deliveryManFormik.values.additional_data,
            [key]: formattedDate,
        }

        // Update Formik field dynamically
        deliveryManFormik.setFieldValue(
            'additional_data',
            updatedAdditionalData
        )

        // Close the calendar after date selection
        setOpenCalendars((prev) => ({
            ...prev,
            [key]: false,
        }))
    }

    // Detect clicks outside the calendar
    useEffect(() => {
        const handleClickOutside = (event) => {
            Object.keys(calendarRefs.current).forEach((key) => {
                if (
                    openCalendars[key] &&
                    calendarRefs.current[key] &&
                    !calendarRefs.current[key].contains(event.target)
                ) {
                    setOpenCalendars((prev) => ({
                        ...prev,
                        [key]: false,
                    }))
                }
            })
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [openCalendars])

    return (
        <>
            <CustomBoxFullWidth>
                <Grid container spacing={2}>
                    <Grid item xs={12} lg={6}>
                        <Grid container spacing={2}>
                            {configData?.deliveryman_additional_join_us_page_data?.data?.map(
                                (item, index) => {
                                    switch (item.field_type) {
                                        case 'number':
                                        case 'text':
                                        case 'email':
                                            return (
                                                <>
                                                    <Grid
                                                        item
                                                        xs={12}
                                                        key={index}
                                                    >
                                                        <CustomTextFieldWithFormik
                                                            label={capitalize(
                                                                item.input_data.replaceAll(
                                                                    '_',
                                                                    ' '
                                                                )
                                                            )}
                                                            placeholder={
                                                                item.placeholder_data
                                                            }
                                                            type={
                                                                item.field_type
                                                            }
                                                            borderRadius="10px"
                                                            touched={
                                                                deliveryManFormik
                                                                    .touched
                                                                    .additional_data?.[
                                                                    item
                                                                        .input_data
                                                                ]
                                                            }
                                                            errors={capitalize(
                                                                deliveryManFormik.errors.additional_data?.[
                                                                    item
                                                                        ?.input_data
                                                                ]
                                                                    ?.split('_')
                                                                    ?.join(' ')
                                                            )}
                                                            fieldProps={deliveryManFormik.getFieldProps(
                                                                `additional_data.${item.input_data}` // Dynamically set the key
                                                            )}
                                                            onChangeHandler={(
                                                                value
                                                            ) => {
                                                                const updatedAdditionalData =
                                                                    {
                                                                        ...deliveryManFormik
                                                                            .values
                                                                            .additional_data,
                                                                        [item.input_data]:
                                                                            value,
                                                                    }

                                                                deliveryManFormik.setFieldValue(
                                                                    'additional_data',
                                                                    updatedAdditionalData
                                                                )
                                                            }}
                                                            value={
                                                                // Display the value dynamically from additional_data using item.input_data as the key
                                                                deliveryManFormik
                                                                    .values
                                                                    .additional_data?.[
                                                                    item
                                                                        .input_data
                                                                ]
                                                            }
                                                            fontSize="14px"
                                                            startIcon={
                                                                <InputAdornment position="start">
                                                                    <Groups2Icon
                                                                        sx={{
                                                                            color:
                                                                                deliveryManFormik
                                                                                    .touched
                                                                                    .identity_number &&
                                                                                !deliveryManFormik
                                                                                    .errors
                                                                                    .identity_number
                                                                                    ? theme
                                                                                          .palette
                                                                                          .primary
                                                                                          .main
                                                                                    : alpha(
                                                                                          theme
                                                                                              .palette
                                                                                              .neutral[400],
                                                                                          0.7
                                                                                      ),
                                                                            fontSize:
                                                                                '18px',
                                                                        }}
                                                                    />
                                                                </InputAdornment>
                                                            }
                                                        />
                                                    </Grid>
                                                </>
                                            )

                                        case 'phone':
                                            return (
                                                <>
                                                    <Grid
                                                        item
                                                        xs={12}
                                                        key={index}
                                                        sx={{ pb: '16px' }}
                                                    >
                                                        <CustomPhoneInput
                                                            placeholder={
                                                                item.placeholder_data
                                                            }
                                                            value={
                                                                deliveryManFormik
                                                                    .values
                                                                    .additional_data?.[
                                                                    item
                                                                        .input_data
                                                                ]
                                                            }
                                                            // required={
                                                            //     item.is_required
                                                            // }
                                                            label={capitalize(
                                                                item.input_data.replaceAll(
                                                                    '_',
                                                                    ' '
                                                                )
                                                            )}
                                                            onHandleChange={(
                                                                value
                                                            ) => {
                                                                const updatedAdditionalData =
                                                                    {
                                                                        ...deliveryManFormik
                                                                            .values
                                                                            .additional_data,
                                                                        [item.input_data]:
                                                                            formatPhoneNumber(
                                                                                value
                                                                            ),
                                                                    }

                                                                deliveryManFormik.setFieldValue(
                                                                    'additional_data',
                                                                    updatedAdditionalData
                                                                )
                                                            }}
                                                            initCountry={
                                                                configData?.country
                                                            }
                                                            touched={
                                                                deliveryManFormik
                                                                    .touched
                                                                    .additional_data?.[
                                                                    item
                                                                        .input_data
                                                                ]
                                                            }
                                                            errors={capitalize(
                                                                deliveryManFormik?.errors?.additional_data?.[
                                                                    item
                                                                        ?.input_data
                                                                ]
                                                                    ?.split('_')
                                                                    ?.join(' ')
                                                            )}
                                                            rtlChange="true"
                                                            borderradius="10px"
                                                            // lanDirection={lanDirection}
                                                            height="45px"
                                                        />
                                                    </Grid>
                                                </>
                                            )
                                        case 'date':
                                            return (
                                                <Grid item xs={12} key={index}>
                                                    <Box
                                                        sx={{
                                                            position:
                                                                'relative',
                                                            marginBottom:
                                                                '16px',
                                                        }}
                                                    >
                                                        <CustomTextFieldStyle
                                                            fullWidth
                                                            variant="outlined"
                                                            value={
                                                                deliveryManFormik
                                                                    ?.values
                                                                    ?.additional_data?.[
                                                                    item
                                                                        ?.input_data
                                                                ] || ''
                                                            }
                                                            borderRadius="10px"
                                                            onClick={() =>
                                                                toggleCalendar(
                                                                    item.input_data
                                                                )
                                                            } // Toggle calendar on click
                                                            placeholder="Date"
                                                            InputProps={{
                                                                readOnly: true, // Make it read-only to prevent manual input
                                                                style: {
                                                                    cursor: 'pointer',
                                                                },
                                                                endAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <CalendarTodayIcon
                                                                            sx={{
                                                                                color:
                                                                                    deliveryManFormik
                                                                                        .touched
                                                                                        .identity_number &&
                                                                                    !deliveryManFormik
                                                                                        .errors
                                                                                        .identity_number
                                                                                        ? theme
                                                                                              .palette
                                                                                              .primary
                                                                                              .main
                                                                                        : alpha(
                                                                                              theme
                                                                                                  .palette
                                                                                                  .neutral[400],
                                                                                              0.7
                                                                                          ),
                                                                                fontSize:
                                                                                    '18px',
                                                                            }}
                                                                        />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                        />

                                                        {/* Calendar for Date Selection */}
                                                        <Box
                                                            ref={(el) =>
                                                                (calendarRefs.current[
                                                                    item.input_data
                                                                ] = el)
                                                            }
                                                            sx={{
                                                                position:
                                                                    'absolute',
                                                                zIndex: 1000,
                                                            }}
                                                        >
                                                            {openCalendars[
                                                                item.input_data
                                                            ] && (
                                                                <Calendar
                                                                    date={
                                                                        deliveryManFormik
                                                                            ?.values
                                                                            ?.additional_data?.[
                                                                            item
                                                                                ?.input_data
                                                                        ]
                                                                            ? new Date(
                                                                                  deliveryManFormik.values.additional_data?.[
                                                                                      item?.input_data
                                                                                  ]
                                                                              )
                                                                            : new Date()
                                                                    } // Prefill with Formik value or current date
                                                                    onChange={(
                                                                        date
                                                                    ) =>
                                                                        handleDateChange(
                                                                            date,
                                                                            item.input_data
                                                                        )
                                                                    } // Handle date change
                                                                    color={(
                                                                        theme
                                                                    ) =>
                                                                        theme
                                                                            .palette
                                                                            .primary
                                                                    } // Primary color for the calendar selection
                                                                    showMonthAndYearPickers // Show month/year picker for easier navigation
                                                                />
                                                            )}
                                                        </Box>
                                                    </Box>

                                                    {deliveryManFormik.touched
                                                        .additional_data?.[
                                                        item.input_data
                                                    ] && (
                                                        <Typography
                                                            sx={{
                                                                mt: '-15px',
                                                                color: (
                                                                    theme
                                                                ) =>
                                                                    theme
                                                                        .palette
                                                                        .error
                                                                        .main,
                                                                fontSize:
                                                                    '12px',
                                                            }}
                                                        >
                                                            {capitalize(
                                                                deliveryManFormik.errors.additional_data?.[
                                                                    item
                                                                        .input_data
                                                                ]
                                                                    ?.split('_')
                                                                    ?.join(' ')
                                                            )}
                                                        </Typography>
                                                    )}
                                                </Grid>
                                            )
                                        case 'check_box':
                                            return (
                                                <Grid item xs={12} key={index}>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            color: (theme) =>
                                                                theme.palette
                                                                    .neutral[1000],
                                                            fontSize: '14px',
                                                        }}
                                                    >
                                                        {t(
                                                            item.input_data.replaceAll(
                                                                '_',
                                                                ' '
                                                            )
                                                        )}
                                                    </Typography>
                                                    <FormGroup>
                                                        {item.check_data.map(
                                                            (data, indx) => {
                                                                return (
                                                                    <FormControlLabel
                                                                        key={
                                                                            indx
                                                                        }
                                                                        required={
                                                                            item.is_required
                                                                        }
                                                                        sx={{
                                                                            '& .MuiFormControlLabel-asterisk':
                                                                                {
                                                                                    color: (
                                                                                        theme
                                                                                    ) =>
                                                                                        theme
                                                                                            .palette
                                                                                            .error
                                                                                            .main, // Change color to match the theme error color
                                                                                },
                                                                            '& .MuiFormControlLabel-label':
                                                                                {
                                                                                    fontSize:
                                                                                        '13px',
                                                                                    fontWeight:
                                                                                        'normal', // Adjust the font size here
                                                                                },

                                                                            color: (
                                                                                theme
                                                                            ) =>
                                                                                theme
                                                                                    .palette
                                                                                    .neutral[1000],
                                                                        }}
                                                                        control={
                                                                            <Checkbox
                                                                                size="small"
                                                                                checked={
                                                                                    deliveryManFormik.values.additional_data?.[
                                                                                        item
                                                                                            .input_data
                                                                                    ]?.includes(
                                                                                        data
                                                                                    ) ||
                                                                                    false
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) => {
                                                                                    const isChecked =
                                                                                        e
                                                                                            .target
                                                                                            .checked
                                                                                    const fieldName = `additional_data.${item.input_data}`

                                                                                    if (
                                                                                        isChecked
                                                                                    ) {
                                                                                        // Add `data` to the array if checked
                                                                                        deliveryManFormik.setFieldValue(
                                                                                            fieldName,
                                                                                            [
                                                                                                ...(deliveryManFormik
                                                                                                    .values
                                                                                                    .additional_data?.[
                                                                                                    item
                                                                                                        .input_data
                                                                                                ] ||
                                                                                                    []),
                                                                                                data,
                                                                                            ]
                                                                                        )
                                                                                    } else {
                                                                                        // Remove `data` from the array if unchecked
                                                                                        deliveryManFormik.setFieldValue(
                                                                                            fieldName,
                                                                                            deliveryManFormik.values.additional_data?.[
                                                                                                item
                                                                                                    .input_data
                                                                                            ]?.filter(
                                                                                                (
                                                                                                    item
                                                                                                ) =>
                                                                                                    item !==
                                                                                                    data
                                                                                            ) ||
                                                                                                []
                                                                                        )
                                                                                    }
                                                                                }}
                                                                            />
                                                                        }
                                                                        label={
                                                                            data
                                                                        }
                                                                    />
                                                                )
                                                            }
                                                        )}
                                                    </FormGroup>
                                                </Grid>
                                            )
                                    }
                                }
                            )}
                        </Grid>
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        {newFileTypes?.map((item, index) => {
                            switch (item.field_type) {
                                case 'file':
                                    return (
                                        <>
                                            <Stack
                                                key={index}
                                                alignItems="start"
                                                justifyContent="flex-start"
                                                spacing={2}
                                                sx={{ mb: '20px' }}
                                            >
                                                <Stack
                                                    direction="row"
                                                    width="100%"
                                                    spacing={1}
                                                    alignItems="center"
                                                    gap="5px"
                                                >
                                                    <InputLabel
                                                        required={
                                                            item.field_type
                                                                .required
                                                        }
                                                        sx={{
                                                            fontWeight: '600',
                                                            fontSize: '14px',
                                                            color: (theme) =>
                                                                theme.palette
                                                                    .neutral[500],
                                                        }}
                                                    >
                                                        {t(
                                                            capitalize(
                                                                item.input_data.replaceAll(
                                                                    '_',
                                                                    ' '
                                                                )
                                                            )
                                                        )}
                                                    </InputLabel>
                                                    <Typography
                                                        fontSize="12px"
                                                        sx={{
                                                            color: (theme) =>
                                                                theme.palette
                                                                    .neutral[400],
                                                        }}
                                                    >
                                                        {t(
                                                            'pdf, doc Less Than 1MB'
                                                        )}
                                                    </Typography>
                                                </Stack>
                                                {item.media_data
                                                    ?.upload_multiple_files ===
                                                0 ? (
                                                    <>
                                                        <Box
                                                            sx={{
                                                                width: {
                                                                    xs: '100%',
                                                                    md: '8.75rem',
                                                                },
                                                            }}
                                                        >
                                                            <ImageUploaderWithPreview
                                                                type="file"
                                                                labelText={t(
                                                                    'Click to upload'
                                                                )}
                                                                file={
                                                                    (deliveryManFormik
                                                                        ?.values?.[
                                                                        item
                                                                            .input_data
                                                                    ] &&
                                                                        deliveryManFormik
                                                                            ?.values?.[
                                                                            item
                                                                                .input_data
                                                                        ]) ||
                                                                    ''
                                                                }
                                                                onChange={
                                                                    // singleFileUploadHandlerForImage
                                                                    (value) => {
                                                                        singleFileUploadHandlerForImage(
                                                                            value,
                                                                            index,
                                                                            item.input_data
                                                                        )
                                                                    }
                                                                }
                                                                imageOnChange={
                                                                    imageOnchangeHandlerForImage
                                                                }
                                                                width="8.75rem"
                                                                height="100px"
                                                                error={
                                                                    deliveryManFormik
                                                                        .errors
                                                                        .additional_documents
                                                                }
                                                                acceptedFileInput={
                                                                    acceptedFileInputFormat.formatsForSingle
                                                                }
                                                            />
                                                        </Box>
                                                    </>
                                                ) : (
                                                    <>
                                                        <MultiFileUploader
                                                            delivery
                                                            fileImagesHandler={(
                                                                value
                                                            ) => {
                                                                // When files are uploaded, set the files in the corresponding Formik field
                                                                deliveryManFormik.setFieldValue(
                                                                    `${item.input_data}`,
                                                                    value
                                                                )
                                                            }}
                                                            totalFiles={
                                                                (deliveryManFormik
                                                                    ?.values?.[
                                                                    item
                                                                        .input_data
                                                                ] &&
                                                                    deliveryManFormik
                                                                        ?.values?.[
                                                                        item
                                                                            .input_data
                                                                    ]) ||
                                                                ''
                                                            }
                                                            maxFileSize={
                                                                20000000
                                                            }
                                                            supportedFileFormats={
                                                                supportedFormatMultiImages
                                                            }
                                                            acceptedFileInput={
                                                                acceptedFileInputFormat.formatsForMultiple
                                                            }
                                                            width="8.75rem"
                                                            height="100px"
                                                            gridControl="true"
                                                        />
                                                    </>
                                                )}
                                            </Stack>
                                        </>
                                    )
                            }
                        })}
                    </Grid>
                </Grid>
            </CustomBoxFullWidth>
        </>
    )
}

export default AdditionalInformation
