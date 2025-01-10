import React, { useEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'
import CustomSearch from '../custom-search/CustomSearch'
import { useRouter } from 'next/router'
import SearchSuggestionsBottom from '../search/SearchSuggestionsBottom'
const HomeSearch = () => {
    const [openSearchSuggestions, setOpenSearchSuggestions] = useState(false)
    const [selectedValue, setSelectedValue] = useState('')
    const router = useRouter()
    const searchRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setOpenSearchSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [searchRef])
    const handleOnFocus = () => {
        setOpenSearchSuggestions(true)
        localStorage.setItem('bg', true)
    }
    const handleKeyPress = (value) => {
        setOpenSearchSuggestions(false)

        let getItem = JSON.parse(localStorage.getItem('searchedValues'))
        if (getItem && getItem.length > 0) {
            if (value !== '') {
                getItem.push(value)
            }
            localStorage.setItem('searchedValues', JSON.stringify(getItem))
        } else {
            if (value !== '') {
                let newData = []
                newData.push(value)
                localStorage.setItem('searchedValues', JSON.stringify(newData))
            }
        }
        if (value !== '') {
            router.push(
                {
                    pathname: window.location.pathname,
                    query: {
                        query: value,
                    },
                },
                undefined,
                { shallow: true }
            )
        }
    }
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                position: 'relative',
                mb: '1rem',
            }}
            onFocus={() => handleOnFocus()}
            ref={searchRef}
        >
            {zoneid && router.pathname !== '/' && (
                <>
                    <CustomSearch
                        label="Search..."
                        handleSearchResult={handleKeyPress}
                        selectedValue={selectedValue}
                    />
                    {openSearchSuggestions && (
                        <SearchSuggestionsBottom
                            setOpenSearchSuggestions={setOpenSearchSuggestions}
                            setSelectedValue={setSelectedValue}
                        />
                    )}
                </>
            )}
        </Box>
    )
}
export default HomeSearch
