import React from 'react'
import { Typography, Stack, styled, useMediaQuery } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import Router from 'next/router'

// Figma node 261:38673 — value + icon on one row, label below, 16px gap
// between the two and 16px padding all round.
const CardRoot = styled(Stack)(({ theme }) => ({
    cursor: 'pointer',
    width: '100%',
    height: '100%',
    padding: '16px',
    borderRadius: '16px',
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0px 1px 4px 0px rgba(0,0,0,0.05)',
    [theme.breakpoints.down('sm')]: {
        padding: '12px',
    },
}))

const ProfileStatistics = ({ value, title, icon: Icon, pathname }) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const isXs = useMediaQuery(theme.breakpoints.down('sm'))
    const handleRoute = (value) => {
        Router.push(
            {
                pathname: '/info',
                query: { page: value },
            },
            undefined,
            { shallow: true }
        )
    }
    return (
        <CardRoot onClick={() => handleRoute(pathname)}>
            <CustomStackFullWidth gap={{ xs: '10px', md: '16px' }}>
                <Stack
                    width="100%"
                    justifyContent="space-between"
                    alignItems="center"
                    direction="row"
                    gap="8px"
                >
                    <Typography
                        sx={{
                            fontSize: { xs: '18px', md: '24px' },
                            fontWeight: 700,
                            lineHeight: 1.1,
                            letterSpacing: '-1.2px',
                        }}
                        color={theme.palette.text.primary}
                    >
                        {value}
                    </Typography>
                    <Icon size={isXs ? 26 : 36} />
                </Stack>
                <Typography
                    sx={{
                        fontSize: { xs: '13px', md: '16px' },
                        fontWeight: 400,
                        textTransform: 'capitalize',
                        lineHeight: 1.2,
                        letterSpacing: '-0.48px',
                    }}
                    color={theme.palette.text.secondary}
                >
                    {t(title)}
                </Typography>
            </CustomStackFullWidth>
        </CardRoot>
    )
}
export default ProfileStatistics
