import { createSlice } from '@reduxjs/toolkit'
import { getIndexFromArrayByComparision } from '@/utils/customFunctions'
const initialState = {
    cartItem: null,
    cartList: [],
    campFoodList: [],
    type: 'regular',
    totalAmount: null,
    walletAmount: null,
    subscriptionSubTotal: null,
}
const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b)
export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        cart: (state, action) => {
            state.cartList = action.payload
        },
        setType: (state = initialState, action) => {
            state.type = action.payload
        },
        setCampCart: (state = initialState, action) => {
            state.campFoodList = [action.payload]
        },
        setCart: (state = initialState, action) => {
            let isPayloadItemMatches = false
            if (state.cartList.length > 0) {
                for (let i = 0; i < state.cartList.length; i++) {
                    if (
                        isEqual(
                            state.cartList[i].variations,
                            action.payload.variations
                        ) &&
                        state.cartList[i].id === action.payload.id
                    ) {
                        isPayloadItemMatches = true
                        state.cartList[i] = {
                            ...state.cartList[i],
                            totalPrice:
                                state.cartList[i].totalPrice +
                                action.payload.totalPrice,
                            quantity:
                                state.cartList[i].quantity +
                                action.payload.quantity,
                        }
                        return
                    } else {
                        isPayloadItemMatches = false
                    }
                }
                if (!isPayloadItemMatches) {
                    state.cartList.push(action.payload)
                }
            } else {
                state.cartList = [
                    ...state.cartList,
                    {
                        ...action.payload,
                    },
                ]
            }
        },
        setVariationToCart: (state = initialState, action) => {
            let isAvailable = state.cartList.filter(
                (item) => item.id === action.payload.id
            )
            if (isAvailable.length > 0) {
                let isA = isAvailable.filter((item) =>
                    item.variation.some(
                        (va) =>
                            JSON.stringify(va) ===
                            JSON.stringify(action.payload.variation[0])
                    )
                )
                if (isA.length === 0) {
                    state.cartList.push(action.payload)
                }
            }
        },
        setUpdateVariationToCart: (state = initialState, action) => {
            const index = state.cartList.findIndex(
                (item, index) => index === action.payload.indexNumber
            )
            state.cartList = state.cartList.map((item, i) =>
                i === index ? action.payload.newObj : item
            )
        },
        setUpdateCart: (state = initialState, action) => {
            state.cartList = state.cartList.map((item) =>
                item.id === action.payload.id
                    ? {
                          ...item,
                          totalPrice: action.payload.totalPrice,
                          quantity: action.payload.quantity,
                      }
                    : item
            )
        },
        addProductToCart: (state, action) => {
            // state.value += action.payload
        },
        incrementProductQty: (state = initialState, action) => {
            let newData
            if (action.payload.variations.length > 0) {
                let index = getIndexFromArrayByComparision(
                    state.cartList,
                    action.payload
                )
                newData = state.cartList.map((item, i) =>
                    i === index
                        ? {
                              ...item,
                              totalPrice: action.payload.totalPrice,
                              quantity: action.payload.quantity,
                          }
                        : item
                )
                state.cartList = newData
            } else {
                newData = state.cartList.map((item) =>
                    item.id === action.payload.id
                        ? {
                              ...item,
                              totalPrice: action.payload.totalPrice,
                              quantity: action.payload.quantity,
                          }
                        : item
                )
                state.cartList = newData
            }
        },
        decrementProductQty: (state = initialState, action) => {
            let newData
            if (action.payload.variations.length > 0) {
                const index = getIndexFromArrayByComparision(
                    state.cartList,
                    action.payload
                )
                newData = state.cartList.map((item, i) =>
                    i === index
                        ? {
                              ...item,
                              totalPrice: action.payload.totalPrice,
                              quantity: action.payload.quantity,
                          }
                        : item
                )
                state.cartList = newData
            } else {
                newData = state.cartList.map((item) =>
                    item.id === action.payload.id
                        ? {
                              ...item,
                              totalPrice: action.payload.totalPrice,
                              quantity: action.payload.quantity,
                          }
                        : item
                )
                state.cartList = newData
            }
        },
        removeProduct: (state = initialState, action) => {
            let newData
            if (action.payload.variations.length > 0) {
                let index = getIndexFromArrayByComparision(
                    state.cartList,
                    action.payload
                )
                newData = state.cartList.filter((item, i) => i !== index)
                state.cartList = newData
            } else {
                newData = state.cartList.filter(
                    (item) => item.id !== action.payload.id
                )
                state.cartList = newData
            }
        },
        setClearCart: (state = initialState, action) => {
            state.cartList = []
        },
        setCartItemByDispatch: (state, action) => {
            state.cartItem = action.payload
        },
        setTotalAmount: (state, action) => {
            state.totalAmount = action.payload
        },
        setSubscriptionSubTotal: (state, action) => {
            state.subscriptionSubTotal = action.payload
        },
        setWalletAmount: (state, action) => {
            state.walletAmount = action.payload
        },
        setReorderCartItemByDispatch: (state, action) => {
            state.cartList = [...state.cartList, ...action.payload]
        },
    },
})

// Action creators are generated for each case reducer function
export const {
    cart,
    setCart,
    incrementProductQty,
    decrementProductQty,
    removeProduct,
    setClearCart,
    setReorderCartItemByDispatch,
    setSubscriptionSubTotal,
    setCampCart,
    setType,
    setCartItemByDispatch,
    setTotalAmount,
    setWalletAmount,
} = cartSlice.actions
export default cartSlice.reducer
