import { t } from 'i18next'
import moment from 'moment'
import { useSelector } from 'react-redux'
import { CustomChip } from '@/components/food-card/FoodCard.style'
import { languageLists } from '@/components/navbar/second-navbar/custom-language/languageLists'
import { rtlLanguageList } from '@/components/navbar/second-navbar/custom-language/rtlLanguageList'
import { store } from '@/redux/store'
const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b)
export function truncate(amountAsString, decimals) {
    let dotIndex = amountAsString?.indexOf('.')
    let toTruncate =
        dotIndex !== -1 && amountAsString?.length > dotIndex + decimals + 1

    let approach = Math.pow(10, decimals)
    let amountToTruncate = toTruncate
        ? amountAsString?.slice(0, dotIndex + decimals + 1)
        : amountAsString
    let truncatedValue = toTruncate
        ? Math.floor(parseFloat(amountToTruncate) * approach) / approach
        : parseFloat(amountAsString)

    return truncatedValue
}

export const getNumberWithConvertedDecimalPoint = (
    amount,
    digitAfterDecimalPoint
) => {
    let newNumber = ((amount * 100) / 100).toFixed(
        Number.parseInt(digitAfterDecimalPoint)
    )
    return newNumber
}
export const getAmount = (
    amount,
    currency_symbol_direction,
    currency_symbol,
    digitAfterDecimalPoint
) => {
    let newAmount = truncate(amount?.toString(), digitAfterDecimalPoint)
    if (newAmount > 10000) {
        if (newAmount >= 1000000000) {
            // Billion
            newAmount =
                (newAmount / 1000000000)?.toFixed(digitAfterDecimalPoint) + 'B'
            return `${currency_symbol}${newAmount}`
        } else if (newAmount >= 1000000) {
            // Million
            newAmount =
                (newAmount / 1000000)?.toFixed(digitAfterDecimalPoint) + 'M'
            return `${currency_symbol}${newAmount}`
        } else if (newAmount >= 1000) {
            // Thousand
            newAmount =
                (newAmount / 1000)?.toFixed(digitAfterDecimalPoint) + 'k'
            return `${currency_symbol}${newAmount}`
        }
    } else {
        if (currency_symbol_direction === 'left') {
            return `${currency_symbol}${newAmount?.toFixed(
                digitAfterDecimalPoint
            )}`
        } else if (currency_symbol_direction === 'right') {
            return `${newAmount?.toFixed(
                digitAfterDecimalPoint
            )}${currency_symbol}`
        }
        return amount
    }
}
const handleVariationValuesSum = (productVariations) => {
    let sum = 0
    if (productVariations.length > 0) {
        productVariations?.forEach((pVal) => {
            pVal?.values?.forEach((cVal) => {
                if (cVal?.isSelected) {
                    sum += Number.parseInt(cVal.optionPrice)
                }
            })
        })
    }
    return sum
}
export const getItemTotalWithoutDiscount = (item) => {
    return item?.price + handleVariationValuesSum(item.variations)
}
export const getSubTotalPrice = (cartList) => {
    let ad = cartList.reduce(
        (total, product) =>
            (product.variations.length > 0
                ? getItemTotalWithoutDiscount(product)
                : product.price) *
                product.quantity +
            selectedAddonsTotal(product.selectedAddons) +
            total,
        0
    )
    return ad
}
export const getTotalPrice = (items) => {
    let totalPrice = 0
    if (items?.length > 0) {
        items.map((item) => {
            totalPrice += item.total_price
        })
        return totalPrice
    }
    return totalPrice
}
export const getFinalTotalPrice = (
    items,
    couponDiscount,
    taxAmount,
    restaurantData
) => {
    let totalPrice = 0
    if (items?.length > 0) {
        items.map((item) => {
            totalPrice +=
                item.price * item.quantity -
                getProductDiscount(items, restaurantData) +
                taxAmount
        })
        if (couponDiscount && couponDiscount?.discount)
            return (
                totalPrice -
                getCouponDiscount(couponDiscount, restaurantData?.data, items)
            )
        return totalPrice
    }
    return totalPrice
}

export const selectedAddonsTotal = (addOns) => {
    if (addOns?.length > 0) {
        let vv = addOns?.reduce(
            (total, addOn) => addOn?.price * addOn?.quantity + total,
            0
        )

        return vv
    } else {
        return 0
    }
}

