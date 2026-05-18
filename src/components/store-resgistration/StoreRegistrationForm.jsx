import React, { useEffect, useMemo, useRef, useState } from 'react'
// import { CustomStackFullWidth } from 'styled-components/CustomStyles.style'
import {
    Alert,
    alpha,
    Box,
    Grid,
    InputAdornment,
    Stack,
    Typography,
    useTheme,
    useMediaQuery,
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
import CustomTextFieldWithFormik from '../form-fields/CustomTextFieldWithFormik'
import MapWithSearch from '../google-map/MapWithSearchBox'
import { useGeolocated } from 'react-geolocated'
import { setAllData, setBusinessLogo } from '@/redux/slices/storeRegistrationData'
import StoreAdditionalInfo from './StoreAdditionalInfo'
import { useGetLocation } from '@/utils/custom-hook/useGetLocation'
import { formatPhoneNumber } from '@/utils/customFunctions'
import toast from 'react-hot-toast'
import BusinessTin from '@/components/store-resgistration/BusinessTin'
import ReportIcon from '@mui/icons-material/Report'
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects'
export const IMAGE_SUPPORTED_FORMATS = [
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/png',
    'image/webp',
]

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
        additional_data: { ...allData?.additional_data } || {},
        tin: allData?.tin || '',
        tin_expire_date: allData?.tin_expire_date || '',
        tin_certificate_image: allData?.tin_certificate_image || '',
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
    const isSmallSize = useMediaQuery(theme.breakpoints.down('md'))
    const [selectedLanguage, setSelectedLanguage] = React.useState('en')
    const [selectedZone, setSelectedZone] = React.useState(null)
    const [inZone, setInZone] = React.useState(null)
    const [showZoneWarning, setShowZoneWarning] = useState(false)
    const { allData, activeStep, zoneOptions } = useSelector(
        (state) => state.storeRegData
    )

    const { businessLogo } = useSelector((state) => state.storeRegData)
    console.log({ businessLogo })
    const [rerenderMap, setRerenderMap] = useState(false)
    const landingFormData = router.query.data && JSON.parse(router.query.data)
    const [additionalDataKey, setAdditionalDataKey] = useState(0)
    const [selectedDates, setSelectedDates] = useState(null)
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const { location, formatted_address } = useSelector(
        (state) => state.addressData
    )
    const isSmall = theme.breakpoints.down('md')
    const initialValues = generateInitialValues(
        configData?.language,
        allData,
        configData
    )
    console.log({allData});
    
    const [submitForm, setSubmitForm] = useState(false)
    const { coords, isGeolocationAvailable, isGeolocationEnabled } =
        useGeolocated({
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


                if (isRequired) {
                    numberValidation = numberValidation.required(
                        `${field.input_data} is required`
                    )
                }
                return numberValidation

            case 'email':
                let emailValidation = Yup.string().email(
                    t('Invalid email address')
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
        validationOptions: {
            abortEarly: false, // ✅ THIS IS THE KEY
        },
        enableReinitialize: true, // This ensures form values are reinitialized when initialValues change
        onSubmit: async (values, helpers) => {
            console.log("values", values)
            try {
                if (inZone) {
                    formSubmitOnSuccess(values)
                } else {
                    toast.error(t('Please select a zone'))
                }
            } catch (err) { }
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

    const hydratedRef = useRef(false)

    useEffect(() => {
        if (!landingFormData) return

        // Run only once
        if (hydratedRef.current) return
        hydratedRef.current = true

        if (landingFormData?.restaurant_name) {
            RestaurantJoinFormik.setFieldValue('restaurant_name', {
                ...RestaurantJoinFormik.values.restaurant_name,
                en: landingFormData.restaurant_name,
            })
        }

        if (landingFormData?.zoneId) {
            setSelectedZone(landingFormData.zoneId)
            RestaurantJoinFormik.setFieldValue('zoneId', landingFormData.zoneId)
        }

        if (landingFormData?.restaurant_address?.lat && landingFormData?.restaurant_address?.lng) {
            RestaurantJoinFormik.setFieldValue('lat', landingFormData.restaurant_address.lat)
            RestaurantJoinFormik.setFieldValue('lng', landingFormData.restaurant_address.lng)
        }

        if (businessLogo) {
            RestaurantJoinFormik.setFieldValue('logo', businessLogo)
        }
    }, [landingFormData])
    console.log({landingFormData});
    

    // Restore business logo from localStorage on page reload
    useEffect(() => {
        const restoreImageFromLocalStorage = async () => {
            try {
                const savedImageData = localStorage.getItem('restaurant_registration_logo')
                if (savedImageData && !businessLogo) {
                    const imageData = JSON.parse(savedImageData)

                    // Convert base64 back to File object
                    const response = await fetch(imageData.base64)
                    const blob = await response.blob()
                    const file = new File([blob], imageData.name, { type: imageData.type })

                    // Set to Redux and Formik
                    dispatch(setBusinessLogo(file))
                    RestaurantJoinFormik.setFieldValue('logo', file)
                }
            } catch (error) {
                console.error('Error restoring image from localStorage:', error)
            }
        }

        restoreImageFromLocalStorage()
    }, [])

    console.log("landingFormData", landingFormData, businessLogo)
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
        if (inZone) {
            RestaurantJoinFormik.setFieldValue('restaurant_address', {
                ...RestaurantJoinFormik.values.restaurant_address,
                [selectedLanguage]: value,
            })
            setKey((prevKey) => prevKey + 1)
        } else {
            RestaurantJoinFormik.setFieldValue('restaurant_address', {
                ...RestaurantJoinFormik.values.restaurant_address,
                [selectedLanguage]: '',
            })
        }
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
        const file = value.target.files[0]
        if (value && !IMAGE_SUPPORTED_FORMATS.includes(file.type)) {
            toast.error(
                'Unsupported file format! Please upload JPG, JPEG, GIF, or PNG.'
            )
            value.target.value = ''
            return
        }
        dispatch(setBusinessLogo(file))
        RestaurantJoinFormik.setFieldValue('logo', value.currentTarget.files[0])

        // Convert File to base64 and store in localStorage for persistence
        const reader = new FileReader()
        reader.onloadend = () => {
            const imageData = {
                base64: reader.result,
                name: file.name,
                type: file.type,
                size: file.size,
            }
            localStorage.setItem('restaurant_registration_logo', JSON.stringify(imageData))
        }
        reader.readAsDataURL(file)
    }
    const imageOnchangeHandlerForImage = (value) => {
        RestaurantJoinFormik.setFieldValue('logo', value)

        if (value instanceof File) {
            dispatch(setBusinessLogo(value))

            // Convert File to base64 and store in localStorage for persistence
            const reader = new FileReader()
            reader.onloadend = () => {
                const imageData = {
                    base64: reader.result,
                    name: value.name,
                    type: value.type,
                    size: value.size,
                }
                localStorage.setItem('restaurant_registration_logo', JSON.stringify(imageData))
            }
            reader.readAsDataURL(value)
        }
    }
    const singleFileUploadHandlerForCoverPhoto = (value) => {
        const file = value.currentTarget.files[0]
        if (value && !IMAGE_SUPPORTED_FORMATS.includes(file.type)) {
            toast.error(
                'Unsupported file format! Please upload JPG, JPEG, GIF, or PNG.'
            )
            value.target.value = ''
            return
        }
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
    const singleFileUploadHandlerForTinFile = (value) => {
        // const file = e.currentTarget.files[0];
        RestaurantJoinFormik.setFieldValue('tin_certificate_image', value)
    }
    const imageOnchangeHandlerForTinImage = (value) => {
        RestaurantJoinFormik.setFieldValue('tin_certificate_image', value)
    }
    useEffect(() => {
        if (selectedDates && selectedDates[0]) {
            const tempSelectedDates = new Date(selectedDates[0])
            RestaurantJoinFormik.setFieldValue(
                'tin_expire_date',
                tempSelectedDates
            )
        }
    }, [selectedDates])
    const cuisinesHandler = (selectedOptions) => {
        const newValues = selectedOptions.map((item) => item.value)
        const currentCuisines = RestaurantJoinFormik.values.cuisine_ids || []
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
        RestaurantJoinFormik.setFieldValue('lat', value?.lat)
        RestaurantJoinFormik.setFieldValue('lng', value?.lng)
    }

    const handleAgreeLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    const newLocation = { lat: latitude, lng: longitude }
                    setLocations(newLocation)
                    handleLocation(newLocation)
                },
                (error) => {
                    console.error('Error getting location: ', error)
                }
            )
        }
    }

    useEffect(() => {
        const fetchZone = async () => {
            if (RestaurantJoinFormik.values?.lat && RestaurantJoinFormik.values?.lng) {
                try {
                    const { data } = await GoogleApi.getZoneId({ lat: RestaurantJoinFormik.values.lat, lng: RestaurantJoinFormik.values.lng })
                    if (data?.zone_data?.length > 0) {
                        const newZoneId = data.zone_data[0].id
                        zoneHandler(newZoneId)
                    }
                } catch (e) {
                    console.error(e)
                }
            }
        }

        const timer = setTimeout(() => {
            fetchZone()
        }, 500) // Debounce delay

        return () => clearTimeout(timer)
    }, [RestaurantJoinFormik.values?.lat, RestaurantJoinFormik.values?.lng])
    const { data: zoneList, refetch: zoneListRefetch } = useGetZoneList()

    useEffect(() => {
        if (!zoneOptions || zoneOptions.length === 0) {
            zoneListRefetch()
        }
    }, [])

    const fallbackZoneOptions = useMemo(() => {
        if (!zoneList || zoneList.length === 0) return []
        return zoneList.map((zone) => ({
            label: zone.name,
            value: zone.id,
        }))
    }, [zoneList])

    const zoneOptionData =
        zoneOptions && zoneOptions.length > 0
            ? zoneOptions
            : fallbackZoneOptions

    const { data: zoneData, refetch } = useQuery(
        ['zoneId', currentLatLng],
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
        if (typeof window !== 'undefined' && !currentLatLng && zoneData?.data) {
            localStorage.setItem(
                'currentLatLng',
                JSON.stringify(configData?.default_location)
            )
            localStorage.setItem('zoneid', zoneData?.data?.zone_id)

            if (zoneData?.data?.zone_id && zoneData?.data?.zone_data?.[0]?.id) {
                zoneHandler?.(zoneData?.data?.zone_data?.[0]?.id)
            }
        }
    }, [configData?.default_location, zoneData?.data, zoneData])

    const [renderKey, setRenderKey] = useState(0)

    useEffect(() => {
        if (landingFormData?.restaurant_address) {
            handleLocation(landingFormData?.restaurant_address)
        }

    }, [])
    const tinNumberHandler = (value) => {
        const filtered = value.replace(/[^0-9\-\/]/g, '')
        RestaurantJoinFormik.setFieldValue('tin', filtered)
    }


    return (
        <CustomStackFullWidth key={renderKey}>
            <form noValidate onSubmit={RestaurantJoinFormik.handleSubmit}>
                <CustomStackFullWidth
                    sx={{
                        border: `1px solid ${theme.palette.neutral[200]}`,
                        marginTop: isSmallSize ? '1rem' : '2rem',
                        borderRadius: '20px',
                        padding: { xs: '1rem', md: '20px' },
                        backgroundColor: theme.palette.neutral[100],
                    }}
                >
                    <Stack
                        sx={{
                            backgroundColor: theme.palette.neutral[100],
                            borderRadius: '8px',
                        }}
                    >
                        <Typography
                            fontSize={{ xs: '0.875rem', sm: '1rem' }}
                            fontWeight="500"
                            textAlign="left"
                            mb=".75rem"
                            sx={{
                                color: theme.palette.neutral[1000],
                            }}
                        >
                            {t('Restaurant Info')}
                        </Typography>

                        <CustomStackFullWidth>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Box>
                                        <RestaurantDetailsForm
                                            submitForm={submitForm}
                                            RestaurantJoinFormik={
                                                RestaurantJoinFormik
                                            }
                                            restaurantNameHandler={
                                                restaurantNameHandler
                                            }
                                            restaurantAddressHandler={
                                                restaurantAddressHandler
                                            }
                                            restaurantvatHandler={
                                                restaurantVatHandler
                                            }
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
                                            handleDeleteCuisine={
                                                handleDeleteCuisine
                                            }
                                            handleClearAllCuisines={
                                                handleClearAllCuisines
                                            }
                                            currentTab={currentTab}
                                            handleCurrentTab={handleCurrentTab}
                                            tabs={tabs}
                                            selectedLanguage={selectedLanguage}
                                            setInZone={setInZone}
                                            key={key}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <CustomStackFullWidth spacing={3}>
                                        <Alert
                                            icon={
                                                <EmojiObjectsIcon fontSize="inherit" />
                                            }
                                            severity="info"
                                        >
                                            {t(
                                                'Set Precious Location On Map for your exact pickup location'
                                            )}
                                        </Alert>
                                        <Box sx={{ position: 'relative' }}>
                                            <MapWithSearch
                                                searchBoxInside={true}
                                                isGps={true}
                                                padding="0px"
                                                coords={coords}
                                                mapHeight={isSmall ? '260px' : '200px'}
                                                heightFromStore="250px"
                                                polygonPaths={polygonPaths}
                                                restaurantAddressHandler={
                                                    restaurantAddressHandler
                                                }
                                                handleLocation={handleLocation}
                                                setInZone={setInZone}
                                                zoneId={
                                                    RestaurantJoinFormik?.values
                                                        ?.zoneId
                                                }
                                                locationFrom={
                                                    landingFormData?.restaurant_address
                                                }
                                                locationCreated={{
                                                    lat: RestaurantJoinFormik?.values?.lat,
                                                    lng: RestaurantJoinFormik?.values?.lng
                                                }}
                                                setShowZoneWarning={
                                                    setShowZoneWarning
                                                }
                                                handleAgreeLocation={handleAgreeLocation}
                                                fromStoreRegistration={true}
                                            />
                                            {!inZone ? (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: '4%',
                                                        left: '50%',
                                                        transform:
                                                            'translateX(-50%)',
                                                        zIndex: 999,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
                                                        backgroundColor:
                                                            theme.palette
                                                                .neutral[800],
                                                        padding: '8px 12px',
                                                        borderRadius: '.5rem',
                                                        gap: '5px',
                                                        width: 'max-content',
                                                        maxWidth: '95%',
                                                    }}
                                                >
                                                    <ReportIcon
                                                        sx={{
                                                            color: theme.palette
                                                                .warning.main,
                                                            fontSize: '20px',
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: theme.palette
                                                                .neutral[100],
                                                            fontSize: '12px',
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {t(
                                                            'Please place the marker inside the available zones.'
                                                        )}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <CustomStackFullWidth
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: '4%',
                                                        left: {
                                                            xs: "15px",
                                                            md: "0"
                                                        },
                                                        right: '0px',
                                                        zIndex: 999,
                                                        display: 'flex',
                                                        justifyContent: { xs: "flex-start", md: "center" },
                                                        alignItems: { xs: "flex-start", md: "center" },
                                                    }}
                                                >
                                                    <Stack
                                                        direction="row"
                                                        spacing={2}
                                                        backgroundColor={
                                                            theme.palette
                                                                .neutral[100]
                                                        }
                                                        paddingX="5px"
                                                        borderRadius="3px"
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontSize:
                                                                    '12px',
                                                                color:
                                                                    theme.palette
                                                                        .neutral[1000],
                                                            }}
                                                        >
                                                            Lat:{' '}
                                                            {Number(
                                                                location?.lat
                                                            )?.toFixed(7)}
                                                        </Typography>
                                                        <Typography
                                                            sx={{
                                                                fontSize:
                                                                    '12px',
                                                                color:
                                                                    theme.palette
                                                                        .neutral[1000],
                                                            }}
                                                        >
                                                            Lng:{' '}
                                                            {Number(
                                                                location?.lng
                                                            )?.toFixed(7)}
                                                        </Typography>
                                                    </Stack>
                                                </CustomStackFullWidth>
                                            )}
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
                </CustomStackFullWidth>

                <CustomStackFullWidth
                    sx={{
                        border: `1px solid ${theme.palette.neutral[200]}`,
                        marginTop: '1rem',
                        borderRadius: '20px',
                        padding: { xs: '1rem', md: '20px' },
                        backgroundColor: (theme) => theme.palette.neutral[100],
                    }}
                >
                    <Typography
                        fontSize={{ xs: '0.875rem', sm: '1rem' }}
                        fontWeight="500"
                        sx={{
                            pb: '1rem',
                            color: (theme) => theme.palette.neutral[1000],
                        }}
                    >
                        {t('Owner Info')}
                    </Typography>

                    <CustomStackFullWidth
                        sx={{
                            backgroundColor: theme.palette.neutral[200],
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
                </CustomStackFullWidth>

                <CustomStackFullWidth
                    sx={{
                        border: `1px solid ${theme.palette.neutral[200]}`,
                        marginTop: '1rem',
                        borderRadius: '20px',
                        padding: { xs: '1rem', md: '20px' },
                        backgroundColor: (theme) => theme.palette.neutral[100],
                    }}
                >
                    <Typography
                        fontSize={{ xs: '0.875rem', sm: '1rem' }}
                        fontWeight="500"
                        sx={{
                            pb: '1rem',
                            color: (theme) => theme.palette.neutral[1000],
                        }}
                    >
                        {t('Account Info')}
                    </Typography>

                    <CustomStackFullWidth
                        sx={{
                            backgroundColor: theme.palette.neutral[200],
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
                </CustomStackFullWidth>

                <CustomStackFullWidth
                    sx={{
                        border: `1px solid ${theme.palette.neutral[200]}`,
                        marginTop: '1rem',
                        borderRadius: '20px',
                        padding: { xs: '1rem', md: '20px' },
                        backgroundColor: (theme) => theme.palette.neutral[100],
                    }}
                >
                    <Typography
                        fontSize={{ xs: '0.875rem', sm: '1rem' }}
                        fontWeight="500"
                        sx={{
                            pb: '1rem',
                            color: (theme) => theme.palette.neutral[1000],
                        }}
                    >
                        {t('Business TIN')}
                    </Typography>

                    <BusinessTin
                        RestaurantJoinFormik={RestaurantJoinFormik}
                        //restaurantVatHandler={restaurantVatHandler}
                        configData={configData}
                        tinNumberHandler={tinNumberHandler}
                        selectedDates={selectedDates}
                        setSelectedDates={setSelectedDates}
                        imageOnchangeHandlerForTinImage={
                            imageOnchangeHandlerForTinImage
                        }
                        singleFileUploadHandlerForTinFile={
                            singleFileUploadHandlerForTinFile
                        }
                        preview={preview}
                        setFile={setFile}
                        file={file}
                        setPreview={setPreview}
                    />
                </CustomStackFullWidth>

                <CustomStackFullWidth
                    sx={{
                        border: `1px solid ${theme.palette.neutral[200]}`,
                        marginTop: '1rem',
                        borderRadius: '20px',
                        padding: { xs: '1rem', md: '20px' },
                        backgroundColor: (theme) => theme.palette.neutral[100],
                    }}
                >
                    <Typography
                        fontSize={{ xs: '0.875rem', sm: '1rem' }}
                        fontWeight="500"
                        sx={{
                            pb: '1rem',
                            color: (theme) => theme.palette.neutral[1000],
                        }}
                    >
                        {t('Additonal Info')}
                    </Typography>

                    <StoreAdditionalInfo
                        additionalDataKey={additionalDataKey}
                        RestaurantJoinFormik={RestaurantJoinFormik}
                        configData={configData}
                        submitForm={submitForm}
                    />
                </CustomStackFullWidth>

                <Stack
                    mt="1rem"
                    direction="row"
                    justifyContent="flex-end"
                    sx={{
                        position: 'sticky',
                        // bottom: isBottomMenu ? '66px' : '0',
                        bottom: '0',
                        zIndex: 999,
                        // display: 'inline-flex !important',
                    }}
                >
                    <Stack
                        direction="row"
                        gap={3}
                        sx={{
                            backgroundColor:
                                theme.palette.background.profileBackground,
                            borderRadius: '15px',
                            p: '.75rem',
                        }}
                    >
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
                                background: (theme) =>
                                    theme.palette.primary.main,
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
                    </Stack>
                </Stack>
            </form>
        </CustomStackFullWidth>
    )
}

export default StoreRegistrationForm
