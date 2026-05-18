import {
    CustomBoxFullWidth,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import {
    alpha,
    Box,
    Checkbox,
    FormControlLabel,
    FormGroup,
    FormLabel,
    Grid,
    InputAdornment,
    Stack,
    TextField,
    InputLabel,
    Typography,
    IconButton,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DescriptionIcon from '@mui/icons-material/Description'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import React, { useEffect, useRef, useState } from 'react'
import { useTheme } from '@emotion/react'
import CustomTextFieldWithFormik from '../form-fields/CustomTextFieldWithFormik'
import { t } from 'i18next'
import Groups2Icon from '@mui/icons-material/Groups2'

import MultiFileUploader from '../multi-file-uploader/MultiFileUploader'
import { capitalize } from '@/utils/capitalize'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import CustomPhoneInput from '../CustomPhoneInput'

import { getAcceptedFileInputFormat } from '@/utils/getAcceptedFileInputFormat'
import { Calendar } from 'react-date-range'
import { format } from 'date-fns'
import { CustomTextFieldStyle } from '../form-fields/CustomTextField.style'
import { formatPhoneNumber } from '@/utils/customFunctions'
import toast from 'react-hot-toast'

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
    additionalImage,
    setAdditionalImage,
}) => {
    const theme = useTheme()

    const fileInputRef = useRef(null)
    const [targetField, setTargetField] = useState({
        key: null,
        index: null,
        isMulti: false,
    })

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (file && targetField.key) {
            const fileExtension = file.name.split('.').pop().toLowerCase()
            const allowedExtensions = [
                'jpg',
                'jpeg',
                'png',
                'gif',
                'pdf',
                'doc',
                'docx',
                'webp',
            ]
            if (!allowedExtensions.includes(fileExtension)) {
                toast.error(t('Invalid file type'))
                return
            }
            if (file.size > 1000000) {
                toast.error(t('File must be less than 1MB'))
                return
            }

            if (targetField.isMulti) {
                const currentFiles =
                    RestaurantJoinFormik.values?.[targetField.key] || []
                let newFiles = Array.isArray(currentFiles)
                    ? [...currentFiles]
                    : []

                if (targetField.index !== null && targetField.index >= 0) {
                    // Replace existing file
                    newFiles[targetField.index] = file
                } else {
                    // Add new file
                    newFiles.push(file)
                }

                RestaurantJoinFormik.setFieldValue(targetField.key, newFiles)
            } else {
                // Single file upload
                RestaurantJoinFormik.setFieldValue(targetField.key, file)
            }

            setTargetField({ key: null, index: null, isMulti: false })
        }
    }

    const triggerFileSelect = (key, index = null, isMulti = false) => {
        setTargetField({ key, index, isMulti })
        setTimeout(() => {
            fileInputRef.current.click()
        }, 0)
    }

    const singleFileUploadHandlerForImage = (value, index, inputData) => {
        const file = value.currentTarget.files[0]

        if (file) {
            const fileExtension = file.name.split('.').pop().toLowerCase()
            const allowedExtensions = [
                'jpg',
                'jpeg',
                'png',
                'gif',
                'pdf',
                'doc',
                'docx',
                'webp',
            ]
            if (!allowedExtensions.includes(fileExtension)) {
                toast.error(t('Invalid file type'))
                return
            }
            // Dynamically set the field value in Formik
            if (file.size > 1000000) {
                toast.error(t('File must be less than 1MB'))
                return
            }
            RestaurantJoinFormik.setFieldValue(inputData, file)
        }
    }

    const imageOnchangeHandlerForImage = (value) => {
        setAdditionalImage(value)
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
            <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".pdf, .doc, .docx, .jpg, .jpeg, .png, .gif"
                onChange={handleFileUpload}
            />
            <CustomBoxFullWidth key={additionalDataKey}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <CustomStackFullWidth
                            sx={{
                                backgroundColor: theme.palette.neutral[200],
                                borderRadius: '8px',
                                px: { xs: '12px !important', md: '1.25rem' },
                                pt: '1.5rem',
                                pb: {
                                    xs: '5px !important',
                                    md: '1rem',
                                },
                            }}
                        >
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
                                                            md={6}
                                                            key={index}
                                                        >
                                                            <CustomTextFieldWithFormik
                                                                required
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
                                                                        ?.split(
                                                                            '_'
                                                                        )
                                                                        ?.join(
                                                                            ' '
                                                                        )
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
                                                            md={6}
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
                                                                        ?.split(
                                                                            '_'
                                                                        )
                                                                        ?.join(
                                                                            ' '
                                                                        )
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
                                                    <Grid
                                                        item
                                                        xs={12}
                                                        md={6}
                                                        key={index}
                                                    >
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
                                                                    endAdornment:
                                                                        (
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
                                                                    item
                                                                        .input_data
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
                                                                            ?.split(
                                                                                '_'
                                                                            )
                                                                            ?.join(
                                                                                ' '
                                                                            )
                                                                    )}
                                                                </Typography>
                                                            )}
                                                    </Grid>
                                                )
                                            case 'check_box':
                                                return (
                                                    <Grid
                                                        item
                                                        xs={12}
                                                        md={6}
                                                        key={index}
                                                    >
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                color: (
                                                                    theme
                                                                ) =>
                                                                    theme
                                                                        .palette
                                                                        .neutral[1000],
                                                                fontSize:
                                                                    '14px',
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
                                                                (
                                                                    data,
                                                                    indx
                                                                ) => {
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
                        </CustomStackFullWidth>
                    </Grid>
                    <Grid item xs={12}>
                        <CustomStackFullWidth
                            sx={{
                                backgroundColor: theme.palette.neutral[200],
                                borderRadius: '8px',
                                padding: '1rem',
                            }}
                        >
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
                                                                fontWeight:
                                                                    '600',
                                                                color: (
                                                                    theme
                                                                ) =>
                                                                    theme
                                                                        .palette
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
                                                            )}{' '}
                                                            <span
                                                                style={{
                                                                    color: 'red',
                                                                    fontSize:
                                                                        '12px',
                                                                }}
                                                            >
                                                                *
                                                            </span>
                                                        </InputLabel>
                                                        <Typography
                                                            fontSize="12px"
                                                            sx={{
                                                                color: (
                                                                    theme
                                                                ) =>
                                                                    theme
                                                                        .palette
                                                                        .neutral[1000],
                                                            }}
                                                        >
                                                            {t(
                                                                'pdf, doc,image Less Than 1MB'
                                                            )}
                                                        </Typography>
                                                    </Stack>
                                                    {item.media_data
                                                        ?.upload_multiple_files ===
                                                        0 ? (
                                                        <>
                                                            <>
                                                                <Stack
                                                                    direction="row"
                                                                    flexWrap="wrap"
                                                                    gap={2}
                                                                    width="100%"
                                                                >
                                                                    {RestaurantJoinFormik
                                                                        .values?.[
                                                                        item
                                                                            .input_data
                                                                    ] ? (
                                                                        (() => {
                                                                            const file =
                                                                                RestaurantJoinFormik
                                                                                    .values[
                                                                                item
                                                                                    .input_data
                                                                                ]
                                                                            const isImage =
                                                                                file?.type?.startsWith(
                                                                                    'image/'
                                                                                ) ||
                                                                                (typeof file ===
                                                                                    'string' &&
                                                                                    (file.endsWith(
                                                                                        '.jpg'
                                                                                    ) ||
                                                                                        file.endsWith(
                                                                                            '.png'
                                                                                        ) ||
                                                                                        file.endsWith(
                                                                                            '.jpeg'
                                                                                        )))
                                                                            const fileName =
                                                                                file?.name ||
                                                                                (typeof file ===
                                                                                    'string'
                                                                                    ? file
                                                                                        .split(
                                                                                            '/'
                                                                                        )
                                                                                        .pop()
                                                                                    : 'Unknown File')
                                                                            const fileUrl =
                                                                                typeof file ===
                                                                                    'string'
                                                                                    ? file
                                                                                    : URL.createObjectURL(
                                                                                        file
                                                                                    )

                                                                            return (
                                                                                <Box
                                                                                    sx={{
                                                                                        width: '100%',
                                                                                        maxWidth:
                                                                                        {
                                                                                            xs: '100%',
                                                                                            md: '200px',
                                                                                        },
                                                                                        height: '100px',
                                                                                        border: '1px solid #ccc',
                                                                                        borderRadius:
                                                                                            '8px',
                                                                                        position:
                                                                                            'relative',
                                                                                        overflow:
                                                                                            'hidden',
                                                                                        backgroundColor:
                                                                                            (
                                                                                                theme
                                                                                            ) =>
                                                                                                theme
                                                                                                    .palette
                                                                                                    .background
                                                                                                    .paper,
                                                                                    }}
                                                                                >
                                                                                    <IconButton
                                                                                        size="small"
                                                                                        onClick={() =>
                                                                                            triggerFileSelect(
                                                                                                item.input_data,
                                                                                                null,
                                                                                                false
                                                                                            )
                                                                                        }
                                                                                        sx={{
                                                                                            position:
                                                                                                'absolute',
                                                                                            top: 5,
                                                                                            right: 5,
                                                                                            backgroundColor:
                                                                                                (
                                                                                                    theme
                                                                                                ) =>
                                                                                                    theme
                                                                                                        .palette
                                                                                                        .primary
                                                                                                        .main,
                                                                                            color: '#fff',
                                                                                            zIndex: 10,
                                                                                            '&:hover':
                                                                                            {
                                                                                                backgroundColor:
                                                                                                    (
                                                                                                        theme
                                                                                                    ) =>
                                                                                                        theme
                                                                                                            .palette
                                                                                                            .primary
                                                                                                            .dark,
                                                                                            },
                                                                                        }}
                                                                                    >
                                                                                        <EditIcon fontSize="small" />
                                                                                    </IconButton>

                                                                                    {isImage ? (
                                                                                        <Box
                                                                                            sx={{
                                                                                                width: '100%',
                                                                                                height: '100%',
                                                                                                display:
                                                                                                    'flex',
                                                                                                alignItems:
                                                                                                    'center',
                                                                                                justifyContent:
                                                                                                    'center',
                                                                                            }}
                                                                                            onClick={() =>
                                                                                                triggerFileSelect(
                                                                                                    item.input_data,
                                                                                                    null,
                                                                                                    false
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <img
                                                                                                src={
                                                                                                    fileUrl
                                                                                                }
                                                                                                alt={
                                                                                                    fileName
                                                                                                }
                                                                                                style={{
                                                                                                    width: '100%',
                                                                                                    height: '100%',
                                                                                                    objectFit:
                                                                                                        'cover',
                                                                                                }}
                                                                                            />
                                                                                        </Box>
                                                                                    ) : (
                                                                                        <Stack
                                                                                            height="100%"
                                                                                            justifyContent="space-between"
                                                                                            onClick={() =>
                                                                                                window.open(
                                                                                                    fileUrl,
                                                                                                    '_blank'
                                                                                                )
                                                                                            }
                                                                                            sx={{
                                                                                                cursor: 'pointer',
                                                                                            }}
                                                                                        >
                                                                                            <Box
                                                                                                sx={{
                                                                                                    height: '60%',
                                                                                                    backgroundColor:
                                                                                                        (
                                                                                                            theme
                                                                                                        ) =>
                                                                                                            theme
                                                                                                                .palette
                                                                                                                .neutral[200],
                                                                                                    display:
                                                                                                        'flex',
                                                                                                    alignItems:
                                                                                                        'center',
                                                                                                    justifyContent:
                                                                                                        'center',
                                                                                                }}
                                                                                            >
                                                                                                {file?.type ===
                                                                                                    'application/pdf' ||
                                                                                                    (typeof file ===
                                                                                                        'string' &&
                                                                                                        file.endsWith(
                                                                                                            '.pdf'
                                                                                                        )) ? (
                                                                                                    <>
                                                                                                        <embed
                                                                                                            src={
                                                                                                                fileUrl
                                                                                                            }
                                                                                                            type="application/pdf"
                                                                                                            width="100%"
                                                                                                            height="100%"
                                                                                                            style={{
                                                                                                                pointerEvents:
                                                                                                                    'none',
                                                                                                            }}
                                                                                                        />
                                                                                                        <Box
                                                                                                            sx={{
                                                                                                                position:
                                                                                                                    'absolute',
                                                                                                                top: 0,
                                                                                                                left: 0,
                                                                                                                width: '100%',
                                                                                                                height: '100%',
                                                                                                                backgroundColor:
                                                                                                                    'rgba(0, 0, 0, 0.1)',
                                                                                                            }}
                                                                                                        />
                                                                                                    </>
                                                                                                ) : (
                                                                                                    <DescriptionIcon
                                                                                                        sx={{
                                                                                                            fontSize:
                                                                                                                '40px',
                                                                                                            color: (
                                                                                                                theme
                                                                                                            ) =>
                                                                                                                theme
                                                                                                                    .palette
                                                                                                                    .neutral[500],
                                                                                                        }}
                                                                                                    />
                                                                                                )}
                                                                                            </Box>
                                                                                            <Stack
                                                                                                direction="row"
                                                                                                alignItems="center"
                                                                                                spacing={
                                                                                                    1
                                                                                                }
                                                                                                p={
                                                                                                    0.5
                                                                                                }
                                                                                                sx={{
                                                                                                    backgroundColor:
                                                                                                        (
                                                                                                            theme
                                                                                                        ) =>
                                                                                                            theme
                                                                                                                .palette
                                                                                                                .neutral[100],
                                                                                                    height: '40%',
                                                                                                    position:
                                                                                                        'relative',
                                                                                                    zIndex: 1,
                                                                                                }}
                                                                                            >
                                                                                                <DescriptionIcon
                                                                                                    sx={{
                                                                                                        fontSize:
                                                                                                            '16px',
                                                                                                        color: (
                                                                                                            theme
                                                                                                        ) =>
                                                                                                            theme
                                                                                                                .palette
                                                                                                                .neutral[400],
                                                                                                    }}
                                                                                                />
                                                                                                <Box overflow="hidden">
                                                                                                    <Typography
                                                                                                        fontSize="10px"
                                                                                                        fontWeight="600"
                                                                                                        noWrap
                                                                                                        title={
                                                                                                            fileName
                                                                                                        }
                                                                                                    >
                                                                                                        {
                                                                                                            fileName
                                                                                                        }
                                                                                                    </Typography>
                                                                                                    <Typography
                                                                                                        fontSize="9px"
                                                                                                        color="text.secondary"
                                                                                                    >
                                                                                                        {t(
                                                                                                            'Click to view'
                                                                                                        )}
                                                                                                    </Typography>
                                                                                                </Box>
                                                                                            </Stack>
                                                                                        </Stack>
                                                                                    )}
                                                                                </Box>
                                                                            )
                                                                        })()
                                                                    ) : (
                                                                        <Box
                                                                            onClick={() =>
                                                                                triggerFileSelect(
                                                                                    item.input_data,
                                                                                    null,
                                                                                    false
                                                                                )
                                                                            }
                                                                            sx={{
                                                                                width: '100%',
                                                                                maxWidth:
                                                                                {
                                                                                    xs: '100%',
                                                                                    md: '200px',
                                                                                },
                                                                                height: '100px',
                                                                                border: '2px dashed #aaa',
                                                                                borderRadius:
                                                                                    '8px',
                                                                                display:
                                                                                    'flex',
                                                                                flexDirection:
                                                                                    'column',
                                                                                alignItems:
                                                                                    'center',
                                                                                justifyContent:
                                                                                    'center',
                                                                                cursor: 'pointer',
                                                                                backgroundColor:
                                                                                    (
                                                                                        theme
                                                                                    ) =>
                                                                                        theme
                                                                                            .palette
                                                                                            .neutral[100],
                                                                                '&:hover':
                                                                                {
                                                                                    backgroundColor:
                                                                                        (
                                                                                            theme
                                                                                        ) =>
                                                                                            theme
                                                                                                .palette
                                                                                                .neutral[200],
                                                                                    borderColor:
                                                                                        (
                                                                                            theme
                                                                                        ) =>
                                                                                            theme
                                                                                                .palette
                                                                                                .primary
                                                                                                .main,
                                                                                },
                                                                            }}
                                                                        >
                                                                            <CloudUploadIcon
                                                                                sx={{
                                                                                    color: (
                                                                                        theme
                                                                                    ) =>
                                                                                        theme
                                                                                            .palette
                                                                                            .neutral[400],
                                                                                    fontSize:
                                                                                        '30px',
                                                                                }}
                                                                            />
                                                                            <Typography
                                                                                fontSize="12px"
                                                                                color="text.secondary"
                                                                            >
                                                                                {t(
                                                                                    'Select a file'
                                                                                )}
                                                                            </Typography>

                                                                        </Box>
                                                                    )}
                                                                </Stack>
                                                            </>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <input
                                                                ref={
                                                                    fileInputRef
                                                                }
                                                                type="file"
                                                                hidden
                                                                accept=".pdf, .doc, .docx, .jpg, .jpeg, .png, .gif"
                                                                onChange={
                                                                    handleFileUpload
                                                                }
                                                            />
                                                            <Stack
                                                                direction="row"
                                                                flexWrap="wrap"
                                                                gap={2}
                                                                width="100%"
                                                            >
                                                                {/* Upload Box */}
                                                                <Box
                                                                    onClick={() =>
                                                                        triggerFileSelect(
                                                                            item.input_data,
                                                                            null,
                                                                            true
                                                                        )
                                                                    }
                                                                    sx={{
                                                                        width: '100%',
                                                                        maxWidth:
                                                                        {
                                                                            xs: '100%',
                                                                            md: '200px',
                                                                        },
                                                                        height: '100px',
                                                                        border: '2px dashed #aaa',
                                                                        borderRadius:
                                                                            '8px',
                                                                        display:
                                                                            'flex',
                                                                        flexDirection:
                                                                            'column',
                                                                        alignItems:
                                                                            'center',
                                                                        justifyContent:
                                                                            'center',
                                                                        cursor: 'pointer',
                                                                        backgroundColor:
                                                                            (
                                                                                theme
                                                                            ) =>
                                                                                theme
                                                                                    .palette
                                                                                    .neutral[100],
                                                                        '&:hover':
                                                                        {
                                                                            backgroundColor:
                                                                                (
                                                                                    theme
                                                                                ) =>
                                                                                    theme
                                                                                        .palette
                                                                                        .neutral[200],
                                                                            borderColor:
                                                                                (
                                                                                    theme
                                                                                ) =>
                                                                                    theme
                                                                                        .palette
                                                                                        .primary
                                                                                        .main,
                                                                        },
                                                                    }}
                                                                >
                                                                    <CloudUploadIcon
                                                                        sx={{
                                                                            color: (
                                                                                theme
                                                                            ) =>
                                                                                theme
                                                                                    .palette
                                                                                    .neutral[400],
                                                                            fontSize:
                                                                                '30px',
                                                                        }}
                                                                    />
                                                                    <Typography
                                                                        fontSize="12px"
                                                                        color="text.secondary"
                                                                    >
                                                                        {t(
                                                                            'Select a file'
                                                                        )}
                                                                    </Typography>

                                                                </Box>

                                                                {/* Render Uploaded Files */}
                                                                {RestaurantJoinFormik
                                                                    .values?.[
                                                                    item
                                                                        .input_data
                                                                ] &&
                                                                    Array.isArray(
                                                                        RestaurantJoinFormik
                                                                            .values[
                                                                        item
                                                                            .input_data
                                                                        ]
                                                                    ) &&
                                                                    RestaurantJoinFormik.values[
                                                                        item
                                                                            .input_data
                                                                    ].map(
                                                                        (
                                                                            file,
                                                                            fileIndex
                                                                        ) => {
                                                                            const isImage =
                                                                                file?.type?.startsWith(
                                                                                    'image/'
                                                                                ) ||
                                                                                (typeof file ===
                                                                                    'string' &&
                                                                                    (file.endsWith(
                                                                                        '.jpg'
                                                                                    ) ||
                                                                                        file.endsWith(
                                                                                            '.png'
                                                                                        ) ||
                                                                                        file.endsWith(
                                                                                            '.jpeg'
                                                                                        )))
                                                                            const fileName =
                                                                                file?.name ||
                                                                                (typeof file ===
                                                                                    'string'
                                                                                    ? file
                                                                                        .split(
                                                                                            '/'
                                                                                        )
                                                                                        .pop()
                                                                                    : 'Unknown File')
                                                                            const fileUrl =
                                                                                typeof file ===
                                                                                    'string'
                                                                                    ? file
                                                                                    : URL.createObjectURL(
                                                                                        file
                                                                                    )

                                                                            return (
                                                                                <Box
                                                                                    key={
                                                                                        fileIndex
                                                                                    }
                                                                                    sx={{
                                                                                        width: '100%',
                                                                                        maxWidth:
                                                                                        {
                                                                                            xs: '100%',
                                                                                            md: '200px',
                                                                                        },
                                                                                        height: '100px',
                                                                                        border: '1px solid #ccc',
                                                                                        borderRadius:
                                                                                            '8px',
                                                                                        position:
                                                                                            'relative',
                                                                                        overflow:
                                                                                            'hidden',
                                                                                        backgroundColor:
                                                                                            (
                                                                                                theme
                                                                                            ) =>
                                                                                                theme
                                                                                                    .palette
                                                                                                    .background
                                                                                                    .paper,
                                                                                    }}
                                                                                >
                                                                                    <IconButton
                                                                                        size="small"
                                                                                        onClick={() =>
                                                                                            triggerFileSelect(
                                                                                                item.input_data,
                                                                                                fileIndex,
                                                                                                true
                                                                                            )
                                                                                        }
                                                                                        sx={{
                                                                                            position:
                                                                                                'absolute',
                                                                                            top: 5,
                                                                                            right: 5,
                                                                                            backgroundColor:
                                                                                                (
                                                                                                    theme
                                                                                                ) =>
                                                                                                    theme
                                                                                                        .palette
                                                                                                        .primary
                                                                                                        .main,
                                                                                            color: '#fff',
                                                                                            zIndex: 10,
                                                                                            '&:hover':
                                                                                            {
                                                                                                backgroundColor:
                                                                                                    (
                                                                                                        theme
                                                                                                    ) =>
                                                                                                        theme
                                                                                                            .palette
                                                                                                            .primary
                                                                                                            .dark,
                                                                                            },
                                                                                        }}
                                                                                    >
                                                                                        <EditIcon fontSize="small" />
                                                                                    </IconButton>

                                                                                    {isImage ? (
                                                                                        <Box
                                                                                            sx={{
                                                                                                width: '100%',
                                                                                                height: '100%',
                                                                                                display:
                                                                                                    'flex',
                                                                                                alignItems:
                                                                                                    'center',
                                                                                                justifyContent:
                                                                                                    'center',
                                                                                            }}
                                                                                            onClick={() =>
                                                                                                triggerFileSelect(
                                                                                                    item.input_data,
                                                                                                    fileIndex,
                                                                                                    true
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <img
                                                                                                src={
                                                                                                    fileUrl
                                                                                                }
                                                                                                alt={
                                                                                                    fileName
                                                                                                }
                                                                                                style={{
                                                                                                    width: '100%',
                                                                                                    height: '100%',
                                                                                                    objectFit:
                                                                                                        'cover',
                                                                                                }}
                                                                                            />
                                                                                        </Box>
                                                                                    ) : (
                                                                                        <Stack
                                                                                            height="100%"
                                                                                            justifyContent="space-between"
                                                                                            onClick={() =>
                                                                                                window.open(
                                                                                                    fileUrl,
                                                                                                    '_blank'
                                                                                                )
                                                                                            }
                                                                                            sx={{
                                                                                                cursor: 'pointer',
                                                                                            }}
                                                                                        >
                                                                                            <Box
                                                                                                sx={{
                                                                                                    height: '60%',
                                                                                                    backgroundColor:
                                                                                                        (
                                                                                                            theme
                                                                                                        ) =>
                                                                                                            theme
                                                                                                                .palette
                                                                                                                .neutral[200],
                                                                                                    display:
                                                                                                        'flex',
                                                                                                    alignItems:
                                                                                                        'center',
                                                                                                    justifyContent:
                                                                                                        'center',
                                                                                                }}
                                                                                            >
                                                                                                {file?.type ===
                                                                                                    'application/pdf' ||
                                                                                                    (typeof file ===
                                                                                                        'string' &&
                                                                                                        file.endsWith(
                                                                                                            '.pdf'
                                                                                                        )) ? (
                                                                                                    <>
                                                                                                        <embed
                                                                                                            src={
                                                                                                                fileUrl
                                                                                                            }
                                                                                                            type="application/pdf"
                                                                                                            width="100%"
                                                                                                            height="100%"
                                                                                                            style={{
                                                                                                                pointerEvents:
                                                                                                                    'none',
                                                                                                            }}
                                                                                                        />
                                                                                                        <Box
                                                                                                            sx={{
                                                                                                                position:
                                                                                                                    'absolute',
                                                                                                                top: 0,
                                                                                                                left: 0,
                                                                                                                width: '100%',
                                                                                                                height: '100%',
                                                                                                                backgroundColor:
                                                                                                                    'rgba(0, 0, 0, 0.1)',
                                                                                                            }}
                                                                                                        />
                                                                                                    </>
                                                                                                ) : (
                                                                                                    <DescriptionIcon
                                                                                                        sx={{
                                                                                                            fontSize:
                                                                                                                '40px',
                                                                                                            color: (
                                                                                                                theme
                                                                                                            ) =>
                                                                                                                theme
                                                                                                                    .palette
                                                                                                                    .neutral[500],
                                                                                                        }}
                                                                                                    />
                                                                                                )}
                                                                                            </Box>
                                                                                            <Stack
                                                                                                direction="row"
                                                                                                alignItems="center"
                                                                                                spacing={
                                                                                                    1
                                                                                                }
                                                                                                p={
                                                                                                    0.5
                                                                                                }
                                                                                                sx={{
                                                                                                    backgroundColor:
                                                                                                        (
                                                                                                            theme
                                                                                                        ) =>
                                                                                                            theme
                                                                                                                .palette
                                                                                                                .neutral[100],
                                                                                                    height: '40%',
                                                                                                    position:
                                                                                                        'relative',
                                                                                                    zIndex: 1,
                                                                                                }}
                                                                                            >
                                                                                                <DescriptionIcon
                                                                                                    sx={{
                                                                                                        fontSize:
                                                                                                            '16px',
                                                                                                        color: (
                                                                                                            theme
                                                                                                        ) =>
                                                                                                            theme
                                                                                                                .palette
                                                                                                                .neutral[400],
                                                                                                    }}
                                                                                                />
                                                                                                <Box overflow="hidden">
                                                                                                    <Typography
                                                                                                        fontSize="10px"
                                                                                                        fontWeight="600"
                                                                                                        noWrap
                                                                                                        title={
                                                                                                            fileName
                                                                                                        }
                                                                                                    >
                                                                                                        {
                                                                                                            fileName
                                                                                                        }
                                                                                                    </Typography>
                                                                                                    <Typography
                                                                                                        fontSize="9px"
                                                                                                        color="text.secondary"
                                                                                                    >
                                                                                                        {t(
                                                                                                            'Click to view'
                                                                                                        )}
                                                                                                    </Typography>
                                                                                                </Box>
                                                                                            </Stack>
                                                                                        </Stack>
                                                                                    )}
                                                                                </Box>
                                                                            )
                                                                        }
                                                                    )}
                                                            </Stack>
                                                        </>
                                                    )}
                                                </Stack>
                                            </>
                                        )
                                }
                            })}
                        </CustomStackFullWidth>
                    </Grid>
                </Grid>
            </CustomBoxFullWidth>
        </>
    )
}

export default StoreAdditionalInfo
