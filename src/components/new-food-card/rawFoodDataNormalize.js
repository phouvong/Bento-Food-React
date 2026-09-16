import { getConvertDiscount } from '@/utils/customFunctions'

export const rawFoodDataNormalize = (product, quantity = 1) => {
    const price = Number(product?.price) || 0
    const discount = Number(product?.discount) || 0
    const discountType = product?.discount_type

    const discountedPrice = getConvertDiscount(
        discount,
        discountType,
        price,
        undefined,
        quantity
    )
    const hasDiscount = discount > 0 && discountedPrice !== price

    return {
        price,
        discount,
        discountType,
        discountedPrice,
        hasDiscount,
    }
}
