import { useEffect, useState } from 'react'
import Head from 'next/head'
import Router, { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import nProgress from 'nprogress'
import { Provider } from 'react-redux'
import { CacheProvider } from '@emotion/react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { alpha, Box, GlobalStyles, NoSsr } from '@mui/material'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import { Toaster } from 'react-hot-toast'

import { store } from '@/redux/store'
import { WrapperForApp } from '@/App.style'
import createEmotionCache from '@/utils/create-emotion-cache'
import { createTheme } from '@/theme'
import { SettingsProvider, SettingsConsumer } from '@/contexts/settings-context'
import Navigation from '@/components/navbar'
import {
    BOTTOM_NAV_CONTENT_HEIGHT,
    BOTTOM_NAV_HEIGHT_CSS_VAR,
    NAVBAR_HEIGHT,
    NAVBAR_HEIGHT_MOBILE,
    usesMobilePageHeader,
} from '@/components/navbar/navbarConstants'
import ScrollToTop from '@/components/scroll-top/ScrollToTop'
import DynamicFavicon from '@/components/favicon/DynamicFavicon'
import FloatingCardManagement from '@/components/floating-cart/FloatingCardManagement'
import SearchProductModal from '@/components/search/SearchProductModal'
import GlobalAuthModal from '@/components/auth/GlobalAuthModal'
import useScrollToTop from '@/hooks/custom-hooks/useScrollToTop'
import { getToken } from '@/components/checkout-page/functions/getGuestUserId'
import { clearWishList } from '@/redux/slices/wishList'

import '@/language/i18n'
import i18n, { t } from 'i18next'
import '@/styles/global.css'
import '@/styles/nprogress.css'
import '@flaticon/flaticon-uicons/css/regular/rounded.css'
import '@flaticon/flaticon-uicons/css/regular/straight.css'
import '@flaticon/flaticon-uicons/css/solid/rounded.css'
import '@flaticon/flaticon-uicons/css/solid/straight.css'
import '@flaticon/flaticon-uicons/css/bold/rounded.css'
import SubscribeServices from '@/components/home/subscribe-services/SubscribeServices'
import ExpiredSubscriptionPrompt from '@/components/home/ExpiredSubscriptionPrompt'
import LanguageChangeBackdrop from '@/components/language-change/LanguageChangeBackdrop'

const Footer = dynamic(() => import('@/components/footer/Footer'), {
    ssr: false,
})
Router.events.on('routeChangeStart', nProgress.start)
Router.events.on('routeChangeError', nProgress.done)
Router.events.on('routeChangeComplete', nProgress.done)

const clientSideEmotionCache = createEmotionCache()
const queryClient = new QueryClient()
const persistor = persistStore(store)

const App = ({
    Component,
    pageProps,
    emotionCache = clientSideEmotionCache,
}) => {
    const router = useRouter()
    const [zoneid, setZoneid] = useState(undefined)
    const [viewFooter, setViewFooter] = useState(false)

    useScrollToTop()

    const getLayout = Component.getLayout ?? ((page) => page)

    // One-time self-heal: wishList persists across sessions, and a couple of
    // logout paths didn't clear it before this fix, so an already-deployed
    // guest can still be showing filled hearts from a previous login.
    useEffect(() => {
        if (!getToken()) store.dispatch(clearWishList([]))
    }, [])

    // Language & zoneid logic
    useEffect(() => {
        const storedLang = localStorage.getItem('language')
        const browserLang = i18n.language.toLowerCase()
        if (!storedLang) localStorage.setItem('language', browserLang)
        i18n.changeLanguage(storedLang || browserLang)

        const storedZoneId = localStorage.getItem('zoneid')
        if (storedZoneId) setZoneid(JSON.parse(storedZoneId))

        const storedVersion = localStorage.getItem('appVersion')
        if (storedVersion !== process.env.NEXT_PUBLIC_SITE_VERSION) {
            localStorage.clear()
            localStorage.setItem(
                'appVersion',
                process.env.NEXT_PUBLIC_SITE_VERSION
            )
            // Only redirect to landing if not already on /home
            // if (router.pathname !== '/home') {
            //   //router.replace('/')
            // }
        }

        setViewFooter(true)
    }, [router])

    return (
        <>
            {useScrollToTop()}
            <CacheProvider value={emotionCache}>
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        {/* <PersistGate loading={null} persistor={persistor}> */}
                        <SettingsProvider>
                            <SettingsConsumer>
                                {({ settings }) => (
                                    <ThemeProvider
                                        theme={createTheme({
                                            direction: settings.direction,
                                            responsiveFontSizes:
                                                settings.responsiveFontSizes,
                                            mode: settings.theme,
                                        })}
                                    >
                                        <CssBaseline />
                                        <GlobalStyles
                                            styles={(theme) => ({
                                                ':root': {
                                                    [BOTTOM_NAV_HEIGHT_CSS_VAR]: `${BOTTOM_NAV_CONTENT_HEIGHT}px`,
                                                },
                                                '@media (hover: hover) and (pointer: fine)':
                                                    {
                                                        '*, html, body': {
                                                            scrollbarWidth:
                                                                'thin',
                                                            scrollbarColor: `${alpha(
                                                                theme.palette
                                                                    .text
                                                                    .secondary,
                                                                0.3
                                                            )} transparent`,
                                                        },
                                                        '*::-webkit-scrollbar, html::-webkit-scrollbar, body::-webkit-scrollbar':
                                                            {
                                                                width: '3px !important',
                                                                height: '3px !important',
                                                            },
                                                        '*::-webkit-scrollbar-track, html::-webkit-scrollbar-track, body::-webkit-scrollbar-track':
                                                            {
                                                                backgroundColor:
                                                                    'transparent',
                                                            },
                                                        '*::-webkit-scrollbar-corner, html::-webkit-scrollbar-corner, body::-webkit-scrollbar-corner':
                                                            {
                                                                backgroundColor:
                                                                    'transparent',
                                                            },
                                                        '*::-webkit-scrollbar-thumb, html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb':
                                                            {
                                                                backgroundColor:
                                                                    alpha(
                                                                        theme
                                                                            .palette
                                                                            .text
                                                                            .secondary,
                                                                        0.3
                                                                    ),
                                                                borderRadius: 999,
                                                            },
                                                        '*::-webkit-scrollbar-thumb:hover, html::-webkit-scrollbar-thumb:hover, body::-webkit-scrollbar-thumb:hover':
                                                            {
                                                                backgroundColor:
                                                                    alpha(
                                                                        theme
                                                                            .palette
                                                                            .primary
                                                                            .main,
                                                                        0.6
                                                                    ),
                                                            },
                                                    },
                                            })}
                                        />
                                        <Toaster />
                                        {/* Global: driven by redux `isLanguageChanging`, so it
                      survives the language menu/drawer unmounting. */}
                                        <NoSsr>
                                            <LanguageChangeBackdrop />
                                        </NoSsr>
                                        <NoSsr>
                                            <ExpiredSubscriptionPrompt />
                                        </NoSsr>
                                        <Head>
                                            <title>{t('Loading...')}</title>
                                        </Head>

                                        <WrapperForApp
                                            pathname={router.pathname}
                                        >
                                            <NoSsr>
                                                <ScrollToTop />
                                                {router.pathname !==
                                                    '/maintenance' && (
                                                    <Navigation />
                                                )}
                                                <DynamicFavicon />
                                            </NoSsr>
                                            <Box
                                                sx={{
                                                    minHeight: '60vh',
                                                    // Spacer for the fixed navbar — one row now, so it is
                                                    // simply the navbar's height on every route.
                                                    mt: {
                                                        xs: usesMobilePageHeader(
                                                            router.pathname
                                                        )
                                                            ? 0
                                                            : `${NAVBAR_HEIGHT_MOBILE}px`,
                                                        md: `${NAVBAR_HEIGHT}px`,
                                                    },
                                                }}
                                            >
                                                <NoSsr>
                                                    {[
                                                        '/',
                                                        '/checkout',
                                                        '/chat',
                                                    ].includes(
                                                        router.pathname
                                                    ) ? null : (
                                                        <FloatingCardManagement
                                                            zoneid={zoneid}
                                                        />
                                                    )}
                                                </NoSsr>
                                                <NoSsr>
                                                    <SearchProductModal />
                                                </NoSsr>
                                                <NoSsr>
                                                    <GlobalAuthModal />
                                                </NoSsr>
                                                {getLayout(
                                                    <Component {...pageProps} />
                                                )}
                                            </Box>

                                            {viewFooter &&
                                                router.pathname !==
                                                    '/maintenance' && (
                                                    <>
                                                        <Footer
                                                            languageDirection={
                                                                settings.direction
                                                            }
                                                        />
                                                    </>
                                                )}
                                        </WrapperForApp>
                                    </ThemeProvider>
                                )}
                            </SettingsConsumer>
                        </SettingsProvider>
                        {/* </PersistGate> */}
                    </Provider>
                    {/* <ReactQueryDevtools initialIsOpen={false} position="bottom-right" /> */}
                </QueryClientProvider>
            </CacheProvider>
        </>
    )
}

export default App
