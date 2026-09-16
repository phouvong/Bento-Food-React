import { useEffect, useMemo, useState } from 'react'
import {
    Box,
    Checkbox,
    Drawer,
    Popover,
    Radio,
    RadioGroup,
    Slider,
    Stack,
    Typography,
    alpha,
    useMediaQuery,
    useTheme,
} from '@mui/material'
import { debounce } from 'lodash'
import { useTranslation } from 'react-i18next'

const SORT_OPTIONS = [
    { value: 'a_z', label: 'Alphabetical (A-Z)' },
    { value: 'z_a', label: 'Alphabetical (Z-A)' },
    { value: 'price_high', label: 'Price: High to Low', priceOnly: true },
    { value: 'price_low', label: 'Price: Low to High', priceOnly: true },
]

const TYPE_OPTIONS = [
    { value: 'halal', label: 'Halal' },
    { value: 'veg', label: 'Veg' },
    { value: 'nonVeg', label: 'Non - Veg' },
]

const DISCOVER_OPTIONS = [
    { value: 'topRated', label: 'Top Rated' },
    { value: 'newArrival', label: 'New Arrival' },
    { value: 'popular', label: 'Popular' },
]

const RATING_OPTIONS = [
    { value: '5_plus', label: 'Only Rate 5' },
    { value: '4_plus', label: '4+ Rating' },
    { value: '3_plus', label: '3+ Rating' },
    { value: '2_plus', label: '2+ Rating' },
]

const CATEGORIES_INITIAL_SHOW = 5
const PRICE_RANGE_DEFAULT_MAX = 1000
const PRICE_CORRECT_DEBOUNCE_MS = 900

const INITIAL_STATE = {
    sortBy: '',
    selectedTypes: [],
    selectedOrderTypes: [],
    selectedDiscover: [],
    selectedRatings: [],
    selectedCategoryIds: [],
    selectedCuisineIds: [],
    priceMin: '',
    priceMax: '',
}

const stateFromFilter = (f = {}) => ({
    sortBy: f.sort_by ?? '',
    selectedTypes: f.type ? f.type.split(',').filter(Boolean) : [],
    selectedOrderTypes: f.order_type
        ? f.order_type.split(',').filter(Boolean)
        : [],
    selectedDiscover: f.discover ? f.discover.split(',').filter(Boolean) : [],
    selectedRatings: f.rating ? f.rating.split(',').filter(Boolean) : [],
    selectedCategoryIds: f.category_ids
        ? f.category_ids.split(',').filter(Boolean).map(Number)
        : [],
    selectedCuisineIds: f.cuisine_ids
        ? f.cuisine_ids.split(',').filter(Boolean).map(Number)
        : [],
    priceMin: f.price_min ?? '',
    priceMax: f.price_max ?? '',
})

const buildOutput = ({
    sortBy,
    selectedTypes,
    selectedOrderTypes,
    selectedDiscover,
    selectedRatings,
    selectedCategoryIds,
    selectedCuisineIds,
    priceMin,
    priceMax,
}) => {
    const out = {}
    if (sortBy) out.sort_by = sortBy
    if (selectedTypes.length) out.type = selectedTypes.join(',')
    if (selectedOrderTypes.length)
        out.order_type = selectedOrderTypes.join(',')
    if (selectedDiscover.length) out.discover = selectedDiscover.join(',')
    if (selectedRatings.length) out.rating = selectedRatings.join(',')
    if (selectedCategoryIds.length)
        out.category_ids = selectedCategoryIds.join(',')
    if (selectedCuisineIds.length)
        out.cuisine_ids = selectedCuisineIds.join(',')
    if (priceMin !== '' && priceMin !== undefined)
        out.price_min = Number(priceMin)
    if (priceMax !== '' && priceMax !== undefined)
        out.price_max = Number(priceMax)
    return out
}

const countSelected = ({
    sortBy,
    selectedTypes,
    selectedOrderTypes,
    selectedDiscover,
    selectedRatings,
    selectedCategoryIds,
    selectedCuisineIds,
    priceMin,
    priceMax,
}) =>
    [
        sortBy,
        selectedTypes.length ? 1 : 0,
        selectedOrderTypes.length ? 1 : 0,
        selectedDiscover.length ? 1 : 0,
        selectedRatings.length ? 1 : 0,
        selectedCategoryIds.length ? 1 : 0,
        selectedCuisineIds.length ? 1 : 0,
        priceMin || priceMax,
    ].filter(Boolean).length

