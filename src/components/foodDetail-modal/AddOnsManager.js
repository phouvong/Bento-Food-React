import React from 'react'
import { Box, FormGroup, Stack, Typography } from '@mui/material'
import IncDecAddOn from './IncDecAddOn'

const AddOnsManager = (props) => {
    const {
        t,
        modalData,
        setTotalPrice,
        changeAddOns,
        product,
        setAddOns,
        add_on,
        quantity,
        cartList,
        setCheckAddOn,
        checkAddOne,
        itemIsLoading,
        variationInCart
    } = props
    return (
        // Same horizontal inset as the variation groups so the option rows
        // and their checkboxes line up down the modal.
        <Box sx={{ px: { xs: '10px', md: '12px' }, py: { xs: 1.5, md: 2 } }}>
            {/* Same header shape as a variation group: name on top, muted
                helper line underneath. */}
            <Stack spacing={0.25}>
                <Typography
                    component="h6"
                    sx={{
                        fontSize: { xs: '16px', md: '17px' },
                        fontWeight: 700,
                        color: (theme) => theme.palette.text.primary,
                        lineHeight: 1.3,
                    }}
                >
                    {t('Add Ons')}
                </Typography>
                <Typography
                    sx={{
                        fontSize: '13px',
                        color: (theme) => theme.palette.neutral[500],
                    }}
                >
                    {t('To add more additional items')}
                </Typography>
            </Stack>
            <FormGroup sx={{ marginLeft: '0px', mt: 1 }}>
                {modalData.length > 0 &&
                    modalData[0].add_ons?.map((item) => (
                        <IncDecAddOn
                            key={item?.id}
                            setTotalPrice={setTotalPrice}
                            changeAddOns={changeAddOns}
                            add_on={item}
                            product_add_ons={product?.add_ons}
                            setAddOns={setAddOns}
                            add_ons={add_on}
                            productQuantity={quantity}
                            product={modalData[0]}
                            cartList={cartList}
                            setCheckAddOn={setCheckAddOn}
                            checkAddOne={checkAddOne}
                            itemIsLoading={itemIsLoading}
                        />
                    ))}
            </FormGroup>
        </Box>
    )
}

AddOnsManager.propTypes = {}

export default AddOnsManager
