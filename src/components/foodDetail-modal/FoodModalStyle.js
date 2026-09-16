import { styled } from '@mui/material/styles'
import { Box, Stack } from '@mui/material'

// Shared styling for the modal's footer CTAs (Add to cart / Update to cart /
// Order Now) so every variant renders at the same 44px height.
export const cartButtonSx = {
    borderRadius: '10px',
    height: { xs: 40, sm: 44 },
    boxShadow: 'none',
    textTransform: 'none',
    fontSize: { xs: '12px', sm: '15px' },
    px: { xs: 0.5, sm: 2 },
    minWidth: 0,
    fontWeight: 700,
    color: (theme) => theme.palette.whiteContainer.main,
    '&:hover': { boxShadow: 'none' },
}

// Same button, but for while a request is in flight. `disabled` blocks a
// double submit, but MUI's default disabled state swaps in a flat grey
// background — that's what made the spinner unreadable. This keeps the
// button's normal primary colour and just dims it slightly instead.
export const cartButtonLoadingSx = {
    ...cartButtonSx,
    '&.Mui-disabled': {
        backgroundColor: (theme) => theme.palette.primary.main,
        color: (theme) => theme.palette.whiteContainer.main,
        opacity: 0.75,
    },
}

// Shared styling for variation radios/checkboxes. Both controls use the flat
// icons below instead of MUI's filled SVGs, so the root only has to supply the
// hit area (MUI puts .Mui-disabled on the root, not on the icon element).
// Out-of-stock controls stay at full visibility on purpose — `disabled`
// already blocks clicks; only the neutral fill hints the state.
export const variationControlSx = {
    padding: '4px',
    '&:hover': { backgroundColor: 'transparent' },
    '&.Mui-disabled .flat-control': {
        borderColor: (theme) => theme.palette.neutral[400],
        backgroundColor: (theme) => theme.palette.neutral[200],
    },
}

// Outline box shared by the flat checkbox (16px) and radio (20px); `checked`
// fills it with the primary colour so the mark inside can stay plain white.
const flatControlSx = (shape, checked, size) => ({
    width: size,
    height: size,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: shape === 'circle' ? '50%' : '4px',
    border: '1.5px solid',
    borderColor: (theme) =>
        checked ? theme.palette.primary.main : theme.palette.neutral[400],
    backgroundColor: (theme) =>
        checked ? theme.palette.primary.main : 'transparent',
})

export const FlatCheckboxIcon = ({ checked }) => (
    <Box className="flat-control" sx={flatControlSx('square', checked, 16)}>
        {checked && (
            <Box
                component="svg"
                viewBox="0 0 12 10"
                sx={{ width: 9, height: 7.5, display: 'block' }}
            >
                <path
                    d="M1 5.2 4.2 8.4 11 1.6"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Box>
        )}
    </Box>
)

export const FlatRadioIcon = ({ checked }) => (
    <Box className="flat-control" sx={flatControlSx('circle', checked, 20)}>
        {checked && (
            <Box
                sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                }}
            />
        )}
    </Box>
)

// Muted full-width prompt shown in place of the whole cart bar while a
// required variation is still unselected. It stays enabled — clicking it
// scrolls the modal to the group that still needs an answer — so the muted
// look comes from the base colours rather than from .Mui-disabled.
export const requiredOptionButtonSx = {
    ...cartButtonSx,
    backgroundColor: (theme) => theme.palette.neutral[200],
    color: (theme) => theme.palette.neutral[500],
    '&:hover': {
        backgroundColor: (theme) => theme.palette.neutral[300],
        boxShadow: 'none',
    },
}

export const CustomStackForFoodModal = styled(Stack)(({ theme, padding }) => ({
    padding: padding ? padding : '18px',
    position: 'absolute',
    bottom: '0',
    borderRadius: '0 0 8px 8px',
    background: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgb(18 18 18 / 94%) 100%)`,
}))
