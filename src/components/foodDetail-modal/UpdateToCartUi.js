import React from 'react'
import { CustomTypography } from '../custom-tables/Tables.style'
import { Button, CircularProgress } from '@mui/material'

const UpdateToCartUi = ({ addToCard, t, isLoading = false }) => {
    return (
        <Button
            disabled={isLoading}
            onClick={() => addToCard()}
            variant="contained"
            fullWidth
        >
            {isLoading ? (
                <CircularProgress size={20} sx={{ color: '#fff' }} />
            ) : (
                <CustomTypography
                    sx={{
                        color: (theme) => theme.palette.whiteContainer.main,
                    }}
                >
                    {t('Update to cart')}
                </CustomTypography>
            )}
        </Button>
    )
}

UpdateToCartUi.propTypes = {}

export default UpdateToCartUi
