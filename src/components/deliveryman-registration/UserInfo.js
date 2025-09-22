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
import React, { useEffect, useState } from 'react'

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

const UserInfo = ({
    deliveryManFormik,
    image,
    setImage,
    handleFieldChange,
}) => {
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

    // Optionally trigger fetch on mount or other conditions

    useEffect(() => {
        typeof image !== 'string' && handleFieldChange('image', image)
    }, [image])

    useEffect(() => {
        refetch()
        zoneListRefetch() // Fetches data when the component mounts
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

    const singleFileUploadHandlerForImage = (value) => {
        setImage(value.currentTarget.files[0])
    }
    const imageOnchangeHandlerForImage = (value) => {
        setImage(value)
    }

    return (
        <>
            <CustomBoxFullWidth>
                <Grid container spacing={2}>
                    <Grid item xs={12} lg={9}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <CustomTextFieldWithFormik
                                    placeholder={t('First Name')}
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
                                        selectFieldData={DELIVERY_MAN_TYPE}
                                        inputLabel={t('Deliveryman Type')}
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
                                        selectFieldData={vehicleListOptions}
                                        inputLabel={t('Select Vehicle Type')}
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
                        </Grid>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        lg={3}
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Stack justifyContent="center" alignItems="center">
                            <InputLabel
                                sx={{
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    color: (theme) =>
                                        theme.palette.neutral[500],
                                }}
                            >
                                {t('Profile Image')}
                            </InputLabel>
                            <Typography
                                fontSize="12px"
                                sx={{
                                    color: (theme) =>
                                        theme.palette.neutral[400],
                                }}
                            >
                                {t('JPG, JPEG, PNG Less Than 1MB (Ratio 2:1)')}
                            </Typography>
                            <Box sx={{ mt: '10px', width: '100%' }}>
                                <ImageUploaderWithPreview
                                    type="file"
                                    labelText={t('Click to upload')}
                                    hintText="Image format - jpg, png, jpeg, gif Image Size - maximum size 2 MB Image Ratio - 1:1"
                                    file={image}
                                    onChange={singleFileUploadHandlerForImage}
                                    imageOnChange={imageOnchangeHandlerForImage}
                                    width="8.75rem"
                                    error={deliveryManFormik.errors.image}
                                    height="100px"

                                    // borderRadius={borderRadius ?? "50%"}
                                />
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </CustomBoxFullWidth>
        </>
    )
}

export default UserInfo
