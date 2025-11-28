import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
import { useMemo } from 'react'
import { store } from '@/redux/store'

export default function PersistProvider({ children }) {
    // Memoize persistor so it doesn't recreate on each render
    const persistor = useMemo(() => persistStore(store), [])
    return (
        <PersistGate loading={null} persistor={persistor}>
            {children}
        </PersistGate>
    )
}
