import { alpha } from '@mui/system'
import { useTranslation } from 'react-i18next'
import UserInfo from './UserInfo'
import IdentityInfo from './IdentityInfo'
import AccountInfo from './AccountInfo'
import DeliverymanFormWrapper from './DeliverymanFormWrapper'
import { useFormik } from 'formik'
import { useState } from 'react'

import toast from 'react-hot-toast'

import { useRouter } from 'next/router'
import {
    ActonButtonsSection,
    FormSection,
    RegistrationCardWrapper,
    TitleTopSection,
} from './CustomStylesDeliveryman'
import { CustomButton } from '@/styled-components/CustomStyles.style'
import { Typography } from '@mui/material'
import AdditionalInformation from './AdditionalInformation'
import { usePostDeliveryManRegisterInfo } from '@/hooks/react-query/deliveryman-registration/useRegisterDeliveryMan'
import { onErrorResponse } from '../ErrorResponse'
import * as Yup from 'yup'

const DeliveryManComponent = ({ configData }) => {
    const router = useRouter()
    const { t } = useTranslation()
    const [image, setImage] = useState('')
    const [identityImage, setIdentityImage] = useState('')
    const [additionalImage, setAdditionalImage] = useState('')
    const [key, setKey] = useState(0)
    const { mutate: registerDeliveryman, isLoading } =
        usePostDeliveryManRegisterInfo()

    const generateValidationForField = (field) => {
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

    // Dynamically generate validation schema for additional data
    const additionalDataValidation = (configData) => {
        const dynamicSchema = {}

        configData?.deliveryman_additional_join_us_page_data?.data?.forEach(
            (item) => {
                // Skip fields with 'checkbox' field_type
                if (item.field_type !== 'check_box') {
                    dynamicSchema[`${item.input_data}`] =
                        generateValidationForField(item)
                }
            }
        )

        return Yup.object().shape(dynamicSchema)
    }

    // Main validation schema
    const deliveryManValidationSchema = Yup.object().shape({
        f_name: Yup.string()
            .required('First name is required')
            .min(2, 'First name must be at least 2 characters')
            .max(50, "First name can't exceed 50 characters"),

        l_name: Yup.string()
            .required('Last name is required')
            .min(2, 'Last name must be at least 2 characters')
            .max(50, "Last name can't exceed 50 characters"),

        email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),

        phone: Yup.string().required('Phone number is required'),

        password: Yup.string()
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters')
            .max(20, "Password can't exceed 20 characters")
            .matches(
                /[A-Z]/,
                'Password must contain at least one uppercase letter'
            )
            .matches(
                /[a-z]/,
                'Password must contain at least one lowercase letter'
            )
            .matches(/[0-9]/, 'Password must contain at least one number')
            .matches(
                /[@$!%*?&#]/,
                'Password must contain at least one special symbol'
            ),

        confirm_password: Yup.string()
            .required('Confirm Password is required')
            .oneOf([Yup.ref('password'), null], 'Passwords must match'),

        earning: Yup.number()
            .typeError('Earning must be a number')
            .required('Earning is required'),

        zone_id: Yup.string().required('Zone selection is required'),

        vehicle_id: Yup.string().required('Vehicle selection is required'),

        identity_type: Yup.string()
            .required('Identity type is required')
            .oneOf(
                ['passport', 'driving_license', 'nid'],
                'Invalid identity type'
            ),

        identity_number: Yup.string().required('Identity number is required'),

        image: Yup.mixed()
            .required('Profile image is required')
            .test('fileType', 'Only images are allowed', (value) =>
                value
                    ? ['image/jpeg', 'image/png', 'image/jpg'].includes(
                          value.type
                      )
                    : false
            ),

        identity_image: Yup.array()
            .of(
                Yup.mixed()
                    .required('Each identity image is required')
                    .test('fileType', 'Only images are allowed', (value) =>
                        value
                            ? ['image/jpeg', 'image/png', 'image/jpg'].includes(
                                  value.type
                              )
                            : false
                    )
            )
            .min(1, 'At least one identity image is required') // Ensure at least one image is selected
            .required('Identity images are required'),

        // Dynamically generated additional data validation
        additional_data: additionalDataValidation(configData),
    })
    const generateInitialValues = (configData) => {
        const initialValues = {
            f_name: '',
            l_name: '',
            email: '',
            earning: '',
            zone_id: '',
            vehicle_id: '',
            identity_type: '',
            identity_number: '',
            phone: '',
            password: '',
            confirm_password: '',
            additional_data: {},
        }

        // Loop through the dynamic fields in configData to set initial values for additional_data
        configData?.deliveryman_additional_join_us_page_data?.data?.forEach(
            (item) => {
                const inputKey = item.input_data

                // Initialize each field in additional_data as an empty string or array
                if (item.field_type !== 'file') {
                    initialValues.additional_data[inputKey] = ''
                }
            }
        )

        return initialValues
    }

    const initialValues = generateInitialValues(configData)
    const deliveryManFormik = useFormik({
        initialValues: initialValues,
        validationSchema: deliveryManValidationSchema,
        onSubmit: async (values, helpers) => {
            try {
                const { confirm_password, ...modifiedValues } = values
                const formData = new FormData()
                const tempData = { ...modifiedValues }
                // Ensure additional_documents is an array
                tempData.additional_documents = [
                    ...(tempData.additional_documents || []),
                ]
                // Loop through configData to match the field keys and handle multiple files
                configData?.deliveryman_additional_join_us_page_data?.data?.forEach(
                    (item) => {
                        const inputKey = item?.input_data
                        // Check if the field exists in tempData and is a file field
                        if (inputKey && tempData[inputKey]) {
                            if (item?.field_type === 'file') {
                                const dynamicKey = `additional_documents[${inputKey}][]`
                                if (
                                    item?.media_data?.upload_multiple_files ===
                                    1
                                ) {
                                    // Handle multiple files
                                    const files = Array.isArray(
                                        tempData[inputKey]
                                    )
                                        ? tempData[inputKey]
                                        : [tempData[inputKey]]
                                    // Append each file to FormData
                                    files.forEach((file) => {
                                        formData.append(dynamicKey, file)
                                    })
                                } else {
                                    // Handle a single file
                                    formData.append(
                                        dynamicKey,
                                        tempData[inputKey]
                                    )
                                }
                                // Remove the key from tempData after processing the file(s)
                                delete tempData[inputKey]
                            }
                        }
                    }
                )
                // Iterate through modified values and append the rest to FormData
                Object.entries(tempData).forEach(([key, value]) => {
                    // Handle identity_image as an array of files
                    if (key === 'identity_image' && Array.isArray(value)) {
                        value.forEach((image) => {
                            formData.append('identity_image[]', image)
                        })
                    }
                    // Handle additional_documents as an array of files
                    else if (
                        key === 'additional_documents' &&
                        Array.isArray(value)
                    ) {
                        value.forEach((document) => {
                            formData.append('additional_documents[]', document)
                        })
                    }
                    // Handle additional_data as a JSON object
                    else if (
                        key === 'additional_data' &&
                        typeof value === 'object'
                    ) {
                        formData.append(
                            'additional_data',
                            JSON.stringify(value)
                        )
                    }
                    // Append other fields if they are not undefined or null
                    else if (value !== undefined && value !== null) {
                        formData.append(key, value)
                    }
                })
                // Call the API function
                registerDeliveryman(formData, {
                    onSuccess: (res) => {
                        toast.success(res.message, {
                            id: res.message,
                        })
                        // Optional reset of the form and state
                        helpers.resetForm()
                        setImage('')
                        setKey((prv) => prv + 1)
                        setIdentityImage('')
                        setAdditionalImage('')
                        router.push('/home') // Uncomment if redirection is needed
                    },
                    onError: onErrorResponse,
                })
            } catch (err) {
                console.error('Submission error:', err)
            }
        },
    })

    const handleFieldChange = (field, value) => {
        deliveryManFormik.setFieldValue(field, value)
    }

    const handleReset = () => {
        deliveryManFormik.resetForm()
        setKey((prv) => prv + 1)
        setImage('')
        setIdentityImage('')
        setAdditionalImage('')
    }
    return (
        <>
            <TitleTopSection sx={{ textAlign: 'center' }}>
                <Typography
                    variant="h4"
                    sx={{
                        mt: { xs: '100px', md: '140px' },
                        fontWeight: '600',
                        fontSize: { xs: '17px', md: '22px' },
                        color: (theme) => theme.palette.neutral[1000],
                        lineHeight: '36px',
                    }}
                >
                    {t('Deliveryman Registration Application')}
                </Typography>
            </TitleTopSection>

            <form onSubmit={deliveryManFormik.handleSubmit}>
                <RegistrationCardWrapper>
                    <FormSection>
                        <DeliverymanFormWrapper
                            title={'User Info'}
                            component={
                                <UserInfo
                                    {...{
                                        deliveryManFormik,
                                        image,
                                        setImage,
                                    }}
                                    handleFieldChange={handleFieldChange}
                                />
                            }
                        />
                        <DeliverymanFormWrapper
                            title={'Identity Info'}
                            component={
                                <IdentityInfo
                                    {...{
                                        deliveryManFormik,
                                        identityImage,
                                        setIdentityImage,
                                    }}
                                    handleFieldChange={handleFieldChange}
                                />
                            }
                        />

                        <DeliverymanFormWrapper
                            title={'Account Info'}
                            component={
                                <AccountInfo
                                    configData={configData}
                                    {...{
                                        deliveryManFormik,
                                    }}
                                    handleFieldChange={handleFieldChange}
                                />
                            }
                        />
                        <DeliverymanFormWrapper
                            key={key}
                            title={'Additional Information'}
                            component={
                                <AdditionalInformation
                                    {...{
                                        deliveryManFormik,
                                        additionalImage,
                                        setAdditionalImage,

                                        configData,
                                    }}
                                    handleFieldChange={handleFieldChange}
                                />
                            }
                        />
                    </FormSection>

                    <ActonButtonsSection>
                        <CustomButton
                            onClick={handleReset}
                            disabled={isLoading}
                            sx={{
                                backgroundColor: (theme) =>
                                    alpha(theme.palette.neutral[200], 0.3),
                                color: (theme) =>
                                    `${theme.palette.primary.dark} !important`,
                                px: '30px',

                                borderRadius: '5px',
                            }}
                        >
                            {t('Reset')}
                        </CustomButton>
                        <CustomButton
                            type="submit"
                            disabled={isLoading}
                            variant="contained"
                            sx={{
                                background: (theme) =>
                                    theme.palette.primary.main,
                                color: (theme) =>
                                    `${theme.palette.neutral[100]}!important`,
                                px: '30px',
                                borderRadius: '5px',
                                fontWeight: '500',
                                fontSize: '14px',
                            }}
                        >
                            {t(
                                isLoading
                                    ? 'Submitting...'
                                    : 'Submit Information'
                            )}
                        </CustomButton>
                    </ActonButtonsSection>
                </RegistrationCardWrapper>
            </form>
        </>
    )
}
export default DeliveryManComponent
