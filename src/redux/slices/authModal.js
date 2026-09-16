import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    isOpen: false,
    modalFor: 'sign-in',
}

export const authModal = createSlice({
    name: 'authModal',
    initialState,
    reducers: {
        openAuthModal: (state, action) => {
            state.isOpen = true
            state.modalFor = action.payload ?? 'sign-in'
        },
        setAuthModalFor: (state, action) => {
            state.modalFor = action.payload
        },
        closeAuthModal: (state) => {
            state.isOpen = false
            state.modalFor = 'sign-in'
        },
    },
})

export const { openAuthModal, setAuthModalFor, closeAuthModal } =
    authModal.actions
export default authModal.reducer
