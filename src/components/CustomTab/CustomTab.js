import React from 'react'
import { TabContext, TabList } from '@mui/lab'
import { TabCustom } from './CustomTab.style'
import { useRouter } from 'next/router'

const CustomTab = ({ tabData, handleNavigate }) => {
    const router = useRouter()
    const handleRoute = (path) => {
        handleNavigate(path)
    }
    const activeRoute = (routeName, currentRoute) => {
        return routeName === currentRoute
    }

    return (
        <>
            <TabContext>
                <TabList
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="scrollable auto tabs example"
                >
                    {tabData.map((menu) => {
                        return (
                            <TabCustom
                                onClick={() => handleRoute(menu.path)}
                                label={menu.label}
                                selected={activeRoute(
                                    menu.path,
                                    router.pathname
                                )}
                            />
                        )
                    })}
                </TabList>
            </TabContext>
        </>
    )
}
export default CustomTab
