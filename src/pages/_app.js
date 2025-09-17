import { useEffect, useState } from 'react'
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

const Footer = dynamic(() => import('@/components/footer/Footer'), { ssr: false })

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
  const [analyticsConfig, setAnalyticsConfig] = useState({})

  const getLayout = Component.getLayout ?? ((page) => page)

  // Fetch analytics config from backend
  useEffect(() => {
    const fetchConfig = async () => {
      if (!process.env.NEXT_PUBLIC_BASE_URL) return
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/config/get-analytic-scripts`, {
          headers: {
            'X-software-id': 33571750,
            'X-server': 'server',
            origin: process.env.NEXT_CLIENT_HOST_URL || 'http://localhost:3000',
          },
        })
        const data = await res.json()
        const configObj = {}
        if (Array.isArray(data)) {
          data.forEach((item) => {
            if (item.type && item.script_id) configObj[item.type] = item.script_id
          })
        }
        setAnalyticsConfig(configObj)
      } catch (e) {
        console.error('Failed to fetch analytics config:', e)
      }
    }
    fetchConfig()
  }, [])

  // Load analytics scripts dynamically
  useEffect(() => {
    const c = analyticsConfig
    if (!c) return
    console.log({c});
    

    // Helper function to inject script
    const injectScript = (id, content, async = false) => {
      const s = document.createElement('script')
      if (async) s.async = true
      s.innerHTML = content
      document.head.appendChild(s)
    }

    // GTM
    if (c.google_tag_manager) {
      injectScript('gtm', `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${c.google_tag_manager}');
      `)
    }

    // GA4
    if (c.google_analytics) {
      const gaScript = document.createElement('script')
      gaScript.async = true
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${c.google_analytics}`
      document.head.appendChild(gaScript)

      injectScript('ga-init', `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config','${c.google_analytics}');
      `)
    }

    // Meta Pixel (Facebook)
    if (c.facebook_pixel) {
      injectScript('fb-pixel', `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(s)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init','${c.facebook_pixel}');
        fbq('track','PageView');
      `)
    }

    // LinkedIn Insight
    if (c.linkedin_insight_tag) {
      injectScript('linkedin', `
        _linkedin_partner_id = "${c.linkedin_insight_tag}";
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        window._linkedin_data_partner_ids.push(_linkedin_partner_id);
      `, true)
    }

    // TikTok Pixel
    if (c.tiktok_pixel) {
      injectScript('tiktok', `
        !function (w,d,t) {
          w[t] = w[t] || [];
          w[t].push({'ttq.load': '${c.tiktok_pixel}','ttq.track': 'PageView'});
          var s = d.createElement('script');
          s.src = 'https://analytics.tiktok.com/i18n/pixel/sdk.js?sdkid=${c.tiktok_pixel}';
          s.async = true;
          var e = d.getElementsByTagName('script')[0];
          e.parentNode.insertBefore(s,e);
        }(window, document, 'ttq');
      `)
    }

    // Snapchat Pixel
    if (c.snapchat_pixel) {
      injectScript('snapchat', `
        (function(e,t,n,c,r,a,i){e.tta=n,e.ttaQueue=e.ttaQueue||[],
        e.ttaConfig={pixelId:"${c.snapchat_pixel}",events:"page_view"},
        e.ttaQueue.push({event:"page_view",parameters:{}});
        var s=t.createElement(n);s.async=!0;s.src="https://tr.snapchat.com/tr.js";
        var o=t.getElementsByTagName(n)[0];o.parentNode.insertBefore(s,o)})
        (window,document,"script");
      `)
    }

    // X (Twitter) Pixel
    if (c.x_pixel) {
      injectScript('twitter', `
        !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
        },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
        a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
        twq('config','${c.x_pixel}');
        twq('track','PageView');
      `)
    }

    // Pinterest Pixel
    if (c.pinterest_pixel) {
      injectScript('pinterest', `
        !function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(
        Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");
        t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
        pintrk('load', '${c.pinterest_pixel}');
        pintrk('page');
      `)
    }

    // Extra scripts from backend
    if (c.head_script) injectScript('head_extra', c.head_script)
    if (c.body_script) {
      const div = document.createElement('div')
      div.innerHTML = c.body_script
      document.body.appendChild(div)
    }
  }, [analyticsConfig])

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
                          mt: {
                            xs: router.pathname === '/home' ? '2.5rem' : '3.5rem',
                            md: router.pathname === '/'
                              ? zoneid
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
