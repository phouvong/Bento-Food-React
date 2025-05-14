import React, { useEffect, useState } from 'react'
import { Search, StyledInputBase } from './CustomSearch.style'
import SearchIcon from '@mui/icons-material/Search'
import { useTranslation } from 'react-i18next'
import {
    CloseIconWrapper,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import { IconButton, InputAdornment, NoSsr } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import LoadingButton from '@mui/lab/LoadingButton'

const CustomSearch = ({
    handleSearchResult,
    label,
    isLoading,
    selectedValue,
    borderRadius,
    forMobile,
    backgroundColor,
}) => {
    const { t } = useTranslation()
    const [value, setValue] = useState('')
    let languageDirection = undefined
    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }
    useEffect(() => {
        if (selectedValue === '') {
            setValue(selectedValue)
        }
    }, [selectedValue])

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchResult(e.target.value)
            e.preventDefault()
        }
    }
    const handleReset = () => {
        setValue('')
        handleSearchResult('')
    }
    const handleChange = (value) => {
        if (value === '') {
            handleSearchResult('')
        }
        setValue(value)
    }

    return (
        <CustomStackFullWidth>
            <form onSubmit={handleKeyPress}>
                <Search
                    borderRadius={borderRadius}
                    backgroundColor={backgroundColor}
                >
                    <NoSsr>
                        <StyledInputBase
                            placeholder={t(label)}
                            value={value}
                            onChange={(e) => handleChange(e.target.value)}
                            inputProps={{ 'aria-label': 'search' }}
                            onKeyPress={(e) => handleKeyPress(e)}
                            languageDirection={languageDirection}
                            forMobile={forMobile}
                            startAdornment={
                                // Add startAdornment here
                                <InputAdornment
                                    position="start"
                                    sx={{
                                        marginInlineStart: '10px',
                                        cursor: 'pointer',
                                        marginInlineEnd: '0px',
                                    }}
                                    // Add your content for the startAdornment here
                                >
                                    <SearchIcon fontSize="medium" />
                                </InputAdornment>
                            }
                        />
                    </NoSsr>
                    {value !== '' && (
                        <>
                            {isLoading ? (
                                <CloseIconWrapper
                                    right={-1}
                                    languageDirection={languageDirection}
                                >
                                    <LoadingButton
                                        loading
                                        variant="text"
                                        sx={{ width: '10px' }}
                                    />
                                </CloseIconWrapper>
                            ) : (
                                <CloseIconWrapper
                                    onClick={() => handleReset()}
                                    languageDirection={languageDirection}
                                >
                                    <IconButton>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </CloseIconWrapper>
                            )}
                        </>
                    )}
                </Search>
            </form>
        </CustomStackFullWidth>
    )
}

CustomSearch.propTypes = {}

export default CustomSearch
