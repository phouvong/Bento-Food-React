import MainApi from '../../../api/MainApi'

export const CouponApi = {
    couponList: (totalAmountForRefer,restaurant_id) => MainApi.get(`/api/v1/coupon/list?order_amount=${totalAmountForRefer?totalAmountForRefer:""}&order_restaurant_id=${restaurant_id?restaurant_id:''}`),
    applyCoupon: (code, restaurant_id,totalAmountForRefer) =>
        MainApi.get(`/api/v1/coupon/apply?code=${code}&restaurant_id=${restaurant_id}&order_amount=${totalAmountForRefer} `),
    restaurantCoupon:(customer_id,restaurant_id)=>MainApi.get(`/api/v1/restaurants/get-coupon?restaurant_id=${restaurant_id}&customer_id=${customer_id?customer_id:null}`)
}
