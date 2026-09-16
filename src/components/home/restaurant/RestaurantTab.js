import { Box, alpha, styled } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { t } from 'i18next'
import { useEffect, useRef } from 'react'
import { handleFilterData } from '../../category/helper'

const TabBtn = styled('button', {
    shouldForwardProp: (p) => p !== 'isactive',
})(({ theme, isactive }) => {
    const active = isactive === 'true'

    return {
        border: 'none',
        cursor: 'pointer',
        padding: '8px 16px',
        borderRadius: 999,
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: '-0.48px',
        whiteSpace: 'nowrap',
        transition: 'all .15s ease',
        [theme.breakpoints.down('sm')]: {
            padding: '7px 12px',
            fontSize: 13,
        },
        ...(active
            ? {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
              }
            : {
                  backgroundColor: theme.palette.neutral[1800],
                  color: theme.palette.text.secondary,
                  [theme.breakpoints.up('md')]: {
                      backgroundColor: theme.palette.background.paper,
                  },
                  '&:hover': {
                      color: theme.palette.primary.main,
                  },
              }),
    }
})

const RestaurantTab = (props) => {
    const {
        filterType,
        handleChange,
        mockData,
        setFilterByData,
        setOffSet,
        setForFilter,
        forFilter,
        scrollToSection5,
        checkedFilterKey,
    } = props
    const theme = useTheme()
    const scrollContainerRef = useRef(null)
    const activeTabRef = useRef(null)

    useEffect(() => {
        const container = scrollContainerRef.current
        const activeEl = activeTabRef.current
        if (!container || !activeEl) return
        if (container.scrollWidth <= container.clientWidth) return
        const targetLeft =
            activeEl.offsetLeft -
            container.clientWidth / 2 +
            activeEl.clientWidth / 2
        container.scrollTo({
            left: Math.max(0, targetLeft),
            behavior: 'smooth',
        })
    }, [filterType, mockData])

    useEffect(() => {
        if (forFilter) scrollToSection5()
        handleFilterData(
            checkedFilterKey,
            setFilterByData,
            setOffSet,
            setForFilter
        )
    }, [checkedFilterKey])

    return (
        <Box
            sx={{
                position: 'relative',
                minWidth: 0,
                // Mobile: fill the row so the tab strip can scroll horizontally.
                // Desktop: shrink to content (never grow) so the parent's
                // space-between can push the tabs to the row's end.
                width: { xs: '100%', md: 'auto' },
                flex: { xs: 1, md: '0 1 auto' },
            }}
        >
            <Box
                ref={scrollContainerRef}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    overflowX: { xs: 'auto', md: 'visible' },
                    flexWrap: { xs: 'nowrap', md: 'wrap' },
                    pr: { xs: 2, md: 0 },
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                    WebkitOverflowScrolling: 'touch',
                    scrollBehavior: 'smooth',
                }}
            >
                {mockData?.map((item) => {
                    const isActive = filterType === item.value
                    return (
                        <TabBtn
                            key={item?.id}
                            ref={isActive ? activeTabRef : undefined}
                            type="button"
                            isactive={isActive ? 'true' : 'false'}
                            onClick={(e) => handleChange(e, item.value)}
                            style={{ flexShrink: 0 }}
                        >
                            {t(item?.category_name)}
                        </TabBtn>
                    )
                })}
            </Box>
            <Box
                sx={{
                    display: { xs: 'block', md: 'none' },
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    right: 0,
                    width: '32px',
                    pointerEvents: 'none',
                    background: `linear-gradient(to right, ${alpha(
                        theme.palette.background.default,
                        0
                    )}, ${theme.palette.background.default})`,
                }}
            />
        </Box>
    )
}

export default RestaurantTab
