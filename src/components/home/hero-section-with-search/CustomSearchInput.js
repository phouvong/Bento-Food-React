import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    InputAdornment,
    NoSsr,
    useTheme,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
} from '@mui/material'
import { styled, keyframes } from '@mui/material/styles'
import {
    Search,
    SearchIconWrapper,
    StyledInputBase,
} from '../../custom-search/CustomSearch.style'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import SettingsIcon from '@mui/icons-material/Settings'
import { useDebounce } from 'use-debounce'
import { removeSpecialCharacters } from '@/utils/customFunctions'
import SpeechRecognition, {
    useSpeechRecognition,
} from 'react-speech-recognition'

// Define the pulse animation
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(244, 67, 54, 0.1);
  }
`

// Styled IconButton with pulse animation
const AnimatedIconButton = styled(IconButton)(({ theme, listening }) => ({
    borderRadius: '50%',
    ...(listening && {
        backgroundColor: theme.palette.error.main + '15',
        animation: `${pulse} 1.2s ease-in-out infinite`,
        '&:hover': {
            backgroundColor: theme.palette.error.main + '25',
        },
    }),
}))

const CustomSearch = ({
    handleSearchResult,
    handleFocus,
    query,
    setFocused,
    setInputValue,
}) => {
    const { t } = useTranslation()
    const theme = useTheme()
    const [value, setValue] = useState('')
    const [debouncedValue] = useDebounce(value, 400)
    const [showPermissionDialog, setShowPermissionDialog] = useState(false)
    const [permissionDenied, setPermissionDenied] = useState(false)

    // Speech recognition setup
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition()

    let languageDirection = undefined
    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }
    useEffect(() => {
        if (query) {
            setValue(removeSpecialCharacters(query))
        } else {
            setValue('')
        }
    }, [query])

    useEffect(() => {
        setInputValue(debouncedValue)
    }, [debouncedValue])

    // Handle speech recognition transcript
    useEffect(() => {
        if (transcript) {
            setValue(transcript)
            setInputValue(transcript)
            handleFocus()
        }
    }, [transcript, setInputValue, handleFocus])


    // Auto-search when speech recognition stops
    useEffect(() => {
        if (!listening && transcript) {
            setTimeout(() => {
                handleSearchResult(transcript)
                resetTranscript()
            }, 1000) // Wait 1 second after stopping to search
        }
    }, [listening, transcript, handleSearchResult, resetTranscript])

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchResult(e.target.value)
            e.preventDefault()
            setFocused(false)
            setInputValue('')
        }
    }
    const handleChange = (value) => {
        if (value === '') {
            handleSearchResult('')
        }
        setValue(value)
        handleFocus()
    }
    const clearValue = () => {
        setValue('')
        setInputValue('')
        resetTranscript()
    }

    const checkMicrophonePermission = async () => {
        try {
            if (navigator.permissions) {
                const permission = await navigator.permissions.query({ name: 'microphone' })
                return permission.state
            }
            return 'granted' // Fallback for browsers that don't support permissions API
        } catch (error) {
            console.warn('Permission API not supported:', error)
            return 'granted' // Fallback
        }
    }

    const startListening = async () => {
        try {
            const permissionState = await checkMicrophonePermission()

            if (permissionState === 'denied') {
                setPermissionDenied(true)
                setShowPermissionDialog(true)
                return
            }

            resetTranscript()
            SpeechRecognition.startListening({
                continuous: false,
                language: navigator.language || 'en-US',
            })
        } catch (error) {
            console.error('Error starting speech recognition:', error)
            setShowPermissionDialog(true)
        }
    }

    const stopListening = () => {
        SpeechRecognition.stopListening()
    }

    const handleVoiceSearch = async () => {
        if (listening) {
            stopListening()
            // On second click (when stopping), clear the previous value
            clearValue()
        } else {
            // If there's already a value in the search input, clear it before starting to listen
            if (value) {
                clearValue()
            }
            await startListening()
        }
    }

    const handleCloseDialog = () => {
        setShowPermissionDialog(false)
        setPermissionDenied(false)
    }

    const handleOpenSettings = () => {
        // Guide user to browser settings
        const userAgent = navigator.userAgent.toLowerCase()
        let settingsUrl = ''

        if (userAgent.includes('chrome')) {
            settingsUrl = 'chrome://settings/content/microphone'
        } else if (userAgent.includes('firefox')) {
            settingsUrl = 'about:preferences#privacy'
        } else if (userAgent.includes('safari')) {
            // Safari doesn't allow direct navigation to settings
            alert(t('Please go to Safari > Preferences > Websites > Microphone to enable microphone access'))
            return
        }

        if (settingsUrl) {
            window.open(settingsUrl, '_blank')
        }
        handleCloseDialog()
    }

    return (
        <CustomStackFullWidth>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    handleSearchResult(value)
                    setFocused(false)
                    setInputValue('')
                }}
            >
                <Search>
                    <SearchIconWrapper languageDirection={languageDirection}>
                        {/*<SearchIcon fontSize="medium" />*/}
                    </SearchIconWrapper>
                    <NoSsr>
                        <StyledInputBase
                            onFocus={handleFocus}
                            backgroundColor={
                                listening
                                    ? theme.palette.primary.light + '20'
                                    : theme.palette.neutral[200]
                            }
                            placeholder={
                                listening
                                    ? t('Listening... Speak now')
                                    : t('Search foods and restaurants....')
                            }
                            value={value}
                            onChange={(e) => handleChange(e.target.value)}
                            inputProps={{
                                'aria-label': 'search',
                                style: {
                                    color:
                                        listening && transcript
                                            ? theme.palette.primary.main
                                            : 'inherit',
                                },
                            }}
                            onKeyDown={(e) => handleKeyDown(e)}
                            languageDirection={languageDirection}
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
                            endAdornment={
                                <InputAdornment
                                    position="end"
                                    sx={{
                                        marginInlineEnd: '10px',
                                        display: 'flex',
                                        gap: '5px',
                                    }}
                                >
                                    {/* Voice Search Button */}
                                    {browserSupportsSpeechRecognition && (
                                        <Tooltip
                                            title={
                                                permissionDenied
                                                    ? t('Microphone access denied')
                                                    : listening
                                                        ? t('Click to stop listening')
                                                        : t('Click to start voice search')
                                            }
                                        >
                                            <AnimatedIconButton
                                                onClick={handleVoiceSearch}
                                                size="small"
                                                listening={listening}
                                                disabled={permissionDenied}
                                                sx={{
                                                    color: permissionDenied
                                                        ? theme.palette.grey[400]
                                                        : listening
                                                            ? theme.palette.error.main
                                                            : theme.palette.primary.main,
                                                    '&:hover': {
                                                        backgroundColor:
                                                            theme.palette.action.hover,
                                                    },
                                                    '&:disabled': {
                                                        color: theme.palette.grey[400],
                                                    },
                                                }}
                                            >
                                                {permissionDenied ? (
                                                    <MicOffIcon fontSize="small" />
                                                ) : (
                                                    <MicIcon fontSize="small" />
                                                )}
                                            </AnimatedIconButton>
                                        </Tooltip>
                                    )}

                                    {/* Clear Button */}
                                    {value !== '' && (
                                        <IconButton
                                            onClick={() => clearValue()}
                                            size="small"
                                            sx={{
                                                color: theme.palette
                                                    .neutral[400],
                                                '&:hover': {
                                                    backgroundColor:
                                                        theme.palette.action
                                                            .hover,
                                                },
                                            }}
                                        >
                                            <CloseIcon
                                                fontSize="small"
                                                sx={{
                                                    borderRadius: '50%',
                                                    p: '2px',
                                                    backgroundColor:
                                                        theme.palette
                                                            .neutral[400],
                                                    color: theme.palette
                                                        .whiteContainer.main,
                                                }}
                                            />
                                        </IconButton>
                                    )}
                                </InputAdornment>
                            }
                        />
                    </NoSsr>
                </Search>
            </form>

            {/* Permission Dialog */}
            <Dialog
                open={showPermissionDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        p: 1,
                    },
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <MicOffIcon color="error" />
                        <Typography variant="h6" component="span">
                            {t('Microphone Access Required')}
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {permissionDenied
                            ? t('Microphone access has been denied. To use voice search, please enable microphone permissions in your browser settings.')
                            : t('We need access to your microphone to enable voice search functionality.')
                        }
                    </Typography>

                    <Box sx={{
                        backgroundColor: theme.palette.neutral[200],
                        p: 2,
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.neutral[200]}`
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>{t('How to enable:')}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            • {t('Click the microphone icon in your browser\'s address bar')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • {t('Select "Allow" when prompted for microphone access')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • {t('Refresh the page if needed')}
                        </Typography>
                    </Box>
                </DialogContent>

            </Dialog>
        </CustomStackFullWidth>
    )
}

CustomSearch.propTypes = {}

export default CustomSearch
