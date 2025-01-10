import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import { Stack } from '@mui/material'
import Typography from '@mui/material/Typography'
import 'simplebar-react/dist/simplebar.min.css'
import { useTranslation } from 'react-i18next'
import CustomGroupCheckbox from '../custom-group-checkboxs/CustomGroupCheckbox'
import { useDispatch, useSelector } from 'react-redux'
import SimpleBar from 'simplebar-react'
import {
    setFilterbyByCuisineDispatch,
    setFilterbyByDispatch,
} from '@/redux/slices/searchFilter'
import { WrapperForSideDrawerFilter } from '@/styled-components/CustomStyles.style'
import { useGetCuisines } from '@/hooks/react-query/cuisines/useGetCuisines'

const FilterCard = ({
    stateData,
    setStateData,

    forcuisine,
    restaurantType,
    setCuisineState,
    cuisineState,
}) => {
    const { t } = useTranslation()
    const { foodOrRestaurant } = useSelector((state) => state.searchFilterStore)

    const [isFilterCall, setIsFilterCall] = useState(false)
    const dispatch = useDispatch()
    const handleFilterBy = () => {
        const activeFilters = stateData.filter((item) => item.isActive === true)
        const activeCuisines = cuisineState?.filter(
            (item) => item.isActive === true
        )
        dispatch(setFilterbyByDispatch(activeFilters))
        dispatch(setFilterbyByCuisineDispatch(activeCuisines))
    }
    useEffect(() => {
        if (isFilterCall) {
            handleFilterBy()
        }
    }, [stateData, cuisineState])

    return (
        <Box sx={{ width: '100%' }}>
            <WrapperForSideDrawerFilter
                smminwith="270px"
                sx={{ paddingInline: '2rem' }}
            >
                <SimpleBar
                    style={{
                        width: '100%',
                        maxHeight: '500px',
                        paddingInlineEnd: '.5rem',
                    }}
                >
                    <Stack spacing={3} width="100%">
                        <Stack spacing={1}>
                            <Typography variant="h4">
                                {t('Filter By')}
                            </Typography>
                            <CustomGroupCheckbox
                                handleChangeFilter={handleFilterBy}
                                checkboxData={
                                    foodOrRestaurant === 'restaurants'
                                        ? stateData?.slice(1)
                                        : stateData?.slice(1, 9)
                                }
                                stateData={stateData}
                                setStateData={setStateData}
                                setIsFilterCall={setIsFilterCall}
                            />
                        </Stack>

                        {foodOrRestaurant === 'restaurants' && (
                            <Stack spacing={1}>
                                <Typography variant="h4">
                                    {t('Cuisines')}
                                </Typography>

                                <CustomGroupCheckbox
                                    checkboxData={cuisineState?.map((item) => {
                                        return {
                                            ...item,
                                            isActive: item?.isActive
                                                ? item?.isActive
                                                : false,
                                        }
                                    })}
                                    forcuisine="true"
                                    setCuisineState={setCuisineState}
                                    cuisineState={cuisineState}
                                    setIsFilterCall={setIsFilterCall}
                                />
                            </Stack>
                        )}
                    </Stack>
                </SimpleBar>
            </WrapperForSideDrawerFilter>
        </Box>
    )
}

FilterCard.propTypes = {}

export default FilterCard
