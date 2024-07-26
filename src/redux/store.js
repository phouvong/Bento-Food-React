import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import counterReducer from '../redux/slices/counter'
import layoutReducer from '../redux/slices/layout'
import offlinePaymentInfoReducer from './slices/OfflinePayment'
import addressDataReducer from './slices/addressData'
import cartReducer from './slices/cart'
import cashbackReducer from './slices/cashbackList'
import userSlice from './slices/customer'
import editProfileReducer from './slices/editProfile'
import fbCredentialSlice from './slices/fbCredentials'
import globalSettingsReducer from './slices/global'
import guestUserReducer from './slices/guestUserInfo'
import landingPageSliceReducer from './slices/landingpagedata'
import languageChangeReducer from './slices/languageChange'
import orderTypeSlice from './slices/orderType'
import restaurantFoodFilterSlice from './slices/restaurantFoodFilter'
import scrollPosition from './slices/scrollPosition'
import searchFilterSlice from './slices/searchFilter'
import searchTagsReducer from './slices/searchTagSlice'
import storedDataSliceReducer from './slices/storedData'
import userTokenReducer from './slices/userToken'
import utilsReducers from './slices/utils'
import wishListSlice from './slices/wishList'
const persistConfig = {
    key: 'stack-food',
    storage: storage,
    blacklist: [
        'searchFilterStore',
        'storedData',
        'scrollPosition',
        'globalSettings',

    ],
}
const reducers = combineReducers({
    counter: counterReducer,
    layout: layoutReducer,
    globalSettings: globalSettingsReducer,
    cart: cartReducer,
    wishList: wishListSlice,
    restaurantFoodFilterStore: restaurantFoodFilterSlice,
    searchFilterStore: searchFilterSlice,
    user: userSlice,
    orderType: orderTypeSlice,
    fbCredentialsStore: fbCredentialSlice,
    storedData: storedDataSliceReducer,
    landingPage: landingPageSliceReducer,
    userToken: userTokenReducer,
    languageChange: languageChangeReducer,
    offlinePayment: offlinePaymentInfoReducer,
    guestUserInfo: guestUserReducer,
    scrollPosition: scrollPosition,
    searchTags: searchTagsReducer,
    addressData: addressDataReducer,
    isEditProfile: editProfileReducer,
    cashbackList: cashbackReducer,
    utilsData: utilsReducers,
})
const persistedReducer = persistReducer(persistConfig, reducers)
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
            // serializableCheck: {
            //     ignoredActions: [
            //         FLUSH,
            //         REHYDRATE,
            //         PAUSE,
            //         PERSIST,
            //         PURGE,
            //         REGISTER,
            //     ],
            // },
        }),
})
