import { Box, useTheme } from '@mui/system'
import React from 'react'
import { TitleTopSection } from './CustomStylesDeliveryman'
import { CustomBoxFullWidth } from '@/styled-components/CustomStyles.style'
import { Typography } from '@mui/material'
import { t } from 'i18next'
import { alpha } from '@mui/material'
const DeliverymanFormWrapper = ({ title, component }) => {
    const theme = useTheme()
    return (
        <>
            <CustomBoxFullWidth
                sx={{
                    backgroundColor: (theme) =>
                        alpha(theme.palette.neutral[200], 0.4),
                    mb: '30px',
                    pb: '30px',
                    pt: '20px',
                    borderRadius: '10px',
                }}
            >
                <TitleTopSection
                    sx={{
                        borderBottom: `1px solid ${alpha(
                            theme.palette.neutral[400],
                            0.1
                        )}`,
                        px: '20px',
                        pb: '11px',
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: '500',
                            color: (theme) => theme.palette.neutral[1000],
                        }}
                    >
                        {t(title)}
                    </Typography>
                </TitleTopSection>
                <Box sx={{ mt: '20px', mx: '20px' }}>{component}</Box>
            </CustomBoxFullWidth>
        </>
    )
}

export default DeliverymanFormWrapper
