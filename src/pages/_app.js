// pages/_app.js or similar file

import { useEffect, useState, useMemo } from 'react'
import Head from 'next/head'
import Router, { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import nProgress from 'nprogress'
import { Provider } from 'react-redux'
import { CacheProvider } from '@emotion/react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Box } from '@mui/material'
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
import ScrollToTop from '@/components/scroll-top/ScrollToTop'
import DynamicFavicon from '@/components/favicon/DynamicFavicon'
import FloatingCardManagement from '@/components/floating-cart/FloatingCardManagement'

import '@/language/i18n'
import i18n, { t } from 'i18next'
import '@/styles/global.css'
import '@/styles/nprogress.css'

const Footer = dynamic(() => import('@/components/footer/Footer'), {
    ssr: false,
})

Router.events.on('routeChangeStart', nProgress.start)
Router.events.on('routeChangeError', nProgress.done)
Router.events.on('routeChangeComplete', nProgress.done)

const clientSideEmotionCache = createEmotionCache()
const queryClient = new QueryClient()
const persistor = persistStore(store)

const App = ({ Component, pageProps, emotionCache = clientSideEmotionCache }) => {
    const router = useRouter()
    const [zoneid, setZoneid] = useState(undefined)
    const [viewFooter, setViewFooter] = useState(false)

    const getLayout = Component.getLayout ?? ((page) => page)

    let storedZoneId = undefined;
    if (typeof window !== 'undefined') {
        storedZoneId = localStorage.getItem('zoneid')
    }

    useEffect(() => {
        const storedLang = localStorage.getItem('language')
        const browserLang = i18n.language.toLowerCase()

        if (!storedLang) {
            localStorage.setItem('language', browserLang)
        }

        i18n.changeLanguage(storedLang || browserLang)


        if (storedZoneId) setZoneid(JSON.parse(storedZoneId))

        const storedVersion = localStorage.getItem('appVersion')
        if (storedVersion !== process.env.NEXT_PUBLIC_SITE_VERSION) {
            localStorage.clear()
            localStorage.setItem('appVersion', process.env.NEXT_PUBLIC_SITE_VERSION)
            router.replace('/')
        }

        setViewFooter(true)
    }, [router])

    return (
        <CacheProvider value={emotionCache}>
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                        <SettingsProvider>
                            <SettingsConsumer>
                                {({ settings }) => (
                                    <ThemeProvider
                                        theme={createTheme({
                                            direction: settings.direction,
                                            responsiveFontSizes: settings.responsiveFontSizes,
                                            mode: settings.theme,
                                        })}
                                    >
                                        <CssBaseline />
                                        <Toaster />
                                        <Head>
                                            <title>{t('Loading...')}</title>
                                        </Head>

                                        <WrapperForApp pathname={router.pathname}>
                                            <ScrollToTop />
                                            {router.pathname !== '/maintenance' && <Navigation />}
                                            <DynamicFavicon />

                                            <Box
                                                sx={{
                                                    minHeight: '100vh',
                                                    // mt: '64px',
                                                    mt: {
                                                        xs: router.pathname === '/home' ? '2.5rem' : '3.5rem',
                                                        md:
                                                            router.pathname === '/'
                                                                ? storedZoneId
                                                                    ? '113px'
                                                                    : '64px'
                                                                : '4rem',
                                                    },
                                                }}
                                            >
                                                {['/', '/checkout', '/chat'].includes(router.pathname) ? null : (
                                                    <FloatingCardManagement zoneid={zoneid} />
                                                )}
                                                {getLayout(<Component {...pageProps} />)}
                                            </Box>

                                            {viewFooter && router.pathname !== '/maintenance' && (
                                                <Footer languageDirection={settings.direction} />
                                            )}
                                        </WrapperForApp>
                                    </ThemeProvider>
                                )}
                            </SettingsConsumer>
                        </SettingsProvider>
                    </PersistGate>
                </Provider>
                <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
            </QueryClientProvider>
        </CacheProvider>
    )
}

export default App