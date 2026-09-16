export const normalizeAddressValues = (values = {}) => {
    const latitude = values?.latitude ?? values?.lat
    const longitude = values?.longitude ?? values?.lng
    return {
        ...values,
        latitude,
        longitude,
        lat: latitude,
        lng: longitude,
        address_type: values?.address_type || 'Selected Address',
    }
}

export const setLocalLocation = (values = {}) => {
    if (typeof window === 'undefined') return
    if (values?.latitude && values?.longitude) {
        localStorage.setItem(
            'currentLatLng',
            JSON.stringify({
                lat: values.latitude,
                lng: values.longitude,
            })
        )
    }
    if (values?.address) {
        localStorage.setItem('location', values.address)
    }
}
