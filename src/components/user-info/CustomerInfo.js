import { Avatar, Typography, useTheme } from '@mui/material'
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
            gap="9px"
            justifyContent="center"
            alignItems="center"
        >
            <Avatar
                sx={{
                    height: 68,
                    width: 70,
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
            <CustomStackFullWidth>
                <Typography
                    color={theme.palette.neutral[500]}
                    fontSize="1rem"
                    fontWeight="600"
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}
                >
                    {userData?.f_name?.concat(' ', userData?.l_name)}

                    {global?.pro_member_status === 1 &&
                    Number(userData?.pro_status) === 1 ? (
                        <ProBadge pro={userData?.pro_status} size={14} />
                    ) : null}
                </Typography>
                <Typography
                    fontSize="0.75rem"
                    fontWeight="400"
                    color={theme.palette.neutral[500]}
                    sx={{ direction: theme.direction === 'rtl' ? 'rtl' : '' }}
                    textAlign={theme.direction === 'rtl' ? 'end' : 'start'}
                >
                    {userData?.phone}
                </Typography>
                <Typography
                    fontSize="0.65rem"
                    fontWeight="400"
                    color={theme.palette.neutral[500]}
                >
                    {t('Joined')}{' '}
                    {moment(userData?.created_at).format('MMM Do YY')}
                </Typography>
            </CustomStackFullWidth>
        </CustomStackFullWidth>
    )
}

export default CustomerInfo