const SectionLabel = ({ children }) => (
    <Typography
        sx={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'text.primary',
            letterSpacing: '-0.48px',
            lineHeight: 1.1,
            textTransform: 'capitalize',
            mb: '12px',
        }}
    >
        {children}
    </Typography>
)

const RowDivider = () => (
    <Box
        sx={{
            height: '2px',
            backgroundColor: (theme) => theme.palette.neutral[200],
        }}
    />
)

const checkboxSx = (theme) => ({
    p: 0,
    color: theme.palette.neutral[400],
    '&.Mui-checked': { color: theme.palette.primary.main },
})

const rowSx = { py: '6px', cursor: 'pointer' }

const PriceInput = ({ prefix, value, onChange, onBlur, theme }) => (
    <Stack
        direction="row"
        alignItems="center"
        sx={{
            flex: 1,
            height: '36px',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper,
            '&:focus-within': { borderColor: theme.palette.primary.main },
        }}
    >
        <Typography
            sx={{
                fontSize: '14px',
                color: theme.palette.text.secondary,
                whiteSpace: 'nowrap',
                lineHeight: 1,
                px: '10px',
                flexShrink: 0,
            }}
        >
            {prefix}
        </Typography>
        <Box
            component="input"
            type="number"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            sx={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                fontWeight: 500,
                color: theme.palette.text.primary,
                fontFamily: 'inherit',
                backgroundColor: 'transparent',
                px: '10px',
                '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                    display: 'none',
                },
            }}
        />
    </Stack>
)

