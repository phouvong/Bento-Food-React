import { useMutation } from 'react-query'
import MainApi from '@/api/MainApi'
import { getGuestId } from '@/utils/localStorage'
import { noteAiChatError } from '@/components/ai-chatbot/aiChatErrors'

const AI_CHAT_CONVERSATIONS_API = '/api/v1/customer/ai-chat/conversations'

// Archives rather than deletes — the server keeps the conversation and only
// drops it from the list.
const deleteAiChatConversation = async (conversationId) => {
    try {
        const { data } = await MainApi.delete(
            `${AI_CHAT_CONVERSATIONS_API}/${conversationId}`,
            { params: { guest_id: getGuestId() } }
        )
        return data
    } catch (error) {
        // Flags `503 ai_disabled` for the launcher before the error propagates.
        noteAiChatError(error)
        throw error
    }
}

const useDeleteAiChatConversation = (options = {}) => {
    return useMutation(deleteAiChatConversation, options)
}

export default useDeleteAiChatConversation
