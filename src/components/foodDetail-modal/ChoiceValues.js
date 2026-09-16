import React, { useEffect, useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import FormControl from '@mui/material/FormControl'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import { alpha, useTheme } from '@mui/material/styles'
import { getAmount } from '@/utils/customFunctions'
import MultiCheckBox from '@/components/foodDetail-modal/MultiCheckBox'
import { FlatRadioIcon, variationControlSx } from './FoodModalStyle'

export const ChoiceValues = (props) => {
    const {
        choice,
        t,
        radioCheckHandler,
        choiceIndex,
        changeChoices,
        currencySymbolDirection,
        currencySymbol,
        digitAfterDecimalPoint,
        quantity,
        selectedOptions,
        itemIsLoading,
        productUpdate,
    } = props
    const [radioData, setRadioData] = useState({ isChecked: false })

    const theme = useTheme()
    useEffect(() => {
        radioData?.option &&
            changeChoices(
                radioData.e,
                radioData.option,
                radioData.index,
                radioData.choiceIndex,
                radioData.choiceRequired,
                radioData.choiceType,
                radioData.isChecked
            )
    }, [radioData])

    const handleRadioData = (
        e,
        option,
        index,
        choiceIndex,
        choiceRequired,
        choiceType
    ) => {
        if (
            radioData?.choiceIndex === choiceIndex &&
            radioData?.index === index
        ) {
            setRadioData({
                ...radioData,
                isChecked: !radioData.isChecked,
                e,
                option,
                index,
                choiceIndex,
                choiceRequired,
                choiceType,
            })
        } else {
            setRadioData({
                ...radioData,
                isChecked: true,
                e,
                option,
                index,
                choiceIndex,
                choiceRequired,
                choiceType,
            })
        }
    }

    const isShowStockText = (option) => {
        return selectedOptions?.some((item) => {
            return (
                item?.option_id === option.option_id &&
                quantity >= option.current_stock
            )
        })
    }

    const text1 = t('only')
    const text2 = t('items available')

    const isRequired = choice?.required === 'on'
    // "Select any of N" — a single-type group always allows exactly one.
    const selectCount =
        choice?.type === 'single' ? 1 : choice?.max || choice?.values?.length
    // Only required groups get the tinted band, so the sections the customer
    // must act on stand out from the optional ones.
    const isTinted = isRequired
    // Once the group has enough selections its red "Required" pill turns into
    // a green "Completed" one.
    const selectedInGroup =
        selectedOptions?.filter((item) => item.choiceIndex === choiceIndex)
            .length ?? 0
    const isFulfilled =
        choice?.type === 'multi'
            ? selectedInGroup >= (choice?.min ?? 1)
            : selectedInGroup > 0

    return (
        <Box
            // Scroll target for the cart bar's "Choose Required Option" prompt.
            id={`variation-group-${choiceIndex}`}
            sx={{
                // Dark palette's neutral[300] is a light text tone, not a
                // surface — the tinted band must swap to the dark card
                // surface there or it renders white-on-light.
                backgroundColor: isTinted
                    ? theme.palette.mode === 'dark'
                        ? theme.palette.neutral[200]
                        : theme.palette.neutral[300]
                    : 'transparent',
                // Cancel the modal content stack's horizontal padding so the
                // tinted band runs edge to edge, then re-apply it inside.
                mx: { xs: '-10px', md: '-12px' },
                px: { xs: '10px', md: '12px' },
                py: { xs: 1.5, md: 2 },
                // Blink target for the cart bar's "Choose Required Option"
                // prompt — FoodDetailModal toggles the class after scrolling
                // here. Inset shadow instead of a real border so the flash
                // causes no layout shift.
                '@keyframes requiredBlink': {
                    '0%, 100%': {
                        boxShadow: 'inset 0 0 0 0.5px transparent',
                    },
                    '50%': {
                        boxShadow: `inset 0 0 0 0.5px ${theme.palette.error.main}`,
                    },
                },
                '&.required-blink': {
                    animation: 'requiredBlink 0.4s ease-in-out 3',
                },
            }}
        >
            {/* Group header — name + "Select any of N", with Required pill */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={1}
            >
                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography
                        component="h6"
                        sx={{
                            fontSize: { xs: '16px', md: '17px' },
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            lineHeight: 1.3,
                        }}
                    >
                        {choice.name}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '13px',
                            color: theme.palette.neutral[500],
                        }}
                    >
                        {t('Select any of')} {selectCount}
                        {!isRequired ? ` (${t('Optional')})` : ''}
                    </Typography>
                </Stack>

                {isRequired && (
                    <Box
                        sx={{
                            flexShrink: 0,
                            px: 1.25,
                            py: '3px',
                            borderRadius: '999px',
                            fontSize: '14px',
                            fontWeight: 400,
                            color: isFulfilled
                                ? theme.palette.success.main
                                : '#fff',
                            // success.light is the same solid green as .main,
                            // so tint it for the pill background.
                            backgroundColor: isFulfilled
                                ? alpha(theme.palette.success.main, 0.15)
                                : theme.palette.error.main,
                        }}
                    >
                        {isFulfilled ? t('Completed') : t('Required')}
                    </Box>
                )}
            </Stack>

            {/* Options — label · price · control (control sits on the right) */}
            <FormControl fullWidth sx={{ mt: 1 }}>
                <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    name="radio-buttons-group"
                >
                    {choice.values?.map((option, index) => {
                        const isOutOfStock =
                            option.current_stock === 0 &&
                            option?.stock_type !== 'unlimited'

                        return (
                            <label
                                key={index}
                                htmlFor={`radio-${choiceIndex}-${index}`}
                                // <label> is inline by default, which stops
                                // the row from spanning the full width and
                                // leaves the control short of the right edge.
                                style={{ display: 'block' }}
                            >
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    spacing={1}
                                    sx={{ cursor: 'pointer', py: 0.25 }}
                                >
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                        sx={{ minWidth: 0 }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: '16px',
                                                color: isOutOfStock
                                                    ? theme.palette.neutral[400]
                                                    : theme.palette.text
                                                          .primary,
                                            }}
                                        >
                                            {option.label}
                                        </Typography>
                                        <Typography
                                            sx={{ fontSize: '12px' }}
                                            color={
                                                isShowStockText(option)
                                                    ? theme.palette.info.main
                                                    : theme.palette.error.main
                                            }
                                        >
                                            {isShowStockText(option) &&
                                            option?.stock_type !== 'unlimited'
                                                ? `(${text1} ${option.current_stock} ${text2})`
                                                : isOutOfStock
                                                ? '(out of stock)'
                                                : ''}
                                        </Typography>
                                    </Stack>

                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        // Keeps the price clear of the
                                        // radio/checkbox on the right.
                                        spacing={1.5}
                                        sx={{ flexShrink: 0 }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: '16px',
                                                color: theme.palette.text
                                                    .primary,
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {option.optionPrice === '0'
                                                ? t('Free')
                                                : `+ ${getAmount(
                                                      option.optionPrice,
                                                      currencySymbolDirection,
                                                      currencySymbol,
                                                      digitAfterDecimalPoint
                                                  )}`}
                                        </Typography>

                                        {choice?.type === 'single' ? (
                                            <Radio
                                                disabled={isOutOfStock}
                                                sx={variationControlSx}
                                                icon={<FlatRadioIcon />}
                                                checkedIcon={
                                                    <FlatRadioIcon checked />
                                                }
                                                checked={radioCheckHandler(
                                                    choiceIndex,
                                                    option,
                                                    index
                                                )}
                                                onClick={(e) =>
                                                    handleRadioData(
                                                        e,
                                                        option,
                                                        index,
                                                        choiceIndex,
                                                        choice.required,
                                                        choice?.type
                                                    )
                                                }
                                                id={`radio-${choiceIndex}-${index}`}
                                            />
                                        ) : (
                                            <MultiCheckBox
                                                changeChoices={changeChoices}
                                                option={option}
                                                index={index}
                                                choiceIndex={choiceIndex}
                                                choice={choice}
                                                radioData={radioData}
                                                itemIsLoading={itemIsLoading}
                                                productUpdate={productUpdate}
                                            />
                                        )}
                                    </Stack>
                                </Stack>
                            </label>
                        )
                    })}
                </RadioGroup>
            </FormControl>
        </Box>
    )
}
