import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    guestUserInfo: null,
}
const guestUserSlice = createSlice({
    name: 'guest-user',
    initialState,
    reducers: {
        setGuestUserInfo: (state, action) => {
            state.guestUserInfo = action.payload
        },
    },
})

export const { setGuestUserInfo } = guestUserSlice.actions
export default guestUserSlice.reducer
