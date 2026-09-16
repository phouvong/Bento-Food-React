import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
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
    CircularProgress,
} from '@mui/material'
import { styled, keyframes } from '@mui/material/styles'
import { useQuery } from 'react-query'
import {
    Search,
    SearchIconWrapper,
    StyledInputBase,
} from '../../custom-search/CustomSearch.style'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import SettingsIcon from '@mui/icons-material/Settings'
import { useDebounce } from 'use-debounce'
import { removeSpecialCharacters } from '@/utils/customFunctions'
import SpeechRecognition, {
    useSpeechRecognition,
} from 'react-speech-recognition'
import { CategoryApi } from '@/hooks/react-query/config/categoryApi'
import { onErrorResponse } from '@/components/ErrorResponse'

const PLACEHOLDER_ROTATE_MS = 2600
const PLACEHOLDER_FADE_MS = 280

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
    width: 32,
    height: 32,
    backgroundColor:
        theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff',
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
        backgroundColor:
            theme.palette.mode === 'dark'
                ? theme.palette.background.paper
                : '#fff',
        borderColor: theme.palette.primary.main,
    },
    ...(listening && {
        backgroundColor: theme.palette.error.main + '15',
        borderColor: theme.palette.error.main,
        animation: `${pulse} 1.2s ease-in-out infinite`,
        '&:hover': {
            backgroundColor: theme.palette.error.main + '25',
            borderColor: theme.palette.error.main,
        },
    }),
}))