export const getTaxableTotalPrice = (
    items,
    couponDiscount,
    restaurantData,
    referDiscount
) => {
    const isTaxIncluded =
        store?.getState?.()?.globalSettings?.global?.tax_included === 1
    let tax = restaurantData?.data?.tax
    let total =
        items?.reduce(
            (total, product) =>
                (product?.variations?.length > 0
                    ? handleProductValueWithOutDiscount(product)
                    : product.price) *
                    product.quantity +
                selectedAddonsTotal(product.selectedAddons) +
                total,
            0
        ) -
        getProductDiscount(items, restaurantData) -
        (couponDiscount
            ? getCouponDiscount(couponDiscount, restaurantData, items)
            : 0) -
        (referDiscount ? referDiscount : 0)

    if (isTaxIncluded) {
        return (total * tax) / (100 + tax)
    } else {
        return (total * tax) / 100
    }
}

export const getVariation = (variations) => {
    let variation = ''
    if (variations?.length > 0) {
        variations.map((item, index) => {
            variation += `${index !== 0 ? '-' : ''}${item.value.type}`
        })
    }
    return variation
}
export const getSelectedAddOn = (add_ons) => {
    let add_on = ''
    if (add_ons?.length > 0) {
        add_ons.map((item, index) => {
            add_on += `${index !== 0 ? ', ' : ''}${item?.name}`
        })
    }
    return add_on
}

export const handleProductValueWithOutDiscount = (product) => {
    let productPrice = product?.price
    if (product?.variations?.length > 0) {
        productPrice += handleVariationValuesSum(product?.variations)
        return productPrice
    } else {
        return productPrice
    }
}

export const getProductDiscount = (items, restaurantData) => {
    if (restaurantData?.data?.discount) {
        let endDate = restaurantData?.data?.discount?.end_date
        let endTime = restaurantData?.data?.discount?.end_time
        let combinedEndDateTime = moment(
            `${endDate} ${endTime}`,
            'YYYY-MM-DD HH:mm:ss'
        ).format()
        let currentDateTime = moment().format()
        if (combinedEndDateTime > currentDateTime) {
            //restaurant wise discount
            let restaurentDiscount = restaurantData?.data?.discount?.discount
            let resDisType = restaurantData?.data?.discount?.discount_type
            let restaurentMinimumPurchase =
                restaurantData?.data?.discount?.min_purchase
            let restaurentMaxDiscount =
                restaurantData?.data?.discount?.max_discount
            let totalDiscount = items.reduce(
                (total, product) =>
                    (product.variations.length > 0
                        ? handleProductValueWithOutDiscount(product) -
                          getConvertDiscount(
                              restaurentDiscount,
                              resDisType,
                              handleProductValueWithOutDiscount(product),
                              product.restaurant_discount
                          )
                        : product.price -
                          getConvertDiscount(
                              restaurentDiscount,
                              resDisType,
                              product.price,
                              product.restaurant_discount
                          )) *
                        product.quantity +
                    total,
                0
            )

            let purchasedAmount = items.reduce(
                (total, product) =>
                    ((product?.variations?.length > 0
                        ? handleProductValueWithOutDiscount(product)
                        : product.price) +
                        (product?.selectedAddons?.length > 0
                            ? product?.selectedAddons?.reduce(
                                  (total, addOn) =>
                                      addOn.price * addOn.quantity + total,
                                  0
                              )
                            : 0)) *
                        product.quantity +
                    total,
                0
            )
            if (purchasedAmount >= restaurentMinimumPurchase) {
                if (totalDiscount >= restaurentMaxDiscount) {
                    return restaurentMaxDiscount
                } else {
                    return totalDiscount
                }
            } else {
                return 0
            }
        } else {
            //product wise discount
            let total = items.reduce(
                (total, product) =>
                    (handleProductValueWithOutDiscount(product) -
                        getConvertDiscount(
                            product.discount,
                            product.discount_type,
                            handleProductValueWithOutDiscount(product),
                            product.restaurant_discount
                        )) *
                    product.quantity,
                0
            )
            return total
        }
    } else {
        let totalDiscount = items?.reduce((total, product) => {
            const discountAmount = getConvertDiscount(
                product.discount,
                product.discount_type,
                handleProductValueWithOutDiscount(product),
                product.restaurant_discount
            )
            return (
                total +
                (handleProductValueWithOutDiscount(product) - discountAmount) *
                    product.quantity
            )
        }, 0)
        return totalDiscount
    }
}

