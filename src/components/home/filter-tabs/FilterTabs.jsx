import { Box, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { t } from 'i18next'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import {
    NAVBAR_HEIGHT,
    NAVBAR_HEIGHT_MOBILE,
} from '@/components/navbar/navbarConstants'
import { NAVBAR_MOBILE_TOP_VAR } from '@/components/navbar/navbarOffset'
import {
    LeafIcon,
    MeatIcon,
    NewArrivalIcon,
    FireIcon,
    CloseIcon,
} from './icons'
import FilterChip, { Chip, ChipIcon, ChipLabel } from './FilterChip'
import { HOME_SECTION_SPACING } from '../homeSectionSpacing'

const SPACING = HOME_SECTION_SPACING.filterTabs

// `dimension`/`value` address the same appliedFilters keys FilterPanel writes,
// so a chip and the panel stay in sync.
const TABS = [
    {
        key: 'veg',
        label: 'Veg',
        Icon: LeafIcon,
        dimension: 'type',
        value: 'veg',
    },
    {
        key: 'nonVeg',
        label: 'Non-Veg',
        Icon: MeatIcon,
        dimension: 'type',
        value: 'nonVeg',
    },
    {
        key: 'newArrival',
        label: 'New Arrival',
        Icon: NewArrivalIcon,
        dimension: 'discover',
        value: 'newArrival',
    },
    {
        key: 'popular',
        label: 'Popular',
        Icon: FireIcon,
        dimension: 'discover',
        value: 'popular',
    },
]

// Mobile-only — mirrors the quick-link section in HomeSidebar (info/error/
// warning/success icon colors), since the sidebar itself is hidden on mobile.
// `section` is the /home/[...slug] segment HomeSidebar navigates to.
const MOBILE_QUICK_LINKS = [
    {
        key: 'bogo',
        label: 'BOGO',
        section: 'bogo',
        iconClass: 'fi fi-sr-badge-percent',
        color: (theme) => theme.palette.error.main,
    },
    {
        key: 'nearby',
        label: 'Nearby',
        section: 'nearby',
        iconClass: 'fi fi-ss-marker',
        color: (theme) => theme.palette.info.main,
    },
    {
        key: 'offers',
        label: 'Offers',
        section: 'offers',
        iconClass: 'fi fi-sr-badge-percent',
        color: (theme) => theme.palette.error.main,
    },
    {
        key: 'topRated',
        label: 'Top Rated',
        section: 'top-rated',
        iconClass: 'fi fi-sr-star',
        color: (theme) => theme.palette.warning.main,
    },
    {
        key: 'freeDelivery',
        label: 'Free Delivery',
        section: 'free-delivery',
        iconClass: 'fi fi-sr-biking-mountain',
        color: (theme) => theme.palette.success.main,
    },
]

const parseCsv = (v) => (v ? v.split(',').filter(Boolean) : [])

const ScrollRow = styled(Stack)(() => ({
    flexDirection: 'row',
    alignItems: 'center',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
}))

// Presentational — all filter state lives in useFilterControls so the host
// page can drive these chips and the mobile page header's filter button from
// one source. `controls` is that hook's return value.
// hideOnMobile: pages that swap in MobilePageHeader on small screens.
// hideBogoChip: Homes.js passes this while BogoOfferBanner is on screen, or
// while no BOGO offer is live, so the row doesn't show a dead/duplicate link.
const FilterTabs = ({
    controls,
    hideOnMobile = false,
    hideBogoChip = false,
}) => {
    const router = useRouter()
    const {
        appliedFilters,
        filterCount,
        filterActive,
        toggleDimension,
        resetFilters,
        openPanel,
    } = controls

    // Restaurant.jsx sets this when its header claims the same sticky slot.
    const restaurantIsSticky = useSelector(
        (state) => state.scrollPosition.restaurantIsSticky
    )

    const mobileQuickLinks = hideBogoChip
        ? MOBILE_QUICK_LINKS.filter(({ key }) => key !== 'bogo')
        : MOBILE_QUICK_LINKS

    return (
        <Box
            id="home-filter-tabs-sticky-bar"
            sx={(theme) => ({
                display: hideOnMobile ? { xs: 'none', md: 'block' } : 'block',
                position: 'sticky',
                top: {
                    xs: `var(${NAVBAR_MOBILE_TOP_VAR}, ${NAVBAR_HEIGHT_MOBILE}px)`,
                    md: `${NAVBAR_HEIGHT}px`,
                },
                zIndex: 98,
                backgroundColor: {
                    xs: theme.palette.background.paper,
                    md: theme.palette.neutral[1800],
                },
                transition: 'transform 0.25s ease, opacity 0.2s ease',
                transform: restaurantIsSticky
                    ? 'translateY(-100%)'
                    : 'translateY(0)',
                opacity: restaurantIsSticky ? 0 : 1,
                pointerEvents: restaurantIsSticky ? 'none' : 'auto',
                borderBottom: {
                    xs: 'none',
                    md: `1px solid ${theme.palette.divider}`,
                },
            })}
        >
            {/* Desktop — Filter, Veg, Non-Veg, New Arrival, Popular */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    gap: '12px',
                    pt: SPACING.pt.md,
                    pb: SPACING.pb.md,
                }}
            >
                <FilterChip
                    fontSize="14px"
                    active={filterActive}
                    count={filterCount}
                    onOpen={openPanel}
                    onReset={resetFilters}
                />

                {TABS.map(({ key, label, Icon, dimension, value }) => {
                    const active = parseCsv(appliedFilters[dimension]).includes(
                        value
                    )
                    const exclusiveWith =
                        dimension === 'type' ? ['veg', 'nonVeg'] : null
                    return (
                        <Chip
                            key={key}
                            active={active}
                            onClick={() =>
                                toggleDimension(dimension, value, exclusiveWith)
                            }
                        >
                            <ChipIcon active={active}>
                                <Icon size={16} />
                            </ChipIcon>
                            <ChipLabel>{t(label)}</ChipLabel>
                            {active && (
                                <ChipIcon active={false}>
                                    <CloseIcon size={10} />
                                </ChipIcon>
                            )}
                        </Chip>
                    )
                })}
            </Box>

            {/* Mobile — Filter, Nearby, Offers, Top Rated, Free Delivery (slider) */}
            <ScrollRow
                sx={{
                    display: { xs: 'flex', md: 'none' },
                    gap: '8px',
                    pt: SPACING.pt.xs,
                    pb: SPACING.pb.xs,
                    pl: { xs: 2, sm: 3 },
                    pr: { xs: 2, sm: 3 },
                }}
            >
                <FilterChip
                    fontSize="12px"
                    active={filterActive}
                    count={filterCount}
                    onOpen={openPanel}
                    onReset={resetFilters}
                />

                {mobileQuickLinks.map(
                    ({ key, label, section, iconClass, color }) => (
                        <Chip
                            key={key}
                            active={false}
                            onClick={() => {
                                if (key === 'bogo') {
                                    router.push('/bogo-list')
                                    return
                                }
                                router.push(`/home/${section}`)
                            }}
                        >
                            <ChipIcon active={false} sx={{ color }}>
                                <i
                                    className={iconClass}
                                    style={{
                                        fontSize: 16,
                                        lineHeight: 1,
                                        display: 'flex',
                                    }}
                                />
                            </ChipIcon>
                            <ChipLabel fontSize="12px">{t(label)}</ChipLabel>
                        </Chip>
                    )
                )}
            </ScrollRow>
        </Box>
    )
}

export default FilterTabs
