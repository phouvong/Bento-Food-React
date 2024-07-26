import { WrapperForApp } from '@/App.style'
import { SettingsConsumer, SettingsProvider } from '@/contexts/settings-context'
import { store } from '@/redux/store'
import { CacheProvider } from '@emotion/react'
import { Box } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import i18n, { t } from 'i18next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Router, { useRouter } from 'next/router'
import nProgress from 'nprogress'
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { Provider } from 'react-redux'
import { persistStore } from 'redux-persist'
import DynamicFavicon from '../components/favicon/DynamicFavicon'
import FloatingCardManagement from '../components/floating-cart/FloatingCardManagement'
import Navigation from '../components/navbar'
import ScrollToTop from '../components/scroll-top/ScrollToTop'
import '../language/i18n'
import '../styles/global.css'
import '../styles/nprogress.css'
import { createTheme } from '../theme/index'
import createEmotionCache from '../utils/create-emotion-cache'

Router.events.on('routeChangeStart', nProgress.start)
Router.events.on('routeChangeError', nProgress.done)
Router.events.on('routeChangeComplete', nProgress.done)
export const currentVersion = process.env.NEXT_PUBLIC_SITE_VERSION
const clientSideEmotionCache = createEmotionCache()

function App({ Component, pageProps, emotionCache = clientSideEmotionCache }) {
    const getLayout = Component.getLayout ?? ((page) => page)
    const queryClient = new QueryClient()
    const router = useRouter()
    const [showSplashScreen, setShowSplashScreen] = useState(true)
    const [viewFooter, setViewFooter] = useState(false)
    const Footer = dynamic(() => import('../components/footer/Footer'), {
        ssr: false,
    })

    useEffect(() => {
        setShowSplashScreen(false)
    }, [router.isReady])
    useEffect(() => {
        const userLanguage = localStorage.getItem('language')
        if (!userLanguage) {
            localStorage.setItem('language', i18n.language)
        }
    }, [])

    useEffect(() => {
        const userLanguage = localStorage.getItem('language')
        if (userLanguage) {
            i18n.changeLanguage(userLanguage?.toLowerCase())
        }
        if (!userLanguage) {
            i18n.changeLanguage(i18n.language)
        }
        setViewFooter(true)
    }, [])

    let persistor = persistStore(store)

    let zoneid = undefined
    if (typeof window !== 'undefined') {
        zoneid = JSON.parse(localStorage.getItem('zoneid'))
    }

    useEffect(() => {
        const storedVersion = localStorage.getItem('appVersion')
        if (storedVersion !== currentVersion) {
            localStorage.clear()
            localStorage.setItem('appVersion', currentVersion)
            router.push('/')
            window.location.reload()
        }
    }, [])

    return (
        <CacheProvider value={emotionCache}>
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <SettingsProvider>
                        <SettingsConsumer>
                            {(value) => (
                                <ThemeProvider
                                    theme={createTheme({
                                        direction: value.settings.direction,
                                        responsiveFontSizes:
                                            value.settings.responsiveFontSizes,
                                        mode: value.settings.theme,
                                    })}
                                >
                                    <CssBaseline />
                                    <Toaster />
                                    <Head>
                                        <title>{t('Loading...')}</title>
                                    </Head>
                                    <WrapperForApp>
                                        <ScrollToTop />
                                        <Navigation />
                                        <DynamicFavicon />

                                        <Box
                                            sx={{
                                                height: '100%',
                                                mt: {
                                                    xs:
                                                        router.pathname ===
                                                        '/home'
                                                            ? '2.5rem'
                                                            : '2rem',
                                                    md:
                                                        router.pathname === '/'
                                                            ? zoneid
                                                                ? '4rem'
                                                                : '2rem'
                                                            : '4rem',
                                                },
                                            }}
                                        >
                                            {router.pathname !== '/' &&
                                                router.pathname !==
                                                    '/checkout' &&
                                                router.pathname !== '/chat' && (
                                                    <FloatingCardManagement
                                                        zoneid={zoneid}
                                                    />
                                                )}
                                            {getLayout(
                                                <Component {...pageProps} />
                                            )}
                                        </Box>
                                        {viewFooter && (
                                            <Footer
                                                languageDirection={
                                                    value?.settings?.direction
                                                }
                                            />
                                        )}
                                    </WrapperForApp>
                                </ThemeProvider>
                            )}
                        </SettingsConsumer>
                    </SettingsProvider>
                </Provider>
                <ReactQueryDevtools
                    initialIsOpen={false}
                    position="bottom-right"
                />
            </QueryClientProvider>
        </CacheProvider>
    )
}

export default App
