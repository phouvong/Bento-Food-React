import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    welcomeModal: false,
    isNeedLoad: false,
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
    },
})

export const { setWelcomeModal, setIsNeedLoad } = utilsSlice.actions

export default utilsSlice.reducer
