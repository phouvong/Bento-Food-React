import React, { useRef } from 'react'
import { Box, Stack, IconButton } from '@mui/system'
import { styled, Typography } from '@mui/material'
import { t } from 'i18next'
import { ArrowForward, ArrowBack } from '@mui/icons-material'
import { alpha } from '@mui/material'

const CustomTypography = styled(Typography)(({ theme, active }) => ({
    fontSize: '20px',
    cursor: 'pointer',
    fontWeight: active === 'true' ? '700' : '400',
}))

const ActiveIndicator = styled(Box)(({ theme, active }) => ({
    backgroundColor: active === 'true' ? theme.palette.primary.main : 'inherit',
    borderRadius: '7px',
    width: '100%',
    height: '3px',
}))

const LangTab = (props) => {
    const { tabs, currentTab, setCurrentTab } = props
    const scrollRef = useRef(null)

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: -100, // Adjust the value to control scroll speed
                behavior: 'smooth',
            })
        }
    }

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: 100, // Adjust the value to control scroll speed
                behavior: 'smooth',
            })
        }
    }

    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{
                position: 'relative',
                overflowX: 'hidden', // Ensure scroll buttons are positioned relative to container
                overflowY: 'hidden', // Hide vertical scrollbar
                whiteSpace: 'nowrap', // Keep elements in a single line (no wrapping)
                height: '-webkit-fill-available', // Make sure it takes the available height
            }}
        >
            <Stack
                ref={scrollRef}
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{
                    overflowX: 'auto', // Enable horizontal scrolling
                    overflowY: 'hidden', // Hide vertical scrollbar
                    whiteSpace: 'nowrap', // Keep elements in a single line
                    paddingBottom: '10px', // Add space to avoid content being hidden behind scrollbar
                    '&::-webkit-scrollbar': {
                        height: '0', // Hide horizontal scrollbar
                        display: 'none', // Hide scrollbar completely
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'transparent', // Transparent thumb
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent', // Transparent track
                    },
                }}
            >
                {tabs?.length > 0 &&
                    tabs.map((item, index) => {
                        return (
                            <Stack
                                key={index}
                                alignItems="center"
                                justifyContent="center"
                                spacing={1}
                            >
                                <Typography
                                    active={
                                        currentTab === index ? 'true' : 'false'
                                    }
                                    onClick={() => setCurrentTab(index, item)}
                                    sx={{
                                        color: (theme) =>
                                            theme.palette.neutral[1000],
                                    }}
                                >
                                    {t(item?.value)}
                                </Typography>
                                <ActiveIndicator
                                    active={
                                        currentTab === index ? 'true' : 'false'
                                    }
                                />
                            </Stack>
                        )
                    })}
            </Stack>
        </Stack>
    )
}

LangTab.propTypes = {}

export default LangTab
