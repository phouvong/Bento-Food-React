import {
    alpha,
    Box,
    Grid,
    InputAdornment,
    Stack,
    Typography,
} from '@mui/material'

import { t } from 'i18next'
import RoomIcon from '@mui/icons-material/Room'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import React, { useEffect, useRef, useState } from 'react'

import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import EmailIcon from '@mui/icons-material/Email'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import { DELIVERY_MAN_TYPE } from './constants'
import { useTheme } from '@emotion/react'
import InputLabel from '@mui/material/InputLabel'
import CustomTextFieldWithFormik from '../form-fields/CustomTextFieldWithFormik'
import CustomSelectWithFormik from '../custom-select/CustomSelectWithFormik'
import { CustomBoxFullWidth } from '@/styled-components/CustomStyles.style'
import ImageUploaderWithPreview from '../single-file-uploader-with-preview/ImageUploaderWithPreview'
import useGetZoneList from '@/hooks/react-query/zone-list/zone-list'
import useGetVehicleList from '@/hooks/react-query/vehicle-list/vehicle-list'
import { IMAGE_SUPPORTED_FORMATS } from '../store-resgistration/StoreRegistrationForm'
import toast from 'react-hot-toast'
import CustomMultiSelectTags from '../custom-multi-select-tags/CustomMultiSelectTags'
import useGetDmShifts from '@/hooks/react-query/dm-shifts/dm-shifts'

