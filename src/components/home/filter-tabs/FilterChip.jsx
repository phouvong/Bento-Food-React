import { Box, Stack, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { t } from 'i18next'
import { FilterIcon, CloseIcon, FilterIconMobile } from './icons'

export const Chip = styled(Stack, {
    shouldForwardProp: (prop) => prop !== 'active',
})(({ theme, active }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    height: '36px',
    padding: '8px 16px',
    borderRadius: '9999px',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[3],
    cursor: 'pointer',
    userSelect: 'none',
    flexShrink: 0,
    color: active ? theme.palette.primary.main : theme.palette.text.primary,
    transition: 'color 0.15s ease',
}))

export const ChipIcon = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'active',
})(({ theme, active }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
}))

export const ChipLabel = styled(Typography, {
    shouldForwardProp: (prop) => prop !== 'fontSize',
})(({ fontSize }) => ({
    fontSize: fontSize || '14px',
    fontWeight: 700,
    letterSpacing: '-0.42px',
    lineHeight: 1.1,
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
    color: 'inherit',
}))

// Same pill used as the "Filter" trigger across FilterTabs (home/free-delivery
// etc.) — reused wherever a page needs just the trigger without the rest of
// the pill row (e.g. cuisine details).
const FilterChip = ({ fontSize, active, count, onOpen, onReset }) => (
    <Chip active={active} onClick={onOpen}>
        <ChipIcon active={active}>
            <Box sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
                <FilterIcon size={16} />
            </Box>
            <Box sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
                <FilterIconMobile size={16} />
            </Box>
        </ChipIcon>
        <ChipLabel fontSize={fontSize}>
            {t('Filter')}
            {active ? ` (${count})` : ''}
        </ChipLabel>
        {active && (
            <ChipIcon
                active={false}
                onClick={onReset}
                sx={{ cursor: 'pointer' }}
            >
                <CloseIcon size={10} />
            </ChipIcon>
        )}
    </Chip>
)

export default FilterChip
