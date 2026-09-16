import { Avatar, Typography, useTheme } from '@mui/material'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { t } from 'i18next'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useQuery } from 'react-query'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import ProBadge from '@/components/pro-badge/ProBadge'
import { ProfileApi } from '@/hooks/react-query/config/profileApi'
import { setUser } from '@/redux/slices/customer'
import { onSingleErrorResponse } from '@/components/ErrorResponse'

const CustomerInfo = () => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const { userData } = useSelector((state) => state.user)
    const { global } = useSelector((state) => state.globalSettings)
    const [imageLoadError, setImageLoadError] = useState(false)

    // Refetch the customer profile every time this card mounts so pro_status,
    // name, and avatar stay in sync with subscribe/cancel/profile updates
    // that happen elsewhere. The result hydrates the redux slice via setUser.
    const { data: profileData } = useQuery(
        ['profile-info'],
        ProfileApi.profileInfo,
        { onError: onSingleErrorResponse }
    )
    useEffect(() => {
        if (profileData?.data) dispatch(setUser(profileData.data))
    }, [profileData, dispatch])
    const profileImage =
        typeof userData?.image_full_url === 'string'
            ? userData.image_full_url.trim()
            : ''
    const hasImage = Boolean(profileImage) && !imageLoadError
    const initials = `${userData?.f_name?.[0] || ''}${
        userData?.l_name?.[0] || ''
    }`.toUpperCase()

    useEffect(() => {
        setImageLoadError(false)
    }, [profileImage])

    return (
        <CustomStackFullWidth
            direction="row"
            gap="12px"
            justifyContent="center"
            alignItems="center"
        >
            <Avatar
                sx={{
                    height: { xs: 56, md: 72 },
                    width: { xs: 56, md: 72 },
                    backgroundColor: hasImage
                        ? (theme) => theme.palette.neutral[100]
                        : (theme) => theme.palette.neutral[400],
                    color: (theme) => theme.palette.neutral[1000],
                }}
                src={hasImage ? profileImage : undefined}
                imgProps={{
                    onError: () => setImageLoadError(true),
                }}
            >
                {!hasImage ? initials || '?' : null}
            </Avatar>
            <CustomStackFullWidth gap="6px">
                <Typography
                    color={theme.palette.text.primary}
                    fontWeight="700"
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        lineHeight: 1.1,
                        fontSize: { xs: '16px', md: '20px' },
                        letterSpacing: '-0.6px',
                    }}
                >
                    {userData?.f_name?.concat(' ', userData?.l_name)}

                    {global?.pro_member_status === 1 &&
                    Number(userData?.pro_status) === 1 ? (
                        <ProBadge pro={userData?.pro_status} size={14} />
                    ) : null}
                </Typography>
                <Typography
                    fontWeight="400"
                    color={theme.palette.text.secondary}
                    sx={{
                        direction: theme.direction === 'rtl' ? 'rtl' : '',
                        fontSize: { xs: '0.7rem', md: '0.75rem' },
                    }}
                    textAlign={theme.direction === 'rtl' ? 'end' : 'start'}
                >
                    {userData?.phone}
                </Typography>
                <CustomStackFullWidth
                    direction="row"
                    gap="4px"
                    alignItems="center"
                >
                    <CalendarTodayIcon
                        sx={{
                            fontSize: { xs: '12px', md: '14px' },
                            color: theme.palette.text.secondary,
                        }}
                    />
                    <Typography
                        fontWeight="400"
                        lineHeight="1.3"
                        color={theme.palette.text.secondary}
                        sx={{ fontSize: { xs: '12px', md: '14px' } }}
                    >
                        {t('Joined')}{' '}
                        {moment(userData?.created_at).format('MMM Do YY')}
                    </Typography>
                </CustomStackFullWidth>
            </CustomStackFullWidth>
        </CustomStackFullWidth>
    )
}

export default CustomerInfo
