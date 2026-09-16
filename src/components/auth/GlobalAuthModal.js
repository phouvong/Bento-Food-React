import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useQueryClient } from 'react-query'
import AuthModal from '@/components/auth'
import { closeAuthModal, setAuthModalFor } from '@/redux/slices/authModal'

const GlobalAuthModal = () => {
    const dispatch = useDispatch()
    const queryClient = useQueryClient()
    const { isOpen, modalFor } = useSelector((state) => state.authModal)

    const cartListRefetch = () => queryClient.invalidateQueries('cart-item')

    return (
        <AuthModal
            open={isOpen}
            modalFor={modalFor}
            setModalFor={(value) => dispatch(setAuthModalFor(value))}
            handleClose={() => dispatch(closeAuthModal())}
            cartListRefetch={cartListRefetch}
        />
    )
}

export default GlobalAuthModal
