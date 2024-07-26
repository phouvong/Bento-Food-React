import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    welcomeModal: false,
}
export const utilsSlice = createSlice({
    name: 'utils-data',
    initialState,
    reducers: {
        setWelcomeModal: (state, action) => {
            state.welcomeModal = action.payload
        },
    },
})

export const { setWelcomeModal } = utilsSlice.actions

export default utilsSlice.reducer
