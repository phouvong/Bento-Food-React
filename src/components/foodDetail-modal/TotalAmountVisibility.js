import React from 'react'
import { FoodTitleTypography } from '../food-card/FoodCard.style'
import { Stack, Typography } from '@mui/material'
import {
    getAmount,
    getConvertDiscount,
    handleTotalAmountWithAddons,
} from '@/utils/customFunctions'
import { CustomTypographyGray } from '../error/Errors.style'

const TotalAmountVisibility = (props) => {
    const {
        modalData,
        totalPrice,
        currencySymbolDirection,
        currencySymbol,
        digitAfterDecimalPoint,
        t,
        productDiscount,
        productDiscountType,
        productRestaurantDiscount,
        selectedAddOns,
        quantity,
    } = props

    return (
        <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="space-between" >
            <FoodTitleTypography
                gutterBottom
                variant="h6"
                component="h6"
                sx={{
                    margin: '0',
                    alignItems: 'end',
                    justifyContent: 'flex-start',
                    padding: {
                        xs:"12px",
                        sm:0
                    },
                    textAlign: 'left',
                }}
            >
                {t('Total Amount')} :
               
            </FoodTitleTypography>
             <Typography
                    fontSize="14px"
                    component="span"
                    fontWeight="600"
                    sx={{
                        color: (theme) => theme.palette.primary.main,
                    }}
                   
                >
                    {modalData.length > 0 &&
                        getAmount(
                            handleTotalAmountWithAddons(
                                getConvertDiscount(
                                    productDiscount,
                                    productDiscountType,
                                    totalPrice,
                                    productRestaurantDiscount,
                                    quantity
                                ),
                                selectedAddOns
                            ),
                            currencySymbolDirection,
                            currencySymbol,
                            digitAfterDecimalPoint
                        )}
                         {modalData.length > 0 &&
            (productDiscount || productRestaurantDiscount === 1) ? (
                <CustomTypographyGray
                    nodefaultfont="true"
                    textdecoration="line-through"
                    sx={{ fontSize: '14px',marginInlineStart:"10px" }}
                    component="span"
                >
                    (
                    {getAmount(
                        handleTotalAmountWithAddons(totalPrice, selectedAddOns),
                        currencySymbolDirection,
                        currencySymbol,
                        digitAfterDecimalPoint
                    )}
                    )
                </CustomTypographyGray>
            ) : null}
                </Typography>

           
        </Stack>
    )
}

TotalAmountVisibility.propTypes = {}

export default TotalAmountVisibility
