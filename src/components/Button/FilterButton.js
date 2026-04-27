import React from 'react'
import { Button, Typography, Box, Stack } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { t } from 'i18next'
import FilterAltIcon from '@mui/icons-material/FilterAlt'

const FilterButton = ({ handleClick, activeFilters, forSearch, homePage, height,padding }) => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    return (
        <Button
            variant="outlined"
            sx={{
                padding: {
                    xs: forSearch ? '5px 30px' : '4px 4px',
                    sm: '4px 8px',
                    md: padding || '5px 8px',
                },
                borderRadius: homePage ? '15px' : "6px",
                color: (theme) => theme.palette.primary.main,
                borderColor: (theme) => theme.palette.primary.main,
                minWidth: '33px',
                height: height || '100%',
                '&:hover': {
                    backgroundColor: (theme) => theme.palette.primary.main,
                    color: (theme) => theme.palette.neutral[100],
                    borderColor: (theme) => theme.palette.primary.main,
                    '& .MuiSvgIcon-root': {
                        color: (theme) => theme.palette.neutral[100],
                    },
                    '& .MuiTypography-root': {
                        color: (theme) => theme.palette.neutral[100],
                    },
                },

            }}
            onClick={handleClick}
        >
            <Stack
                direction="row"
                alignItems="center"
                spacing={0.3}
                paddingX={{ xs: '0.35rem', sm: '.5rem' }}
            >
                {activeFilters?.length > 0 && (
                    <Box
                        sx={{
                            backgroundColor: (theme) =>
                                theme.palette.primary.main,
                            color: (theme) => theme.palette.neutral[100],
                            borderRadius: '50%',
                            fontSize: '11px',
                            width: { xs: '16px', sm: '19px' },
                            height: { xs: '16px', sm: '19px' },
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: { xs: '3px', sm: '5px' },
                            marginRight: { xs: '3px', sm: '5px' },
                        }}
                    >
                        {activeFilters?.length}
                    </Box>
                )}
                <FilterAltIcon
                    style={{
                        width: '13px',
                        height: '13px',
                    }}
                    sx={{ color: theme.palette.primary.main }}
                />

                {!isSmall && (
                    <Typography
                        fontSize="12px"
                        fontWeight="500"
                        color={theme.palette.primary.main}
                    >
                        {t('Filter')}
                    </Typography>
                )}
            </Stack>
        </Button>
    )
}

export default FilterButton