const toRadians = (degree) => {
    return (degree * Math.PI) / 180
}

function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    const earthRadius = 6378137.0
    const startLatitude = lat1
    const endLatitude = lat2
    const startLongitude = lon1
    const endLongitude = lon2
    const dLat = toRadians(endLatitude - startLatitude)
    const dLon = toRadians(endLongitude - startLongitude)

    const a =
        Math.pow(Math.sin(dLat / 2), 2) +
        Math.pow(Math.sin(dLon / 2), 2) *
            Math.cos(toRadians(startLatitude)) *
            Math.cos(toRadians(endLatitude))
    const c = 2 * Math.asin(Math.sqrt(a))

    return earthRadius * c
}

export const handleDistance = (distance, origin, destination) => {
    if ( distance?.distanceMeters) {
        return  distance?.distanceMeters / 1000
    } else if ( distance?.status === 'ZERO_RESULTS') {
        return (
            distanceInKmBetweenEarthCoordinates(
                origin?.latitude || origin?.lat,
                origin?.longitude || origin?.lng,
                destination?.lat || destination?.latitude,
                destination?.lng || destination?.longitude
            ) / 1000
        )
    } else {
        return (
            distanceInKmBetweenEarthCoordinates(
                origin?.latitude || origin?.lat,
                origin?.longitude || origin?.lng,
                destination?.lat || destination?.latitude,
                destination?.lng || destination?.longitude
            ) / 1000
        )
    }
}
export let bad_weather_fees = 0
const getDeliveryFeeByBadWeather = (
    charge,
    increasedDeliveryFee,
    increasedDeliveryFeeStatus
) => {
    const totalCharge = charge
    if (Number.parseInt(increasedDeliveryFeeStatus) === 1) {
        const tempValue = totalCharge * (increasedDeliveryFee / 100)
        bad_weather_fees = tempValue
        return totalCharge + tempValue
    } else {
        return totalCharge
    }
}

