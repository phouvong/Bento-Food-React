import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    language: '',
    countryCode: 'US',
    countryFlag: '/_next/static/media/us.b358a5c6.svg',
    // True while a language switch is in flight (i18n swap + query refetches).
    // Drives the global LanguageChangeBackdrop in _app.js — global so it
    // survives the switcher's parent menu/drawer unmounting.
    isLanguageChanging: false,
}

// Action creators are generated for each case reducer function
export const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setLanguage: (state, action) => {
            state.language = action.payload
        },
        setCountryCode: (state, action) => {
            state.countryCode = action.payload
        },
        setCountryFlag: (state, action) => {
            state.countryFlag = action.payload
        },
        setIsLanguageChanging: (state, action) => {
            state.isLanguageChanging = action.payload
        },
    },
})

export const {
    setLanguage,
    setCountryCode,
    setCountryFlag,
    setIsLanguageChanging,
} = languageSlice.actions

export default languageSlice.reducer
