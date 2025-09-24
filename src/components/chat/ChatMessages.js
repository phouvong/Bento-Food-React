import React, { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import ChatMessage, { getFileExtension, imageExtensions } from './ChatMessage'
import CustomModal from '../custom-modal/CustomModal'
import { ScrollToBottom } from './ChatView'
import ImagePreviewOnModal from '../image-preview-on-modal'

import 'simplebar-react/dist/simplebar.min.css'

const ChatMessages = ({ conversationData, scrollBottom }) => {
    const [messagesData, setMessagesData] = useState([])
    const [isMessage, setIsMessage] = useState(false)
    const [conversationDetails, setConversationDetails] = useState()
    const [openModal, setModalOpen] = useState(false)
    const [modalImage, setModalImage] = useState(null)
    const [AllImages, setAllImages] = useState([])
    const messagesEndRef = useRef(null)
    useEffect(() => {
        let a = []
        if (conversationData.length > 0) {
            conversationData.forEach((page) => {
                setConversationDetails(page)
                page?.messages?.forEach((item) => a.push(item))
            })
            setMessagesData(a)
            setIsMessage(true)
        }
    }, [conversationData])
    useEffect(() => {
        modalImage && setModalOpen(true)
    }, [modalImage])

    const handleImageOnClick = (value, images) => {
        const getOnlyImage = images?.filter((item) =>
            imageExtensions?.includes(getFileExtension(item))
        )
        setAllImages(getOnlyImage)
        setModalImage(value)
    }
    const handleModalClose = (value) => {
        setModalOpen(value)
        setModalImage(null)
    }

    return (
        <Box sx={{ p: 2 }}>
            <>
                {messagesData
                    ?.map((item, index) => (
                        <ChatMessage
                            key={index}
                            body={item?.message}
                            messgageData={item && item}
                            createdAt={item?.created_at}
                            conversationData={conversationDetails}
                            image={item?.file_full_url}
                            handleImageOnClick={handleImageOnClick}
                            setAllImages={setAllImages}
                        />
                    ))
                    .reverse()}
                <CustomModal
                    openModal={openModal}
                    setModalOpen={handleModalClose}
                    maxWidth="400px"
                    bgColor="none"
                >
                    <ImagePreviewOnModal
                        modalImage={modalImage}
                        handleModalClose={handleModalClose}
                        AllImages={AllImages}
                    />
                </CustomModal>
                {scrollBottom && <ScrollToBottom />}
            </>
        </Box>
    )
}

ChatMessages.propTypes = {}

export default ChatMessages
