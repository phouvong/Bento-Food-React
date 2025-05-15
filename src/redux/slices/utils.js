import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    welcomeModal: false,
    isNeedLoad: false,
    trackOrderStoreData: {},
}
export const utilsSlice = createSlice({
    name: 'utils-data',
    initialState,
    reducers: {
        setWelcomeModal: (state, action) => {
            state.welcomeModal = action.payload
        },
        setIsNeedLoad: (state, action) => {
            state.isNeedLoad = action.payload
        },
        setTrackOrderStoreData: (state, action) => {
            state.trackOrderStoreData = action.payload
        },
        setTrackOrderPhone: (state, action) => {
            state.trackOrderStoreData = {
                ...state.trackOrderStoreData,
                phone: action.payload,
            }
        },
    },
})

export const { setTrackOrderStoreData, setWelcomeModal, setIsNeedLoad } =
    utilsSlice.actions

export default utilsSlice.reducer
