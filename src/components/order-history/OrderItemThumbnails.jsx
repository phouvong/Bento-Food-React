import React from 'react'
import { Box, Stack, Typography } from '@mui/material'
import CustomImageContainer from '@/components/CustomImageContainer'

const THUMB_SIZE = 36

// Overlapping circular item thumbnails + a "+N" overflow bubble (Figma node
// 261:39656). Renders nothing when there's no item data yet — the order-list
// API doesn't return item images/names today, only a count.
const OrderItemThumbnails = ({ items = [], maxVisible = 2 }) => {
    if (!items?.length) return null

    const visible = items.slice(0, maxVisible)
    const overflow = items.length - visible.length

    return (
        <Stack direction="row" alignItems="center">
            {visible.map((item, index) => (
                <Box
                    key={item?.id ?? index}
                    sx={{
                        width: THUMB_SIZE,
                        height: THUMB_SIZE,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flexShrink: 0,
                        position: 'relative',
                        border: (theme) =>
                            `2px solid ${theme.palette.background.paper}`,
                        marginInlineStart: index === 0 ? 0 : '-8px',
                        zIndex: visible.length - index,
                    }}
                >
                    <CustomImageContainer
                        src={item?.image}
                        alt={item?.name}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                    />
                </Box>
            ))}
            {overflow > 0 && (
                <Box
                    sx={{
                        width: THUMB_SIZE,
                        height: THUMB_SIZE,
                        borderRadius: '50%',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginInlineStart: '-8px',
                        backgroundColor: (theme) => theme.palette.neutral[300],
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: (theme) => theme.palette.text.secondary,
                        }}
                    >
                        +{overflow}
                    </Typography>
                </Box>
            )}
        </Stack>
    )
}

export default OrderItemThumbnails