export const getDeliveryFees = (
    restaurantData,
    global,
    cartList,
    distance,
    couponDiscount,
    couponType,
    orderType,
    zoneData,
    origin,
    destination,
    extraCharge
) => {
    //convert m to km
    let convertedDistance = handleDistance(
        distance?.data,
        origin,
        destination
    )
    let deliveryFee
    let totalOrderAmount = cartItemsTotalAmount(cartList)

    //restaurant self delivery system checking
    if (Number.parseInt(restaurantData?.data?.self_delivery_system) === 1) {
        if (
            (global?.free_delivery_over !== null &&
                global?.free_delivery_over > 0 &&
                totalOrderAmount > global?.free_delivery_over) ||
            restaurantData?.data?.free_delivery ||
            orderType === 'take_away' ||
            orderType === 'dine_in' ||
            (restaurantData?.data?.free_delivery_distance_status &&
                convertedDistance <
                    restaurantData?.data?.free_delivery_distance_value)
        ) {
            return 0
        } else {
            deliveryFee =
                convertedDistance *
                    restaurantData?.data?.per_km_shipping_charge || 0

            if (
                deliveryFee > restaurantData?.data?.minimum_shipping_charge &&
                deliveryFee < restaurantData?.data?.maximum_shipping_charge
            ) {
                return deliveryFee
            } else {
                if (
                    deliveryFee < restaurantData?.data?.minimum_shipping_charge
                ) {
                    return restaurantData?.data?.minimum_shipping_charge
                } else if (
                    restaurantData?.data?.maximum_shipping_charge !== null &&
                    deliveryFee > restaurantData?.data?.maximum_shipping_charge
                ) {
                    return restaurantData?.data?.maximum_shipping_charge
                } else {
                    return deliveryFee
                }
            }
        }
    } else {
        if (zoneData?.length > 0) {
            const restaurantChargeInfo = zoneData?.find(
                (item) =>
                    Number.parseInt(item.id) ===
                    Number.parseInt(restaurantData?.data?.zone_id)
            )

            ///SELF DELIVERY OFF
            if (
                restaurantChargeInfo &&
                Number.parseInt(restaurantData?.data?.self_delivery_system) !==
                    1
            ) {
                if (
                    (global?.free_delivery_over !== null &&
                        global?.free_delivery_over > 0 &&
                        totalOrderAmount > global?.free_delivery_over) ||
                    orderType === 'take_away' ||
                    orderType === 'dine_in' ||
                    convertedDistance < global?.free_delivery_distance
                ) {
                    return 0
                } else {
                    deliveryFee =
                        convertedDistance *
                        (restaurantChargeInfo?.per_km_shipping_charge || 0)
                    if (
                        deliveryFee >=
                            restaurantChargeInfo?.minimum_shipping_charge &&
                        deliveryFee + extraCharge <=
                            restaurantChargeInfo?.maximum_shipping_charge
                    ) {
                        return (
                            getDeliveryFeeByBadWeather(
                                deliveryFee,
                                restaurantChargeInfo?.increased_delivery_fee,
                                restaurantChargeInfo?.increased_delivery_fee_status
                            ) + extraCharge
                        )
                    } else if (
                        deliveryFee <
                        restaurantChargeInfo?.minimum_shipping_charge
                    ) {
                        return (
                            getDeliveryFeeByBadWeather(
                                restaurantChargeInfo?.minimum_shipping_charge,
                                restaurantChargeInfo?.increased_delivery_fee,
                                restaurantChargeInfo?.increased_delivery_fee_status
                            ) + extraCharge
                        )
                    } else if (
                        deliveryFee + extraCharge >=
                            restaurantChargeInfo?.maximum_shipping_charge &&
                        restaurantChargeInfo?.maximum_shipping_charge !== null
                    ) {
                        return getDeliveryFeeByBadWeather(
                            restaurantChargeInfo?.maximum_shipping_charge,
                            restaurantChargeInfo?.increased_delivery_fee,
                            restaurantChargeInfo?.increased_delivery_fee_status
                        )
                    } else {
                        if (
                            (global?.free_delivery_over !== null &&
                                global?.free_delivery_over > 0 &&
                                totalOrderAmount >
                                    global?.free_delivery_over) ||
                            orderType === 'take_away' ||
                            orderType === 'dine_in' ||
                            convertedDistance < global?.free_delivery_distance
                        ) {
                            return 0
                        } else {
                            return getDeliveryFeeByBadWeather(
                                deliveryFee,
                                restaurantChargeInfo?.increased_delivery_fee,
                                restaurantChargeInfo?.increased_delivery_fee_status
                            )
                        }
                    }
                }
            }
        }
    }
}
export const getDateFormat = (date) => {
    return moment(date).format('LL')
}
export const getDateFormatAnotherWay = (date) => {
    return moment(date).format('ll')
}

