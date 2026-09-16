import { useMutation } from 'react-query'
import MainApi from '@/api/MainApi'
import { getGuestId } from '@/utils/localStorage'
import {
    noteAiChatError,
    readAiChatLimits,
} from '@/components/ai-chatbot/aiChatErrors'

const AI_CHAT_SEND_API = '/api/v1/customer/ai-chat/send'

// A reply is a model call plus tool queries, so the guide asks for at least
// 60s. MainApi sets no timeout of its own (axios default: wait forever); this
// caps the wait without cutting a slow-but-legitimate reply short.
const AI_CHAT_SEND_TIMEOUT_MS = 90_000

const sendAiChatMessage = async ({ conversationId, message }) => {
    const payload = { message, guest_id: getGuestId() }
    if (conversationId) payload.conversation_id = conversationId
    try {
        const { data, headers } = await MainApi.post(AI_CHAT_SEND_API, payload, {
            timeout: AI_CHAT_SEND_TIMEOUT_MS,
        })
        // Limits ride along with the reply so the caller can warn before the
        // daily allowance runs out instead of only after it does.
        return { reply: data, limits: readAiChatLimits(headers) }
    } catch (error) {
        // Flags `503 ai_disabled` for the launcher before the error propagates.
        noteAiChatError(error)
        throw error
    }
}

const useSendAiChatMessage = (options = {}) => {
    return useMutation(sendAiChatMessage, options)
}

export default useSendAiChatMessage
