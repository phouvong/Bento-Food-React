import React, { useEffect, useRef, useState } from 'react'
import ReactPlayer from 'react-player'
import { Stack, IconButton, useTheme } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import ReplayIcon from '@mui/icons-material/Replay'

const SCROLL_RESUME_DELAY_MS = 150

const VideoPlayerWithCenteredControl = ({
    video,
    playing,
    setPlaying,
    ended,
    setEnded,
    height,
    isMargin,
}) => {
    const playerRef = useRef(null)
    const theme = useTheme()
    const [muted, setMuted] = useState(true)
    const scrollPausedRef = useRef(false)

    useEffect(() => {
        if (!playing) return

        let ticking = false
        let resumeTimeout = null

        const pauseForScroll = () => {
            const internalPlayer = playerRef.current?.getInternalPlayer?.()
            if (internalPlayer?.pause && !internalPlayer.paused) {
                scrollPausedRef.current = true
                internalPlayer.pause()
            }
        }

        const resumeAfterScroll = () => {
            if (!scrollPausedRef.current) return
            scrollPausedRef.current = false
            playerRef.current?.getInternalPlayer?.()?.play?.()
                ?.catch?.(() => undefined)
        }

        const handleScroll = () => {
            if (!ticking) {
                ticking = true
                requestAnimationFrame(() => {
                    ticking = false
                    pauseForScroll()
                })
            }
            if (resumeTimeout) clearTimeout(resumeTimeout)
            resumeTimeout = setTimeout(
                resumeAfterScroll,
                SCROLL_RESUME_DELAY_MS
            )
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (resumeTimeout) clearTimeout(resumeTimeout)
            scrollPausedRef.current = false
        }
    }, [playing])

    const handlePlayPause = (e) => {
        e.stopPropagation()
        if (ended) {
            playerRef.current.seekTo(0)
            setEnded(false)
        }
        setPlaying(!playing)
    }
    const handleEnded = () => {
        setPlaying(false)
        setEnded(true)
    }
    const handlePauseVideo = () => {
        if (scrollPausedRef.current) return
        setPlaying(false)
    }
    const handlePlayVideo = () => {
        setPlaying(true)
    }
    if (video === '') {
        return null
    }

    return (
        <Stack
            sx={{
                position: 'relative',
                margin: isMargin && '0px 25px -110px',
                boxShadow: '0px 15px 30px rgba(150, 150, 154, 0.40)',
                borderRadius: '10px',
                overflow: 'hidden',
                height: height ?? '200px',
                backgroundColor: theme.palette.neutral[400],
                zIndex: 1,
            }}
        >
            <ReactPlayer
                ref={playerRef}
                url={
                    video ??
                    'https://www.youtube.com/watch?v=WVT6_xZ6jR4&list=PLLFMbDpKMZBzLpPBBj4JgpoMFWzc6OCxq&index=2'
                }
                width="100%"
                height="100%"
                playing={playing}
                onEnded={handleEnded}
                // Native controls consume pointer events over the whole video
                // surface, which blocks horizontal swipes on the ads slider
                // (mobile). The centered IconButton below is the control UI.
                controls={false}
                muted={true}
                onPause={handlePauseVideo}
                onPlay={handlePlayVideo}
                playsinline
                config={{
                    file: {
                        attributes: {
                            playsInline: true,
                            disablePictureInPicture: true,
                            preload: 'metadata',
                        },
                    },
                }}
            />
            <IconButton
                onClick={(e) => handlePlayPause(e)}
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: theme.palette.neutral[100],
                    '&:hover': {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.neutral[100],
                    },
                    color: theme.palette.neutral[500],
                }}
            >
                {ended ? (
                    <ReplayIcon sx={{ fontSize: '2rem' }} />
                ) : playing ? (
                    <PauseIcon sx={{ fontSize: '2rem' }} />
                ) : (
                    <PlayArrowIcon sx={{ fontSize: '2rem' }} />
                )}
            </IconButton>
        </Stack>
    )
}

export default VideoPlayerWithCenteredControl