export const getTotalVariationsPrice = (variations) => {
    let value = 0
    if (variations?.length > 0) {
        variations?.forEach?.((item) => {
            if (item?.values?.length > 0) {
                item?.values?.forEach((itemVal) => {
                    if (itemVal?.isSelected) {
                        value += Number.parseInt(itemVal?.optionPrice)
                    }
                })
            }
        })
    }
    return value
}
export const getConvertDiscount = (
    dis,
    disType,
    price,
    restaurantDiscount,
    quantity
) => {
    let q = quantity ? quantity : 1
    if (restaurantDiscount === 0) {
        if (disType === 'amount') {
            price = price - dis * q
        } else if (disType === 'percent') {
            price = price - (dis / 100) * price
        }
        return price
    } else {
        return price - (price * restaurantDiscount) / 100
    }
}
export const getCouponDiscount = (couponDiscount, restaurantData, cartList) => {
    if (couponDiscount) {
        let purchasedAmount = cartList.reduce(
            (total, product) =>
                (product.variations.length > 0
                    ? handleProductValueWithOutDiscount(product)
                    : product.price) *
                    product.quantity +
                selectedAddonsTotal(product.selectedAddons) +
                total,
            0
        )
        if (purchasedAmount >= couponDiscount.min_purchase) {
            switch (couponDiscount.coupon_type) {
                case 'zone_wise':
                    let zoneid = JSON.parse(couponDiscount.data)
                    if (
                        couponDiscount &&
                        couponDiscount.discount_type === 'amount'
                    ) {
                        if (couponDiscount.max_discount === 0) {
                            return couponDiscount.discount
                        } else {
                            return couponDiscount.discount
                        }
                    } else {
                        let percentageWiseDis =
                            (purchasedAmount -
                                getProductDiscount(cartList, restaurantData)) *
                            (couponDiscount.discount / 100)

                        if (couponDiscount.max_discount === 0) {
                            return percentageWiseDis
                        } else {
                            if (
                                percentageWiseDis >= couponDiscount.max_discount
                            ) {
                                return couponDiscount.max_discount
                            } else {
                                return percentageWiseDis
                            }
                        }
                    }
                    break
                case 'restaurant_wise':
                    let restaurantId = JSON.parse(couponDiscount.data)

                    if (
                        Number.parseInt(restaurantId[0]) ===
                        restaurantData?.data?.id
                    ) {
                        if (
                            couponDiscount &&
                            couponDiscount.discount_type === 'amount'
                        ) {
                            if (couponDiscount.max_discount === 0) {
                                return couponDiscount.discount
                            } else {
                            }
                        } else {
                            let percentageWiseDis =
                                (purchasedAmount -
                                    getProductDiscount(
                                        cartList,
                                        restaurantData
                                    )) *
                                (couponDiscount.discount / 100)
                            if (couponDiscount.max_discount === 0) {
                                return percentageWiseDis
                            } else {
                                if (
                                    percentageWiseDis >=
                                    couponDiscount.max_discount
                                ) {
                                    return couponDiscount.max_discount
                                } else {
                                    return percentageWiseDis
                                }
                            }
                        }
                    } else {
                        return 0
                    }
                    break
                case 'free_delivery':
                    return 0
                case 'default':
                    if (
                        couponDiscount &&
                        couponDiscount.discount_type === 'amount'
                    ) {
                        if (couponDiscount.max_discount === 0) {
                            return couponDiscount.discount
                        } else {
                            return couponDiscount.discount
                        }
                    } else {
                        let percentageWiseDis =
                            (purchasedAmount -
                                getProductDiscount(cartList, restaurantData)) *
                            (couponDiscount.discount / 100)
                        if (couponDiscount.max_discount === 0) {
                            return percentageWiseDis
                        } else {
                            if (
                                percentageWiseDis >= couponDiscount.max_discount
                            ) {
                                return couponDiscount.max_discount
                            } else {
                                return percentageWiseDis
                            }
                        }
                    }
            }
        } else {
            return 0
        }
    }
}
export const isAvailable = (start, end) => {
    const startTime = moment(start, 'HH:mm:ss')
    const endTime = moment(end, 'HH:mm:ss ')
    let currentTime = moment()
    return moment(currentTime).isBetween(startTime, endTime)
}

