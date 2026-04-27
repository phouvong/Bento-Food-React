import CustomSlider from '../../custom-slider/CustomSlider'
import { alpha, useTheme } from '@mui/material/styles'
import { Box, Button, Checkbox, Divider, Radio, Stack } from '@mui/material'
import Typography from '@mui/material/Typography'
import { t } from 'i18next'
import { Fragment, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { WrapperForSideDrawerFilter } from '@/styled-components/CustomStyles.style'
import { useGetCuisines } from '@/hooks/react-query/cuisines/useGetCuisines'
import { setCuisines } from '@/redux/slices/storedData'

const RestaurantFilterCard = (props) => {
    const theme = useTheme()
    const router = useRouter()
    const dispatch = useDispatch()
    const {
        handleReset,
        highestPrice,
        checkboxData,
        setCheckedFilterKey,
        rowWise,
        foodOrRestaurant,
        handlePrice,
        handleDropClose,
        priceAndRating,
        singleSelect,
        only_food,
        setFilterByData,
        hideCuisines,
        homeRestaurant,
    } = props
    const { global } = useSelector((state) => state.globalSettings)
    const { cuisines } = useSelector((state) => state.storedData)
    const allData = Array.isArray(checkboxData) ? checkboxData : []
    const itemData =
        global?.toggle_veg_non_veg === false
            ? allData?.length > 2
                ? allData?.slice(2)
                : allData
            : allData
    const isPopularFoodsPage = router?.pathname === '/popular-foods'

    const normalizeValue = (value = '') =>
        value
            .toString()
            .replace(/[_\s-]/g, '')
            .toLowerCase()

    const normalizedMap = itemData.reduce((acc, item) => {
        const key = normalizeValue(item?.value || item?.name)
        if (key && !acc[key]) acc[key] = item
        return acc
    }, {})
    const usedIds = new Set()
    const pickItem = (...candidates) => {
        const match = candidates
            ?.map((candidate) => normalizedMap?.[normalizeValue(candidate)])
            ?.find((item) => item && !usedIds.has(item?.id))
        if (match) usedIds.add(match.id)
        return match || null
    }
    const buildRows = (definitions = []) =>
        definitions.map((definition) => ({
            key: definition.key,
            label: t(definition.label),
            value: definition.candidates?.[0] || definition.key,
            item: pickItem(...definition.candidates),
        }))

    const sortingRows = buildRows([
        { key: 'default', label: 'Default', candidates: ['default'] },
        {
            key: 'fast_delivery',
            label: 'Fast Delivery',
            candidates: ['fast_delivery', 'fast delivery', 'fastdelivery'],
        },
        { key: 'a_to_z', label: 'A to Z', candidates: ['a_to_z', 'atoz'] },
        { key: 'z_to_a', label: 'Z to A', candidates: ['z_to_a', 'ztoa'] },
    ])
    const vegItem = pickItem('veg')
    const nonVegItem = pickItem('non_veg', 'nonveg', 'non veg')
    const orderTypeRows = buildRows([
        // { key: 'all', label: 'All', candidates: ['all'] },
        { key: 'delivery', label: 'Delivery', candidates: ['delivery'] },
        {
            key: 'take_away',
            label: 'Take Away',
            candidates: ['take_away', 'take away', 'takeaway'],
        },
        {
            key: 'dine_in',
            label: 'Dine In',
            candidates: ['dine_in', 'dine in', 'dinein'],
        },
    ])
    const ratingRows = buildRows([
        { key: 'rating_4', label: 'Rating 4+', candidates: ['rating4'] },
        { key: 'rating_3', label: 'Rating 3+', candidates: ['rating3'] },
        { key: 'rating_2', label: 'Rating 2+', candidates: ['rating2'] },
        { key: 'rating_1', label: 'Rating 1+', candidates: ['rating1'] },
    ])
    const filterByRows = buildRows([
        {
            key: 'free_delivery',
            label: 'Free Delivery',
            candidates: ['free_delivery', 'freedelivery'],
        },
        {
            key: 'discounted',
            label: 'Discounted',
            candidates: ['discounted', 'discount'],
        },
        { key: 'popular', label: 'Popular', candidates: ['popular'] },
        {
            key: 'new_arrivals',
            label: 'New Arrivals',
            candidates: ['new_arrivals', 'newarrivals', 'latest', 'new'],
        },
    ]).filter((row) => !(isPopularFoodsPage && row?.key === 'popular'))
    const { data: cuisinesData, refetch: refetchCuisines } = useGetCuisines()
    const visibleCuisineRows = (Array.isArray(cuisines) ? cuisines : []).map(
        (cuisine) => ({
            key: `cuisine_${cuisine?.id}`,
            label: cuisine?.name,
            value: cuisine?.id,
            item: cuisine,
        })
    )

    const remainingRows = itemData
        ?.filter(
            (item) =>
                !usedIds.has(item?.id) &&
                item?.section !== 'cuisines' &&
                normalizeValue(item?.value || item?.name) !== 'all'
        )
        ?.map((item) => ({
            key: `remaining_${item?.id}`,
            label: t(item?.name),
            item,
        }))
    const filterRowsWithRemaining = [...filterByRows, ...remainingRows].reduce(
        (acc, row) => {
            const tokenKey = normalizeValue(
                row?.item?.value || row?.value || row?.item?.name || row?.name
            )
            const labelKey = normalizeValue(row?.label)
            if (
                (tokenKey && acc.tokenSet.has(tokenKey)) ||
                (labelKey && acc.labelSet.has(labelKey))
            ) {
                return acc
            }
            if (tokenKey) acc.tokenSet.add(tokenKey)
            if (labelKey) acc.labelSet.add(labelKey)
            acc.rows.push(row)
            return acc
        },
        { rows: [], tokenSet: new Set(), labelSet: new Set() }
    ).rows

    const hasActive = checkboxData?.some((item) => item.isActive)
    const hasPriceOrRating =
        Boolean(priceAndRating?.rating) ||
        Boolean(priceAndRating?.price?.length)

    const borderColor = alpha(theme.palette.text.primary, 0.12)
    const rowControlBorder = alpha(theme.palette.text.primary, 0.4)
    const sectionTitleColor = theme.palette.text.primary
    const bodyTextColor = alpha(theme.palette.text.primary, 0.8)
    const accentColor = theme.palette.primary.main
    const showPriceBlock = rowWise && foodOrRestaurant === 'products' && typeof handlePrice === 'function'

    useEffect(() => {
        if (foodOrRestaurant !== 'restaurants') return
        if (cuisines?.length) return
        refetchCuisines()
    }, [cuisines?.length, foodOrRestaurant, refetchCuisines])

    useEffect(() => {
        if (cuisinesData?.Cuisines?.length) {
            dispatch(setCuisines(cuisinesData.Cuisines))
        }
    }, [cuisinesData, dispatch])

    useEffect(() => {
        if (typeof setFilterByData !== 'function') return

        const hasActiveOrderType = (candidate) =>
            allData?.some((entry) => {
                const entryToken = normalizeValue(entry?.value || entry?.name)
                return entry?.isActive && entryToken === candidate
            })

        const delivery = hasActiveOrderType('delivery')
        const take_away = hasActiveOrderType('takeaway')
        const dine_in = hasActiveOrderType('dinein')

        setFilterByData((prev = {}) => {
            if (
                prev.delivery === delivery &&
                prev.take_away === take_away &&
                prev.dine_in === dine_in
            ) {
                return prev
            }
            return { ...prev, delivery, take_away, dine_in }
        })
    }, [allData, setFilterByData])

    const getToken = (payload = {}) =>
        normalizeValue(
            payload?.value ||
                payload?.item?.value ||
                payload?.name ||
                payload?.label
        )

    const toggleItem = (
        target,
        isRadio,
        groupRows = [],
        sectionKey = '',
        sectionRows = []
    ) => {
        const targetToken = getToken(target)
        if (!targetToken) return

        const targetValue =
            target?.item?.value ||
            target?.value ||
            target?.item?.name ||
            target?.name ||
            targetToken

        const groupValueSet = new Set(
            groupRows?.map((row) => getToken(row))?.filter(Boolean)
        )
        const isCuisineSection = sectionKey === 'cuisines'

        if (sectionKey === 'sorting' && targetToken === 'default') {
            const updated = allData.map((entry) => {
                const entryToken = normalizeValue(entry?.value || entry?.name)
                if (groupValueSet.has(entryToken)) {
                    return { ...entry, isActive: false }
                }
                return entry
            })
            setCheckedFilterKey(updated)
            return
        }

        let foundTarget = false
        const updated = allData.map((entry) => {
            const entryToken = normalizeValue(entry?.value || entry?.name)
            const isTargetEntry = isCuisineSection
                ? entry?.section === 'cuisines' && entryToken === targetToken
                : entry?.id === target?.item?.id || entryToken === targetToken

            if (isTargetEntry) {
                foundTarget = true
                return { ...entry, isActive: isRadio ? true : !entry?.isActive }
            }

            if (singleSelect) {
                return { ...entry, isActive: false }
            }

            if (isRadio && groupValueSet.has(entryToken)) {
                return { ...entry, isActive: false }
            }

            return entry
        })

        if (foundTarget) {
            setCheckedFilterKey(updated)
            return
        }

        const nextData = [
            ...updated,
            {
                id: isCuisineSection
                    ? `cuisine_${targetToken}`
                    : target?.item?.id || `generated_${targetToken}`,
                name:
                    target?.label ||
                    target?.item?.name ||
                    target?.name ||
                    targetValue,
                value: targetValue,
                section: sectionKey || undefined,
                isActive: true,
            },
        ]
        setCheckedFilterKey(nextData)
    }

    const clearGroup = (rows = []) => {
        const ids = rows
            ?.map((row) => row?.item?.id)
            ?.filter((id) => id !== undefined)
        if (!ids?.length) return
        const updated = allData.map((entry) =>
            ids.includes(entry?.id) ? { ...entry, isActive: false } : entry
        )
        setCheckedFilterKey(updated)
    }

    const controlView = (controlType, checked, disabled = false) => {
        const commonControlSx = {
            p: 0,
            pointerEvents: 'none',
            color: disabled ? alpha(rowControlBorder, 0.45) : rowControlBorder,
            '&.Mui-checked': {
                color: accentColor,
            },
            '& .MuiSvgIcon-root': {
                fontSize: 18,
            },
        }
        if (controlType === 'radio') {
            return (
                <Radio
                    checked={checked}
                    disabled={disabled}
                    disableRipple
                    size="small"
                    sx={commonControlSx}
                />
            )
        }
        return (
            <Checkbox
                checked={checked}
                disabled={disabled}
                disableRipple
                size="small"
                sx={commonControlSx}
            />
        )
    }

    const optionRow = (
        row,
        controlType = 'checkbox',
        radioGroup = [],
        sectionKey = '',
        sectionRows = []
    ) => {
        const rowToken = getToken(row)
        const currentRowItem = allData?.find(
            (entry) => normalizeValue(entry?.value || entry?.name) === rowToken
        )
        const sortingTokens = new Set(
            radioGroup?.map((item) => getToken(item))?.filter(Boolean)
        )
        const hasActiveCustomSorting =
            sectionKey === 'sorting' &&
            allData?.some((entry) => {
                const entryToken = normalizeValue(entry?.value || entry?.name)
                return (
                    entry?.isActive &&
                    sortingTokens.has(entryToken) &&
                    entryToken !== 'default'
                )
            })
        const isChecked =
            sectionKey === 'sorting' && rowToken === 'default'
                ? Boolean(currentRowItem?.isActive) || !hasActiveCustomSorting
                : Boolean(currentRowItem?.isActive)
        const isClickable = Boolean(rowToken)
        const handleRowClick = () => {
            if (!isClickable) return
            toggleItem(
                row,
                controlType === 'radio',
                radioGroup,
                sectionKey,
                sectionRows
            )
        }
        return (
            <Stack
                key={row?.key}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                onClick={handleRowClick}
                sx={{
                    minHeight: 20,
                    py: '3px',
                    cursor: isClickable ? 'pointer' : 'default',
                    userSelect: 'none',
                }}
            >
                <Typography
                    fontSize="14px"
                    fontWeight={isChecked ? 700 : 400}
                    color={
                        isClickable ? bodyTextColor : alpha(bodyTextColor, 0.6)
                    }
                >
                    {row?.label}
                </Typography>
                {controlView(controlType, isChecked, !isClickable)}
            </Stack>
        )
    }

    const sectionHeader = (title) => (
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
        >
            <Typography
                fontSize="14px"
                fontWeight={700}
                color={sectionTitleColor}
            >
                {title}
            </Typography>
        </Stack>
    )
    const renderSelectableSection = ({
        key,
        title,
        rows,
        type = 'checkbox',
        showDivider = true,
    }) => (
        <Fragment key={key}>
            <Stack spacing={1}>
                {sectionHeader(title)}
                {rows.map((row) =>
                    optionRow(
                        row,
                        type,
                        type === 'radio' ? rows : [],
                        key,
                        rows
                    )
                )}
            </Stack>
            {showDivider && <Divider sx={{ borderColor }} />}
        </Fragment>
    )
    const renderFoodTypeOption = (item, label) => (
        <Box
            onClick={() =>
                item &&
                toggleItem(
                    {
                        item,
                        value: item?.value,
                        label: t(label),
                    },
                    false
                )
            }
            sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 28,
                borderRadius: '4px',
                border: '1px solid',
                borderColor: item?.isActive
                    ? alpha(accentColor, 0.6)
                    : 'transparent',
                backgroundColor: item?.isActive
                    ? alpha(accentColor, 0.16)
                    : 'transparent',
                cursor: item ? 'pointer' : 'not-allowed',
                opacity: item ? 1 : 0.45,
                transition: 'all 0.18s ease',
                '&:hover': {
                    backgroundColor: item
                        ? alpha(accentColor, 0.08)
                        : 'transparent',
                },
            }}
        >
            <Typography
                fontSize="11px"
                fontWeight={item?.isActive ? 700 : 500}
                color={item?.isActive ? accentColor : bodyTextColor}
            >
                {t(label)}
            </Typography>
        </Box>
    )
    const isOnlyFood = only_food === true || only_food === 'true'
    const sections = [
        {
            key: 'sorting',
            title: t('Sorting'),
            rows: sortingRows,
            type: 'radio',
        },
        ...(!isOnlyFood && foodOrRestaurant === 'restaurants'
            ? [
                  {
                      key: 'order-type',
                      title: t('Order Type'),
                      rows: orderTypeRows,
                      type: 'checkbox',
                  },
              ]
            : []),
        {
            key: 'restaurant-rating',
            title: t('Rating'),
            rows: ratingRows,
            type: 'radio',
        },
        {
            key: 'filter-by',
            title: t('Filter By'),
            rows: filterRowsWithRemaining,
            type: 'checkbox',
        },
        ...(!hideCuisines && foodOrRestaurant === 'restaurants'
            ? [
                  {
                      key: 'cuisines',
                      title: t('Cuisines'),
                      rows: visibleCuisineRows,
                      type: 'checkbox',
                  },
              ]
            : []),
    ]
    const [firstSection, ...remainingSections] = sections

    if (homeRestaurant === 'true' || homeRestaurant === true) {
        const homeFilterRows = [
            { key: 'veg', label: t('Veg'), candidates: ['veg'] },
            {
                key: 'non_veg',
                label: t('Non-Veg'),
                candidates: ['non_veg', 'nonveg', 'non veg'],
            },
            {
                key: 'top_rated',
                label: t('Top Rated'),
                candidates: ['top_rated', 'toprated'],
            },
            {
                key: 'discount',
                label: t('Discount'),
                candidates: ['discount', 'discounted'],
            },
        ].map((def) => {
            const match = def.candidates
                .map((c) => normalizedMap[normalizeValue(c)])
                .find(Boolean)
            return {
                key: def.key,
                label: def.label,
                value: def.candidates[0],
                item: match,
            }
        })
        return (
            <WrapperForSideDrawerFilter
                sx={{
                    p: '16px !important',
                    width: { xs: '250px', sm: '260px' },
                    maxHeight: '78vh',
                    overflowY: 'auto',
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
                }}
            >
                <Stack spacing={1.25}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography
                            fontSize="14px"
                            fontWeight={700}
                            color={sectionTitleColor}
                        >
                            {t('Filter By')}
                        </Typography>
                        <Button
                            onClick={handleReset}
                            size="small"
                            disabled={!hasActive && !hasPriceOrRating}
                            sx={{
                                minWidth: 'auto',
                                p: 0,
                                fontSize: '14px',
                                fontWeight: 700,
                                color: theme.palette.error.main,
                                textTransform: 'none',
                                lineHeight: 1.1,
                                '&.Mui-disabled': {
                                    color: alpha(
                                        theme.palette.error.main,
                                        0.35
                                    ),
                                },
                            }}
                        >
                            {t('Reset')}
                        </Button>
                    </Stack>
                    {homeFilterRows.map((row) => {
                        const isChecked = Boolean(row?.item?.isActive)
                        const isClickable = Boolean(row?.item)
                        return (
                            <Stack
                                key={row.key}
                                direction="row"
                                alignItems="center"
                                gap={1}
                                onClick={() =>
                                    isClickable && toggleItem(row, false)
                                }
                                sx={{
                                    cursor: isClickable
                                        ? 'pointer'
                                        : 'not-allowed',
                                    userSelect: 'none',
                                    py: '2px',
                                }}
                            >
                                <Checkbox
                                    checked={isChecked}
                                    disabled={!isClickable}
                                    disableRipple
                                    size="small"
                                    sx={{
                                        p: 0,
                                        pointerEvents: 'none',
                                        color: rowControlBorder,
                                        '&.Mui-checked': { color: accentColor },
                                        '& .MuiSvgIcon-root': { fontSize: 20 },
                                    }}
                                />
                                <Typography
                                    fontSize="14px"
                                    fontWeight={isChecked ? 700 : 400}
                                    color={bodyTextColor}
                                >
                                    {row.label}
                                </Typography>
                            </Stack>
                        )
                    })}
                </Stack>
            </WrapperForSideDrawerFilter>
        )
    }

    return (
        <WrapperForSideDrawerFilter
            sx={{
                p: '16px !important',
                width: { xs: '200px', sm: '280px' },
                minWidth: { xs: '176px', sm: '176px' },
                maxWidth: { xs: '200px', sm: '300px' },
                maxHeight: '78vh',
                overflowY: 'auto',
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${borderColor}`,
                borderRadius: '4px',
                boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
            }}
        >
            <Stack spacing={2}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography
                        fontSize="14px"
                        fontWeight={700}
                        color={sectionTitleColor}
                    >
                        {t('Filter')}
                    </Typography>
                    <Button
                        onClick={handleReset}
                        size="small"
                        disabled={!hasActive && !hasPriceOrRating}
                        sx={{
                            minWidth: 'auto',
                            p: 0,
                            fontSize: '14px',
                            fontWeight: 700,
                            color: theme.palette.error.main,
                            textTransform: 'none',
                            lineHeight: 1.1,
                            '&.Mui-disabled': {
                                color: alpha(theme.palette.error.main, 0.35),
                            },
                        }}
                    >
                        {t('Reset Filter')}
                    </Button>
                </Stack>
                <Divider sx={{ borderColor }} />

                {renderSelectableSection({
                    key: firstSection.key,
                    title: firstSection.title,
                    rows: firstSection.rows,
                    type: firstSection.type,
                })}

                <Stack spacing={1}>
                    {sectionHeader(t('Food Type'))}
                    <Stack
                        direction="row"
                        sx={{
                            border: '1px solid',
                            borderColor,
                            borderRadius: '6px',
                            p: '2px',
                            gap: '2px',
                            backgroundColor: alpha(
                                theme.palette.text.primary,
                                0.03
                            ),
                        }}
                    >
                        {renderFoodTypeOption(vegItem, 'Veg')}
                        {renderFoodTypeOption(nonVegItem, 'Non-veg')}
                    </Stack>
                </Stack>
                <Divider sx={{ borderColor }} />

                {remainingSections.map((section, index) =>
                    renderSelectableSection({
                        key: section.key,
                        title: section.title,
                        rows: section.rows,
                        type: section.type,
                        showDivider: index !== remainingSections.length - 1,
                    })
                )}

                {showPriceBlock && (
                    <Stack spacing={0.8}>
                        <Divider sx={{ borderColor }} />
                        {sectionHeader(t('Price'))}
                        <CustomSlider
                            handleChangePrice={handlePrice}
                            highestPrice={highestPrice}
                            priceValue={priceAndRating?.price}
                        />
                    </Stack>
                )}

                {/* <Box
                    sx={{
                        position: 'sticky',
                        bottom: 0,
                        pt: 0.8,
                        mt: 0.2,
                        backgroundColor: theme.palette.background.paper,
                        zIndex: 2,
                    }}
                >
                    <Divider sx={{ borderColor, mb: 0.8 }} />
                    <Button
                        onClick={() => handleDropClose?.()}
                        variant="contained"
                        sx={{
                            width: '100%',
                            minHeight: 24,
                            borderRadius: '3px',
                            fontSize: '14px',
                            fontWeight: 700,
                            textTransform: 'none',
                            boxShadow: 'none',
                        }}
                    >
                        {t('Apply')}
                    </Button>
                </Box> */}
            </Stack>
        </WrapperForSideDrawerFilter>
    )
}

export default RestaurantFilterCard
