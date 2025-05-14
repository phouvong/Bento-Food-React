import MainApi from '@/api/MainApi'
import { useMutation } from 'react-query'

const postData = async (storeData, configData) => {
    // Prepare translations
    const translationsR = []
    for (const [locale, name] of Object.entries(storeData.restaurant_name)) {
        translationsR.push({ id: null, locale, key: 'name', value: name })
    }

    for (const [locale, address] of Object.entries(
        storeData.restaurant_address
    )) {
        translationsR.push({ id: null, locale, key: 'address', value: address })
    }

    const translations = JSON.stringify(translationsR)

    // Final data structure for the store data
    const finalData = {
        translations,
        vat: storeData.vat,
        min_delivery_time: storeData?.min_delivery_time,
        max_delivery_time: storeData?.max_delivery_time,
        lat: storeData?.lng,
        lng: storeData?.lat,
        fName: storeData?.f_name,
        lName: storeData?.l_name,
        phone: storeData?.phone,
        email: storeData?.email,
        password: storeData?.password,
        zone_id: storeData?.zoneId,
        delivery_time_type: storeData?.delivery_time_type,
        business_plan: storeData?.value.business_plan,
        package_id: storeData?.value.package_id,
        logo: storeData?.logo,
        cover_photo: storeData?.cover_photo,
        cuisine_ids: JSON.stringify(storeData?.cuisine_ids),
        tags: JSON.stringify(storeData?.tags),
        additional_data: JSON.stringify(storeData?.additional_data),
    }

    const formData = new FormData()

    // Function to recursively append data to FormData
    const appendFormData = (formData, data, parentKey = '') => {
        Object.keys(data).forEach((key) => {
            const value = data[key]
            const fullKey = parentKey ? `${parentKey}[${key}]` : key

            // If value is an object and not a File, recursively append
            if (
                value &&
                typeof value === 'object' &&
                !(value instanceof File)
            ) {
                appendFormData(formData, value, fullKey)
            } else {
                formData.append(fullKey, value) // Otherwise, append the value directly
            }
        })
    }

    // Append the final data to FormData
    appendFormData(formData, finalData)

    // Handle file fields dynamically from configData
    configData?.restaurant_additional_join_us_page_data?.data?.forEach(
        (item) => {
            const inputKey = item?.input_data

            // Check if the field exists in storeData and if it is a file field
            if (inputKey && storeData[inputKey]) {
                if (item?.field_type === 'file') {
                    const dynamicKey = `additional_documents[${inputKey}][]` // Create dynamic key for files

                    // Check if the field allows multiple files
                    if (item?.media_data?.upload_multiple_files === 1) {
                        // Handle multiple files (if input is an array)
                        const files = Array.isArray(storeData[inputKey])
                            ? storeData[inputKey]
                            : [storeData[inputKey]]

                        files.forEach((file) => {
                            if (file instanceof File) {
                                formData.append(dynamicKey, file) // Append each file to FormData
                            }
                        })
                    } else {
                        // Handle a single file (if not multiple files)
                        const file = storeData[inputKey]
                        if (file instanceof File) {
                            formData.append(dynamicKey, file) // Append single file to FormData
                        }
                    }
                }
            }
        }
    )
    const { data: responseData } = await MainApi.post(
        `api/v1/auth/vendor/register`,
        formData
    )
    return responseData
}

export const usePostStoreRegistration = () => {
    return useMutation(({ tempData, configData }) =>
        postData(tempData, configData)
    )
}
