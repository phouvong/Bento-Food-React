import { useState } from 'react'
import BogoOfferBanner from './BogoOfferBanner'
import HappyHourBanner from './HappyHourBanner'
import { Box, Stack } from '@mui/material'
import { HOME_SECTION_SPACING } from '../homeSectionSpacing'

const SPACING = HOME_SECTION_SPACING.happyHourNBogoBanner

// BOGO and Happy Hour can each be independently on/off. Happy Hour reports
// its own active state (offer live vs expired) via onActiveChange — when
// active it floats above BottomNav on mobile instead (FloatingCardManagement),
// so it never shows inline on xs here, only on sm+.
// - both active: two equal halves on sm+, BOGO alone on xs.
// - one active: that one takes the full width on sm+.
// - neither active: the whole section is hidden, on every breakpoint.
const HappyHourNBogoBanner = ({
    setBogoBannerVisible,
    bogoActive = true,
}) => {
    const [happyHourActive, setHappyHourActive] = useState(false)

    // Collapse visually (never unmount) when neither banner is active:
    // HappyHourBanner must stay mounted to poll /happy-hour/running and
    // report back via onActiveChange — an early `return null` here would
    // deadlock it as permanently inactive once both flags go false.
    const anyActive = bogoActive || happyHourActive

    return (
        <Stack
            direction="row"
            gap="20px"
            width="100%"
            sx={{
                display: !anyActive
                    ? 'none'
                    : bogoActive
                      ? 'flex'
                      : { xs: 'none', sm: 'flex' },
                pt: SPACING.pt,
                pb: SPACING.pb,
            }}
        >
            {bogoActive && (
                <Box
                    sx={{
                        flex: happyHourActive
                            ? { xs: '1 1 100%', sm: '1 1 0%' }
                            : '1 1 100%',
                        minWidth: 0,
                    }}
                >
                    <BogoOfferBanner
                        onVisibilityChange={setBogoBannerVisible}
                    />
                </Box>
            )}

            <Box
                sx={{
                    display: happyHourActive
                        ? { xs: 'none', sm: 'block' }
                        : 'none',
                    flex: bogoActive ? '1 1 0%' : '1 1 100%',
                    minWidth: 0,
                }}
            >
                <HappyHourBanner onActiveChange={setHappyHourActive} />
            </Box>
        </Stack>
    )
}

export default HappyHourNBogoBanner
