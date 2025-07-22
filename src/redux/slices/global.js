import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    global: undefined,
    couponInfo: null,
    couponType: '',
    zoneData: null,
    handleHomePage: false,
    openMapDrawer: false,
    userLocationUpdate: false,
    businessLogo: null,
}

export const globalSettingSlice = createSlice({
    name: 'globalData',
    initialState,
    reducers: {
        setGlobalSettings: (state, action) => {
            state.global = action.payload
        },
        setCouponInfo: (state, action) => {
            state.couponInfo = action?.payload
        },
        setBusinessLogo: (state, action) => {
            state.businessLogo = action?.payload
        },
        setCouponType: (state, action) => {
            state.couponType = action?.payload
        },
        setZoneData: (state, action) => {
            state.zoneData = action?.payload
        },
        setHandleHomePage: (state, action) => {
            state.handleHomePage = action.payload
        },
        setOpenMapDrawer: (state, action) => {
            state.openMapDrawer = action.payload
        },
        setUserLocationUpdate: (state, action) => {
            state.userLocationUpdate = action.payload
        },
    },
})

// Action creators are generated for each case reducer function
export const {
    setGlobalSettings,
    setCouponInfo,
    setCouponType,
    setZoneData,
    setHandleHomePage,
    setOpenMapDrawer,
    setUserLocationUpdate,
    setBusinessLogo,
} = globalSettingSlice.actions
export default globalSettingSlice.reducer
