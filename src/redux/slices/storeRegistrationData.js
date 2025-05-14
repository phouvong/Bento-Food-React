import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    allData: {},
    activeStep: 0,
    zoneOptions: [],
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
    },
})

export const { setAllData, setActiveStep, setZoneOptions } = storedResDataSlice.actions

export default storedResDataSlice.reducer