const CheckboxListSection = ({
    label,
    items,
    selectedIds,
    toggleItem,
    t,
}) => {
    const theme = useTheme()
    const [expanded, setExpanded] = useState(false)
    if (!items || items.length === 0) return null

    const visible = expanded
        ? items
        : items.slice(0, CATEGORIES_INITIAL_SHOW)
    const hasMore = items.length > CATEGORIES_INITIAL_SHOW

    return (
        <>
            <Box sx={{ px: '12px', py: '16px' }}>
                <SectionLabel>{label}</SectionLabel>
                {visible.map((item) => (
                    <Stack
                        key={item.id}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={rowSx}
                        onClick={() => toggleItem(item.id)}
                    >
                        <Typography
                            sx={{
                                fontSize: '14px',
                                color: theme.palette.text.primary,
                                letterSpacing: '-0.42px',
                                textTransform: 'capitalize',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {item.name}
                        </Typography>
                        <Checkbox
                            checked={selectedIds.includes(item.id)}
                            size="small"
                            sx={checkboxSx(theme)}
                        />
                    </Stack>
                ))}
                {hasMore && (
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        gap="6px"
                        onClick={() => setExpanded((e) => !e)}
                        sx={{
                            mt: '4px',
                            py: '8px',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            '&:hover': {
                                backgroundColor: theme.palette.neutral[200],
                            },
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: theme.palette.info.main,
                                letterSpacing: '-0.42px',
                            }}
                        >
                            {expanded ? t('See Less') : t('See More')}
                        </Typography>
                        <i
                            className={
                                expanded
                                    ? 'fi fi-rr-angle-small-up'
                                    : 'fi fi-rr-angle-small-down'
                            }
                            style={{
                                fontSize: '16px',
                                lineHeight: 1,
                                display: 'flex',
                                color: theme.palette.info.main,
                            }}
                        />
                    </Stack>
                )}
            </Box>
            <RowDivider />
        </>
    )
}

const CategoriesSection = ({ categories, selectedCategoryIds, toggleCategory, t }) => (
    <CheckboxListSection
        label={t('Categories')}
        items={categories}
        selectedIds={selectedCategoryIds}
        toggleItem={toggleCategory}
        t={t}
    />
)

const CuisinesSection = ({ cuisines, selectedCuisineIds, toggleCuisine, t }) => (
    <CheckboxListSection
        label={t('Cuisines')}
        items={cuisines}
        selectedIds={selectedCuisineIds}
        toggleItem={toggleCuisine}
        t={t}
    />
)

const FilterContent = ({
    sortBy,
    setSortBy,
    selectedTypes,
    toggleType,
    selectedOrderTypes,
    toggleOrderType,
    selectedDiscover,
    toggleDiscover,
    selectedRatings,
    toggleRating,
    selectedCategoryIds,
    toggleCategory,
    selectedCuisineIds,
    toggleCuisine,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    showSortBy,
    sortOptions,
    showType,
    typeOptions,
    showOrderType,
    orderTypeOptions,
    orderTypeLabel,
    showDiscover,
    discoverOptions,
    discoverLabel,
    showRatings,
    ratingOptions,
    showCategories,
    showCuisines,
    showPriceRange,
    categories,
    cuisines,
    priceRangeMax,
    currencySymbol,
    selectedCount,
    handleReset,
    handleApply,
    onClose,
    t,
}) => {
    const theme = useTheme()

    const correctMaxDebounced = useMemo(
        () =>
            debounce((minNum, maxNum) => {
                if (minNum > maxNum) setPriceMax(String(minNum))
            }, PRICE_CORRECT_DEBOUNCE_MS),
        [setPriceMax]
    )
    const correctMinDebounced = useMemo(
        () =>
            debounce((minNum, maxNum) => {
                if (maxNum < minNum) setPriceMin(String(maxNum))
            }, PRICE_CORRECT_DEBOUNCE_MS),
        [setPriceMin]
    )
    useEffect(
        () => () => {
            correctMaxDebounced.cancel()
            correctMinDebounced.cancel()
        },
        [correctMaxDebounced, correctMinDebounced]
    )

    return (
        <Box
            sx={{
                width: { xs: '100%', sm: '360px' },
                display: 'flex',
                flexDirection: 'column',
                maxHeight: { xs: '90vh', sm: '80vh' },
                overflowX: 'hidden',
            }}
        >
            {/* Header */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ px: '20px', py: '16px' }}
            >
                <Typography
                    sx={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        letterSpacing: '-0.54px',
                    }}
                >
                    {t('Filter')}
                </Typography>
                <Box
                    onClick={onClose}
                    sx={{
                        width: 36,
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '9999px',
                        backgroundColor: theme.palette.neutral[200],
                        cursor: 'pointer',
                    }}
                >
                    <i
                        className="fi fi-rr-cross"
                        style={{
                            fontSize: '13px',
                            lineHeight: 1,
                            display: 'flex',
                            color: theme.palette.text.primary,
                        }}
                    />
                </Box>
            </Stack>

            <RowDivider />

            {/* Scrollable content */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    scrollbarGutter: 'stable',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'transparent transparent',
                    '&::-webkit-scrollbar': { width: 6 },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'transparent',
                        borderRadius: 999,
                        transition: 'background-color 0.2s ease',
                    },
                    '&:hover': {
                        scrollbarColor: `${alpha(
                            theme.palette.text.secondary,
                            0.35
                        )} transparent`,
                    },
                    '&:hover::-webkit-scrollbar-thumb': {
                        backgroundColor: alpha(
                            theme.palette.text.secondary,
                            0.35
                        ),
                    },
                }}
            >
                {/* Sort By */}
                {showSortBy && (
                    <>
                        <Box sx={{ px: '12px', py: '16px' }}>
                            <SectionLabel>{t('Sort By')}</SectionLabel>
                            <RadioGroup
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                {sortOptions
                                    .filter(
                                        (opt) =>
                                            showPriceRange || !opt.priceOnly
                                    )
                                    .map((opt) => (
                                        <Stack
                                            key={opt.value || 'default'}
                                            direction="row"
                                            alignItems="center"
                                            justifyContent="space-between"
                                            sx={rowSx}
                                            onClick={() => setSortBy(opt.value)}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: '14px',
                                                    color: theme.palette.text
                                                        .primary,
                                                    letterSpacing: '-0.42px',
                                                }}
                                            >
                                                {t(opt.label)}
                                            </Typography>
                                            <Radio
                                                value={opt.value}
                                                checked={sortBy === opt.value}
                                                size="small"
                                                sx={checkboxSx(theme)}
                                            />
                                        </Stack>
                                    ))}
                            </RadioGroup>
                        </Box>
                        <RowDivider />
                    </>
                )}

                {/* Type */}
                {showType && (
                    <>
                        <Box sx={{ px: '12px', py: '16px' }}>
                            <SectionLabel>{t('Type')}</SectionLabel>
                            {typeOptions.map((opt) => (
                                <Stack
                                    key={opt.value}
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    sx={rowSx}
                                    onClick={() => toggleType(opt.value)}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: '14px',
                                            color: theme.palette.text.primary,
                                            letterSpacing: '-0.42px',
                                        }}
                                    >
                                        {t(opt.label)}
                                    </Typography>
                                    <Checkbox
                                        checked={selectedTypes.includes(
                                            opt.value
                                        )}
                                        size="small"
                                        sx={checkboxSx(theme)}
                                    />
                                </Stack>
                            ))}
                        </Box>
                        <RowDivider />
                    </>
                )}

                {/* Order Type */}
                {showOrderType && orderTypeOptions.length > 0 && (
                    <>
                        <Box sx={{ px: '12px', py: '16px' }}>
                            <SectionLabel>{t(orderTypeLabel)}</SectionLabel>
                            {orderTypeOptions.map((opt) => (
                                <Stack
                                    key={opt.value}
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    sx={rowSx}
                                    onClick={() => toggleOrderType(opt.value)}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: '14px',
                                            color: theme.palette.text.primary,
                                            letterSpacing: '-0.42px',
                                        }}
                                    >
                                        {t(opt.label)}
                                    </Typography>
                                    <Checkbox
                                        checked={selectedOrderTypes.includes(
                                            opt.value
                                        )}
                                        size="small"
                                        sx={checkboxSx(theme)}
                                    />
                                </Stack>
                            ))}
                        </Box>
                        <RowDivider />
                    </>
                )}

                {/* Discover */}
                {showDiscover && discoverOptions.length > 0 && (
                    <>
                        <Box sx={{ px: '12px', py: '16px' }}>
                            <SectionLabel>{t(discoverLabel)}</SectionLabel>
                            {discoverOptions.map((opt) => (
                                <Stack
                                    key={opt.value}
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    sx={rowSx}
                                    onClick={() => toggleDiscover(opt.value)}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: '14px',
                                            color: theme.palette.text.primary,
                                            letterSpacing: '-0.42px',
                                        }}
                                    >
                                        {t(opt.label)}
                                    </Typography>
                                    <Checkbox
                                        checked={selectedDiscover.includes(
                                            opt.value
                                        )}
                                        size="small"
                                        sx={checkboxSx(theme)}
                                    />
                                </Stack>
                            ))}
                        </Box>
                        <RowDivider />
                    </>
                )}

                {/* Ratings */}
                {showRatings && (
                    <>
                        <Box sx={{ px: '12px', py: '16px' }}>
                            <SectionLabel>{t('Ratings')}</SectionLabel>
                            {ratingOptions.map((opt) => (
                                <Stack
                                    key={opt.value}
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    sx={rowSx}
                                    onClick={() => toggleRating(opt.value)}
                                >
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        gap="8px"
                                    >
                                        <i
                                            className="fi fi-rr-star"
                                            style={{
                                                fontSize: '14px',
                                                lineHeight: 1,
                                                display: 'flex',
                                                color: theme.palette.text
                                                    .secondary,
                                            }}
                                        />
                                        <Typography
                                            sx={{
                                                fontSize: '14px',
                                                color: theme.palette.text
                                                    .primary,
                                                letterSpacing: '-0.42px',
                                            }}
                                        >
                                            {t(opt.label)}
                                        </Typography>
                                    </Stack>
                                    <Checkbox
                                        checked={selectedRatings.includes(
                                            opt.value
                                        )}
                                        size="small"
                                        sx={checkboxSx(theme)}
                                    />
                                </Stack>
                            ))}
                        </Box>
                        <RowDivider />
                    </>
                )}

                {/* Categories — hide by passing showCategories={false} or categories=[] */}
                {showCategories && categories?.length > 0 && (
                    <CategoriesSection
                        categories={categories}
                        selectedCategoryIds={selectedCategoryIds}
                        toggleCategory={toggleCategory}
                        t={t}
                    />
                )}

                {/* Cuisines — hide by passing showCuisines={false} or cuisines=[] */}
                {showCuisines && cuisines?.length > 0 && (
                    <CuisinesSection
                        cuisines={cuisines}
                        selectedCuisineIds={selectedCuisineIds}
                        toggleCuisine={toggleCuisine}
                        t={t}
                    />
                )}

                {/* Price Range */}
                {showPriceRange && (
                    <Box sx={{ px: '12px', py: '16px' }}>
                        <SectionLabel>
                            {t('Price Range')} ({currencySymbol})
                        </SectionLabel>
                        <Stack
                            direction="row"
                            gap="10px"
                            alignItems="center"
                            sx={{ px: '4px' }}
                        >
                            <PriceInput
                                prefix={t('Min')}
                                value={priceMin}
                                onChange={(e) => {
                                    const val = e.target.value
                                    setPriceMin(val)
                                    const num = Number(val)
                                    if (val === '' || isNaN(num)) return
                                    const maxNum =
                                        priceMax !== ''
                                            ? Number(priceMax)
                                            : priceRangeMax
                                    correctMaxDebounced(num, maxNum)
                                }}
                                onBlur={() => {
                                    correctMaxDebounced.cancel()
                                    const num = Number(priceMin)
                                    if (priceMin === '' || isNaN(num)) return
                                    const maxNum =
                                        priceMax !== ''
                                            ? Number(priceMax)
                                            : priceRangeMax
                                    if (num > maxNum)
                                        setPriceMax(String(num))
                                }}
                                theme={theme}
                            />
                            <Typography
                                sx={{ color: theme.palette.text.secondary }}
                            >
                                -
                            </Typography>
                            <PriceInput
                                prefix={t('Max')}
                                value={priceMax}
                                onChange={(e) => {
                                    const val = e.target.value
                                    setPriceMax(val)
                                    const num = Number(val)
                                    if (val === '' || isNaN(num)) return
                                    const minNum =
                                        priceMin !== '' ? Number(priceMin) : 0
                                    correctMinDebounced(minNum, num)
                                }}
                                onBlur={() => {
                                    correctMinDebounced.cancel()
                                    const num = Number(priceMax)
                                    if (priceMax === '' || isNaN(num)) return
                                    const minNum =
                                        priceMin !== '' ? Number(priceMin) : 0
                                    if (num < minNum)
                                        setPriceMin(String(num))
                                }}
                                theme={theme}
                            />
                        </Stack>

                        <Box sx={{ px: '12px', mt: '20px' }}>
                            <Slider
                                value={[
                                    priceMin !== ''
                                        ? Math.min(
                                              Number(priceMin),
                                              priceRangeMax
                                          )
                                        : 0,
                                    priceMax !== ''
                                        ? Math.min(
                                              Number(priceMax),
                                              priceRangeMax
                                          )
                                        : priceRangeMax,
                                ]}
                                min={0}
                                max={priceRangeMax}
                                onChange={(_, newVal) => {
                                    setPriceMin(String(newVal[0]))
                                    setPriceMax(String(newVal[1]))
                                }}
                                disableSwap
                                sx={{
                                    color: theme.palette.text.primary,
                                    height: 4,
                                    '& .MuiSlider-thumb': {
                                        width: 20,
                                        height: 20,
                                        backgroundColor:
                                            theme.palette.background.paper,
                                        border: `2px solid ${theme.palette.text.primary}`,
                                        boxShadow:
                                            '0px 1px 4px rgba(0,0,0,0.15)',
                                        '&:hover, &.Mui-focusVisible': {
                                            boxShadow:
                                                '0px 2px 8px rgba(0,0,0,0.2)',
                                        },
                                    },
                                    '& .MuiSlider-track': { border: 'none' },
                                    '& .MuiSlider-rail': {
                                        backgroundColor:
                                            theme.palette.neutral[200],
                                        opacity: 1,
                                    },
                                }}
                            />
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                sx={{ mt: '2px' }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: '12px',
                                        color: theme.palette.text.secondary,
                                    }}
                                >
                                    {currencySymbol}0
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: '12px',
                                        color: theme.palette.text.secondary,
                                    }}
                                >
                                    {currencySymbol}
                                    {priceRangeMax.toLocaleString()}
                                </Typography>
                            </Stack>
                        </Box>
                    </Box>
                )}
            </Box>

            <RowDivider />

            {/* Footer */}
            <Stack direction="row" gap="12px" sx={{ px: '20px', py: '16px' }}>
                <Box
                    onClick={handleReset}
                    sx={{
                        flex: 1,
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        backgroundColor: theme.palette.neutral[200],
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 },
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            letterSpacing: '-0.42px',
                        }}
                    >
                        {t('Reset')}
                    </Typography>
                </Box>
                <Box
                    onClick={handleApply}
                    sx={{
                        flex: 1,
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        backgroundColor: theme.palette.primary.main,
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.9 },
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: theme.palette.primary.contrastText,
                            letterSpacing: '-0.42px',
                        }}
                    >
                        {t('Apply')}
                        {selectedCount > 0 ? ` (${selectedCount})` : ''}
                    </Typography>
                </Box>
            </Stack>
        </Box>
    )
}

