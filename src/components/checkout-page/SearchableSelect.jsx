import React, { useMemo, useRef, useState } from 'react'
import {
    Box,
    InputBase,
    Popover,
    Stack,
    Typography,
    useTheme,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useTranslation } from 'react-i18next'

const SearchableSelect = ({
    value,
    onChange,
    options = [],
    placeholder,
    searchPlaceholder,
    emptyText,
    disabled = false,
    hasError = false,
}) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const anchorRef = useRef(null)
    const [anchorEl, setAnchorEl] = useState(null)
    const [search, setSearch] = useState('')

    const open = Boolean(anchorEl)
    const selectedOption = options.find((opt) => opt.id === value)

    const filteredOptions = useMemo(() => {
        if (!search.trim()) return options
        const query = search.trim().toLowerCase()
        return options.filter((opt) =>
            opt.name?.toLowerCase().includes(query)
        )
    }, [options, search])

    const handleOpen = () => {
        if (disabled) return
        setAnchorEl(anchorRef.current)
    }

    const handleClose = () => {
        setAnchorEl(null)
        setSearch('')
    }

    const handleSelect = (optionId) => {
        onChange?.(optionId)
        handleClose()
    }

    return (
        <>
            <Box
                ref={anchorRef}
                onClick={handleOpen}
                sx={{
                    width: '100%',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    px: '12px',
                    borderRadius: '8px',
                    backgroundColor: disabled
                        ? theme.palette.neutral[200]
                        : theme.palette.background.paper,
                    border: '1px solid',
                    borderColor: hasError
                        ? theme.palette.error.main
                        : open
                          ? theme.palette.primary.main
                          : theme.palette.divider,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'border-color 0.15s ease',
                }}
            >
                <Typography
                    noWrap
                    sx={{
                        fontSize: '16px',
                        color: selectedOption
                            ? theme.palette.text.primary
                            : theme.palette.text.secondary,
                    }}
                >
                    {selectedOption ? t(selectedOption.name) : placeholder}
                </Typography>
                <KeyboardArrowDownIcon
                    sx={{
                        fontSize: 18,
                        color: theme.palette.text.secondary,
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.15s ease',
                        flexShrink: 0,
                    }}
                />
            </Box>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                disableRestoreFocus
                slotProps={{
                    paper: {
                        sx: {
                            mt: '4px',
                            width: anchorRef.current?.offsetWidth || 'auto',
                            minWidth: 240,
                            maxHeight: 320,
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: theme.palette.divider,
                            boxShadow:
                                '0px 4px 20px rgba(0, 0, 0, 0.1)',
                            overflow: 'hidden',
                        },
                    },
                }}
            >
                <Box
                    sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        backgroundColor: theme.palette.background.paper,
                        borderBottom: '1px solid',
                        borderColor: theme.palette.divider,
                        px: '12px',
                        py: '8px',
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        gap="8px"
                        sx={{
                            backgroundColor: theme.palette.neutral[1800],
                            borderRadius: '8px',
                            px: '10px',
                            height: '36px',
                        }}
                    >
                        <SearchIcon
                            sx={{
                                fontSize: 16,
                                color: theme.palette.text.secondary,
                            }}
                        />
                        <InputBase
                            autoFocus
                            fullWidth
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={searchPlaceholder || t('Search')}
                            sx={{
                                fontSize: '14px',
                                color: theme.palette.text.primary,
                            }}
                        />
                    </Stack>
                </Box>

                <Box sx={{ overflowY: 'auto', py: '4px' }}>
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => {
                            const isSelected = opt.id === value
                            return (
                                <Box
                                    key={opt.id}
                                    onClick={() => handleSelect(opt.id)}
                                    sx={{
                                        px: '14px',
                                        py: '10px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: isSelected
                                            ? theme.palette.primary.main
                                            : theme.palette.text.primary,
                                        fontWeight: isSelected ? 600 : 400,
                                        backgroundColor: isSelected
                                            ? theme.palette.neutral[1800]
                                            : 'transparent',
                                    }}
                                >
                                    {t(opt.name)}
                                </Box>
                            )
                        })
                    ) : (
                        <Box sx={{ px: '14px', py: '16px' }}>
                            <Typography
                                sx={{
                                    fontSize: '13px',
                                    color: theme.palette.text.secondary,
                                    textAlign: 'center',
                                }}
                            >
                                {emptyText || t('No options found')}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Popover>
        </>
    )
}

export default SearchableSelect
