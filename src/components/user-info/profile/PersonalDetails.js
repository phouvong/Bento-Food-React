import React from 'react'
import { CustomStackFullWidth } from '../../../styled-components/CustomStyles.style'
import { Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// Figma node 261:38739 — name/phone/email as flat-icon pill chips instead of
// label:value pairs. Wraps on narrow screens; parent (ProfilePage's
// CustomPaperBigCard) already supplies the outer card + padding, so this only
// owns the pill row itself.
const InfoPill = ({ icon, children }) => {
    const theme = useTheme()
    if (!children) return null
    return (
        <Stack
            direction="row"
            alignItems="center"
            gap="8px"
            sx={{
                height: '40px',
                padding: '0 12px',
                borderRadius: '8px',
                backgroundColor: theme.palette.neutral[1800],
            }}
        >
            <i
                className={icon}
                style={{
                    fontSize: '16px',
                    lineHeight: 1,
                    color: theme.palette.text.primary,
                }}
            />
            <Typography
                sx={{
                    fontSize: '14px',
                    fontWeight: 500,
                    letterSpacing: '-0.42px',
                    color: theme.palette.text.primary,
                    whiteSpace: 'nowrap',
                }}
            >
                {children}
            </Typography>
        </Stack>
    )
}

const PersonalDetails = ({ data }) => {
    const fullName = [data?.data?.f_name, data?.data?.l_name]
        .filter(Boolean)
        .join(' ')

    return (
        <CustomStackFullWidth>
            <Stack direction="row" flexWrap="wrap" gap="12px">
                <InfoPill icon="fi fi-rr-circle-user">{fullName}</InfoPill>
                <InfoPill icon="fi fi-rr-phone-call">
                    {data?.data?.phone}
                </InfoPill>
                <InfoPill icon="fi fi-rr-envelope">
                    {data?.data?.email}
                </InfoPill>
            </Stack>
        </CustomStackFullWidth>
    )
}

export default PersonalDetails
