import { CustomToaster } from '@/components/custom-toaster/CustomToaster'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import {
    ButtonGroup,
    Checkbox,
    IconButton,
    Typography,
    Stack,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getAmount } from '@/utils/customFunctions'
import { useIsMount } from '../first-render-useeffect-controller/useIsMount'
import { FlatCheckboxIcon, variationControlSx } from './FoodModalStyle'

const IncDecAddOn = ({
    changeAddOns,
    add_on,
    setAddOns,
    add_ons,
    product,
    cartList,
    itemIsLoading,
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

    const isOutOfStock =
        add_on?.stock_type !== 'unlimited' && add_on?.addon_stock === 0

    return (
        <>
            {addOn && (
                // Same row shape as the variation options: label on the left,
                // price + control on the right.
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ py: 0.75 }}
                >
                    <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        flexWrap="nowrap"
                        sx={{ minWidth: 0 }}
                    >
                        <Typography
                            sx={{
                                fontSize: '16px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                color: (theme) =>
                                    isOutOfStock
                                        ? theme.palette.neutral[400]
                                        : theme.palette.text.primary,
                            }}
                        >
                            {addOn?.name}
                        </Typography>
                        {isOutOfStock && (
                            <Typography
                                fontSize={{ xs: '10px', md: '12px' }}
                                color={theme.palette.error.main}
                                sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                            >
                                {`(${t('out of stock')})`}
                            </Typography>
                        )}
                    </Stack>

                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                        // Flex gap (not sibling margins) so the checkbox's
                        // own ml can add extra space before it.
                        useFlexGap
                        sx={{ flexShrink: 0 }}
                    >
                        <Typography
                            sx={{
                                fontSize: '16px',
                                whiteSpace: 'nowrap',
                                fontWeight: quantity > 0 ? 700 : 400,
                                color: (theme) =>
                                    quantity > 0
                                        ? theme.palette.text.primary
                                        : theme.palette.neutral[500],
                            }}
                        >
                            {/* Prefixed like the variation prices so the row
                                reads as an addition to the base price. */}
                            {`+ ${getAmount(
                                addOn?.price,
                                currencySymbolDirection,
                                currencySymbol,
                                digitAfterDecimalPoint
                            )}`}
                        </Typography>

                        {quantity > 0 && (
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
                        )}

                        <Checkbox
                            disabled={isOutOfStock}
                            onChange={changeCheckedAddOn}
                            checked={checkAddOne}
                            sx={{ ...variationControlSx, ml: 1 }}
                            icon={<FlatCheckboxIcon />}
                            checkedIcon={<FlatCheckboxIcon checked />}
                        />
                    </Stack>
                </Stack>
            )}
        </>
    )
}

export default IncDecAddOn
