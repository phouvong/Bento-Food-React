import { useInfiniteQuery } from 'react-query'
import MainApi from '@/api/MainApi'
import { getGuestId } from '@/utils/localStorage'
import { onErrorResponse } from '@/components/ErrorResponse'
import { noteAiChatError } from '@/components/ai-chatbot/aiChatErrors'

const AI_CHAT_MESSAGES_API = '/api/v1/customer/ai-chat/messages'

const fetchAiChatMessages = async ({ conversationId, offset, limit }) => {
    const { data } = await MainApi.get(AI_CHAT_MESSAGES_API, {
        params: {
            conversation_id: conversationId,
            offset,
            limit,
            guest_id: getGuestId(),
        },
    })
    return data
}

const useGetAiChatMessages = ({
    conversationId,
    enabled = true,
    limit = 10,
    messagesCount = 0,
}) => {
    const initialOffset = Math.max(
        1,
        Math.ceil(Number(messagesCount || 0) / limit) || 1
    )

    return useInfiniteQuery(
        ['ai-chat-messages', conversationId, initialOffset],
        ({ pageParam }) =>
            fetchAiChatMessages({
                conversationId,
                offset: pageParam ?? initialOffset,
                limit,
            }),
        {
            enabled: enabled && Boolean(conversationId),
            // `ai_disabled` hides the widget rather than toasting, and a
            // `404 not_found` conversation is handled by the caller, which
            // drops the stale id and starts fresh.
            onError: (error) => {
                const { status, code } = noteAiChatError(error)
                if (status === 503 && code === 'ai_disabled') return
                if (status === 404) return
                onErrorResponse(error)
            },
            refetchOnWindowFocus: false,
            getPreviousPageParam: (firstPage) => {
                const currentOffset = Number(firstPage?.offset ?? initialOffset)
                return currentOffset > 1 ? currentOffset - 1 : undefined
            },
            getNextPageParam: () => undefined,
        }
    )
}

export default useGetAiChatMessages