const FilterPanel = ({
    anchorEl,
    onClose,
    onApply,
    filterValue = {},
    anchorHorizontal = 'left',
    showSortBy = true,
    sortOptions = SORT_OPTIONS,
    showType = true,
    typeOptions = TYPE_OPTIONS,
    showOrderType = false,
    orderTypeOptions = [],
    orderTypeLabel = 'Order Type',
    showDiscover = true,
    discoverOptions = DISCOVER_OPTIONS,
    discoverLabel = 'Discover',
    hiddenDiscover = [],
    showRatings = true,
    ratingOptions = RATING_OPTIONS,
    showCategories = true,
    showCuisines = true,
    showPriceRange = true,
    categories = [],
    cuisines = [],
    priceRangeMax = PRICE_RANGE_DEFAULT_MAX,
    currencySymbol = '$',
}) => {
    const { t } = useTranslation()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const open = Boolean(anchorEl)
    // Popover's horizontal origin is physical, but RTL mirrors the layout — the
    // trigger that sits at the row's end moves to the physical left there.
    const alignedHorizontal =
        theme.direction === 'rtl'
            ? anchorHorizontal === 'right'
                ? 'left'
                : 'right'
            : anchorHorizontal

    const [sortBy, setSortBy] = useState(INITIAL_STATE.sortBy)
    const [selectedTypes, setSelectedTypes] = useState(
        INITIAL_STATE.selectedTypes
    )
    const [selectedOrderTypes, setSelectedOrderTypes] = useState(
        INITIAL_STATE.selectedOrderTypes
    )
    const [selectedDiscover, setSelectedDiscover] = useState(
        INITIAL_STATE.selectedDiscover
    )
    const [selectedRatings, setSelectedRatings] = useState(
        INITIAL_STATE.selectedRatings
    )
    const [selectedCategoryIds, setSelectedCategoryIds] = useState(
        INITIAL_STATE.selectedCategoryIds
    )
    const [selectedCuisineIds, setSelectedCuisineIds] = useState(
        INITIAL_STATE.selectedCuisineIds
    )
    const [priceMin, setPriceMin] = useState(INITIAL_STATE.priceMin)
    const [priceMax, setPriceMax] = useState(INITIAL_STATE.priceMax)

    // Re-sync local state from the caller's last-applied value whenever
    // the panel opens, so it never fights an in-progress edit while closed.
    useEffect(() => {
        if (!open) return
        const s = stateFromFilter(filterValue)
        setSortBy(s.sortBy)
        setSelectedTypes(s.selectedTypes)
        setSelectedOrderTypes(s.selectedOrderTypes)
        setSelectedDiscover(s.selectedDiscover)
        setSelectedRatings(s.selectedRatings)
        setSelectedCategoryIds(s.selectedCategoryIds)
        setSelectedCuisineIds(s.selectedCuisineIds)
        setPriceMin(s.priceMin)
        setPriceMax(s.priceMax)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    const currentState = {
        sortBy,
        selectedTypes,
        selectedOrderTypes,
        selectedDiscover,
        selectedRatings,
        selectedCategoryIds,
        selectedCuisineIds,
        priceMin,
        priceMax,
    }

    // halal toggles independently; veg / nonVeg are mutually exclusive
    const toggleType = (val) => {
        setSelectedTypes((prev) => {
            if (val === 'halal') {
                return prev.includes('halal')
                    ? prev.filter((v) => v !== 'halal')
                    : [...prev, 'halal']
            }
            const withoutMeat = prev.filter(
                (v) => v !== 'veg' && v !== 'nonVeg'
            )
            return prev.includes(val) ? withoutMeat : [...withoutMeat, val]
        })
    }

    const toggleOrderType = (val) =>
        setSelectedOrderTypes((prev) =>
            prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
        )

    const toggleDiscover = (val) =>
        setSelectedDiscover((prev) =>
            prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
        )

    const toggleRating = (val) =>
        setSelectedRatings((prev) =>
            prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
        )

    const toggleCategory = (id) =>
        setSelectedCategoryIds((prev) =>
            prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
        )

    const toggleCuisine = (id) =>
        setSelectedCuisineIds((prev) =>
            prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
        )

    const handleReset = () => {
        setSortBy(INITIAL_STATE.sortBy)
        setSelectedTypes(INITIAL_STATE.selectedTypes)
        setSelectedOrderTypes(INITIAL_STATE.selectedOrderTypes)
        setSelectedDiscover(INITIAL_STATE.selectedDiscover)
        setSelectedRatings(INITIAL_STATE.selectedRatings)
        setSelectedCategoryIds(INITIAL_STATE.selectedCategoryIds)
        setSelectedCuisineIds(INITIAL_STATE.selectedCuisineIds)
        setPriceMin(INITIAL_STATE.priceMin)
        setPriceMax(INITIAL_STATE.priceMax)
        onApply?.({})
        onClose()
    }

    const handleApply = () => {
        onApply?.(buildOutput(currentState))
        onClose()
    }

    const selectedCount = countSelected(currentState)

    const contentProps = {
        sortBy,
        setSortBy,
        selectedTypes,
        toggleType,
        selectedOrderTypes,
        toggleOrderType,
        selectedDiscover,
        toggleDiscover,
        selectedRatings,
        toggleRating,
        selectedCategoryIds,
        toggleCategory,
        selectedCuisineIds,
        toggleCuisine,
        priceMin,
        setPriceMin,
        priceMax,
        setPriceMax,
        showSortBy,
        sortOptions,
        showType,
        typeOptions,
        showOrderType,
        orderTypeOptions,
        orderTypeLabel,
        showDiscover,
        discoverOptions: discoverOptions.filter(
            (opt) => !hiddenDiscover.includes(opt.value)
        ),
        discoverLabel,
        showRatings,
        ratingOptions,
        showCategories,
        showCuisines,
        showPriceRange,
        categories,
        cuisines,
        priceRangeMax,
        currencySymbol,
        selectedCount,
        handleReset,
        handleApply,
        onClose,
        t,
    }

    if (isMobile) {
        return (
            <Drawer
                anchor="bottom"
                open={open}
                onClose={onClose}
                sx={{ zIndex: (theme) => theme.zIndex.modal }}
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: '20px',
                        borderTopRightRadius: '20px',
                        overflow: 'hidden',
                    },
                }}
            >
                <FilterContent {...contentProps} />
            </Drawer>
        )
    }

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            disableScrollLock
            anchorOrigin={{ vertical: 'bottom', horizontal: alignedHorizontal }}
            transformOrigin={{ vertical: 'top', horizontal: alignedHorizontal }}
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '16px',
                        boxShadow: '0px 8px 32px rgba(0,0,0,0.12)',
                        mt: '8px',
                        overflow: 'hidden',
                    },
                },
            }}
        >
            <FilterContent {...contentProps} />
        </Popover>
    )
}

export default FilterPanel
