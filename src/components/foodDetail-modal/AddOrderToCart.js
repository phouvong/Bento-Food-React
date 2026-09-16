import React from 'react'
import { Button, CircularProgress } from '@mui/material'
import { cartButtonLoadingSx, cartButtonSx } from './FoodModalStyle'

const AddOrderToCart = (props) => {
    const {
        product,
        t,
        addToCard,
        orderNow,
        addToCartLoading,
        getFullFillRequirements,
    } = props

    const isPreOrder = Boolean(product?.available_date_starts)

    return (
        <Button
            disabled={addToCartLoading}
            onClick={() => (isPreOrder ? orderNow?.() : addToCard?.())}
            variant="contained"
            fullWidth
            sx={addToCartLoading ? cartButtonLoadingSx : cartButtonSx}
        >
            {addToCartLoading ? (
                <CircularProgress
                    size={22}
                    thickness={5}
                    sx={{ color: (theme) => theme.palette.whiteContainer.main }}
                />
            ) : isPreOrder ? (
                t('Order Now')
            ) : (
                t('Add to cart')
            )}
        </Button>
    )
}

export default AddOrderToCart
