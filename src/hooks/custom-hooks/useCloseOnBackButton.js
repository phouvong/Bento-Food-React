import { useEffect, useRef } from 'react'
import Router from 'next/router'

const openEntries = []
let pendingReleaseTimer = null
let popStateBound = false
let routeEventsBound = false
let routeChanging = false

const handlePopState = () => {
    const entry = openEntries.pop()
    if (!entry) return
    entry.closedByBack = true
    entry.onCloseRef.current?.()
}

const bindPopState = () => {
    if (popStateBound || typeof window === 'undefined') return
    window.addEventListener('popstate', handlePopState)
    popStateBound = true
}

// A real page navigation (e.g. applying a filter that redirects) also
// unmounts the drawer, which would otherwise be mistaken for a manual close
// and trigger a synthetic history.back() that undoes the navigation.
const bindRouteEvents = () => {
    if (routeEventsBound) return
    const setRouteChanging = (val) => () => {
        routeChanging = val
    }
    Router.events.on('routeChangeStart', setRouteChanging(true))
    Router.events.on('routeChangeComplete', setRouteChanging(false))
    Router.events.on('routeChangeError', setRouteChanging(false))
    routeEventsBound = true
}

const acquireEntry = (entry) => {
    bindPopState()
    bindRouteEvents()
    if (pendingReleaseTimer !== null) {
        clearTimeout(pendingReleaseTimer)
        pendingReleaseTimer = null
    } else {
        window.history.pushState({ drawerOpen: true }, '')
    }
    openEntries.push(entry)
}

const releaseEntry = (entry, consumeHistory) => {
    const index = openEntries.indexOf(entry)
    if (index !== -1) openEntries.splice(index, 1)
    if (entry.closedByBack || !consumeHistory || routeChanging) return
    if (pendingReleaseTimer !== null) return
    pendingReleaseTimer = setTimeout(() => {
        pendingReleaseTimer = null
        window.history.back()
    }, 0)
}

const useCloseOnBackButton = (open, onClose) => {
    const onCloseRef = useRef(onClose)
    const isUnmountingRef = useRef(false)

    useEffect(() => {
        onCloseRef.current = onClose
    })

    useEffect(
        () => () => {
            isUnmountingRef.current = true
        },
        []
    )

    useEffect(() => {
        if (typeof window === 'undefined' || !open) return

        const entry = { onCloseRef, closedByBack: false }
        acquireEntry(entry)

        return () => releaseEntry(entry, !isUnmountingRef.current)
    }, [open])
}

export default useCloseOnBackButton
