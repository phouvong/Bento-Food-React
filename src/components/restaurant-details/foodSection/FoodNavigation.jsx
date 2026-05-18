import { Stack, alpha, styled } from '@mui/material'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { RTL } from '../../RTL/RTL'

const TabBar = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    padding: 4,
    borderRadius: 999,
    border: `1px solid ${theme.palette.neutral[300]}`,
    backgroundColor: theme.palette.background.paper,
    flexShrink: 0,
    maxWidth: '100%',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
}))

const TabBtn = styled('button', {
    shouldForwardProp: (p) => p !== 'isactive',
})(({ theme, isactive }) => ({
    border: 'none',
    cursor: 'pointer',
    padding: '9px 18px',
    lineHeight: 1.2,
    borderRadius: 999,
    fontSize: 12.5,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    transition: 'all .18s ease',
    backgroundColor:
        isactive === 'true' ? theme.palette.primary.main : 'transparent',
    color:
        isactive === 'true'
            ? theme.palette.primary.contrastText
            : theme.palette.text.secondary,
    boxShadow:
        isactive === 'true'
            ? `0 2px 6px ${alpha(theme.palette.primary.main, 0.28)}`
            : 'none',
    '&:hover': isactive === 'true' ? {} : { color: theme.palette.primary.main },
}))

const FoodNavigation = ({
    catetoryMenus,
    setCategoryId,
    category_id,
    id,
    usein,
}) => {
    const { t } = useTranslation()
    const tabBarRef = useRef(null)
    const activeBtnRef = useRef(null)
    const handleCategoryId = (catId) => {
        setCategoryId(catId)
    }

    let languageDirection = undefined
    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }

    const allId = usein === 'restaurant' ? 0 : id
    const isAllActive = category_id === allId || category_id === id

    useEffect(() => {
        const container = tabBarRef.current
        const activeBtn = activeBtnRef.current
        if (!container || !activeBtn) return
        container.scrollTo({
            left: activeBtn.offsetLeft - container.offsetLeft,
            behavior: 'smooth',
        })
    }, [category_id])

    return (
        <RTL direction={languageDirection}>
            <TabBar role="tablist" ref={tabBarRef}>
                <TabBtn
                    role="tab"
                    type="button"
                    ref={isAllActive ? activeBtnRef : null}
                    isactive={isAllActive ? 'true' : 'false'}
                    onClick={() => handleCategoryId(id)}
                >
                    {t('All')}
                </TabBtn>
                {catetoryMenus?.length > 0 &&
                    catetoryMenus.map((menu) => (
                        <TabBtn
                            key={menu.id}
                            role="tab"
                            type="button"
                            ref={
                                category_id === menu.id ? activeBtnRef : null
                            }
                            isactive={
                                category_id === menu.id ? 'true' : 'false'
                            }
                            onClick={() => handleCategoryId(menu.id)}
                        >
                            {menu.name}
                        </TabBtn>
                    ))}
            </TabBar>
        </RTL>
    )
}

export default FoodNavigation
