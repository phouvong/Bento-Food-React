import React from 'react'
import { Button, CircularProgress } from '@mui/material'
import { cartButtonLoadingSx, cartButtonSx } from './FoodModalStyle'

const UpdateToCartUi = ({ addToCard, t, isLoading = false }) => {
    return (
        <Button
            disabled={isLoading}
            onClick={() => addToCard()}
            variant="contained"
            fullWidth
            sx={isLoading ? cartButtonLoadingSx : cartButtonSx}
        >
            {isLoading ? (
                <CircularProgress
                    size={22}
                    thickness={5}
                    sx={{ color: (theme) => theme.palette.whiteContainer.main }}
                />
            ) : (
                t('Update to cart')
            )}
        </Button>
    )
}

UpdateToCartUi.propTypes = {}

export default UpdateToCartUi
