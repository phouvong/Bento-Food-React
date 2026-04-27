import { Box, FormControlLabel, Stack, Typography } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import Radio from '@mui/material/Radio'
import FormGroup from '@mui/material/FormGroup'
import { t } from 'i18next'
import { styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/styles'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import CircleIcon from '@mui/icons-material/Circle'

const CustomFormGroup = styled(FormGroup)(({ rowWise, isSmall }) => ({
    display: 'flex',
    flexDirection: rowWise ? 'row' : 'column',
    maxWidth: rowWise ? (isSmall ? '170px' : '350px') : '100%',
    width: '100%',
    justifyContent: rowWise ? 'space-between' : 'flex-start',
}))

const GroupCheckBox = ({
    checkboxData,
    allCheckboxData,
    setCheckedFilterKey,
    rowWise,
    handleDropClose,
    singleSelect,
}) => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const handleChange = (event, id) => {
        const sourceData = allCheckboxData || checkboxData
        let newArr = sourceData.map((item) => {
            if (item?.id !== id) {
                return singleSelect ? { ...item, isActive: false } : item
            }
            return { ...item, isActive: event.target.checked }
        })
        setCheckedFilterKey(newArr)
        if (handleDropClose) handleDropClose()
    }

    return (
        <Box width="100%">
            <CustomFormGroup rowWise={rowWise} isSmall={isSmall}>
                {checkboxData?.map((item) => {
                    return (
                        <FormControlLabel
                            sx={{
                                width: '100%',
                                maxWidth: rowWise
                                    ? isSmall
                                        ? '150px'
                                        : '170px'
                                    : '100%',
                                marginLeft: 0,
                                marginRight: 0,
                                '.MuiFormControlLabel-label': {
                                    width: '100%',
                                },
                            }}
                            key={item?.id}
                            value={item?.value}
                            name={item?.value}
                            labelPlacement="start"
                            control={
                                singleSelect ? (
                                    <Radio
                                        sx={{
                                            padding: '2px',
                                            color: theme.palette.text.secondary,
                                            '&.Mui-checked': {
                                                color: theme.palette.primary.main,
                                            },
                                        }}
                                        icon={
                                            <RadioButtonUncheckedIcon
                                                sx={{ fontSize: 14 }}
                                            />
                                        }
                                        checkedIcon={
                                            <CircleIcon
                                                sx={{ fontSize: 12 }}
                                            />
                                        }
                                        onChange={(event) =>
                                            handleChange(event, item.id)
                                        }
                                        checked={item?.isActive}
                                    />
                                ) : (
                                    <Checkbox
                                        sx={{
                                            padding: '2px',
                                            color: theme.palette.text.secondary,
                                            '&.Mui-checked': {
                                                color: theme.palette.primary.main,
                                            },
                                        }}
                                        icon={
                                            <RadioButtonUncheckedIcon
                                                sx={{ fontSize: 14 }}
                                            />
                                        }
                                        checkedIcon={
                                            <CircleIcon
                                                sx={{ fontSize: 12 }}
                                            />
                                        }
                                        onChange={(event) =>
                                            handleChange(event, item.id)
                                        }
                                        checked={item?.isActive}
                                    />
                                )
                            }
                            label={
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    width="100%"
                                    py={0.35}
                                >
                                    <Typography
                                        fontSize="10px"
                                        color={theme.palette.text.primary}
                                        fontWeight={400}
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            pr: 0.8,
                                        }}
                                    >
                                        {t(item?.name)}
                                    </Typography>
                                </Stack>
                            }
                        />
                    )
                })}
            </CustomFormGroup>
        </Box>
    )
}

export default GroupCheckBox
