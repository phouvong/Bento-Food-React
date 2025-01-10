import React, { useEffect, useRef, useState } from 'react'
import CustomSearchInput from './CustomSearchInput'
import { useRouter } from 'next/router'
import SearchSuggestionsBottom from '../../search/SearchSuggestionsBottom'
import { useSelector } from 'react-redux'
import { Stack } from '@mui/material'

const SearchBox = ({ query }) => {
    const [focused, setFocused] = React.useState(false)
    const { token } = useSelector((state) => state.userToken)
    const [inputValue, setInputValue] = useState('')
    const router = useRouter()
    const { categoryIsSticky } = useSelector((state) => state.scrollPosition)
    const searchRef = useRef(null)
    const onFocus = () => setFocused(true)
    const onBlur = () => {
        setFocused(false)
    }
    useEffect(() => {
        if (categoryIsSticky) {
            setFocused(false)
        }
    }, [categoryIsSticky])

    const handleSearchedValues = (value) => {
        const searchedValues = JSON.parse(
            localStorage.getItem('searchedValues')
        )
        if (searchedValues && searchedValues.length > 0) {
            if (value !== '') {
                searchedValues.push(value)
            }
            localStorage.setItem(
                'searchedValues',
                JSON.stringify([...new Set(searchedValues)])
            )
        } else {
            if (value !== '') {
                let newData = []
                newData.push(value)
                localStorage.setItem('searchedValues', JSON.stringify(newData))
            }
        }
    }
    const routeHandler = (value) => {
        setFocused(false)
        setInputValue('')

        if (value !== '') {
            router.push(
                {
                    pathname: '/home',
                    query: {
                        query: value,
                    },
                },
                undefined,
                { shallow: router.pathname === '/home' }
            )
            onBlur()
        }
    }
    const handleKeyPress = (value) => {
        const trimmedValue = value.trim()

        if (trimmedValue === '') {
            return
        }

        handleSearchedValues(trimmedValue)
        routeHandler(trimmedValue)
    }
    const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
            setFocused(false)
            setInputValue('')
        }
    }
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside, {
            passive: true,
        })

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [searchRef])
    const handleSearchSuggestionsBottom = () => {
        if (token) {
            if (focused) {
                return (
                    <SearchSuggestionsBottom
                        routeHandler={routeHandler}
                        handleFocus={onFocus}
                        inputValue={inputValue}
                        searchRef={searchRef}
                    />
                )
            }
        } else {
            if (inputValue.trim().length >= 1) {
                return (
                    <SearchSuggestionsBottom
                        routeHandler={routeHandler}
                        handleFocus={onFocus}
                        inputValue={inputValue}
                        searchRef={searchRef}
                    />
                )
            }
        }
    }

    return (
        <Stack>
            <CustomSearchInput
                setInputValue={setInputValue}
                handleSearchResult={handleKeyPress}
                handleFocus={onFocus}
                handleBlur={onBlur}
                query={query}
                setFocused={setFocused}
            />
            {handleSearchSuggestionsBottom()}
        </Stack>
    )
}

export default SearchBox
