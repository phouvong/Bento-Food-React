import { IconButton, InputAdornment, Stack, alpha } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import { CloseIconWrapper } from '@/styled-components/CustomStyles.style'
import { Search, StyledInputBase } from '../custom-search/CustomSearch.style'
import { LoadingButton } from '@mui/lab'
import CloseIcon from '@mui/icons-material/Close'
import { t } from 'i18next'

const ChatContactSearch = ({
    searchValue,
    handleSearch,
    isLoading,
    handleReset,
    searchSubmitHandler,
}) => {
    const theme = useTheme()
    const onChangeHandler = (e) => {
        e.preventDefault()
        handleSearch(e.target.value)
    }
    return (
        <Stack padding="1rem 0rem">
            <form onSubmit={(e) => searchSubmitHandler(e)}>
                <Search border={`1px solid ${alpha(theme.palette.primary.main, 0.2)}`} backgroundColor="background.paper" borderRadius="8px">
                    <StyledInputBase
                        fullWidth
                        label={t('Search...')}
                        placeholder={t('Search...')}
                        startAdornment={
                            <InputAdornment
                                position="start"
                                sx={{
                                    paddingInlineStart: '10px',
                                    marginInlineEnd: "-2px",
                                }}
                            >
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        }
                        value={searchValue}
                        onChange={(e) => onChangeHandler(e)}
                    />
                    {searchValue !== '' && (
                        <>
                            {isLoading ? (
                                <CloseIconWrapper right={-1}>
                                    <LoadingButton
                                        loading
                                        variant="text"
                                        sx={{ width: '10px' }}
                                    />
                                </CloseIconWrapper>
                            ) : (
                                <CloseIconWrapper onClick={handleReset}>
                                    <IconButton>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </CloseIconWrapper>
                            )}
                        </>
                    )}
                </Search>
            </form>
        </Stack>
    )
}

ChatContactSearch.propTypes = {}

export default ChatContactSearch
