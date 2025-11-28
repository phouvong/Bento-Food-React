// Safe localStorage access for SSR compatibility

export const getFromLocalStorage = (key, defaultValue = null) => {
    if (typeof window !== 'undefined') {
        try {
            const item = localStorage.getItem(key)
            return item !== null ? item : defaultValue
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error)
            return defaultValue
        }
    }
    return defaultValue
}

export const setToLocalStorage = (key, value) => {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(key, value)
            return true
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error)
            return false
        }
    }
    return false
}

export const removeFromLocalStorage = (key) => {
    if (typeof window !== 'undefined') {
        try {
            localStorage.removeItem(key)
            return true
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error)
            return false
        }
    }
    return false
}

export const clearLocalStorage = () => {
    if (typeof window !== 'undefined') {
        try {
            localStorage.clear()
            return true
        } catch (error) {
            console.error('Error clearing localStorage:', error)
            return false
        }
    }
    return false
}

// Specific getters for commonly used values
export const getLanguageDirection = () => getFromLocalStorage('direction', 'ltr')
export const getZoneId = () => getFromLocalStorage('zoneid')
export const getToken = () => getFromLocalStorage('token')
export const getGuestId = () => getFromLocalStorage('guest_id')
export const getCurrentLatLng = () => {
    const value = getFromLocalStorage('currentLatLng')
    try {
        return value ? JSON.parse(value) : null
    } catch {
        return null
    }
}
