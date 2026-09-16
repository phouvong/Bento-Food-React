import React from 'react'
import { Stack, Box, Typography } from '@mui/material'

// Segmented control track — e.g. Regular Order | Repeat Order.
// `options`: [{ value, label }]. Controlled: `value` + `onChange(value)`.
// Equal-width segments filling the track (Figma: radius 8px, not a pill).
const SegmentedToggle = ({ options, value, onChange }) => {
    return (
        <Stack
            direction="row"
            sx={{
                flex: 1,
                minWidth: 0,
                borderRadius: '8px',
                backgroundColor: (theme) => theme.palette.neutral[200],
                overflowX: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
            }}
        >
            {options.map((option) => {
                const isActive = value === option.value
                return (
                    <Box
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        sx={{
                            flex: 1,
                            minWidth: 'fit-content',
                            textAlign: 'center',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            backgroundColor: isActive
                                ? 'primary.main'
                                : 'transparent',
                            transition: 'background-color 0.15s ease',
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: '14px',
                                fontWeight: 600,
                                lineHeight: 1.2,
                                letterSpacing: '-0.42px',
                                whiteSpace: 'nowrap',
                                color: isActive ? '#fff' : 'text.primary',
                            }}
                        >
                            {option.label}
                        </Typography>
                    </Box>
                )
            })}
        </Stack>
    )
}

export default SegmentedToggle
