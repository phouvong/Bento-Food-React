import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import { Box, Popover, Stack, alpha, styled } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { t } from 'i18next'
import { useEffect, useRef, useState } from 'react'
import { handleFilterData } from '../../category/helper'
import RestaurantFilterCard from './RestaurantFilterCard'

const TabBtn = styled('button', {
    shouldForwardProp: (p) => p !== 'isactive',
})(({ theme, isactive }) => ({
    border: `1px solid ${theme.palette.divider}`,
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: 999,
    fontSize: 12.5,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    transition: 'all .15s ease',
    backgroundColor:
        isactive === 'true' ? theme.palette.text.primary : 'transparent',
    color:
        isactive === 'true'
            ? theme.palette.background.paper
            : theme.palette.text.secondary,
    borderColor:
        isactive === 'true'
            ? theme.palette.text.primary
            : theme.palette.divider,
    '&:hover':
        isactive === 'true'
            ? {}
            : {
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
              },
}))

const FilterBtn = styled('button')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    marginInlineStart: 'auto',
    padding: '8px 16px',
    borderRadius: 999,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    fontWeight: 600,
    fontSize: 12.5,
    transition: 'all .15s ease',
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
}))

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
        setCheckedFilterKey,
    } = props
    const [anchorEl, setAnchorEl] = useState(null)
    const open = Boolean(anchorEl)
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

    const handleDropClick = (event) => setAnchorEl(event.currentTarget)
    const handleDropClose = () => setAnchorEl(null)

    useEffect(() => {
        if (forFilter) scrollToSection5()
        handleFilterData(
            checkedFilterKey,
            setFilterByData,
            setOffSet,
            setForFilter
        )
    }, [checkedFilterKey])

    useEffect(() => {
        if (!open) return

        const handleScroll = () => {
            handleDropClose()
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [open])

    const handleClearAll = () => handleDropClose()
    const handleReset = () => {
        const data = checkedFilterKey?.map((item) => ({
            ...item,
            isActive: false,
        }))
        setCheckedFilterKey(data)
        handleDropClose()
    }

    return (
        <>
            <Stack
                direction="row"
                alignItems="center"
                gap={1}
                sx={{ width: '100%', flexWrap: { xs: 'nowrap', md: 'wrap' } }}
            >
                <Box sx={{ position: 'relative', flex: 1, minWidth: 0 }}>
                    <Box
                        ref={scrollContainerRef}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            overflowX: { xs: 'auto', md: 'visible' },
                            flexWrap: { xs: 'nowrap', md: 'wrap' },
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
                <FilterBtn
                    type="button"
                    onClick={handleDropClick}
                    style={{ flexShrink: 0 }}
                >
                    <FilterAltOutlinedIcon sx={{ fontSize: 14 }} />
                    {t('Filter')}
                </FilterBtn>
            </Stack>
            <Popover
                onClose={handleDropClose}
                id="fade-button"
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                disableScrollLock
                sx={{ zIndex: 1400, top: '5px' }}
            >
                <RestaurantFilterCard
                    handleReset={handleReset}
                    homeRestaurant="true"
                    checkboxData={checkedFilterKey}
                    handleDropClose={handleDropClose}
                    anchorEl={anchorEl}
                    setFilterByData={setFilterByData}
                    handleClearAll={handleClearAll}
                    setCheckedFilterKey={setCheckedFilterKey}
                />
            </Popover>
        </>
    )
}

export default RestaurantTab
