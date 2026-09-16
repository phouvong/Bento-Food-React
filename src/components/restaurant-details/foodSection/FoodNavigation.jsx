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
    // String() guards against category_id (from a URL query param, always a
    // string) vs. menu.id (from the API, usually a number) type mismatches.
    const isAllActive =
        String(category_id) === String(allId) ||
        String(category_id) === String(id)

    useEffect(() => {
        const container = tabBarRef.current
        const activeBtn = activeBtnRef.current
        if (!container || !activeBtn) return
        container.scrollTo({
            left: activeBtn.offsetLeft - container.offsetLeft,
            behavior: 'smooth',
        })
    }, [category_id])

    // A single sub-category has nothing to switch between, so there's no
    // "All" tab — but some items are assigned straight to the parent
    // category with no sub-category, so fetching must still go through the
    // parent id/allId to include those. The lone tab is shown as selected
    // and its click is a no-op on the actual fetched id.
    const showAllTab = catetoryMenus?.length > 1
    const onlySubCategory = catetoryMenus?.length === 1 ? catetoryMenus[0] : null

    return (
        <RTL direction={languageDirection}>
            <TabBar role="tablist" ref={tabBarRef}>
                {showAllTab && (
                    <TabBtn
                        role="tab"
                        type="button"
                        ref={isAllActive ? activeBtnRef : null}
                        isactive={isAllActive ? 'true' : 'false'}
                        onClick={() => handleCategoryId(id)}
                    >
                        {t('All')}
                    </TabBtn>
                )}
                {onlySubCategory && (
                    <TabBtn
                        role="tab"
                        type="button"
                        ref={activeBtnRef}
                        isactive="true"
                        onClick={() => handleCategoryId(id)}
                    >
                        {onlySubCategory.name}
                    </TabBtn>
                )}
                {showAllTab &&
                    catetoryMenus.map((menu) => {
                        // Sub-categories are the same "categories" resource
                        // as top-level ones — prefer their slug (readable
                        // in the URL) and fall back to id only if a menu
                        // has none.
                        const menuIdentifier = menu.slug || menu.id
                        const isMenuActive =
                            String(category_id) === String(menuIdentifier)
                        return (
                            <TabBtn
                                key={menu.id}
                                role="tab"
                                type="button"
                                ref={isMenuActive ? activeBtnRef : null}
                                isactive={isMenuActive ? 'true' : 'false'}
                                onClick={() =>
                                    handleCategoryId(menuIdentifier)
                                }
                            >
                                {menu.name}
                            </TabBtn>
                        )
                    })}
            </TabBar>
        </RTL>
    )
}

export default FoodNavigation
