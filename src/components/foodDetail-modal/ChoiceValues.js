import React, { useEffect, useState } from 'react'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { FoodTitleTypography } from '../food-card/FoodCard.style'
import FormControl from '@mui/material/FormControl'
import RadioGroup from '@mui/material/RadioGroup'
import {
    alpha,
    FormControlLabel,
    styled,
    Typography,
    Stack,
} from '@mui/material'
import Radio from '@mui/material/Radio'
import { CustomTypographyLabel } from '@/styled-components/CustomTypographies.style'
import { getAmount } from '@/utils/customFunctions'
import InfoIcon from '@mui/icons-material/Info'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip'
import { useTheme } from '@mui/styles'
import MultiCheckBox from '@/components/foodDetail-modal/MultiCheckBox'

const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
        color: alpha(theme.palette.primary.main, 0.8),
    },
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.neutral[100],
    },
}))

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
    let text
    if (choice) {
        text = `${t(
            'This Variation needs to be selected in between minimum'
        )} ${choice?.min} ${t('and maximum')} ${choice?.max} ${t('items.')}`
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

    return (
        <CustomStackFullWidth>
            <FoodTitleTypography
                gutterBottom
                fontWeight="600"
                component="h6"
                sx={{
                    margin: '5px 0',
                    textAlign: 'left',
                }}
            >
                {choice.name} :
                {choice?.type === 'multi' && (
                    <CustomTooltip title={text} placement="top-start">
                        <InfoIcon
                            style={{
                                with: '12px',
                                height: '12px',
                                cursor: 'pointer',
                            }}
                            color="primary"
                        />
                    </CustomTooltip>
                )}
            </FoodTitleTypography>
            <FormControl sx={{ marginInlineStart: '-10px' }}>
                <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    name="radio-buttons-group"
                >
                    {choice.values?.map((option, index) => (
                        <label htmlFor={`radio-${choiceIndex}-${index}`}>
                            <CustomStackFullWidth
                                key={index}
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                spacing={1}
                                sx={{ cursor: 'pointer' }}
                            >
                                <FormControlLabel
                                    value={option.label}
                                    control={
                                        choice?.type === 'single' ? (
                                            <Radio
                                                disabled={
                                                    option.current_stock ===
                                                        0 &&
                                                    option?.stock_type !==
                                                        'unlimited'
                                                }
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor:
                                                            'transparent',
                                                    },
                                                }}
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
                                        )
                                    }
                                    label={
                                        <Stack direction="row" spacing={1}>
                                            <CustomTypographyLabel
                                                sx={{
                                                    color: (theme) =>
                                                        option.current_stock ===
                                                            0 &&
                                                        option?.stock_type !==
                                                            'unlimited'
                                                            ? theme.palette
                                                                  .neutral[400]
                                                            : theme.palette
                                                                  .neutral[1000],
                                                }}
                                                span="component"
                                            >
                                                {option.label}
                                            </CustomTypographyLabel>
                                            <Typography
                                                fontSize="12px"
                                                color={
                                                    isShowStockText(option)
                                                        ? theme.palette.info
                                                              .main
                                                        : theme.palette.error
                                                              .main
                                                }
                                            >
                                                {isShowStockText(option) &&
                                                option?.stock_type !==
                                                    'unlimited'
                                                    ? `(${text1} ${option.current_stock} ${text2})`
                                                    : option.current_stock ===
                                                          0 &&
                                                      option?.stock_type !==
                                                          'unlimited'
                                                    ? '(out of stock)'
                                                    : ''}
                                            </Typography>
                                        </Stack>
                                    }
                                />

                                <CustomTypographyLabel>
                                    {option.optionPrice === '0'
                                        ? 'Free'
                                        : `+${getAmount(
                                              option.optionPrice,
                                              currencySymbolDirection,
                                              currencySymbol,
                                              digitAfterDecimalPoint
                                          )}`}
                                </CustomTypographyLabel>
                            </CustomStackFullWidth>
                        </label>
                    ))}
                </RadioGroup>
            </FormControl>
        </CustomStackFullWidth>
    )
}
