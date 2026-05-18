import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    allData: {},
    activeStep: 0,
    zoneOptions: [],
    businessLogo: null,
}

// Action creators are generated for each case reducer function
export const storedResDataSlice = createSlice({
    name: 'mple',
    initialState,
    reducers: {
        setAllData: (state, action) => {
            state.allData = action.payload
        },
        setActiveStep: (state, action) => {
            state.activeStep = action.payload
        },
        setZoneOptions: (state, action) => {
            state.zoneOptions = action.payload
        },
        setBusinessLogo: (state, action) => {
            state.businessLogo = action.payload
        },
    },
})

export const { setAllData, setActiveStep, setZoneOptions, setBusinessLogo, } = storedResDataSlice.actions

export default storedResDataSlice.reducer
