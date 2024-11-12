/* eslint-disable react-hooks/exhaustive-deps */
import useGetCashbackList from '@/hooks/react-query/cashback/useGetCashbackList'
import { setCashbackList } from '@/redux/slices/cashbackList'
import { CustomDateFormat } from '@/utils/CustomDateAndTimeFormat'
import { getAmount } from '@/utils/customFunctions'
import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'
import { Collapse, Stack, Typography } from '@mui/material'
import { Box, alpha } from '@mui/system'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
const CloseIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect
            x="0.186275"
            y="0.186275"
            width="15.6275"
            height="15.6275"
            rx="7.81373"
            fill="#9DA7BC"
            stroke="currentColor"
            stroke-width="0.372549"
        />
        <rect
            x="5.66211"
            y="4.68848"
            width="7.5454"
            height="0.93329"
            transform="rotate(45 5.66211 4.68848)"
            fill="currentColor"
        />
        <rect
            x="5"
            y="10.024"
            width="7.5487"
            height="0.936582"
            transform="rotate(-45 5 10.024)"
            fill="currentColor"
        />
    </svg>
)
const CashBackPopup = () => {
    const [open, setOpen] = useState(false)
    const [scrolling, setScrolling] = useState(false)
    const theme = useTheme()
    const dispatch = useDispatch()
    const handleSuccess = (data) => {
        dispatch(setCashbackList(data))
    }
    const { refetch } = useGetCashbackList(handleSuccess)
    const { cashbackList } = useSelector((state) => state.cashbackList)
    const { global } = useSelector((state) => state.globalSettings)

    useEffect(() => {
        if (!cashbackList) refetch()
    }, [])

    const handleScrolling = () => {
        if (window.innerWidth < 1024) {
            setScrolling(true)
        }
        const timer = setTimeout(() => {
            setScrolling(false)
        }, 1000)
        return () => clearTimeout(timer)
    }

    useEffect(() => {
        handleScrolling()
        window.addEventListener('scroll', handleScrolling)
        return () => {
            window.removeEventListener('scroll', handleScrolling)
        }
    }, [])

    if (cashbackList?.length > 0)
        return (
            <>
                <CustomPopupButtonBox
                    onClick={() => setOpen(!open)}
                    open={open}
                    scrolling={scrolling}
                >
                    <img
                        src="/static/cash-back.svg"
                        alt="Cashback"
                        width={68}
                        height={72}
                    />
                </CustomPopupButtonBox>
                <Box
                    sx={{
                        backgroundColor:theme=>theme.palette.mode === 'dark'?alpha(theme.palette.neutral[100],.6):alpha(theme.palette.neutral[1000],.6),
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        zIndex: '1000000',
                        transition: 'all ease 0.3s',
                        opacity: open ? 1 : 0,
                        visibility: open ? 'visible' : 'hidden',
                        cursor: 'zoom-out',
                    }}
                    onClick={() => setOpen(false)}
                />
                <CustomPopupBox>
                    <Collapse in={open}>
                        <Box position="relative">
                            <Stack gap="10px">
                                {cashbackList.map((item, index) => (
                                    <CustomOfferBox key={index}>
                                        <Box className="box-top">
                                            <Typography
                                                variant="h6"
                                                color={
                                                    theme.palette.neutral[1000]
                                                }
                                            >
                                                {item?.cashback_type ===
                                                'amount'
                                                    ? getAmount(
                                                          item?.cashback_amount,
                                                          global?.currency_symbol_direction,
                                                          global?.currency_symbol,
                                                          global?.digit_after_decimal_point
                                                      )
                                                    : item?.cashback_amount +
                                                      '%'}{' '}
                                                {t(item?.title)}
                                            </Typography>
                                        </Box>
                                        <Stack direction="row" px={1}>
                                            <Box
                                                component="span"
                                                sx={{
                                                    color: (theme) =>
                                                        theme.palette
                                                            .neutral[1000],
                                                }}
                                            >
                                                {t('Min Spent')}{' '}
                                                {getAmount(
                                                    item?.min_purchase,
                                                    global?.currency_symbol_direction,
                                                    global?.currency_symbol,
                                                    global?.digit_after_decimal_point
                                                )}
                                            </Box>
                                            <Box
                                                component="span"
                                                mx="4px"
                                                sx={{
                                                    color: (theme) =>
                                                        theme.palette
                                                            .neutral[1000],
                                                }}
                                            >
                                                |
                                            </Box>
                                            <Box
                                                component="span"
                                                sx={{
                                                    color: (theme) =>
                                                        theme.palette
                                                            .neutral[1000],
                                                }}
                                            >
                                                {CustomDateFormat(
                                                    item?.end_date
                                                )}
                                            </Box>
                                        </Stack>
                                    </CustomOfferBox>
                                ))}
                            </Stack>
                        </Box>
                    </Collapse>
                </CustomPopupBox>
            </>
        )
    return <></>
}

const CustomPopupButtonBox = styled(Box)(({ open, theme, scrolling }) => ({
    position: 'fixed',
    cursor: 'pointer',
    display: 'flex',
    bottom: '53px',
    insetInlineEnd: '23px',
    zIndex: open ? '9999999' : '1200',
    transition: 'all ease 0.3s',
    transform: scrolling && !open ? 'scale(0)' : 'scale(1)',
    [theme.breakpoints.down('lg')]: {
        bottom: '73px',
    },
    [theme.breakpoints.down('sm')]: {
        bottom: '83px',
        img: {
            width: '50px',
            height: '50px',
        },
    },
}))
const CustomOverlay = styled(Box)(({ theme }) => ({
    position: 'fixed',
    display: 'none',
    bottom: '0',
    right: '0',
    width: '100%',
    height: '100%',
    zIndex: '99999',
    background: alpha(theme.palette.neutral[900], 0.9),
    [theme.breakpoints.down('1200')]: {
        display: 'block',
    },
}))
const CustomPopupBox = styled(Box)(({ theme }) => ({
    position: 'fixed',
    bottom: '130px',
    insetInlineEnd: '23px',
    zIndex: '1000000',
    overflowY: 'auto',
    width: '293px',
    maxHeight: 'calc(100dvh - 260px)',
    [theme.breakpoints.down('lg')]: {
        bottom: '130px',
    },
    [theme.breakpoints.down('sm')]: {
        bottom: '110px',
        maxHeight: 'calc(100dvh - 170px)',
    },
}))
const CustomOfferBox = styled(Box)(({ theme }) => ({
    background: theme.palette.background.default,
    padding: '10px',
    borderRadius: '5px',
    fontSize: '10px',
    boxShadow: theme.shadows[14],
    '.box-top': {
        background: theme.palette.background.custom7,
        padding: '8px',
        borderRadius: '3px',
        mb: 2,
        '.MuiTypography-h6': {
            fontSize: '14px',
            wordBreak: 'break-all',
            whiteSpace: 'normal',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis',
        },
    },
}))
export default CashBackPopup
