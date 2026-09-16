import React from 'react'
import { Stack, Typography } from '@mui/material'
import { CustomPaperBigCard } from '@/styled-components/CustomStyles.style'

// Shared card shell for the redesigned checkout sections — bold title (+
// optional gray subtitle) on the left, an optional control on the right,
// matching baseline. See CHECKOUT_REDESIGN_PLAN.md §5 "Design system".
const CheckoutSectionCard = ({ title, subtitle, rightSlot, children, ...rest }) => {
    return (
        <CustomPaperBigCard padding="16px" {...rest}>
            <Stack spacing={title || subtitle ? '16px' : 0}>
                {(title || rightSlot) && (
                    <Stack
                        direction="row"
                        alignItems="flex-start"
                        justifyContent="space-between"
                        gap="12px"
                    >
                        <Stack spacing="4px">
                            {title && (
                                <Typography
                                    sx={{
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        color: 'text.primary',
                                    }}
                                >
                                    {title}
                                </Typography>
                            )}
                            {subtitle && (
                                <Typography
                                    sx={{
                                        fontSize: '13px',
                                        color: 'text.secondary',
                                    }}
                                >
                                    {subtitle}
                                </Typography>
                            )}
                        </Stack>
                        {rightSlot}
                    </Stack>
                )}
                {children}
            </Stack>
        </CustomPaperBigCard>
    )
}

export default CheckoutSectionCard
