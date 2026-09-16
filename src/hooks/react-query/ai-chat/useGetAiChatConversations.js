import { useQuery } from 'react-query'
import MainApi from '@/api/MainApi'
import { getGuestId } from '@/utils/localStorage'
import { onErrorResponse } from '@/components/ErrorResponse'
import { noteAiChatError } from '@/components/ai-chatbot/aiChatErrors'

const AI_CHAT_CONVERSATIONS_API = '/api/v1/customer/ai-chat/conversations'

const fetchAiChatConversations = async ({ limit = 20, offset = 1 } = {}) => {
    const { data } = await MainApi.get(AI_CHAT_CONVERSATIONS_API, {
        params: { limit, offset, guest_id: getGuestId() },
    })
    return data
}

const useGetAiChatConversations = ({
    enabled = false,
    limit = 20,
    offset = 1,
} = {}) => {
    return useQuery(
        ['ai-chat-conversations', limit, offset],
        () => fetchAiChatConversations({ limit, offset }),
        {
            enabled,
            // `503 ai_disabled` is not an error to show the customer — it
            // hides the chat entry point, so it is swallowed here.
            onError: (error) => {
                const { status, code } = noteAiChatError(error)
                if (status === 503 && code === 'ai_disabled') return
                onErrorResponse(error)
            },
            refetchOnWindowFocus: false,
        }
    )
}

export default useGetAiChatConversations
