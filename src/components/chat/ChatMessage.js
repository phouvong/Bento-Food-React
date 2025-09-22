import React, { useRef, useState } from 'react'
import { Stack, Typography, Box } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import { useTheme } from '@mui/material/styles'
import { useSelector } from 'react-redux'
import CustomImageContainer from '../CustomImageContainer'
import {
    BodyWrapper,
    CardWrapper,
    ChatMessageWrapper,
    CustomAvatar,
    TimeWrapper,
} from './Message.style'
import AttachmentBox from '@/components/chat/AttachmentBox'
import IconButton from '@mui/material/IconButton'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import PauseIcon from '@mui/icons-material/Pause'
import CustomModal from '@/components/custom-modal/CustomModal'
import CloseIcon from '@mui/icons-material/Close'
import moment from 'moment'

export const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp']
export const videoExtensions = ['mp4', 'avi', 'mov', 'wmv']
export const documentExtensions = ['pdf']
export const getFileExtension = (url) => {
    const parts = url?.split('.')
    return parts?.length > 1 ? parts.pop().toLowerCase() : ''
}

const ChatMessage = (props) => {
    const theme = useTheme()
    const {
        body,
        createdAt,
        messgageData,
        authorAvatar,
        conversationData,
        image,
        handleImageOnClick,
        setAllImages,
    } = props

    const { global } = useSelector((state) => state.globalSettings)
    const languageDirection = localStorage.getItem('direction')
    const authorType = messgageData.sender_id //sender
    let userType, userImage, senderImage
    const videoRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [videoModal, setVideoModal] = useState(false)
    const [videoItem, setVideoItem] = useState(null)

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }
    const handlePlay = (item) => {
        setVideoItem(item)
        setVideoModal(true)
    }

    const handleFullscreen = () => {
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen()
            } else if (videoRef.current.webkitRequestFullscreen) {
                /* Safari */
                videoRef.current.webkitRequestFullscreen()
            } else if (videoRef.current.msRequestFullscreen) {
                /* IE11 */
                videoRef.current.msRequestFullscreen()
            }
        }
    }

    const checkFileType = (url) => {
        const extension = getFileExtension(url)
        if (imageExtensions.includes(extension)) {
            return 'image'
        } else if (videoExtensions.includes(extension)) {
            return 'video'
        } else if (documentExtensions.includes(extension)) {
            return 'document'
        } else {
            return 'unknown'
        }
    }

    const receiverImageUrl = () => {
        if (conversationData?.conversation?.receiver_type === 'vendor') {
            return global?.base_urls?.restaurant_image_url
        }
        if (conversationData?.conversation?.receiver_type === 'delivery_man') {
            return global?.base_urls?.delivery_man_image_url
        } else {
            return global?.base_urls?.business_logo_url
        }
    }

    const customerImageUrl = global?.base_urls?.customer_image_url

    if (conversationData?.conversation?.sender_type === 'customer') {
        userType = conversationData?.conversation.sender_id
        userImage =
            conversationData?.conversation?.receiver_type === 'admin'
                ? global?.logo_full_url
                : conversationData?.conversation?.receiver?.image_full_url
        senderImage = conversationData?.conversation?.sender?.image_full_url
    } else {
        userType = conversationData?.conversation?.receiver?.id
        userImage =
            conversationData?.conversation?.receiver_type === 'admin'
                ? global?.logo_full_url
                : conversationData?.conversation?.sender?.image_full_url
        senderImage = conversationData?.conversation?.receiver?.image_full_url
    }
    const handleClick = (url) => {
        window.open(url, '_blank')
    }

    return (
        <ChatMessageWrapper
            authorType={authorType}
            userType={userType}
            languageDirection={languageDirection}
        >
            <CustomAvatar
                src={authorType === userType ? senderImage : userImage}
                authorType={authorType}
                userType={userType}
            />
            <BodyWrapper authorType={authorType} userType={userType}>
                <Stack
                    direction="row"
                    width="130px"
                    gap="10px"
                    justifyContent={
                        authorType === userType ? 'flex-end' : 'flex-start'
                    }
                    marginInlineStart={authorType === userType ? 'auto' : ''}
                    flexWrap="wrap"
                >
                    {image?.slice(0, 4).map((item, index) => {
                        const fileType = checkFileType(item)
                        if (fileType === 'image' && index < 3) {
                            return (
                                <Box
                                    key={item}
                                    sx={{
                                        cursor: 'pointer',
                                        borderRadius: '10px',
                                        width: 'calc(50% - 8px)',
                                        display: 'inline-flex',
                                    }}
                                    onClick={() =>
                                        handleImageOnClick(item, image)
                                    }
                                >
                                    <CustomImageContainer
                                        src={item}
                                        width="60px"
                                        height="60px"
                                        objectFit="cover"
                                        borderRadius=".5rem"
                                    />
                                </Box>
                            )
                        } else if (fileType === 'image' && index === 3) {
                            const remainingImagesCount = image.length - 3
                            return (
                                <Box
                                    key={item}
                                    sx={{
                                        cursor: 'pointer',
                                        borderRadius: '10px',
                                        width: 'calc(50% - 8px)',
                                        display: 'inline-flex',
                                        position: 'relative',
                                    }}
                                    onClick={() =>
                                        handleImageOnClick(item, image)
                                    }
                                >
                                    <CustomImageContainer
                                        src={item}
                                        width="60px"
                                        height="60px"
                                        objectFit="cover"
                                        borderRadius=".5rem"
                                    />
                                    {remainingImagesCount > 0 && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                backgroundColor:
                                                    'rgba(0, 0, 0, 0.5)',
                                                color: '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '10px',
                                            }}
                                        >
                                            +{remainingImagesCount}
                                        </Box>
                                    )}
                                </Box>
                            )
                        } else if (fileType === 'video') {
                            return (
                                <Box
                                    key={item}
                                    width="100%"
                                    sx={{ position: 'relative' }}
                                >
                                    <video
                                        style={{
                                            width: '100%',
                                            borderRadius: '.5rem',
                                        }}
                                        preload="metadata"
                                    >
                                        <source src={item} type="video/mp4" />
                                        Your browser does not support the video
                                        tag.
                                    </video>

                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            display: 'flex',
                                            gap: '10px',
                                        }}
                                    >
                                        <IconButton
                                            onClick={() => handlePlay(item)}
                                            sx={{
                                                backgroundColor:
                                                    'rgba(0, 0, 0, 0.5)',
                                            }}
                                        >
                                            <PlayArrowIcon
                                                sx={{ color: '#fff' }}
                                            />
                                        </IconButton>
                                    </Box>
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            right: '2%',
                                            bottom: '10%',
                                            display: 'flex',
                                        }}
                                    >
                                        <FullscreenIcon
                                            onClick={handleFullscreen}
                                            sx={{
                                                color: 'rgba(0, 0, 0, 0.5)',
                                                cursor: 'pointer',
                                            }}
                                        />
                                    </Box>
                                </Box>
                            )
                        } else if (fileType === 'document') {
                            return (
                                <Stack
                                    key={item}
                                    onClick={() => handleClick(item)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <AttachmentBox
                                        item={{
                                            name: `attachment_${index + 1}.pdf`,
                                            size: 0,
                                        }}
                                        removeImage={null}
                                        view
                                    />
                                </Stack>
                            )
                        } else if (fileType === 'unknown') {
                            return (
                                <Typography key={item} variant="body2">
                                    Unsupported file type
                                </Typography>
                            )
                        }
                    })}
                </Stack>
                {body && (
                    <CardWrapper authorType={authorType} userType={userType}>
                        <Typography
                            color={
                                authorType === userType
                                    ? theme.palette.whiteContainer.main
                                    : theme.palette.neutral[1000]
                            }
                            align={authorType === userType ? 'right' : 'left'}
                            fontSize="13px"
                        >
                            {body}
                        </Typography>
                    </CardWrapper>
                )}
                <TimeWrapper>
                    {authorType === userType && (
                        <CheckIcon
                            fontSize="14px"
                            style={{
                                color:
                                    messgageData.is_seen === 0
                                        ? theme.palette.primary.main
                                        : 'green',
                            }}
                        />
                    )}
                    <Typography color="textSecondary" noWrap variant="caption">
                        {moment(createdAt).format('h:mm A')}
                    </Typography>
                </TimeWrapper>
            </BodyWrapper>
            <CustomModal
                openModal={videoModal}
                setModalOpen={() => setVideoModal(false)}
                maxWidth="400px"
                bgColor="none"
            >
                <Box width="100%" sx={{ position: 'relative' }}>
                    <button
                        onClick={() => setVideoModal(false)}
                        className="closebtn"
                        style={{
                            position: 'absolute',
                            top: '-7%',
                            right: '-7%',
                            height: '22px',
                            width: '22px',
                            display: 'inline-flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <CloseIcon sx={{ fontSize: '16px' }} />
                    </button>
                    <video
                        ref={videoRef}
                        style={{
                            width: '100%',
                            borderRadius: '.5rem',
                        }}
                        preload="metadata"
                        controls
                    >
                        <source src={videoItem} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            display: 'flex',
                            gap: '10px',
                        }}
                    >
                        <IconButton
                            onClick={() => handlePlayPause()}
                            sx={{
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            }}
                        >
                            {isPlaying ? (
                                <PauseIcon sx={{ color: '#fff' }} />
                            ) : (
                                <PlayArrowIcon sx={{ color: '#fff' }} />
                            )}
                        </IconButton>
                    </Box>
                    <Box
                        sx={{
                            position: 'absolute',
                            // top: '50%',
                            right: '2%',
                            bottom: '10%',

                            //transform: 'translate(-50%, -50%)',
                            display: 'flex',
                            // gap: '10px'
                        }}
                    >
                        <FullscreenIcon
                            onClick={handleFullscreen}
                            sx={{
                                color: 'rgba(0, 0, 0, 0.5)',
                                cursor: 'pointer',
                            }}
                        />
                    </Box>
                </Box>
            </CustomModal>
        </ChatMessageWrapper>
    )
}

export default ChatMessage
