import React, { useEffect, useRef, useState } from 'react'
import CustomSearchInput from './CustomSearchInput'
import { useRouter } from 'next/router'
import SearchSuggestionsBottom from '../../search/SearchSuggestionsBottom'
import { useSelector } from 'react-redux'
import { Stack, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const SearchBox = ({ query, autoFocusOnMobile = false, onFocusChange }) => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const [focused, setFocused] = React.useState(false)
    const [inputValue, setInputValue] = useState('')
    const [selectedValue, setSelectedValue] = useState('')
    const [suggestionsFetching, setSuggestionsFetching] = useState(false)
    const router = useRouter()
    const { categoryIsSticky } = useSelector((state) => state.scrollPosition)
    const containerRef = useRef(null)
    const searchRef = useRef(null)
    const inputRef = useRef(null)
    const onFocus = () => setFocused(true)
    const onBlur = () => {
        setFocused(false)
    }
    // Only for callers (e.g. FilterTag's tap-to-open mobile search) that
    // mount this component in direct response to the user opening it —
    // NewNavbar renders it unconditionally, so this must stay opt-in.
    useEffect(() => {
        if (autoFocusOnMobile && isSmall) setFocused(true)
    }, [autoFocusOnMobile, isSmall])

    useEffect(() => {
        if (categoryIsSticky) {
            setFocused(false)
        }
    }, [categoryIsSticky])

    useEffect(() => {
        onFocusChange?.(focused)
    }, [focused, onFocusChange])

    // Once the route's own query catches up, drop the optimistic value so
    // later typed searches aren't stuck showing a stale selection.
    useEffect(() => {
        setSelectedValue('')
    }, [query])

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
        inputRef.current?.blur()

        if (value !== '') {
            setSelectedValue(value)
            router.push(
                {
                    pathname: '/search',
                    query: {
                        query: value,
                    },
                },
                undefined,
                { shallow: router.pathname === '/search' }
            )
            onBlur()
        }
    }
    // For suggestion rows that navigate away (a food modal opening, a
    // restaurant redirect) rather than running an actual search — the typed
    // query has no bearing on where the user landed, so leaving it in the
    // box would misleadingly look like a search was performed.
    const resetSearch = () => {
        setFocused(false)
        setInputValue('')
        inputRef.current?.clearValue()
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
        const target = event.target
        const insideContainer = containerRef.current?.contains(target)
        const insidePopover = searchRef.current?.contains(target)
        if (!insideContainer && !insidePopover) {
            setFocused(false)
        }
    }
    useEffect(() => {
        document.addEventListener('pointerdown', handleClickOutside, {
            passive: true,
        })

        return () => {
            document.removeEventListener('pointerdown', handleClickOutside)
        }
    }, [])

    const handleSearchSuggestionsBottom = () => {
        if (!focused) return null
        return (
            <SearchSuggestionsBottom
                routeHandler={routeHandler}
                handleFocus={onFocus}
                inputValue={inputValue}
                searchRef={searchRef}
                onClose={onBlur}
                resetSearch={resetSearch}
                onFetchingStateChange={setSuggestionsFetching}
            />
        )
    }

    return (
        <Stack ref={containerRef} sx={{ position: 'relative' }}>
            <CustomSearchInput
                ref={inputRef}
                setInputValue={setInputValue}
                handleSearchResult={handleKeyPress}
                handleFocus={onFocus}
                handleBlur={onBlur}
                query={selectedValue || query}
                setFocused={setFocused}
                isSuggestionsFetching={suggestionsFetching}
            />
            {handleSearchSuggestionsBottom()}
        </Stack>
    )
}

export default SearchBox
