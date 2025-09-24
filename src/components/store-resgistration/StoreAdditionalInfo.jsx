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
    TextField,
    Typography,
} from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { useTheme } from '@emotion/react'
import CustomTextFieldWithFormik from '../form-fields/CustomTextFieldWithFormik'
import { t } from 'i18next'
import Groups2Icon from '@mui/icons-material/Groups2'
import TodayIcon from '@mui/icons-material/Today'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import ImageUploaderWithPreview from '../single-file-uploader-with-preview/ImageUploaderWithPreview'
import MultiFileUploader from '../multi-file-uploader/MultiFileUploader'
import { capitalize } from '@/utils/capitalize'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import moment from 'moment'
import { concat } from 'lodash'
import CustomPhoneInput from '../CustomPhoneInput'
import CustomDivider from '../CustomDivider'
import { getAcceptedFileInputFormat } from '@/utils/getAcceptedFileInputFormat'
import { Calendar } from 'react-date-range'
import { format } from 'date-fns'
import { CustomTextFieldStyle } from '../form-fields/CustomTextField.style'
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
const StoreAdditionalInfo = ({
                                 additionalDataKey,
                                 RestaurantJoinFormik,
                                 configData,
                                 identityHandler,
                                 identityNumberHandler,
                                 handleIdentityImageUpload,
                                 additionalImage,
                                 setAdditionalImage,
                                 handleFieldChange,
                             }) => {
    const theme = useTheme()
    // useEffect(() => {
    //     typeof additionalImage !== 'string' &&
    //         handleFieldChange('identity_image', additionalImage)
    // }, [additionalImage])

    const singleFileUploadHandlerForImage = (value, index, inputData) => {
        const file = value.currentTarget.files[0]
        // if (file) {
        //     // Retrieve the existing `additional_documents` array from Formik
        //     const existingFiles =
        //         RestaurantJoinFormik.values.additional_documents || []
        //     const files = [...existingFiles]
        //     files[index] = file

        //     RestaurantJoinFormik.setFieldValue('additional_documents', files)
        // }

        if (file) {
            // Dynamically set the field value in Formik
            RestaurantJoinFormik.setFieldValue(inputData, file)
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
        // setAdditionalImage(files)
        RestaurantJoinFormik.setFieldValue('additional_documents', [
            ...RestaurantJoinFormik.values.additional_documents,
            ...files,
        ])
    }

    useEffect(() => {
        if (additionalImage && Object.keys(additionalImage).length > 0) {
            // Iterate through configData and update Formik values
            configData?.restaurant_additional_join_us_page_data?.data.forEach(
                (item) => {
                    if (item.field_type === 'file') {
                        const fileData = additionalImage[item.input_data]
                        if (fileData) {
                            RestaurantJoinFormik.setFieldValue(
                                item.input_data,
                                fileData
                            )
                        }
                    }
                }
            )
        }
    }, [additionalImage, RestaurantJoinFormik, configData])
    const [selectedDate, setSelectedDate] = useState(null)

    // const handleDateChange = (date) => {
    //     setSelectedDate(moment(date?.$d).format('YYYY-MM-DD'))
    // }

    const newFileTypes =
        configData?.restaurant_additional_join_us_page_data?.data
            ?.filter((item) => item?.field_type === 'file')
            .map((item) => ({ ...item }))

    // Generate the accepted file input format

    const acceptedFileInputFormat = getAcceptedFileInputFormat(
        configData?.restaurant_additional_join_us_page_data?.data
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
            ...RestaurantJoinFormik.values.additional_data,
            [key]: formattedDate,
        }

        // Update Formik field dynamically
        RestaurantJoinFormik.setFieldValue(
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
            <CustomBoxFullWidth key={additionalDataKey}>
                {' '}
                <Typography
                    fontSize="18px"
                    fontWeight="500"
                    sx={{
                        color: (theme) => theme.palette.neutral[1000],
                        borderBottom: (theme) =>
                            `1px solid ${alpha(
                                theme.palette.neutral[400],
                                0.3
                            )}`,
                        p: '1rem',
                    }}
                >
                    {t('Additonal Info')}
                </Typography>
                <Grid container spacing={2} sx={{ padding: '1rem' }}>
                    <Grid item xs={12} md={12} align="left"></Grid>
                    <Grid item xs={12} lg={6}>
                        <Grid container spacing={2}>
                            {configData?.restaurant_additional_join_us_page_data?.data?.map(
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
                                                                RestaurantJoinFormik
                                                                    .touched
                                                                    .additional_data?.[
                                                                    item
                                                                        .input_data
                                                                    ]
                                                            }
                                                            errors={capitalize(
                                                                RestaurantJoinFormik.errors.additional_data?.[
                                                                    item
                                                                        ?.input_data
                                                                    ]
                                                                    ?.split('_')
                                                                    ?.join(' ')
                                                            )}
                                                            fieldProps={RestaurantJoinFormik.getFieldProps(
                                                                `additional_data.${item.input_data}` // Dynamically set the key
                                                            )}
                                                            onChangeHandler={(
                                                                value
                                                            ) => {
                                                                const updatedAdditionalData =
                                                                    {
                                                                        ...RestaurantJoinFormik
                                                                            .values
                                                                            .additional_data,
                                                                        [item.input_data]:
                                                                        value,
                                                                    }

                                                                RestaurantJoinFormik.setFieldValue(
                                                                    'additional_data',
                                                                    updatedAdditionalData
                                                                )
                                                            }}
                                                            value={
                                                                // Display the value dynamically from additional_data using item.input_data as the key
                                                                RestaurantJoinFormik
                                                                    .values
                                                                    .additional_data?.[
                                                                    item
                                                                        .input_data
                                                                    ]
                                                            }
                                                            fontSize="12px"
                                                            startIcon={
                                                                <InputAdornment position="start">
                                                                    <Groups2Icon
                                                                        sx={{
                                                                            color:
                                                                                RestaurantJoinFormik
                                                                                    .touched
                                                                                    .identity_number &&
                                                                                !RestaurantJoinFormik
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
                                                    >
                                                        <CustomPhoneInput
                                                            placeholder={
                                                                item.placeholder_data
                                                            }
                                                            value={
                                                                RestaurantJoinFormik
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
                                                                        ...RestaurantJoinFormik
                                                                            .values
                                                                            .additional_data,
                                                                        [item.input_data]:
                                                                            formatPhoneNumber(
                                                                                value
                                                                            ),
                                                                    }

                                                                RestaurantJoinFormik.setFieldValue(
                                                                    'additional_data',
                                                                    updatedAdditionalData
                                                                )
                                                            }}
                                                            initCountry={
                                                                configData?.country
                                                            }
                                                            touched={
                                                                RestaurantJoinFormik
                                                                    .touched
                                                                    .additional_data?.[
                                                                    item
                                                                        .input_data
                                                                    ]
                                                            }
                                                            errors={capitalize(
                                                                RestaurantJoinFormik?.errors?.additional_data?.[
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
                                                    {/* <LocalizationProvider
                                                        dateAdapter={
                                                            AdapterDayjs
                                                        }
                                                    >
                                                        <DatePicker
                                                            label={capitalize(
                                                                item.input_data.replaceAll(
                                                                    '_',
                                                                    ' '
                                                                )
                                                            )}
                                                            inputFormat="MM/DD/YYYY"
                                                            value={
                                                                (RestaurantJoinFormik
                                                                    ?.values
                                                                    .additional_data?.[
                                                                    item
                                                                        ?.input_data
                                                                ] &&
                                                                    dayjs(
                                                                        RestaurantJoinFormik
                                                                            ?.values
                                                                            .additional_data?.[
                                                                            item
                                                                                ?.input_data
                                                                        ]
                                                                    )) ||
                                                                null
                                                            }
                                                            onChange={(
                                                                date
                                                            ) => {
                                                                const updatedAdditionalData =
                                                                    {
                                                                        ...RestaurantJoinFormik
                                                                            .values
                                                                            .additional_data,
                                                                        [item.input_data]:
                                                                            moment(
                                                                                date?.$d
                                                                            ).format(
                                                                                'YYYY-MM-DD'
                                                                            ),
                                                                    }

                                                                RestaurantJoinFormik.setFieldValue(
                                                                    'additional_data',
                                                                    updatedAdditionalData
                                                                )

                                                                setSelectedDate(
                                                                    moment(
                                                                        date?.$d
                                                                    ).format(
                                                                        'YYYY-MM-DD'
                                                                    )
                                                                )
                                                            }}
                                                            sx={{
                                                                width: '100%',
                                                                color: (
                                                                    theme
                                                                ) =>
                                                                    theme
                                                                        .palette
                                                                        .neutral[1000],
                                                                bgcolor: (
                                                                    theme
                                                                ) =>
                                                                    theme
                                                                        .palette
                                                                        .neutral[100],
                                                                borderRadius:
                                                                    '10px',
                                                            }}
                                                            renderInput={(
                                                                params
                                                            ) => (
                                                                <TextField
                                                                    {...params}
                                                                    fullWidth
                                                                    disabled
                                                                    // required={
                                                                    //     item.required
                                                                    // }
                                                                    variant="outlined"
                                                                    InputProps={{
                                                                        style: {
                                                                            height: '45px', // Set your desired height value here
                                                                        },
                                                                        endAdornment:
                                                                            (
                                                                                <IconButton
                                                                                    edge="end"
                                                                                    onClick={
                                                                                        params.openPicker
                                                                                    }
                                                                                >
                                                                                    <TodayIcon />
                                                                                </IconButton>
                                                                            ),
                                                                    }}
                                                                />
                                                            )}

                                                            // shouldDisableDate={isDateDisabled}
                                                        />
                                                    </LocalizationProvider> */}
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
                                                                RestaurantJoinFormik
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
                                                                                    RestaurantJoinFormik
                                                                                        .touched
                                                                                        .identity_number &&
                                                                                    !RestaurantJoinFormik
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
                                                                        RestaurantJoinFormik
                                                                            ?.values
                                                                            ?.additional_data?.[
                                                                            item
                                                                                ?.input_data
                                                                            ]
                                                                            ? new Date(
                                                                                RestaurantJoinFormik.values.additional_data?.[
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

                                                    {RestaurantJoinFormik
                                                        .touched
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
                                                                RestaurantJoinFormik.errors.additional_data?.[
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
                                                                                    RestaurantJoinFormik.values.additional_data?.[
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
                                                                                        RestaurantJoinFormik.setFieldValue(
                                                                                            fieldName,
                                                                                            [
                                                                                                ...(RestaurantJoinFormik
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
                                                                                        RestaurantJoinFormik.setFieldValue(
                                                                                            fieldName,
                                                                                            RestaurantJoinFormik.values.additional_data?.[
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
                                            >
                                                <Stack
                                                    direction="row"
                                                    width="100%"
                                                    spacing={1}
                                                    alignItems="center"
                                                >
                                                    <InputLabel
                                                        required={
                                                            item.field_type
                                                                .required
                                                        }
                                                        sx={{
                                                            fontWeight: '600',
                                                            color: (theme) =>
                                                                theme.palette
                                                                    .neutral[1000],
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
                                                                    .neutral[1000],
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
                                                                    (RestaurantJoinFormik
                                                                            ?.values?.[
                                                                            item
                                                                                .input_data
                                                                            ] &&
                                                                        RestaurantJoinFormik
                                                                            ?.values?.[
                                                                            item
                                                                                ?.input_data
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
                                                                    RestaurantJoinFormik
                                                                        .errors
                                                                        .additional_documents
                                                                }
                                                                acceptedFileInput={
                                                                    acceptedFileInputFormat.formatsForSingle
                                                                }
                                                                // borderRadius={
                                                                //     borderRadius ??
                                                                //     '50%'
                                                                // }
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
                                                                RestaurantJoinFormik.setFieldValue(
                                                                    `${item.input_data}`,
                                                                    value
                                                                )
                                                            }}
                                                            totalFiles={
                                                                (RestaurantJoinFormik
                                                                        ?.values?.[
                                                                        item
                                                                            .input_data
                                                                        ] &&
                                                                    RestaurantJoinFormik
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
                                                            errorAlert="File is Required"
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

export default StoreAdditionalInfo