const UserInfo = ({
    deliveryManFormik,
    image,
    setImage,
    handleFieldChange,
    configData
}) => {
    console.log({configData});
    
    const theme = useTheme()
    const {
        data: zoneList,
        isLoading: zoneListLoading,

        refetch: zoneListRefetch,
    } = useGetZoneList()
    const {
        data: vehicleList,
        isLoading,
        isError,
        error,
        refetch,
    } = useGetVehicleList()
    const { data: shiftList, refetch: shiftListRefetch } = useGetDmShifts()

    // Optionally trigger fetch on mount or other conditions

    useEffect(() => {
        typeof image !== 'string' && handleFieldChange('image', image)
    }, [image])

    useEffect(() => {
        refetch()
        zoneListRefetch() // Fetches data when the component mounts
        shiftListRefetch()
    }, [])

    const vehicleListOptions = vehicleList?.map((item) => {
        return {
            label: item?.type,
            value: item?.id.toString(),
        }
    })

    const zoneListOptions = zoneList?.map((item) => {
        return {
            label: item?.name,
            value: item?.id.toString(),
        }
    })

    const is12HourTimeFormat = String(configData?.timeformat) === '12'
    const formatShiftTime = (value) => {
        if (!value) return ''
        const parts = String(value).split(':')
        if (parts.length < 2) return value

        const hours = Number(parts[0])
        const minutes = String(parts[1] ?? '').padStart(2, '0')
        if (Number.isNaN(hours)) return value

        if (!is12HourTimeFormat) {
            return `${String(hours).padStart(2, '0')}:${minutes}`
        }

        const period = hours >= 12 ? 'PM' : 'AM'
        const twelveHour = ((hours + 11) % 12) + 1 // 0 -> 12, 13 -> 1
        return `${twelveHour}:${minutes} ${period}`
    }

    const shiftListOptions = (shiftList?.data || shiftList || [])
        .map((item) => {
            const name =
                item?.name ||
                item?.shift_name ||
                item?.title ||
                item?.label ||
                ''

            const startTime = formatShiftTime(item?.start_time)
            const endTime = formatShiftTime(item?.end_time)
            const time = `${startTime}${endTime ? ` - ${endTime}` : ''}`
            const showTime = !Number(item?.is_full_day)

            const label = [name, showTime && time ? `(${time})` : '']
                .filter(Boolean)
                .join(' ')

            return {
                label,
                value: item?.id?.toString(),
                isFullDay: Number(item?.is_full_day) === 1,
            }
        })
        .filter((option) => option.value)

    const shiftGridColumns = shiftListOptions?.length > 2 ? 12 : 6


    const fullDayOption = shiftListOptions.find((option) => option.isFullDay)
    const isFullDaySelected = Boolean(
        fullDayOption &&
        deliveryManFormik.values.shift_ids?.includes(fullDayOption.value)
    )
    const isFreelancer = String(deliveryManFormik.values.earning) === '1'
    const hasAutoSelectedShift = useRef(false)

    useEffect(() => {
        if (!isFreelancer) return
        if (!shiftListOptions?.length) return
        if (deliveryManFormik.values.shift_ids?.length) return
        if (hasAutoSelectedShift.current) return
        if (fullDayOption) {
            handleFieldChange('shift_ids', [fullDayOption.value])
            hasAutoSelectedShift.current = true
        }
    }, [shiftListOptions, deliveryManFormik.values.shift_ids, isFreelancer])

    const shiftMultiSelectHandler = (selectedOptions) => {
        if (!isFreelancer) return
        const newValues = selectedOptions.map((item) =>
            item?.value?.toString()
        )
        const fullDayValue = fullDayOption?.value?.toString()
        if (fullDayValue && newValues.includes(fullDayValue)) {
            handleFieldChange('shift_ids', [fullDayValue])
            return
        }
        handleFieldChange('shift_ids', newValues)
    }

    const handleDeleteShift = (option) => {
        const newShiftIds =
            deliveryManFormik.values.shift_ids?.filter(
                (item) => item !== option.value
            ) || []
        handleFieldChange('shift_ids', newShiftIds)
    }

    const singleFileUploadHandlerForImage = (value) => {
        const file = value.target.files[0]
        if (file && !IMAGE_SUPPORTED_FORMATS.includes(file.type)) {
            toast.error(
                t('Unsupported file format! Please upload JPG, JPEG, GIF, PNG, or WEBP.')
            )
            value.target.value = '' // reset input
            return
        }
        if (file?.size > 1 * 1024 * 1024) {
            toast.error(t('File size too large'))
            value.target.value = '' // reset input
            return
        }
        setImage(value.currentTarget.files[0])
    }
    const imageOnchangeHandlerForImage = (value) => {
        setImage(value)
    }

    return (
        <CustomBoxFullWidth>
            <Grid container spacing={2}>
                <Grid item xs={12} lg={8}>
                    <Stack
                        sx={{
                            borderRadius: '.3125rem',
                            background: theme.palette.neutral[200],
                            p: '1.5rem 1rem 1rem',
                        }}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <CustomTextFieldWithFormik
                                    placeholder={t('First Name')}
                                    required
                                    type="text"
                                    borderRadius="10px"
                                    label={t('First Name')}
                                    touched={deliveryManFormik.touched.f_name}
                                    errors={deliveryManFormik.errors.f_name}
                                    fieldProps={deliveryManFormik.getFieldProps(
                                        'f_name'
                                    )}
                                    onChangeHandler={(value) => {
                                        handleFieldChange('f_name', value)
                                    }}
                                    value={deliveryManFormik.values.f_name}
                                    fontSize="12px"
                                    startIcon={
                                        <InputAdornment position="start">
                                            <AccountCircleIcon
                                                sx={{
                                                    color:
                                                        deliveryManFormik
                                                            .touched.f_name &&
                                                            !deliveryManFormik
                                                                .errors.f_name
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
                            <Grid item xs={12} sm={6}>
                                <CustomTextFieldWithFormik
                                    required
                                    placeholder={t('Last Name')}
                                    type="text"
                                    label={t('Last Name')}
                                    borderRadius="10px"
                                    fieldProps={deliveryManFormik.getFieldProps(
                                        'l_name'
                                    )}
                                    onChangeHandler={(value) => {
                                        handleFieldChange('l_name', value)
                                    }}
                                    value={deliveryManFormik.values.l_name}
                                    touched={deliveryManFormik.touched.l_name}
                                    errors={deliveryManFormik.errors.l_name}
                                    fontSize="12px"
                                    startIcon={
                                        <InputAdornment position="start">
                                            <AccountCircleIcon
                                                sx={{
                                                    color:
                                                        deliveryManFormik
                                                            .touched.l_name &&
                                                            !deliveryManFormik
                                                                .errors.l_name
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
                            <Grid item xs={12} sm={6}>
                                <CustomTextFieldWithFormik
                                    required
                                    placeholder={t('Email')}
                                    type="email"
                                    label={t('Email')}
                                    borderRadius="10px"
                                    touched={deliveryManFormik.touched.email}
                                    errors={deliveryManFormik.errors.email}
                                    fieldProps={deliveryManFormik.getFieldProps(
                                        'email'
                                    )}
                                    onChangeHandler={(value) => {
                                        handleFieldChange('email', value)
                                    }}
                                    value={deliveryManFormik.values.email}
                                    fontSize="12px"
                                    startIcon={
                                        <InputAdornment position="start">
                                            <EmailIcon
                                                sx={{
                                                    color:
                                                        deliveryManFormik
                                                            .touched.email &&
                                                            !deliveryManFormik
                                                                .errors.email
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
                            <Grid item xs={12} sm={6}>
                                <Box
                                    sx={{
                                        borderRadius: '10px',
                                    }}
                                >
                                    <CustomSelectWithFormik
                                        required
                                        selectFieldData={DELIVERY_MAN_TYPE}
                                        inputLabel={t('Deliveryman Type')}
                                        placeholder={t('Deliveryman Type')}
                                        fieldSetGap="10px"
                                        passSelectedValue={(value) => {
                                            handleFieldChange('earning', value)
                                        }}
                                        background={theme.palette.neutral[100]}
                                        borderRadius="10px"
                                        height="45px"
                                        touched={
                                            deliveryManFormik.touched.earning
                                        }
                                        errors={
                                            deliveryManFormik.errors.earning
                                        }
                                        fieldProps={deliveryManFormik.getFieldProps(
                                            'earning'
                                        )}
                                        startIcon={
                                            <RoomIcon
                                                sx={{
                                                    color:
                                                        deliveryManFormik
                                                            .touched.earning &&
                                                            !deliveryManFormik
                                                                .errors.earning
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
                            <Grid item xs={12} sm={6}>
                                <Box
                                    sx={{
                                        borderRadius: '10px',
                                    }}
                                >
                                    <CustomSelectWithFormik
                                        required
                                        placeholder={t('Select Zones')}
                                        selectFieldData={zoneListOptions}
                                        inputLabel={t('Select Zones')}
                                        fieldSetGap="10px"
                                        passSelectedValue={(value) => {
                                            handleFieldChange('zone_id', value)
                                        }}
                                        background={theme.palette.neutral[100]}
                                        borderRadius="10px"
                                        height="45px"
                                        sx={{
                                            background: (theme) =>
                                                theme.palette.neutral[100],
                                        }}
                                        touched={
                                            deliveryManFormik.touched.zone_id
                                        }
                                        errors={
                                            deliveryManFormik.errors.zone_id
                                        }
                                        fieldProps={deliveryManFormik.getFieldProps(
                                            'zone_id'
                                        )}
                                        startIcon={
                                            <LocationOnIcon
                                                sx={{
                                                    color:
                                                        deliveryManFormik
                                                            .touched.zone_id &&
                                                            !deliveryManFormik
                                                                .errors.zone_id
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
                            <Grid item xs={12} sm={6}>
                                <Box
                                    sx={{
                                        borderRadius: '10px',
                                    }}
                                >
                                    <CustomSelectWithFormik
                                        required
                                        selectFieldData={vehicleListOptions}
                                        inputLabel={t('Select Vehicle Type')}
                                        placeholder={t('Select Vehicle Type')}
                                        fieldSetGap="10px"
                                        passSelectedValue={(value) => {
                                            handleFieldChange(
                                                'vehicle_id',
                                                value
                                            )
                                        }}
                                        touched={
                                            deliveryManFormik.touched.vehicle_id
                                        }
                                        errors={
                                            deliveryManFormik.errors.vehicle_id
                                        }
                                        fieldProps={deliveryManFormik.getFieldProps(
                                            'vehicle_id'
                                        )}
                                        background={theme.palette.neutral[100]}
                                        borderRadius="10px"
                                        height="45px"
                                        startIcon={
                                            <DirectionsCarIcon
                                                sx={{
                                                    color:
                                                        deliveryManFormik
                                                            .touched
                                                            .vehicle_id &&
                                                            !deliveryManFormik
                                                                .errors.vehicle_id
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
                            {isFreelancer && (
                                <Grid item xs={12} sm={shiftGridColumns}>
                                    <CustomMultiSelectTags
                                        
                                        label="Working Shift"
                                        options={shiftListOptions}
                                        placeholder={t('Select Working Shift')}
                                        onChange={shiftMultiSelectHandler}
                                        filterSelectedOptions={false}
                                        showOptionCheckbox
                                        getOptionDisabled={(option) =>
                                            isFullDaySelected &&
                                            !option.isFullDay
                                        }
                                        value={
                                            shiftListOptions?.filter((option) =>
                                                deliveryManFormik.values.shift_ids?.includes(
                                                    option.value
                                                )
                                            ) || []
                                        }
                                        handleDelete={handleDeleteShift}
                                        backgroundColor={theme.palette.neutral[100]}
                                        startIcon={
                                            <DirectionsCarIcon
                                                sx={{
                                                    color:
                                                        deliveryManFormik
                                                            .touched
                                                            .shift_ids &&
                                                            !deliveryManFormik.errors
                                                                .shift_ids
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
                                </Grid>
                            )}
                        </Grid>
                    </Stack>
                </Grid>
                <Grid item xs={12} lg={4}>
                    <Stack
                        sx={{
                            borderRadius: '.3125rem',
                            background: theme.palette.neutral[200],
                            p: '1.5rem 1rem 1rem',
                            height: '100%',
                        }}
                    >
                        <InputLabel
                            sx={{
                                fontWeight: '500',
                                fontSize: '14px',
                                color: (theme) => theme.palette.text.primary,
                            }}
                        >
                            {t('Deliveryman Image')}{' '}
                            <span style={{ color: 'red', fontSize: '12px' }}>
                                *
                            </span>
                        </InputLabel>
                        <Box sx={{ mt: '10px', width: '100%' }}>
                            <ImageUploaderWithPreview
                                type="file"
                                labelText={t('Click to upload')}
                                hintText="Image format - jpg, png, jpeg,webp, gif Image Size - maximum size 2 MB Image Ratio - 1:1"
                                file={image}
                                onChange={singleFileUploadHandlerForImage}
                                imageOnChange={imageOnchangeHandlerForImage}
                                width="8.75rem"
                                error={deliveryManFormik.errors.image}
                                height="100px"

                            // borderRadius={borderRadius ?? "50%"}
                            />
                        </Box>
                        {!image && (
                            <Typography
                                variant="caption"
                                sx={{
                                    color: (theme) => theme.palette.error.main,
                                    mt: '10px',
                                    display: 'block',
                                    textAlign: 'center',
                                }}
                            >
                                {deliveryManFormik.errors.image}
                            </Typography>
                        )}
                        <Typography
                            fontSize="12px"
                            mt="24px"
                            textAlign="center"
                            sx={{
                                color: (theme) => theme.palette.neutral[400],
                            }}
                        >
                            {t('JPG, JPEG, PNG, WebP Less Than 2MB (Ratio 2:1)')}
                        </Typography>
                    </Stack>
                </Grid>
            </Grid>
        </CustomBoxFullWidth>
    )
}

export default UserInfo
