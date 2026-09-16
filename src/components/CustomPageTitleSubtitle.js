import React from 'react'
import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

// hideTitle accepts a plain boolean or an MUI breakpoint object of booleans
// (e.g. { xs: true, md: false }) to hide just the title on some screen sizes.
const toTitleDisplay = (hideTitle) =>
    typeof hideTitle === 'object' && hideTitle !== null
        ? Object.fromEntries(
              Object.entries(hideTitle).map(([bp, hidden]) => [
                  bp,
                  hidden ? 'none' : 'block',
              ])
          )
        : hideTitle
        ? 'none'
        : 'block'

const CustomPageTitleSubtitle = ({
    title,
    subtitle,
    align = 'left',
    mb = { xs: 1.5, md: 3 },
    hideTitle = false,
}) => {
    const { t } = useTranslation()

    return (
        <Box
            sx={{
                mb,
                textAlign: align,
            }}
        >
            {title && (
                <Typography
                    component="h1"
                    sx={{
                        display: toTitleDisplay(hideTitle),
                        fontSize: { xs: '20px', md: '26px' },
                        fontWeight: { xs: 700, md: 800 },
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                        color: (theme) => theme.palette.text.primary,
                    }}
                >
                    {t(title)}
                </Typography>
            )}
            {subtitle && (
                <Typography
                    sx={{
                        mt: 0.5,
                        fontSize: { xs: '13px', md: '14px' },
                        lineHeight: 1.5,
                        color: (theme) => theme.palette.text.secondary,
                    }}
                >
                    {t(subtitle)}
                </Typography>
            )}
        </Box>
    )
}

export default CustomPageTitleSubtitle
