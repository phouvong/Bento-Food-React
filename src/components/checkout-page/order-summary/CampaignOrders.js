import React from 'react'
import { Grid } from '@mui/material'
import {
    OrderFoodAmount,
    OrderFoodName,
    OrderFoodSubtitle,
} from '../CheckOut.style'
import {
    getAmount,
    handleTotalAmountWithAddonsFF,
} from '@/utils/customFunctions'
import { useSelector } from 'react-redux'
import CustomImageContainer from '../../CustomImageContainer'

const CampaignOrders = ({ global }) => {
    const { campFoodList } = useSelector((state) => state.cart)
    const languageDirection = localStorage.getItem('direction')

    return (
        <>
            {campFoodList.map((item) => (
                <Grid container md={12} xs={12} spacing={{ xs: 1 }}>
                    <Grid item md={4} xs={4}>
                        <CustomImageContainer
                            height="90px"
                            width="90px"
                            src={item.image_full_url}
                            loading="lazy"
                            borderRadius="10px"
                        />
                    </Grid>
                    <Grid
                        item
                        md={8}
                        xs={8}
                        paddingRight={languageDirection === 'rtl' && '10px'}
                    >
                        <OrderFoodName>{item.name}</OrderFoodName>
                        <OrderFoodSubtitle>
                            Qty : {item.quantity}
                        </OrderFoodSubtitle>
                        <OrderFoodAmount>
                            {getAmount(
                                handleTotalAmountWithAddonsFF(
                                    item.totalPrice,
                                    item?.selectedAddons
                                ),
                                global?.currencySymbolDirection,
                                global?.currencySymbol,
                                global?.digitAfterDecimalPoint
                            )}
                        </OrderFoodAmount>
                    </Grid>
                </Grid>
            ))}
        </>
    )
}

CampaignOrders.propTypes = {}

export default CampaignOrders
