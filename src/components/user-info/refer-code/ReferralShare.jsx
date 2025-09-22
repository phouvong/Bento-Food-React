import CustomModal from '@/components/custom-modal/CustomModal'
import { CustomToaster } from '@/components/custom-toaster/CustomToaster'
import { SliderCustom } from '@/styled-components/CustomStyles.style'
import { facebookAppId } from '@/utils/staticCredentials'
import CloseIcon from '@mui/icons-material/Close'
import ShareIcon from '@mui/icons-material/Share'
import {
    Button,
    ClickAwayListener,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import {
    EmailIcon,
    EmailShareButton,
    FacebookMessengerIcon,
    FacebookMessengerShareButton,
    LineIcon,
    LineShareButton,
    LinkedinIcon,
    LinkedinShareButton,
    LivejournalIcon,
    LivejournalShareButton,
    RedditIcon,
    RedditShareButton,
    TelegramIcon,
    TelegramShareButton,
    TumblrIcon,
    TumblrShareButton,
    TwitterIcon,
    TwitterShareButton,
    WhatsappIcon,
    WhatsappShareButton,
} from 'react-share'
import Slider from 'react-slick'
import {
    CodePreviewWrapper,
    ReferralShareBox,
    ShareButton,
} from './ReferralCode.style'
import { referralSettings } from './ReferralSettings'

const ReferralShare = ({ referralCode, configData, horizontal, size }) => {
    const [currentUrl, setCurrentUrl] = useState(null)
    const [open, setOpen] = useState(false)
    const [tooltipOpen, setTooltipOpen] = useState(false)
    const theme = useTheme()
    const companyName = configData?.business_name
    const pinId = 'patwary6am'
    const shareUrl = `${t('Hey there welcome to')} ${companyName}! ${t(
        "If you're checking out"
    )} ${companyName} ${t(
        'for the first time, make sure to use the referral code'
    )} ${referralCode} ${t(
        "when you sign up. It's my way of welcoming you to this awesome e-commerce platform! Happy shopping on"
    )} ${companyName}! ${currentUrl}`
    const title = `${t('Hey there welcome to')} ${companyName}!`
    useEffect(() => {
        setCurrentUrl(
            window.location.origin + '?referral_earn_code=' + referralCode
        )
    }, [])
    const copyReferCode = async (text) => {
        if (typeof window !== undefined) {
            await window.navigator.clipboard.writeText(text)
        }
    }
    const handleTooltipClose = () => {
        setTooltipOpen(false)
    }
    const handleTooltipOpen = async (referralCode) => {
        setTooltipOpen(true)
        const code_url = `
        ${companyName}
        Referral code=${referralCode}
        ${window.location.origin}`
        await copyReferCode(code_url)
        CustomToaster('success', t('Referral Code Copied'))
    }

    return (
        <>
            <ReferralShareBox horizontal={horizontal}>
                <FacebookMessengerShareButton
                    url={shareUrl}
                    appId={facebookAppId}
                    quote={shareUrl}
                >
                    <FacebookMessengerIcon size={size ? size : 40} round />
                </FacebookMessengerShareButton>
                <TwitterShareButton url={shareUrl}>
                    <TwitterIcon size={size ? size : 40} round />
                </TwitterShareButton>
                <WhatsappShareButton
                    url={shareUrl}
                    separator=":: "
                    title={title}
                    quote={shareUrl}
                >
                    <WhatsappIcon size={size ? size : 40} round />
                </WhatsappShareButton>
                <LinkedinShareButton
                    title={title}
                    url={currentUrl}
                    source={currentUrl}
                    summary={shareUrl}
                >
                    <LinkedinIcon size={size ? size : 40} round />
                </LinkedinShareButton>
                <ShareButton size={`${size}px`} onClick={() => setOpen(true)}>
                    <ShareIcon
                        sx={{
                            fontSize: `${size - 12}px`,
                            color: theme.palette.info.main,
                        }}
                    />
                </ShareButton>
                <CustomModal openModal={open} setModalOpen={setOpen}>
                    <Paper
                        sx={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: { xs: '350px', sm: '450px', md: '550px' },
                            p: '1.2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px',
                            padding: '40px',
                        }}
                    >
                        <IconButton
                            onClick={() => setOpen(false)}
                            sx={{ position: 'absolute', top: 10, right: 10 }}
                        >
                            <CloseIcon sx={{ fontSize: '22px' }} />
                        </IconButton>
                        <Typography fontSize="16px">{t('Share')}</Typography>
                        <SliderCustom nopadding="true">
                            <Slider {...referralSettings}>
                                <FacebookMessengerShareButton
                                    url={shareUrl}
                                    appId={facebookAppId}
                                    quote={shareUrl}
                                >
                                    <FacebookMessengerIcon
                                        size={size ? size : 40}
                                        round
                                    />
                                </FacebookMessengerShareButton>
                                <TwitterShareButton url={shareUrl}>
                                    <TwitterIcon
                                        size={size ? size : 40}
                                        round
                                    />
                                </TwitterShareButton>
                                <WhatsappShareButton
                                    url={shareUrl}
                                    separator=":: "
                                    title={title}
                                    quote={shareUrl}
                                >
                                    <WhatsappIcon
                                        size={size ? size : 40}
                                        round
                                    />
                                </WhatsappShareButton>
                                <LinkedinShareButton
                                    title={title}
                                    url={currentUrl}
                                    source={currentUrl}
                                    summary={shareUrl}
                                >
                                    <LinkedinIcon
                                        size={size ? size : 40}
                                        round
                                    />
                                </LinkedinShareButton>
                                <TelegramShareButton url={shareUrl}>
                                    <TelegramIcon
                                        size={size ? size : 40}
                                        round
                                    />
                                </TelegramShareButton>
                                <EmailShareButton
                                    url={currentUrl}
                                    subject={title}
                                    body={shareUrl}
                                >
                                    <EmailIcon size={size ? size : 40} round />
                                </EmailShareButton>
                                <RedditShareButton
                                    title={title}
                                    url={shareUrl}
                                    windowWidth={660}
                                    windowHeight={460}
                                >
                                    <RedditIcon size={size ? size : 40} round />
                                </RedditShareButton>
                                <TumblrShareButton
                                    url={String(window.location.origin)}
                                    title={title}
                                    caption={shareUrl}
                                >
                                    <TumblrIcon size={size ? size : 40} round />
                                </TumblrShareButton>
                                <LivejournalShareButton
                                    url={shareUrl}
                                    title={title}
                                    description={shareUrl}
                                >
                                    <LivejournalIcon
                                        size={size ? size : 40}
                                        round
                                    />
                                </LivejournalShareButton>
                                <LineShareButton url={shareUrl} title={title}>
                                    <LineIcon size={size ? size : 40} round />
                                </LineShareButton>
                                {/* <WeiboShareButton
                            url={shareUrl}
                            image={`${String(window.location)}/${pImg}`}
                        >
                            <WeiboIcon size={size ? size : 40} round />
                        </WeiboShareButton> */}
                                {/* <InstapaperShareButton url={String(window.location.origin)} title={title} description={shareUrl}>
                                <InstapaperIcon size={size ? size : 40} round />
                            </InstapaperShareButton>
                            <HatenaShareButton
                                url={String(window.location.origin)}
                                title={shareUrl}
                                windowWidth={660}
                                windowHeight={460}
                            >
                                <HatenaIcon size={size ? size : 40} round />
                            </HatenaShareButton> */}
                            </Slider>
                        </SliderCustom>
                        <CodePreviewWrapper
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            padding="5px"
                        >
                            <Typography
                                fontWeight="600"
                                color={theme.palette.primary.main}
                            >
                                {referralCode}{' '}
                            </Typography>
                            <Stack padding="3px">
                                <ClickAwayListener
                                    onClickAway={handleTooltipClose}
                                >
                                    <Tooltip
                                        placement="top"
                                        PopperProps={{
                                            disablePortal: true,
                                        }}
                                        onClose={handleTooltipClose}
                                        open={tooltipOpen}
                                        disableFocusListener
                                        disableHoverListener
                                        disableTouchListener
                                        title={t('Copied')}
                                    >
                                        <Button
                                            variant="contained"
                                            onClick={() =>
                                                handleTooltipOpen(referralCode)
                                            }
                                        >
                                            {t('Copy')}
                                        </Button>
                                    </Tooltip>
                                </ClickAwayListener>
                            </Stack>
                        </CodePreviewWrapper>
                    </Paper>
                </CustomModal>
            </ReferralShareBox>
        </>
    )
}
export default ReferralShare
