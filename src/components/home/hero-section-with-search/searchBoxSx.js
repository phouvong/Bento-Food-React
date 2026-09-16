// Shared skin for SearchBox wherever it sits in a navbar-style bar (the
// desktop/mobile navbar rows and the search page's mobile header) so the
// input reads identically across them.
export const searchBoxSx = {
    minWidth: 0,
    display: 'flex',
    '& > *': { width: '100%', minWidth: 0 },
    '& form': { width: '100%' },
    '& form > div': {
        height: '40px',
        borderRadius: '8px',
        paddingInline: '12px',
        gap: '8px',
        backgroundColor: (th) => `${th.palette.neutral[200]} !important`,
        border: (th) => `1px solid ${th.palette.divider} !important`,
        boxShadow: 'none !important',
    },
    '& form > div:hover, & form > div:focus-within': {
        borderColor: (th) => `${th.palette.divider} !important`,
        boxShadow: 'none !important',
    },
    '& .MuiInputBase-root': {
        width: '100%',
        height: '100%',
        gap: '8px',
        padding: 0,
        background: 'transparent !important',
        border: 'none !important',
    },
    '& .MuiInputBase-input': {
        padding: '0 !important',
        height: 'auto !important',
        fontSize: '14px !important',
        color: (th) => th.palette.text.primary,
    },
    '& .MuiInputBase-input::placeholder': {
        color: (th) => th.palette.text.secondary,
        opacity: 1,
        fontSize: '14px',
    },
    '& .MuiInputAdornment-root': { margin: '0 !important', height: 'auto' },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
        fontSize: '16px',
        color: (th) => th.palette.text.secondary,
    },
    '& .MuiInputAdornment-positionEnd .MuiIconButton-root': {
        width: 24,
        height: 24,
        padding: 0,
    },
}
