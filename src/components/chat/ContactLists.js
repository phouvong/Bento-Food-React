import { List, Stack, Box } from '@mui/material'
import {
    CustomListItem,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import InfoCard from './InfoCard'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import Skeleton from '@mui/material/Skeleton'
import { useSelector } from 'react-redux'

const ContactLists = ({
    channelList,
    handleChannelOnClick,
    channelLoading,
    selectedId,
}) => {
    const { global } = useSelector((state) => state.globalSettings)

    if (channelLoading) {
        return (
            <>
                {[...Array(1, 2, 3, 4)].map(() => {
                    return (
                        <Box padding=".5rem">
                            <Stack direction="row" spacing={3}>
                                <Skeleton
                                    animation="wave"
                                    variant="circular"
                                    width={80}
                                    height={50}
                                />
                                <Stack
                                    justifyContent="space-between"
                                    direction="column"
                                    width="100%"
                                >
                                    <Skeleton
                                        animation="wave"
                                        height={15}
                                        width="40%"
                                    />
                                    <Skeleton
                                        animation="wave"
                                        height={15}
                                        width="80%"
                                    />
                                </Stack>
                            </Stack>
                        </Box>
                    )
                })}
            </>
        )
    }
    const handleInfoCard = (item) => {
        if (item.sender_type === 'customer') {
            return (
                <InfoCard
                    name={item.receiver_type.replaceAll('_', ' ')}
                    messageTime={item?.last_message_time}
                    receiver={
                        item.receiver
                            ? item.receiver.f_name
                            : global?.business_name
                    }
                    unRead={item.unread_message_count}
                    userList={item}
                    selectedId={selectedId}
                    currentId={item.id}
                    last_message={item?.last_message}
                    email={item?.receiver?.email}
                />
            )
        } else {
            return (
                <InfoCard
                    name={item.sender_type.replaceAll('_', ' ')}
                    messageTime={item.created_at}
                    last_message={item?.last_message}
                    receiver={
                        item?.sender?.f_name.concat(
                            ' ',
                            item?.sender?.l_name
                        ) || ' '
                    }
                    unRead={item.unread_message_count}
                    userList={item}
                    selectedId={selectedId}
                    currentId={item.id}
                    email={item?.sender?.email}
                />
            )
        }
    }

    return (
        <CustomStackFullWidth>
            {channelList?.length > 0 && (
                <SimpleBar style={{ maxHeight: '60vh' }}>
                    <List disablePadding>
                        {channelList?.map((item, index) => {
                            return (
                                <CustomListItem
                                    key={index}
                                    disableGutters
                                    disablePadding
                                    cursor="true"
                                    onClick={() => handleChannelOnClick(item)}
                                >
                                    {handleInfoCard(item)}
                                </CustomListItem>
                            )
                        })}
                    </List>
                </SimpleBar>
            )}
        </CustomStackFullWidth>
    )
}

export default ContactLists
