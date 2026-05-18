import React from 'react'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CustomPageTitle from '../CustomPageTitle'
import CustomSearch from '../custom-search/CustomSearch'
import { useTranslation } from 'react-i18next'
import { Stack } from '@mui/material'
import { useTheme } from '@mui/styles'

const PageSearchWithTitle = ({ title, handleSearchResult, label, action }) => {
    const { t } = useTranslation()
    const theme = useTheme()

    return (
        <CustomStackFullWidth
            justifyContent="space-between"
            alignItems="center"
            spacing={2.5}
            direction={{ xs: 'column', sm: 'row' }}
        >
            {title && <CustomPageTitle title={title} textAlign="center" />}
            <Stack
                direction="row"
                alignItems="stretch"
                spacing={1}
                width="100%"
                maxWidth={title ? '520px' : '100%'}
            >
                <Stack flex="1 1 auto">
                    <CustomSearch
                        handleSearchResult={handleSearchResult}
                        label={t(label)}
                        backgroundColor={theme.palette.neutral[200]}
                        borderRadius=".5rem"
                    />
                </Stack>
                {action}
            </Stack>
        </CustomStackFullWidth>
    )
}

export default PageSearchWithTitle
