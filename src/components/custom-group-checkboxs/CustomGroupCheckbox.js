import React, { useState } from 'react'
import Box from '@mui/material/Box'
import FormGroup from '@mui/material/FormGroup'
import Checkbox from '@mui/material/Checkbox'
import { Skeleton, Stack, Button } from '@mui/material'
import { t } from 'i18next'
import { CustomTypographyLabel } from '../../styled-components/CustomTypographies.style'

const CustomLabelControl = ({ label, control }) => {
    return (
        <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box sx={{ mr: 1 }}>{label}</Box>
            {control}
        </Box>
    )
}

const CustomGroupCheckbox = (props) => {
    const {
        setIsFilterCall,
        forcuisine,
        checkboxData,
        stateData,
        setStateData,
        setCuisineState,
        cuisineState,
    } = props

    const [expanded, setExpanded] = useState(false)

    const visibleCheckboxes = !expanded
        ? checkboxData.slice(0, 4) // Show only 4 checkboxes initially
        : checkboxData

    const toggleExpand = () => {
        setExpanded(!expanded)
    }
    const handleChangeCuisine = (event, id) => {
        let newCuisines = cuisineState?.map((item) =>
            item?.id === id ? { ...item, isActive: event.target.checked } : item
        )
        setCuisineState(newCuisines)
        setIsFilterCall(true)
    }

    const handleChange = (event, id) => {
        if (id === 0 || id === 2) {
            // Toggle the isActive state for 'Veg' and 'Non-Veg' without affecting others
            let newArr = stateData.map((item) =>
                item.id === id
                    ? { ...item, isActive: event.target.checked }
                    : item.id === 0 || item.id === 2
                    ? { ...item, isActive: false }
                    : item
            )
            setStateData(newArr)
            setIsFilterCall(true)
        } else {
            let newArr = stateData.map((item) =>
                item?.id === id
                    ? { ...item, isActive: event.target.checked }
                    : item
            )
            //dispatch(setSearchTagData(newArr))
            setStateData(newArr)
            setIsFilterCall(true)
        }
    }

    return (
        <div>
            <FormGroup
                sx={{
                    display: 'flex',
                    width: '100%',
                }}
            >
                {visibleCheckboxes.map((item) => {
                    const label = (
                        <CustomTypographyLabel>
                            {forcuisine === 'true' ? item?.name : t(item?.name)}
                        </CustomTypographyLabel>
                    )
                    const control = (
                        <Checkbox
                            sx={{ padding: '4px' }}
                            onChange={(event) =>
                                forcuisine === 'true'
                                    ? handleChangeCuisine(event, item.id)
                                    : handleChange(event, item.id)
                            }
                            checked={item?.isActive}
                        />
                    )

                    return (
                        <Box
                            sx={{
                                width: '100%',
                                textAlign: 'left',
                            }}
                            key={item?.id}
                        >
                            <CustomLabelControl
                                label={label}
                                control={control}
                            />
                        </Box>
                    )
                })}

                {checkboxData.length > 4 && (
                    <Button
                        onClick={toggleExpand}
                        sx={{ mt: 2 }}
                        variant="text"
                    >
                        {expanded ? t('View Less') : t('View More')}
                    </Button>
                )}
            </FormGroup>
        </div>
    )
}

export default CustomGroupCheckbox