const CustomSearch = forwardRef(function CustomSearch(
    {
        handleSearchResult,
        handleFocus,
        query,
        setFocused,
        setInputValue,
        isSuggestionsFetching,
    },
    ref
) {
    const { t } = useTranslation()
    const theme = useTheme()
    const [value, setValue] = useState('')
    const [debouncedValue] = useDebounce(value, 400)
    const [showPermissionDialog, setShowPermissionDialog] = useState(false)
    const [permissionDenied, setPermissionDenied] = useState(false)

    // Animated placeholder — cycles through category names, same source
    // query FeatureCatagories uses (shares its react-query cache entry).
    const { data: categoriesResponse } = useQuery(
        ['category', ''],
        () => CategoryApi.categories(''),
        {
            staleTime: 1000 * 60 * 8,
            cacheTime: 8 * 60 * 1000,
            onError: onErrorResponse,
        }
    )
    const animatedItems = useMemo(
        () =>
            (categoriesResponse?.data ?? [])
                .slice(0, 15)
                .map((c) => c?.name)
                .filter(Boolean),
        [categoriesResponse]
    )
    const [phIndex, setPhIndex] = useState(0)
    const [phVisible, setPhVisible] = useState(true)
    // Ref so the interval always reads the latest items without restarting
    const animatedItemsRef = useRef(animatedItems)
    animatedItemsRef.current = animatedItems

    useEffect(() => {
        const id = setInterval(() => {
            const items = animatedItemsRef.current
            if (!items || items.length <= 1) return
            setPhVisible(false)
            setTimeout(() => {
                setPhIndex((prev) => (prev + 1) % items.length)
                setPhVisible(true)
            }, PLACEHOLDER_FADE_MS)
        }, PLACEHOLDER_ROTATE_MS)
        return () => clearInterval(id)
    }, [])

    const rawNoun = animatedItems[phIndex]
    // Keep long category names from breaking the placeholder UI
    const currentNoun =
        rawNoun && rawNoun.length > 22
            ? `${rawNoun.slice(0, 22).trimEnd()}…`
            : rawNoun

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

    // Rich placeholder must start exactly where the real caret does. Rather
    // than guessing the icon/adornment/input-padding pixel math (fragile —
    // breaks the moment any of those change), measure the native input's
    // actual rendered text-start position and use that directly.
    const overlayWrapperRef = useRef(null)
    const nativeInputRef = useRef(null)
    const [overlayInset, setOverlayInset] = useState(0)
    const [overlayMeasured, setOverlayMeasured] = useState(false)

    // useLayoutEffect (not useEffect) so this runs before the browser
    // paints — otherwise the overlay briefly renders at its initial 0px
    // inset (overlapping the icon) for one frame before correcting.
    useLayoutEffect(() => {
        const measure = () => {
            const wrapperEl = overlayWrapperRef.current
            const inputEl = nativeInputRef.current
            if (!wrapperEl || !inputEl) return
            const wrapperRect = wrapperEl.getBoundingClientRect()
            const inputRect = inputEl.getBoundingClientRect()
            const inputStyle = window.getComputedStyle(inputEl)
            const isRtl = languageDirection === 'rtl'
            const gap = isRtl
                ? wrapperRect.right -
                  inputRect.right +
                  (parseFloat(inputStyle.paddingRight) || 0)
                : inputRect.left -
                  wrapperRect.left +
                  (parseFloat(inputStyle.paddingLeft) || 0)
            setOverlayInset(Math.max(gap, 0))
            setOverlayMeasured(true)
        }
        measure()
        window.addEventListener('resize', measure)
        // The search icon is a Flaticon webfont glyph — before it finishes
        // loading, the browser renders a fallback glyph of a different
        // width, so the icon's rendered width (and therefore the caret's
        // start position) shifts once the real font swaps in. Re-measure
        // when fonts finish loading so the overlay doesn't stay stuck at
        // the pre-font-load position.
        if (typeof document !== 'undefined' && document.fonts?.ready) {
            document.fonts.ready.then(measure)
        }
        return () => window.removeEventListener('resize', measure)
    }, [languageDirection])

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

    useImperativeHandle(ref, () => ({
        clearValue,
        blur: () => nativeInputRef.current?.blur(),
    }))

    const checkMicrophonePermission = async () => {
        try {
            if (navigator.permissions) {
                const permission = await navigator.permissions.query({
                    name: 'microphone',
                })
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
            alert(
                t(
                    'Please go to Safari > Preferences > Websites > Microphone to enable microphone access'
                )
            )
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
                        <Box
                            ref={overlayWrapperRef}
                            sx={{ position: 'relative', width: '100%' }}
                        >
                            <StyledInputBase
                                onFocus={handleFocus}
                                inputRef={nativeInputRef}
                                backgroundColor={
                                    listening
                                        ? theme.palette.primary.light + '20'
                                        : theme.palette.neutral[200]
                                }
                                placeholder={
                                    listening
                                        ? t('Listening... Speak now')
                                        : currentNoun
                                        ? ''
                                        : t('Search foods')
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
                                        <Box
                                            component="i"
                                            className="fi fi-rs-search"
                                            sx={{
                                                fontSize: '18px',
                                                lineHeight: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        />
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
                                                        ? t(
                                                              'Microphone access denied'
                                                          )
                                                        : listening
                                                        ? t(
                                                              'Click to stop listening'
                                                          )
                                                        : t(
                                                              'Click to start voice search'
                                                          )
                                                }
                                            >
                                                <AnimatedIconButton
                                                    onClick={handleVoiceSearch}
                                                    size="small"
                                                    listening={listening}
                                                    disabled={permissionDenied}
                                                    sx={{
                                                        color: permissionDenied
                                                            ? theme.palette
                                                                  .grey[400]
                                                            : listening
                                                            ? theme.palette
                                                                  .error.main
                                                            : theme.palette
                                                                  .primary.main,
                                                        '&:hover': {
                                                            backgroundColor:
                                                                theme.palette
                                                                    .action
                                                                    .hover,
                                                        },
                                                        '&:disabled': {
                                                            color: theme.palette
                                                                .grey[400],
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

                                        {isSuggestionsFetching && (
                                            <CircularProgress
                                                size={16}
                                                thickness={5}
                                                sx={{
                                                    color: theme.palette
                                                        .neutral[400],
                                                }}
                                            />
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
                                                            'transparent',
                                                        color: theme.palette
                                                            .neutral[500],
                                                    },
                                                }}
                                            >
                                                <Box
                                                    component="i"
                                                    className="fi fi-br-cross-small"
                                                    sx={{
                                                        fontSize: '18px',
                                                        lineHeight: 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                />
                                            </IconButton>
                                        )}
                                    </InputAdornment>
                                }
                            />
                            {overlayMeasured &&
                            !listening &&
                            currentNoun &&
                            value === '' ? (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        inset: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        pointerEvents: 'none',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {/* Left inset is measured from the real
                                    input's own rendered text-start position
                                    (see the layout-measure effect above) so
                                    this lines up with the caret exactly,
                                    regardless of icon size or input padding. */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            minWidth: 0,
                                            overflow: 'hidden',
                                            marginInlineStart: `${overlayInset}px`,
                                            fontSize: {
                                                xs: '13px',
                                                sm: '12px',
                                            },
                                            lineHeight: 1.3,
                                            color: (th) =>
                                                th.palette.mode === 'dark'
                                                    ? th.palette.neutral[400]
                                                    : th.palette.neutral[1000],
                                        }}
                                    >
                                        {t('Search for')}&nbsp;
                                        <Box
                                            component="span"
                                            sx={{
                                                fontWeight: 700,
                                                color: (th) =>
                                                    th.palette.text.primary,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                opacity: phVisible ? 1 : 0,
                                                transform: phVisible
                                                    ? 'translateY(0)'
                                                    : 'translateY(-5px)',
                                                transition:
                                                    'opacity 0.28s ease, transform 0.28s ease',
                                            }}
                                        >
                                            {currentNoun}
                                        </Box>
                                    </Box>
                                </Box>
                            ) : null}
                        </Box>
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
                            ? t(
                                  'Microphone access has been denied. To use voice search, please enable microphone permissions in your browser settings.'
                              )
                            : t(
                                  'We need access to your microphone to enable voice search functionality.'
                              )}
                    </Typography>

                    <Box
                        sx={{
                            backgroundColor: theme.palette.neutral[200],
                            p: 2,
                            borderRadius: 1,
                            border: `1px solid ${theme.palette.neutral[200]}`,
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            <strong>{t('How to enable:')}</strong>
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            •{' '}
                            {t(
                                "Click the microphone icon in your browser's address bar"
                            )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            •{' '}
                            {t(
                                'Select "Allow" when prompted for microphone access'
                            )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • {t('Refresh the page if needed')}
                        </Typography>
                    </Box>
                </DialogContent>
            </Dialog>
        </CustomStackFullWidth>
    )
})

CustomSearch.propTypes = {}

export default CustomSearch
