import React, { useRef, useState } from 'react'
import {
    TextField,
    Box,
    Tooltip,
    IconButton,
    styled,
    InputAdornment,
    Stack,
} from '@mui/material'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import Picker from 'emoji-picker-react'
import { toast } from 'react-hot-toast'
import { t } from 'i18next'
import ChatImage from './ChatImage'
import useMediaQuery from '@mui/material/useMediaQuery'
import AttachmentIcon from '@mui/icons-material/Attachment'

const CssTextField = styled(TextField)(({ theme }) => ({
    '& label.Mui-focused': {
        color: theme.palette.neutral[300],
        background: theme.palette.neutral[100],
    },
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
    },
    '& .MuiOutlinedInput-root': {
        border: `1px solid ${theme.palette.neutral[300]}`,
        fontSize: '14px',
        borderRadius: '24px',
        [theme.breakpoints.down('sm')]: {
            fontSize: '10px',
        },
    },
}))

const ChatMessageAdd = ({ onSend }) => {
    const [openEmoji, setOpenEmoji] = useState(false)
    const xSmall = useMediaQuery((theme) => theme.breakpoints.down('md'))
    const [body, setBody] = useState({
        text: '',
        file: [],
    })
    const languageDirection = localStorage.getItem('direction')
    const fileInputRef = useRef(null)
    const attachmentInputRef = useRef(null)

    const handleChange = (event) => {
        setBody({ ...body, text: event.target.value })
    }

    const onEmojiClick = (event, emojiObject) => {
        setBody({ ...body, text: body.text + event?.emoji })
        setOpenEmoji(false)
    }

    const handleSend = () => {
        if (!body) {
            toast.error(t('write something'))
        }
        onSend?.(body)
        setBody({ text: '', file: [] })
    }

    const handleAttach = () => {
        fileInputRef.current.click()
    }

    const handleAttachment = () => {
        attachmentInputRef.current.click()
    }

    const handleKeyUp = (event) => {
        if (event.code === 'Enter' && !event.shiftKey) {
            handleSend()
        }
    }

    const handleFileOnChange = (e) => {
        setBody({ ...body, file: [...body.file, ...e.target.files] })
        fileInputRef.current.value = null // Reset the input value
    }

    const handleChangeAttachment = (e) => {
        setBody({ ...body, file: [...body.file, ...e.target.files] })
        attachmentInputRef.current.value = null // Reset the input value
    }

    const removeImage = (name) => {
        const tempData = body.file.filter((item) => item.name !== name)
        setBody({ text: body.text, file: tempData })
    }

    return (
        <Box
            sx={{
                position: 'relative',
            }}
        >
            <Box
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    flexShrink: 0,
                    p: 1.5,

                    boxShadow: '0px 0px 1px rgba(0, 0, 0, 0.25)',
                    margin: '10px',
                }}
            >
                <Box sx={{ position: 'absolute', bottom: '80%' }}>
                    {openEmoji && (
                        <Picker
                            pickerStyle={{ width: '100%' }}
                            onEmojiClick={onEmojiClick}
                        />
                    )}
                </Box>
                <Stack direction="row" sx={{ paddingInlineEnd: '.7rem' }}>
                    <Tooltip title={t('Image')}>
                        <IconButton
                            sx={{ padding: '2px' }}
                            onClick={handleAttach}
                        >
                            <InsertPhotoIcon
                                fontSize="medium"
                                color="primary"
                            />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('Attachment')}>
                        <IconButton
                            sx={{ padding: '2px' }}
                            onClick={handleAttachment}
                        >
                            <AttachmentIcon fontSize="medium" color="primary" />
                        </IconButton>
                    </Tooltip>
                </Stack>
                <CssTextField
                    fullWidth
                    onChange={handleChange}
                    onKeyUp={handleKeyUp}
                    placeholder={t('Start a new message')}
                    value={body.text}
                    size="small"
                    multiline
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="start">
                                {!xSmall && (
                                    <InsertEmoticonIcon
                                        color="primary"
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() =>
                                            setOpenEmoji(
                                                (prevState) => !prevState
                                            )
                                        }
                                    />
                                )}
                            </InputAdornment>
                        ),
                    }}
                />

                <Box
                    sx={{
                        alignItems: 'center',
                        display: 'flex',
                        m: -2,
                        marginInlineStart: languageDirection !== 'rtl' && 2,
                        marginInlineEnd: languageDirection === 'rtl' && '1rem',
                    }}
                >
                    <Tooltip title="Send">
                        <IconButton
                            disabled={
                                body.text === '' && body.file.length === 0
                            }
                            onClick={handleSend}
                            sx={{
                                transform:
                                    languageDirection === 'rtl' &&
                                    'rotate(180deg)',
                            }}
                        >
                            <SendOutlinedIcon
                                fontSize="medium"
                                color="primary"
                            />
                        </IconButton>
                    </Tooltip>
                </Box>
                <input
                    hidden
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileOnChange}
                />
                <input
                    ref={attachmentInputRef}
                    hidden
                    multiple
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.mp4,.avi,.mov,.wmv,.flv,.mkv"
                    onChange={handleChangeAttachment} // Corrected from onClick to onChange
                />
            </Box>
            {body.file.length > 0 && (
                <ChatImage body={body} removeImage={removeImage} />
            )}
        </Box>
    )
}

export default ChatMessageAdd
