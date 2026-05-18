import { Stack, Typography } from '@mui/material'
import { CustomFab } from '@/styled-components/CustomStyles.style'
import RemoveIcon from '@mui/icons-material/Remove'
import AddIcon from '@mui/icons-material/Add'

const IncrementDecrementManager = (props) => {
    const { decrementPrice, totalPrice, quantity, incrementPrice } = props
    return (
        <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent={{ xs: 'flex-start', md: 'flex-start' }}
        >
            <CustomFab
                onClick={decrementPrice}
                color="primary"
                aria-label="remove"
                disabled={totalPrice === 0 || quantity <= 1}
                sx={{ minHeight: 32, minWidth: 32 }}
            >
                <RemoveIcon
                    size="small"
                    sx={{
                        color: (theme) => theme.palette.neutral[100],
                        width: '16px',
                    }}
                />
            </CustomFab>
            <Typography variant="h5" sx={{ minWidth: 28, textAlign: 'center' }}>
                {quantity}
            </Typography>
            <CustomFab
                color="primary"
                aria-label="add"
                onClick={incrementPrice}
                sx={{ minHeight: 32, minWidth: 32 }}
            >
                <AddIcon
                    size="small"
                    sx={{
                        color: (theme) => theme.palette.neutral[100],
                        width: '16px',
                    }}
                />
            </CustomFab>
        </Stack>
    )
}

IncrementDecrementManager.propTypes = {}

export default IncrementDecrementManager