export const getDataLimit = (data) => {
    const tempData = data?.slice(0, 10).map((item) => item)
    return tempData
}
export const getCalculatedTotal = (
    cartList,
    couponDiscount,
    restaurantData,
    global,
    distanceData,
    couponType,
    orderType,
    freeDelivery,
    deliveryTip,
    zoneData,
    origin,
    destination,
    extraCharge,
    additionalCharge,
    extraPackagingCharge,
    referDiscount
) => {
    if (couponDiscount) {
        if (couponDiscount?.coupon_type === 'free_delivery') {
            return (
                truncate(
                    getSubTotalPrice(cartList).toString(),
                    global?.digit_after_decimal_point
                ) -
                truncate(
                    getProductDiscount(cartList, restaurantData).toString(),
                    global?.digit_after_decimal_point
                ) +
                //here we check tex is included or exclude
                (global?.tax_included !== 1 &&
                    truncate(
                        getTaxableTotalPrice(
                            cartList,
                            couponDiscount,
                            restaurantData,
                            referDiscount
                        )?.toString(),
                        global?.digit_after_decimal_point
                    )) -
                (couponDiscount
                    ? truncate(
                          getCouponDiscount(
                              couponDiscount,
                              restaurantData,
                              cartList
                          )?.toString(),
                          global?.digit_after_decimal_point
                      )
                    : 0) +
                truncate(
                    deliveryTip?.toString(),
                    global?.digit_after_decimal_point
                ) +
                additionalCharge +
                extraPackagingCharge
            )
        } else {
            return (
                truncate(
                    getSubTotalPrice(cartList).toString(),
                    global?.digit_after_decimal_point
                ) -
                truncate(
                    getProductDiscount(cartList, restaurantData).toString(),
                    global?.digit_after_decimal_point
                ) +
                //here we check tex is included or exclude
                (global?.tax_included !== 1 &&
                    truncate(
                        getTaxableTotalPrice(
                            cartList,
                            couponDiscount,
                            restaurantData,
                            referDiscount
                        ).toString(),
                        global?.digit_after_decimal_point
                    )) -
                (couponDiscount
                    ? truncate(
                          getCouponDiscount(
                              couponDiscount,
                              restaurantData,
                              cartList
                          )?.toString(),
                          global?.digit_after_decimal_point
                      )
                    : 0) +
                truncate(
                    getDeliveryFees(
                        restaurantData,
                        global,
                        cartList,
                        distanceData?.data,
                        couponDiscount,
                        couponType,
                        orderType,
                        zoneData,
                        origin,
                        destination,
                        extraCharge && extraCharge
                    )?.toString(),
                    global?.digit_after_decimal_point
                ) +
                truncate(
                    deliveryTip?.toString(),
                    global?.digit_after_decimal_point
                ) +
                additionalCharge +
                extraPackagingCharge
            )
        }
    } else {
        return (
            truncate(
                getSubTotalPrice(cartList).toString(),
                global?.digit_after_decimal_point
            ) -
            truncate(
                getProductDiscount(cartList, restaurantData).toString(),
                global?.digit_after_decimal_point
            ) +
            ///here we check tex is included or exclude
            (global?.tax_included !== 1 &&
                truncate(
                    getTaxableTotalPrice(
                        cartList,
                        couponDiscount,
                        restaurantData,
                        referDiscount
                    )?.toString(),
                    global?.digit_after_decimal_point
                )) -
            0 +
            truncate(
                getDeliveryFees(
                    restaurantData,
                    global,
                    cartList,
                    distanceData?.data,
                    couponDiscount,
                    couponType,
                    orderType,
                    zoneData,
                    origin,
                    destination,
                    extraCharge
                )?.toString(),
                global?.digit_after_decimal_point
            ) +
            truncate(
                deliveryTip?.toString(),
                global?.digit_after_decimal_point
            ) +
            additionalCharge +
            extraPackagingCharge
        )
    }
}

export const getDiscountForTag = (restaurantDiscount) => {
    let endDate = restaurantDiscount?.end_date
    let endTime = restaurantDiscount?.end_time
    let combinedEndDateTime = moment(
        `${endDate} ${endTime}`,
        'YYYY-MM-DD HH:mm:ss'
    ).format()
    let currentDateTime = moment().format()
    if (combinedEndDateTime > currentDateTime) {
        return restaurantDiscount?.discount
    }
}

export const isFoodAvailableBySchedule = (cart, selectedTime) => {
    if (selectedTime === 'now') {
        let currentTime = moment()
        if (cart.length > 0) {
            let isAvailable = cart.every((item) => {
                const startTime = moment(item.available_time_starts, 'HH:mm:ss')
                const endTime = moment(item.available_time_ends, 'HH:mm:ss')
                return moment(currentTime).isBetween(startTime, endTime)
            })
            return !!isAvailable
        }
    } else {
        if (selectedTime) {
            const slug = selectedTime.split(' ').pop()
            if (cart.length > 0) {
                const isAvailable = cart.every((item) => {
                    const startTime = moment(
                        item.available_time_starts,
                        'HH:mm:ss'
                    )
                    const endTime = moment(item.available_time_ends, 'HH:mm:ss')
                    const currentTime = moment(selectedTime, 'HH:mm:ss')
                    return moment(currentTime).isBetween(startTime, endTime)
                })
                return !!isAvailable
            }
        }
    }
}

export const FormatedDateWithTime = (date) => {
    let dateString = moment(date).format('YYYY-MM-DD hh:mm a')
    return dateString
}
export const FormatedDateWithTimeAnotherType = (date) => {
    let timeFormat = global?.timeformat
    if (timeFormat === '12') {
        return moment(date).format('ll hh:mm a')
    } else {
        return moment(date).format('ll HH:mm')
    }
}

