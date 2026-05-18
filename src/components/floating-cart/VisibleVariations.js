import React, { useEffect, useState } from 'react'
import { Stack, Box } from '@mui/material'
import { OrderFoodSubtitle } from '../checkout-page/CheckOut.style'

const VisibleVariations = (props) => {
    const { variations, t, orderDetailsColor } = props
    const [variationsWithChild, setVariationsWithChild] = useState([])
    const handleVariationsWithChild = (variations) => {
        const variationsArray = []
        if (variations.length > 0) {
            variations.forEach((variation) => {
                if (variation?.values?.length > 0) {
                    const selected = variation?.values?.filter(
                        (variationValue) => variationValue?.isSelected === true
                    )

                    if (selected.length > 0) {
                        const sArray = {
                            variationName: variation.name,
                            variationValues: selected,
                        }
                        variationsArray.push(sArray)
                    }
                }
            })

            setVariationsWithChild(variationsArray)
        }
    }
    useEffect(() => {
        handleVariationsWithChild(variations)
    }, [variations])

    return (
        <>
            {variationsWithChild.length > 0 && (
                <Box
                    sx={{
                        display: 'block',
                        width: '100%',
                    }}
                >
                    <OrderFoodSubtitle
                        component="span"
                        orderdetailscolor={orderDetailsColor}
                    >
                        {t('Variation')}
                    </OrderFoodSubtitle>
                    <OrderFoodSubtitle component="span" sx={{ mx: 0.5 }}>
                        :
                    </OrderFoodSubtitle>
                    {variationsWithChild.map((item, parentIndex) => {
                        return (
                            <Box component="span" key={parentIndex}>
                                <OrderFoodSubtitle
                                    component="span"
                                    sx={{
                                        marginInlineEnd: '4px',
                                        wordBreak: 'break-word',
                                    }}
                                    orderdetailscolor={orderDetailsColor}
                                >
                                    {item?.variationName}
                                </OrderFoodSubtitle>

                                {item?.variationValues?.length > 0 && (
                                    <OrderFoodSubtitle
                                        component="span"
                                        orderdetailscolor={orderDetailsColor}
                                    >
                                        (
                                        {item?.variationValues?.map(
                                            (val, index) =>
                                                `${val.label}${index + 1 !==
                                                    item.variationValues.length
                                                    ? ','
                                                    : ''
                                                }`
                                        )}
                                        )
                                        {parentIndex + 1 !==
                                            variationsWithChild?.length
                                            ? ','
                                            : ' '}
                                    </OrderFoodSubtitle>
                                )}
                            </Box>
                        )
                    })}
                </Box>
            )}
        </>
    )
}

VisibleVariations.propTypes = {}

export default VisibleVariations
