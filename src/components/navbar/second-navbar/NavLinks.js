import React, { useState } from 'react'
import { Stack } from '@mui/material'
import { NavLinkStyle } from '../Navbar.style'
import NavCatagory from '../NavCatagory'
import NavResturant from '../NavResturant'
import NavCuisines from '../NavCuisines'
import { setHandleHomePage } from '@/redux/slices/global'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'

const NavLinks = ({ zoneid, t, languageDirection }) => {
    const router = useRouter()
    const dispatch = useDispatch()
    const [openCategoryModal, setCategoryModal] = useState(false)
    const [openRestaurantModal, setRestaurantModal] = useState(false)
    const handleClick = () => {
        router.push('/home')
        dispatch(setHandleHomePage(false))
    }

    const isHomeActive =
        router?.pathname === '/home' || router?.pathname === '/'

    return (
        <Stack direction="row" spacing="2px" alignItems="center">

            <>
                <NavLinkStyle
                    onClick={handleClick}
                    underline="none"
                    languageDirection={languageDirection}
                    active={isHomeActive}
                    sx={{ cursor: 'pointer' }}
                >
                    {t('Home')}
                </NavLinkStyle>

                <NavCatagory
                    openModal={openCategoryModal}
                    setModal={setCategoryModal}
                    setRestaurantModal={setRestaurantModal}
                    languageDirection={languageDirection}
                />
                <NavCuisines
                    openModal={openCategoryModal}
                    setModal={setCategoryModal}
                    setRestaurantModal={setRestaurantModal}
                    languageDirection={languageDirection}
                />

                <NavResturant
                    openModal={openRestaurantModal}
                    setModal={setRestaurantModal}
                    zoneid={zoneid}
                    languageDirection={languageDirection}
                />
            </>

        </Stack>
    )
}

NavLinks.propTypes = {}

export default NavLinks
