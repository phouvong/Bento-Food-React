import { Box, IconButton, Stack, Typography } from '@mui/material'
import RemoveIcon from '@mui/icons-material/Remove'
import AddIcon from '@mui/icons-material/Add'

// Light-gray rounded square stepper buttons (not the old orange circles).
const stepperBtnSx = {
    width: 42,
    height: 38,
    borderRadius: '10px',
    backgroundColor: (theme) => theme.palette.neutral[200],
    color: (theme) => theme.palette.text.primary,
    '&:hover': {
        backgroundColor: (theme) => theme.palette.neutral[300],
    },
    '&.Mui-disabled': {
        backgroundColor: (theme) => theme.palette.neutral[200],
        opacity: 0.5,
    },
}

const IncrementDecrementManager = (props) => {
    const {
        decrementPrice,
        totalPrice,
        quantity,
        incrementPrice,
        // Only set by callers that can delete outright (the item is already
        // in the cart) — once quantity can't go any lower the minus button
        // becomes a delete action instead of just disabling.
        onDelete,
        disabled,
    } = props
    const showDelete = quantity <= 1 && typeof onDelete === 'function'
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
                onClick={showDelete ? onDelete : decrementPrice}
                aria-label={showDelete ? 'delete' : 'remove'}
                disabled={
                    disabled ||
                    (!showDelete && (totalPrice === 0 || quantity <= 1))
                }
                sx={stepperBtnSx}
            >
                {showDelete ? (
                    <Box
                        component="i"
                        className="fi fi-rr-trash"
                        sx={{
                            fontSize: '16px',
                            lineHeight: 1,
                            color: (theme) => theme.palette.error.main,
                        }}
                    />
                ) : (
                    <RemoveIcon sx={{ fontSize: '18px' }} />
                )}
            </IconButton>

            <Typography
                sx={{
                    minWidth: 30,
                    textAlign: 'center',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: (theme) => theme.palette.text.primary,
                }}
            >
                {quantity}
            </Typography>

            <IconButton
                onClick={incrementPrice}
                aria-label="add"
                disabled={disabled}
                sx={stepperBtnSx}
            >
                <AddIcon sx={{ fontSize: '18px' }} />
            </IconButton>
        </Stack>
    )
}

IncrementDecrementManager.propTypes = {}

export default IncrementDecrementManager
