import { CustomToaster } from '@/components/custom-toaster/CustomToaster'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import {
    ButtonGroup,
    Checkbox,
    FormControlLabel,
    Grid,
    IconButton,
    Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Stack } from '@mui/system'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { CustomTypographyLabel } from '../../styled-components/CustomTypographies.style'
import { getAmount } from '../../utils/customFunctions'
import { useIsMount } from '../first-render-useeffect-controller/useIsMount'

const IncDecAddOn = ({
    setTotalPrice,
    setVarPrice,
    changeAddOns,
    add_on,
    setProductAddOns,
    product_add_ons,
    setAddOns,
    add_ons,
    productQuantity,
    product,
    cartList,
    selectedChoice,
    itemIsLoading,

    // setCheckAddOn,
    // checkAddOne
}) => {
    const [checkAddOne, setCheckAddOn] = useState(false)
    const [addOn, setAddOn] = useState(null)
    const [quantity, setQuantity] = useState(0)
    const { global } = useSelector((state) => state.globalSettings)
    const theme = useTheme()

    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint

    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }

    useEffect(() => {
        if (itemIsLoading) {
            //setAddOn({ ...add_on, quantity: quantity })
            setCheckAddOn(false)
            setQuantity(0)
        } else {
            if (product?.selectedAddons) {
                //if selected addons exist
                setAddOns(product?.selectedAddons)
                let isAddonExist = product?.selectedAddons.find(
                    (item) => item.id === add_on.id
                )
                if (isAddonExist) {
                    setAddOn({ ...isAddonExist })
                    setQuantity(isAddonExist.quantity)
                    setCheckAddOn(true)
                } else {
                    setAddOn({ ...add_on, quantity: quantity })
                    setCheckAddOn(false)
                    setQuantity(0)
                }
            } else {
                //if no selected addons exist
                setAddOn({ ...add_on, quantity: quantity })
                setCheckAddOn(false)
                setQuantity(0)
            }
        }
    }, [product, cartList, itemIsLoading])
    const isMount = useIsMount()
    useEffect(() => {
        if (isMount) {
            //for doing nothing on first render
        } else {
            let newData = add_ons.map((item) =>
                item.id === addOn.id ? { ...item, quantity: quantity } : item
            )

            setAddOns(newData)
            if (quantity === 0) {
                setCheckAddOn(false)
            }
        }
    }, [quantity])
    const changeCheckedAddOn = (e) => {
        setCheckAddOn(e.target.checked)
        if (e.target.checked) {
            setQuantity(1)
            changeAddOns(e.target.checked, {
                ...addOn,
                quantity: quantity === 0 ? 1 : quantity,
            })
        } else {
            setQuantity(0)
            changeAddOns(e.target.checked, {
                ...addOn,
                quantity: quantity === 0 ? 1 : quantity,
            })
        }
    }

    const incrementAddOnQty = (add_on) => {
        if (add_on?.stock_type !== 'unlimited') {
            if (quantity + 1 > add_on?.addon_stock) {
                CustomToaster('error', `${t('Out Of Stock')}`, 'addon')
            } else {
                setQuantity((prevState) => prevState + 1)
            }
        } else {
            setQuantity((prevState) => prevState + 1)
        }
    }
    const decrementAddOnQty = () => {
        setQuantity((prevState) => prevState - 1)
    }
    const buttonColor = theme.palette.neutral[1000]
    return (
        <>
            {addOn && (
                <Grid
                    container
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Grid item md={6} sm={5} xs={5}>
                        <FormControlLabel
                            disabled={
                                add_on?.stock_type !== 'unlimited' &&
                                add_on?.addon_stock === 0
                            }
                            sx={{ marginInlineStart: '-10px' }}
                            key={addOn?.id}
                            control={
                                <Checkbox
                                    onChange={changeCheckedAddOn}
                                    checked={checkAddOne}
                                />
                            }
                            label={
                                <Stack direction="row" spacing={1}>
                                    <CustomTypographyLabel
                                        sx={{
                                            color: (theme) =>
                                                add_on?.stock_type !==
                                                    'unlimited' &&
                                                add_on?.addon_stock === 0
                                                    ? theme.palette.neutral[400]
                                                    : theme.palette
                                                          .neutral[1000],
                                        }}
                                        span="component"
                                    >
                                        {addOn?.name}
                                    </CustomTypographyLabel>
                                    <Typography
                                        fontSize="12px"
                                        color={theme.palette.error.main}
                                    >
                                        {add_on?.stock_type !== 'unlimited' &&
                                        add_on?.addon_stock === 0
                                            ? `(${t('out of stock')})`
                                            : ''}
                                    </Typography>
                                </Stack>
                            }
                        />
                    </Grid>
                    <Grid
                        item
                        md={quantity > 0 ? 3 : 6}
                        sm={3}
                        xs={3}
                        justifySelf="flex-end"
                    >
                        <CustomTypographyLabel
                            sx={{
                                textAlign: 'right',
                                fontWeight: quantity > 0 ? '700' : '500',
                                color:
                                    quantity > 0
                                        ? theme.palette.neutral[1000]
                                        : theme.palette.neutral[400],
                            }}
                        >
                            {getAmount(
                                addOn?.price,
                                currencySymbolDirection,
                                currencySymbol,
                                digitAfterDecimalPoint
                            )}
                        </CustomTypographyLabel>
                    </Grid>
                    {quantity > 0 && (
                        <Grid
                            item
                            md={3}
                            sm={4}
                            xs={4}
                            align="right"
                            alignItems="center"
                        >
                            <ButtonGroup
                                variant="contained"
                                aria-label="contained primary button group"
                                size="small"
                                sx={{
                                    background: (theme) =>
                                        theme.palette.neutral[200],
                                    gap: '10px',
                                    alignItems: 'center',
                                    paddingX: '5px',
                                    borderRadius: '37px',
                                }}
                            >
                                <IconButton
                                    disabled={!checkAddOne || quantity === 0}
                                    aria-label="delete"
                                    sx={{ margin: '0', padding: '2px' }}
                                    onClick={() => {
                                        decrementAddOnQty()
                                    }}
                                >
                                    <RemoveIcon
                                        fontWeight="700"
                                        sx={{
                                            color: (theme) =>
                                                theme.palette.neutral[1000],
                                            width: '18px',
                                            height: '18px',
                                        }}
                                    />
                                </IconButton>
                                <span
                                    style={{
                                        marginTop: '2px',
                                        width: '8px',
                                        textAlign: 'center',
                                    }}
                                >
                                    {quantity}
                                </span>
                                <IconButton
                                    disabled={!checkAddOne}
                                    aria-label="add"
                                    sx={{ margin: '0', padding: '2px' }}
                                    onClick={() => incrementAddOnQty(add_on)}
                                >
                                    <AddIcon
                                        fontWeight="700"
                                        sx={{
                                            color: (theme) =>
                                                theme.palette.neutral[1000],
                                            width: '18px',
                                            height: '18px',
                                        }}
                                    />
                                </IconButton>
                            </ButtonGroup>
                        </Grid>
                    )}
                </Grid>
            )}
        </>
    )
}

export default IncDecAddOn