export const formatedDate = (data) => {
    let date = moment(data).format('MMM Do YY')
    return date
}
export const restaurantDiscountTag = (
    restaurantDiscount,
    freeDelivery,
    currencySymbolDirection,
    currencySymbol,
    digitAfterDecimalPoint
) => {
    const off = t('% off on all items!')
    const amountOff = t('off on all items!')
    if (restaurantDiscount?.discount_type === 'percent') {
        return `${getDiscountForTag(restaurantDiscount)}${off}`
    }
    if (restaurantDiscount?.discount_type === 'amount') {
        return `${getAmount(
            restaurantDiscount.discount,
            currencySymbolDirection,
            currencySymbol,
            digitAfterDecimalPoint
        )}${amountOff}`
    } else return null
}

export const getIndexFromArrayByComparision = (arrayOfObjects, object) => {
    return arrayOfObjects.findIndex(
        (item) =>
            isEqual(item.variations, object.variations) && item.id === object.id
    )
}
export const handleTotalAmountWithAddons = (
    mainTotalAmount,
    selectedAddOns
) => {
    if (selectedAddOns?.length > 0) {
        let selectedAddonsTotalPrice = 0
        selectedAddOns.forEach(
            (item) => (selectedAddonsTotalPrice += item?.price * item?.quantity)
        )
        return mainTotalAmount + selectedAddonsTotalPrice
    } else {
        return mainTotalAmount
    }
}

export const cartItemsTotalAmount = (cartList) => {
    let totalAmount = 0
    if (cartList?.length > 0) {
        cartList?.forEach((item) => {
            totalAmount += handleTotalAmountWithAddons(
                item?.totalPrice,
                item?.selectedAddons
            )
        })
    }
    return totalAmount
}
export const calculateItemBasePrice = (item, selectedOptions) => {
    let basePrice = item?.price
    if (selectedOptions?.length > 0) {
        selectedOptions?.forEach((option) => {
            if (option?.isSelected === true) {
                basePrice += Number.parseInt(option?.optionPrice)
            }
        })
    }
    return basePrice
}
export const maxCodAmount = (restaurantData, global, zoneData) => {
    if (zoneData?.data?.zone_data?.length > 0) {
        const resInfor = zoneData?.data?.zone_data?.find(
            (item) =>
                Number.parseInt(item.id) ===
                Number.parseInt(restaurantData?.data?.zone_id)
        )
        if (
            resInfor?.max_cod_order_amount !== null &&
            resInfor?.max_cod_order_amount !== 0
        ) {
            return resInfor?.max_cod_order_amount
        } else return 0
    }
}
export const foodCount = (productData) => {
    let itemCount = 0
    if (productData && productData?.length > 0) {
        productData?.forEach((product) => {
            if (
                product?.variations === null ||
                product?.variations[0]?.values ||
                product?.variations?.length === 0
            ) {
                return itemCount++
            }
        })
    } else {
        itemCount = 0
    }

    return itemCount
}

export const handleIncrementedTotal = (
    basePrice,
    quantity,
    discount,
    discountType
) => {
    if (discountType === 'amount') {
        return basePrice * quantity + discount - discount
    } else {
        const discountAmount = discount / 100
        const subtraction = 1 - discountAmount
        const mainPrice = (basePrice / subtraction) * quantity
        return mainPrice - (mainPrice * discount) / 100
    }
}

