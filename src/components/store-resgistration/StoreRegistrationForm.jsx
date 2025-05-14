import React, { useEffect, useMemo, useRef, useState } from 'react'
// import { CustomStackFullWidth } from 'styled-components/CustomStyles.style'
import {
    alpha,
    Box,
    Grid,
    InputAdornment,
    Stack,
    Typography,
    useTheme,
} from '@mui/material'
import * as Yup from 'yup'
import RoomIcon from '@mui/icons-material/Room'
import { useFormik } from 'formik'
import { useTranslation } from 'react-i18next'

import { useQuery } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import {
    CustomButton,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import CustomDivider from '../CustomDivider'
import RestaurantDetailsForm from './RestaurantDetailsForm'
import ImageSection from './ImageSection'
import OwnerForm from './OwnerForm'
import AccountInfo from './AccountInfo'
import ValidationSchemaForRestaurant from './ValidationSchemaForRestaurant'
import { GoogleApi } from '@/hooks/react-query/config/googleApi'
import useGetZoneList from '@/hooks/react-query/zone-list/zone-list'
import LangTab from './LanTab'
import CustomTextFieldWithFormik from '../form-fields/CustomTextFieldWithFormik'
import MapWithSearch from '../google-map/MapWithSearchBox'
import { useGeolocated } from 'react-geolocated'
import { setAllData } from '@/redux/slices/storeRegistrationData'
import StoreAdditionalInfo from './StoreAdditionalInfo'
import { useGetLocation } from '@/utils/custom-hook/useGetLocation'
import { formatPhoneNumber } from '@/utils/customFunctions'
import toast from 'react-hot-toast'

export const generateInitialValues = (languages, allData, configData) => {
    const initialValues = {
        restaurant_name: {},
        restaurant_address: {},
        vat: allData?.vat || '',
        min_delivery_time: allData?.min_delivery_time || '',
        max_delivery_time: allData?.max_delivery_time || '',
        logo: allData?.logo || '',
        cover_photo: allData?.cover_photo || '',
        f_name: allData?.f_name || '',
        l_name: allData?.l_name || '',
        phone: allData?.phone || '',
        email: allData?.email || '',
        cuisine_ids: allData?.cuisine_ids || [],
        tags: allData?.tags || [],
        password: allData?.password || '',
        confirm_password: allData?.confirm_password || '',
        lat: allData?.lat || '',
        lng: allData?.lng || '',
        zoneId: allData?.zoneId || '',
        module_id: allData?.module_id || '',
        delivery_time_type: allData?.delivery_time_type || '',
        // additional_documents: allData?.additional_documents || [],
        additional_data: { ...allData?.additional_data } || {}, // Make a shallow copy of additional_data
    }

    const updatedInitialValues = { ...initialValues }
    configData?.restaurant_additional_join_us_page_data?.data?.forEach(
        (item) => {
            if (item.field_type === 'file') {
                if (
                    item.media_data.upload_multiple_files === 1 ||
                    item.media_data.upload_multiple_files === 0
                ) {
                    updatedInitialValues[item.input_data] =
                        allData?.[item.input_data] || '' // Empty array for file uploads
                }
            } else {
                // Handle other types of fields (text, number, etc.)
                updatedInitialValues.additional_data[item.input_data] =
                    allData?.additional_data?.[item.input_data] || '' // Default to empty string if not set
            }
        }
    )

    // Set initial values for each language
    languages?.forEach((lang) => {
        updatedInitialValues.restaurant_name[lang.key] =
            allData?.restaurant_name?.[lang.key] || ''
        updatedInitialValues.restaurant_address[lang.key] =
            allData?.restaurant_address?.[lang.key] || ''
    })

    // Return the updated initial values
    return updatedInitialValues
}

const StoreRegistrationForm = ({
    setActiveStep,
    setFormValues,
    configData,
}) => {
    const router = useRouter()
    const theme = useTheme()
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const [polygonPaths, setPolygonPaths] = useState([])
    const [currentTab, setCurrentTab] = useState(0)
    const [selectedLanguage, setSelectedLanguage] = React.useState('en')
    const [selectedZone, setSelectedZone] = React.useState(null)
    const [inZone, setInZone] = React.useState(null)
    const { allData, activeStep, zoneOptions } = useSelector((state) => state.storeRegData);
    const { businessLogo } = useSelector((state) => state.globalSettings);
    const [rerenderMap, setRerenderMap] = useState(false);
    const landingFormData = router.query.data && JSON.parse(router.query.data);
    const [additionalDataKey, setAdditionalDataKey] = useState(0)
    const initialValues = generateInitialValues(
        configData?.language,
        allData,
        configData
    )
const [submitForm,setSubmitForm]=useState(false)
    const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
            positionOptions: {
                enableHighAccuracy: false,
            },
            userDecisionTimeout: 5000,
            isGeolocationEnabled: true,
        })
    const { setLocations } = useGetLocation(coords)
    const generateValidationForField = (field, configData) => {
        const isRequired = field.is_required === 1

        switch (field.field_type) {
            case 'text':
                let textValidation = Yup.string()
                    .min(2, `${field.input_data} must be at least 2 characters`)
                    .max(50, `${field.input_data} can't exceed 50 characters`)

                if (isRequired) {
                    textValidation = textValidation.required(
                        `${field.input_data} is required`
                    )
                }
                return textValidation

            case 'number':
                let numberValidation = Yup.number()
                    .typeError(`${field.input_data} must be a number`)
                    .min(1, `${field.input_data} must be at least 1`)
                    .max(999, `${field.input_data} can't exceed 999`)

                if (isRequired) {
                    numberValidation = numberValidation.required(
                        `${field.input_data} is required`
                    )
                }
                return numberValidation

            case 'email':
                let emailValidation = Yup.string().email(
                    'Invalid email address'
                )

                if (isRequired) {
                    emailValidation = emailValidation.required(
                        `${field.input_data} is required`
                    )
                }
                return emailValidation

            case 'date':
                let dateValidation = Yup.date().typeError(
                    `${field.input_data} must be a valid date`
                )

                if (isRequired) {
                    dateValidation = dateValidation.required(
                        `${field.input_data} is required`
                    )
                }
                return dateValidation

            case 'phone':
                let phoneValidation = Yup.string()
                    .matches(
                        /^[+]?[0-9]{10,15}$/, // Allow optional "+" at the start and 10-15 digits
                        'Phone number must be between 10 to 15 digits and may include a "+"'
                    )
                    .required('Phone number is required')

                return phoneValidation

            default:
                return Yup.string()
        }
    }

    const additionalDataValidation = (configData) => {
        const dynamicSchema = {}

        configData?.restaurant_additional_join_us_page_data?.data?.forEach(
            (item) => {
                if (item.field_type !== 'check_box') {
                    dynamicSchema[`${item.input_data}`] =
                        generateValidationForField(item)
                }
            }
        )

        return Yup.object().shape(dynamicSchema)
    }

    const generateValidationForImage = (field) => {
        const isRequired = field.is_required === 1

        switch (field.field_type) {
            case 'file':
                let fileValidation = Yup.mixed()
                    .test(
                        'fileType',
                        `${field.input_data} must be a valid file type`,
                        (value) => {
                            // Here you can dynamically validate based on media_data
                            if (value && value.length) {
                                const allowedTypes = []

                                // If media_data allows image files
                                if (
                                    field.media_data &&
                                    field.media_data.image === 1
                                ) {
                                    allowedTypes.push(
                                        'image/jpeg',
                                        'image/png',
                                        'image/gif'
                                    )
                                }

                                // If media_data allows PDF files
                                if (
                                    field.media_data &&
                                    field.media_data.pdf === 1
                                ) {
                                    allowedTypes.push('application/pdf')
                                }

                                // If media_data allows doc files
                                if (
                                    field.media_data &&
                                    field.media_data.docs === 1
                                ) {
                                    allowedTypes.push(
                                        'application/msword',
                                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                    )
                                }

                                return value.every((file) =>
                                    allowedTypes.includes(file.type)
                                )
                            }
                            return true // If no file is selected, the validation can pass
                        }
                    )
                    .required(`${field.input_data} is required`)

                return fileValidation

            default:
                let defaultValidation = Yup.string()
                return defaultValidation
        }
    }

    const additionalDocumentsValidation = (configData) => {
        const dynamicSchema = {}

        configData?.restaurant_additional_join_us_page_data?.data?.forEach(
            (item) => {
                if (item.field_type !== 'check_box') {
                    dynamicSchema[`${item.input_data}`] =
                        generateValidationForImage(item)
                }
            }
        )

        return Yup.object().shape(dynamicSchema)
    }


    const RestaurantJoinFormik = useFormik({
        initialValues,
        validationSchema: ValidationSchemaForRestaurant(
            additionalDataValidation(configData),
            additionalDocumentsValidation(configData)
        ),
        enableReinitialize: true, // This ensures form values are reinitialized when initialValues change
        onSubmit: async (values, helpers) => {
            try {
                if (inZone) {
                    formSubmitOnSuccess(values);
                } else {
                    toast.error(t("Please select a zone"));
                }
            } catch (err) {
            }

        },
    })

    let currentLatLng = undefined
    if (typeof window !== 'undefined') {
        currentLatLng = JSON.parse(window.localStorage.getItem('currentLatLng'))
    }

    useEffect(() => {
        if (RestaurantJoinFormik?.values?.zoneId) {
            const filterZone = zoneList?.find(
                (item) => item?.id === RestaurantJoinFormik?.values?.zoneId
            )
            function convertGeoJSONToCoordinates(geoJSON) {
                const coords = geoJSON?.coordinates[0]
                return coords?.map((coord) => ({
                    lat: coord[1],
                    lng: coord[0],
                }))
            }
            const format = convertGeoJSONToCoordinates(filterZone?.coordinates)
            setPolygonPaths(format)
        }
    }, [RestaurantJoinFormik?.values?.zoneId])

    const formSubmitOnSuccess = (values) => {

        setFormValues(values)

        dispatch(setActiveStep(1))
        dispatch(setAllData(values))
    }

    const hydratedRef = useRef(false);

    useEffect(() => {
        if (!landingFormData) return;

        // Run only once
        if (hydratedRef.current) return;
        hydratedRef.current = true;

        if (landingFormData?.restaurant_name) {
            RestaurantJoinFormik.setFieldValue('restaurant_name', {
                ...RestaurantJoinFormik.values.restaurant_name,
                en: landingFormData.restaurant_name,
            });
        }


        if (landingFormData?.zoneId) {
            setSelectedZone(landingFormData.zoneId);
            RestaurantJoinFormik.setFieldValue('zoneId', landingFormData.zoneId);
        }

        if (businessLogo) {
            RestaurantJoinFormik.setFieldValue('logo', businessLogo);
        }
    }, [landingFormData]);

    const fNameHandler = (value) => {
        RestaurantJoinFormik.setFieldValue('f_name', value)
    }
    const restaurantNameHandler = (value) => {
        RestaurantJoinFormik.setFieldValue('restaurant_name', {
            ...RestaurantJoinFormik.values.restaurant_name,
            [selectedLanguage]: value,
        })
    }
    const restaurantVatHandler = (value) => {
        RestaurantJoinFormik.setFieldValue('vat', value)
    }
    const [key, setKey] = useState(0)
    const restaurantAddressHandler = (value) => {
        RestaurantJoinFormik.setFieldValue('restaurant_address', {
            ...RestaurantJoinFormik.values.restaurant_address,
            [selectedLanguage]: value,
        })
        setKey((prevKey) => prevKey + 1)
    }

    const minDeliveryTimeHandler = (value) => {
        RestaurantJoinFormik.setFieldValue('min_delivery_time', value)
    }
    const maxDeliveryTimeHandler = (value) => {
        RestaurantJoinFormik.setFieldValue('max_delivery_time', value)
    }
    const handleTimeTypeChangeHandler = (value) => {
        RestaurantJoinFormik.setFieldValue('delivery_time_type', value)
    }
    const lNameHandler = (value) => {
        RestaurantJoinFormik.setFieldValue('l_name', value)
    }
    const phoneHandler = (values) => {
        RestaurantJoinFormik.setFieldValue('phone', formatPhoneNumber(values))
    }
    const emailHandler = (value) => {
        RestaurantJoinFormik.setFieldValue('email', value)
    }
    const passwordHandler = (value) => {
        RestaurantJoinFormik.setFieldValue('password', value)
    }
    const singleFileUploadHandlerForImage = (value) => {
        RestaurantJoinFormik.setFieldValue('logo', value.currentTarget.files[0])
    }
    const imageOnchangeHandlerForImage = (value) => {
        RestaurantJoinFormik.setFieldValue('logo', value)
    }
    const singleFileUploadHandlerForCoverPhoto = (value) => {
        RestaurantJoinFormik.setFieldValue(
            'cover_photo',
            value.currentTarget.files[0]
        )
    }
    const imageOnchangeHandlerForCoverPhoto = (value) => {
        RestaurantJoinFormik.setFieldValue('cover_photo', value)
    }
    const zoneHandler = (value) => {
        setSelectedZone(value)
        RestaurantJoinFormik.setFieldValue('zoneId', value)
    }
    const moduleHandler = (value) => {
        RestaurantJoinFormik.setFieldValue('module_id', value)
    }
    const cuisinesHandler = (selectedOptions) => {
        const newValues = selectedOptions.map((item) => item.value)

        // Ensure RestaurantJoinFormik.values.cuisine_ids is always an array
        const currentCuisines = RestaurantJoinFormik.values.cuisine_ids || []

        // Concatenate the new values
        RestaurantJoinFormik.setFieldValue('cuisine_ids', [
            ...currentCuisines,
            ...newValues,
        ])
    }

    const handleDeleteCuisine = (option) => {
        const newCuisines = RestaurantJoinFormik.values.cuisine_ids?.filter(
            (item) => item !== option.value
        )

        RestaurantJoinFormik.setFieldValue('cuisine_ids', newCuisines)
    }

    const handleClearAllCuisines = () => {
        RestaurantJoinFormik.setFieldValue('cuisine_ids', [])
    }
    const handleLocation = (value) => {
        RestaurantJoinFormik.setFieldValue('lng', value?.lat)
        RestaurantJoinFormik.setFieldValue('lat', value?.lng)
    }
    const { data: zoneList, refetch: zoneListRefetch } = useGetZoneList()

    useEffect(() => {
        if (!zoneOptions || zoneOptions.length === 0) {
            zoneListRefetch();
        }
    }, [zoneOptions]);

    const fallbackZoneOptions = useMemo(() => {
        if (!zoneList || zoneList.length === 0) return [];
        return zoneList.map(zone => ({
            label: zone.name,
            value: zone.id,
        }));
    }, [zoneList]);

    const zoneOptionData = zoneOptions && zoneOptions.length > 0
        ? zoneOptions
        : fallbackZoneOptions;

    const { data: zoneData, refetch } = useQuery(
        ['zoneId'],
        async () =>
            GoogleApi.getZoneId(currentLatLng ?? configData?.default_location),
        {
            retry: 1,
        }
    )



    let tabs = []
    configData?.language?.forEach((lan) => {
        let obj = {
            name: lan?.key,
            value: lan?.value,
        }
        tabs?.push(obj)
    })
    const handleCurrentTab = (value, item) => {
        setSelectedLanguage(item?.name)
        setCurrentTab(value)
    }
    useEffect(() => {
        if (zoneData?.data?.zone_data && currentLatLng) {
            refetch()
        }
    }, [zoneData?.data?.zone_data])
    useEffect(() => {
        if (!currentLatLng && zoneData?.data) {
            localStorage.setItem(
                'currentLatLng',
                JSON.stringify(configData?.default_location)
            )
            localStorage.setItem('zoneid', zoneData?.data?.zone_id)
        }
    }, [configData?.default_location, zoneData?.data])

    const [renderKey, setRenderKey] = useState(0)

    useEffect(() => {
        if (landingFormData?.restaurant_address) {
            setLocations( landingFormData.restaurant_address)
        } else {
            setLocations(configData?.default_location)
        }
    }, [])
    return (
        <CustomStackFullWidth
            key={renderKey}
            sx={{
                border: `1px solid ${theme.palette.neutral[200]}`,
                marginTop: '2rem',
                borderRadius: '20px',
                padding: { xs: '1rem', md: '30px' },
                backgroundColor: (theme) => theme.palette.neutral[100],
            }}
        >
            <form noValidate onSubmit={RestaurantJoinFormik.handleSubmit}>
                <Stack
                    sx={{
                        backgroundColor: (theme) => theme.palette.neutral[100],
                        // backgroundColor: (theme) => alpha(theme.palette.neutral[400], 0.1),
                        padding: '.6rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                    }}
                >
                    <Typography
                        fontSize="18px"
                        fontWeight="500"
                        textAlign="left"
                        marginBottom="16px"
                        sx={{ color: (theme) => theme.palette.neutral[1000] }}
                    >
                        {t('Restaurant Info')}
                    </Typography>
                    <CustomDivider border="1px" paddingBottom="5px" />
                    <CustomStackFullWidth
                        // padding={{ xs: '7px', md: '2rem' }}
                        mt="20px"
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={12}>
                                <Box sx={{ mb: '20px' }}>
                                    <LangTab
                                        tabs={tabs}
                                        currentTab={currentTab}
                                        setCurrentTab={handleCurrentTab}
                                        fontSize=""
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}></Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <RestaurantDetailsForm
                                    submitForm={submitForm}
                                    RestaurantJoinFormik={RestaurantJoinFormik}
                                    restaurantNameHandler={
                                        restaurantNameHandler
                                    }
                                    restaurantAddressHandler={
                                        restaurantAddressHandler
                                    }
                                    restaurantvatHandler={restaurantVatHandler}
                                    minDeliveryTimeHandler={
                                        minDeliveryTimeHandler
                                    }
                                    maxDeliveryTimeHandler={
                                        maxDeliveryTimeHandler
                                    }
                                    cuisinesHandler={cuisinesHandler}
                                    zoneOption={zoneOptionData}
                                    zoneHandler={zoneHandler}
                                    moduleHandler={moduleHandler}
                                    handleTimeTypeChangeHandler={
                                        handleTimeTypeChangeHandler
                                    }
                                    handleDeleteCuisine={handleDeleteCuisine}
                                    handleClearAllCuisines={
                                        handleClearAllCuisines
                                    }
                                    currentTab={currentTab}
                                    handleCurrentTab={handleCurrentTab}
                                    tabs={tabs}
                                    selectedLanguage={selectedLanguage}
                                    setInZone={setInZone}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <CustomStackFullWidth spacing={3}>
                                    <CustomTextFieldWithFormik
                                        key={key}
                                        placeholder={t('Restaurant Address')}
                                        required="true"
                                        type="text"
                                        label={t('Restaurant Address')}
                                        touched={
                                            RestaurantJoinFormik.touched
                                                .restaurant_address
                                        }
                                        errors={
                                            RestaurantJoinFormik.errors
                                                .restaurant_address
                                        }
                                        value={
                                            RestaurantJoinFormik.values
                                                .restaurant_address[
                                                selectedLanguage
                                            ]
                                        } // Use the selected language value
                                        borderRadius="8px"
                                        onChangeHandler={
                                            restaurantAddressHandler
                                        }
                                        fontSize="12px"
                                        startIcon={
                                            <InputAdornment position="start">
                                                <RoomIcon
                                                    sx={{
                                                        color:
                                                            RestaurantJoinFormik
                                                                .touched
                                                                .restaurant_address &&
                                                            !RestaurantJoinFormik
                                                                .errors
                                                                .restaurant_address
                                                                ? theme.palette
                                                                      .primary
                                                                      .main
                                                                : alpha(
                                                                      theme
                                                                          .palette
                                                                          .neutral[400],
                                                                      0.7
                                                                  ),
                                                        fontSize: '18px',
                                                    }}
                                                />
                                            </InputAdornment>
                                        }
                                    />
                                    <Box sx={{ position: 'relative' }}>
                                        <MapWithSearch
                                            searchBoxInside={true}
                                            isGps={true}
                                            rerenderMap={rerenderMap}
                                            padding="0px"
                                            coords={coords}
                                            mapHeight="200px"
                                            heightFromStore="250px"
                                            polygonPaths={polygonPaths}
                                            restaurantAddressHandler={
                                                restaurantAddressHandler
                                            }
                                            handleLocation={handleLocation}
                                            setInZone={setInZone}
                                            zoneId={RestaurantJoinFormik?.values?.zoneId}
                                        />
                                    </Box>

                                    <ImageSection
                                        singleFileUploadHandlerForImage={
                                            singleFileUploadHandlerForImage
                                        }
                                        imageOnchangeHandlerForImage={
                                            imageOnchangeHandlerForImage
                                        }
                                        singleFileUploadHandlerForCoverPhoto={
                                            singleFileUploadHandlerForCoverPhoto
                                        }
                                        imageOnchangeHandlerForCoverPhoto={
                                            imageOnchangeHandlerForCoverPhoto
                                        }
                                        RestaurantJoinFormik={
                                            RestaurantJoinFormik
                                        }
                                    />
                                </CustomStackFullWidth>
                            </Grid>
                        </Grid>
                    </CustomStackFullWidth>
                </Stack>
                <CustomStackFullWidth
                    mt="20px"
                    sx={{
                        backgroundColor: (theme) =>
                            alpha(theme.palette.neutral[200], 0.6),
                        // backgroundColor: (theme) => alpha(theme.palette.neutral[400], 0.1),

                        borderRadius: '8px',
                    }}
                >
                    <OwnerForm
                        RestaurantJoinFormik={RestaurantJoinFormik}
                        fNameHandler={fNameHandler}
                        lNameHandler={lNameHandler}
                        phoneHandler={phoneHandler}
                        configData={configData}
                    />
                </CustomStackFullWidth>
                <CustomStackFullWidth
                    mt="20px"
                    sx={{
                        backgroundColor: (theme) =>
                            alpha(theme.palette.neutral[200], 0.6),
                        // backgroundColor: (theme) => alpha(theme.palette.neutral[400], 0.1),

                        borderRadius: '8px',
                    }}
                >
                    <AccountInfo
                        RestaurantJoinFormik={RestaurantJoinFormik}
                        emailHandler={emailHandler}
                        passwordHandler={passwordHandler}
                        configData={configData}
                    />
                </CustomStackFullWidth>
                <CustomStackFullWidth
                    mt="20px"
                    sx={{
                        backgroundColor: (theme) =>
                            alpha(theme.palette.neutral[200], 0.6),
                        // backgroundColor: (theme) => alpha(theme.palette.neutral[400], 0.1),

                        borderRadius: '8px',
                    }}
                >
                    <StoreAdditionalInfo
                        additionalDataKey={additionalDataKey}
                        RestaurantJoinFormik={RestaurantJoinFormik}
                        configData={configData}
                        submitForm={submitForm}
                    />
                </CustomStackFullWidth>
                <Grid item md={12} xs={12} mt="1rem" align="end">
                    <CustomButton
                        // disabled={isLoading}
                        onClick={() => {
                            RestaurantJoinFormik.resetForm()
                            setKey((prev) => prev + 1)
                            setAdditionalDataKey((prev) => prev + 1)
                        }}
                        sx={{
                            backgroundColor: (theme) =>
                                alpha(theme.palette.neutral[200], 0.5),
                            color: (theme) =>
                                `${theme.palette.primary.dark} !important`,
                            px: '30px',

                            borderRadius: '5px',
                            mr: 2,
                        }}
                    >
                        {t('Reset')}
                    </CustomButton>
                    <CustomButton
                        type="submit"
                        // disabled={!inZone}
                        variant="contained"
                        sx={{
                            background: (theme) => theme.palette.primary.main,
                            minWidth: '100px',
                            color: (theme) =>
                                `${theme.palette.neutral[100]}!important`,
                            px: '30px',
                            borderRadius: '5px',
                            fontWeight: '500',
                            fontSize: '14px',
                            cursor: 'pointer',
                        }}
                    >
                        {t('Next')}
                    </CustomButton>
                </Grid>
            </form>
        </CustomStackFullWidth>
    )
}

export default StoreRegistrationForm
