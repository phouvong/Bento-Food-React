import { Stack, useTheme } from '@mui/system'
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
                    borderRadius: '.625rem',
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: theme.palette.background.paper,
                    boxShadow:
                        '0px 8px 15px rgba(28, 30, 32, 0.03), 0px 0px 2px rgba(28, 30, 32, 0.08)',
                }}
            >
                <TitleTopSection>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: '500',
                            color: theme.palette.neutral[1000],
                        }}
                    >
                        {t(title)}
                    </Typography>
                </TitleTopSection>

                <Stack mt={2}>{component}</Stack>
            </CustomBoxFullWidth>
        </>
    )
}

export default DeliverymanFormWrapper