export const handleTotalAmountWithAddonsFF = (
    mainTotalAmount,
    selectedAddOns
) => {
    if (selectedAddOns?.length > 0) {
        let selectedAddonsTotalPrice = 0
        selectedAddOns.forEach(
            (item) => (selectedAddonsTotalPrice += item?.price * item?.quantity)
        )
        return mainTotalAmount + selectedAddonsTotalPrice
    } else {
        return mainTotalAmount
    }
}
export const handleBadge = (
    product,
    currencySymbol,
    currencySymbolDirection,
    digitAfterDecimalPoint
) => {
    const percentOff = t('% OFF')
    const OFF = t('OFF')
    if (Number.parseInt(product?.restaurant_discount) === 0) {
        if (Number.parseInt(product?.discount) > 0) {
            if (product?.discount_type === 'percent') {
                return (
                    <CustomChip
                        discount
                        label={
                            !product.available_date_ends
                                ? `${product?.discount} %`
                                : ` ${product?.discount} ${percentOff}`
                        }
                        campaign={product.available_date_ends}
                    />
                )
            } else {
                return (
                    <CustomChip
                        discount
                        label={
                            !product.available_date_ends
                                ? ` ${getAmount(
                                      product?.discount,
                                      currencySymbolDirection,
                                      currencySymbol,
                                      digitAfterDecimalPoint
                                  )}`
                                : ` ${getAmount(
                                      product?.discount,
                                      currencySymbolDirection,
                                      currencySymbol,
                                      digitAfterDecimalPoint
                                  )} ${OFF}`
                        }
                        campaign={product.available_date_ends}
                    />
                )
            }
        }
    } else {
        if (Number.parseInt(product?.restaurant_discount) > 0) {
            return (
                <CustomChip
                    campaign={product.available_date_ends}
                    label={
                        !product.available_date_ends
                            ? `${product?.restaurant_discount}  %`
                            : `${product?.restaurant_discount}  ${percentOff}`
                    }
                />
            )
        }
    }
}
export const languageValue = (language) => {
    let selectedLanguage = languageLists?.find((item) => {
        if (item?.languageCode === language) {
            return item?.languageName
        }
    })
    return selectedLanguage
}
export const isRTLLanguage = (value) => {
    let rtl = rtlLanguageList.includes(value)
    return rtl
}
export const removeDuplicates = (array, property) => {
    const uniqueValues = {}
    return array.filter((item) => {
        if (!uniqueValues[item[property]]) {
            uniqueValues[item[property]] = true
            return true
        }
        return false
    })
}

export const getReviewCount = (count) => {
    if (Number.parseInt(count) > 999) {
        return `(${count / 1000}k+)`
    } else if (Number.parseInt(count) === 0) {
        return ''
    } else {
        return `(${count})`
    }
}

export const DistanceCalculate = ({ distance }) => {
    const { global } = useSelector((state) => state.globalSettings)
    const distanceValue = (distance / 1000).toFixed(
        global?.digit_after_decimal_point
    )

    const getDistance = () => {
        if (Number.parseInt(distanceValue) > 1000) {
            return t('1k+ km')
        } else {
            return `${(distance / 1000).toFixed(
                global?.digit_after_decimal_point
            )}km `
        }
    }

    return distance ? getDistance() : '0 km'
}

export function capitalizeEachWord(str) {
    return str
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export const getReferDiscount = (totalAmount, discountAmount, discountType) => {
    if (discountType === 'percentage') {
        return (discountAmount / 100) * totalAmount
    } else {
        return discountAmount
    }
}
export const removeSpecialCharacters = (inputString) => {
    // Define the pattern for special characters
    const pattern = /[^a-zA-Z0-9\s]/g

    // Use the replace method to remove special characters
    return inputString?.replace(pattern, '')
}
export const checkMaintenanceMode = (configData) => {
    const isMaintenanceMode =
        configData?.maintenance_mode_data?.maintenance_system_setup?.includes(
            'react_website'
        )
    return !!(isMaintenanceMode && configData?.maintenance_mode)
}
export function maskSensitiveInfo(input) {
    if (input) {
        if (input?.includes('@')) {
            const [localPart, domain] = input.split('@')
            const maskedLocalPart =
                localPart.slice(0, 2) + '*'.repeat(localPart.length - 2)

            return `${maskedLocalPart}@${domain}`
        } else {
            const maskedSection = input.slice(4, -3).replace(/\d/g, '*')
            return input.slice(0, 4) + maskedSection + input.slice(-3)
        }
    }
}

function isEmail(input) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailPattern.test(input)
}
function isPhoneNumber(input) {
    const phonePattern =
        /^\+?[0-9]{1,4}?[-.s]?(\(?\d{1,3}?\))?[-.s]?\d{1,4}[-.s]?\d{1,4}[-.s]?\d{1,9}$/
    return phonePattern.test(input)
}
export function checkInput(input) {
    if (isEmail(input)) {
        return 'email'
    } else if (isPhoneNumber(input)) {
        return 'phone'
    } else {
        return 'invalid'
    }
}

export function formatPhoneNumber(number) {
    if (number) {
        const str = number?.toString()
        if (str.startsWith('+')) {
            return str
        } else {
            return `+${str}`
        }
    }
}
