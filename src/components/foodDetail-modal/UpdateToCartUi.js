import React from 'react'
import PropTypes from 'prop-types'
import { CustomTypography } from '../custom-tables/Tables.style'
import { Button } from '@mui/material'

const UpdateToCartUi = (props) => {

    const { addToCard, t,isUpdateDisabled } = props
    return (
        <Button
             disabled={isUpdateDisabled()}
            onClick={() => addToCard()}
            variant="contained"
            fullWidth
        >
            <CustomTypography
                sx={{
                    color: (theme) => theme.palette.whiteContainer.main,
                }}
            >
                {t('Update to cart')}
            </CustomTypography>
        </Button>
    )
}

UpdateToCartUi.propTypes = {}

export default UpdateToCartUi
