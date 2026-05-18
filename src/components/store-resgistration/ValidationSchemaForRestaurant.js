import React from 'react'

import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'

const IMAGE_SUPPORTED_FORMATS = [
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/png',
    'image/webp',
]

const ValidationSchemaForRestaurant = (
    additionalDataValidation,
    additionalDocumentsValidation
) => {
    const { t } = useTranslation()

    const FILE_SIZE = 20000000

    return Yup.object({
        restaurant_name: Yup.object().required(t('restaurant name required')),
        restaurant_address: Yup.object().required(
            t('restaurant address required')
        ),
        f_name: Yup.string().required(t('Name is required')),
        l_name: Yup.string().required(t('last name required')),
        phone: Yup.string()
            .required(t('phone number required'))
            .min(10, t('Phone number must be at least 10 digits')),

        min_delivery_time: Yup.string()
            .required(t('Minimum Delivery Time'))
            .test(
                'min-less-than-max',
                t(
                    'Min Delivery Time cannot be more than Max Delivery Time'
                ),
                function (value) {
                    const { max_delivery_time } = this.parent
                    if (max_delivery_time && value) {
                        return parseInt(value) <= parseInt(max_delivery_time)
                    }
                    return true // If either min or max is not set, skip validation
                }
            ),
        max_delivery_time: Yup.string()
            .required(t('Maximum Delivery Time'))
            .test(
                'max-greater-than-min',
                t(
                    'Max Delivery Time must be greater than Min Delivery Time'
                ),
                function (value) {
                    const { min_delivery_time } = this.parent
                    if (min_delivery_time && value) {
                        return parseInt(value) > parseInt(min_delivery_time)
                    }
                    return true // If either min or max is not set, skip validation
                }
            ),
        delivery_time_type: Yup.string().required(t(' Delivery Time Type')),

        lat: Yup.string().required(t('Latitude is required')),
        lng: Yup.string().required(t('Longitude is required')),
        zoneId: Yup.number().required(t('Zone is required')),

        logo: Yup.mixed()
            .required()
            .test(
                'fileSize',
                'file too large',
                (value) => value === null || (value && value.size <= FILE_SIZE)
            )
            .test(
                'fileFormat',
                t('Unsupported Format'),
                (value) => value && IMAGE_SUPPORTED_FORMATS.includes(value.type)
            ),
        cover_photo: Yup.mixed()
            .required(t('Restaurant Cover Photo is a required field'))

            .test(
                'fileFormat',
                t('Unsupported Format'),
                (value) => value && IMAGE_SUPPORTED_FORMATS.includes(value.type)
            ),
        email: Yup.string()
            .email('Must be a valid email')
            .max(255)
            .required(t('Email is required')),

        password: Yup.string()

            .test(
                "password-requirements",
                "Password requirements not met",
                function (value) {
                    const errors = [];

                    // Always check length
                    if (!value || value.length < 8) {
                        errors.push(t('8 characters minimum.'))
                    }
                    // Check for number
                    if (!value || !/[0-9]/.test(value)) {
                        errors.push(t('1 digit'))
                    }
                    // Check for uppercase
                    if (!value || !/[A-Z]/.test(value)) {
                        errors.push(t('1 capital letter'))
                    }
                    // Check for lowercase
                    if (!value || !/[a-z]/.test(value)) {
                        errors.push(t('1 small letter'))
                    }
                    // Check for special character
                    if (!value || !/[!@#$%^&*(),.?":{}|<>+_=]/.test(value)) {
                        errors.push(t('1 special character'))
                    }

                    if (errors.length > 0) {
                        return this.createError({ message: errors.join(" ") });
                    }
                    return true;
                }
            ),
        confirm_password: Yup.string()
            .required(t('Confirm Password required'))
            .oneOf([Yup.ref('password'), null], t('Passwords must match')),
        additional_data: additionalDataValidation,

        // additional_documents: additionalDocumentsValidation,
    })
}

export default ValidationSchemaForRestaurant
