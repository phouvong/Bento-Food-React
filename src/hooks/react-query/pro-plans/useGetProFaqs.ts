import { useQuery, UseQueryResult } from 'react-query'
import { onErrorResponse } from '@/components/ErrorResponse'
import MainApi from '../../../api/MainApi'

// ProFaq is intentionally permissive: the backend may key the question/answer
// fields differently across versions, so we keep all observed spellings as
// optional. The page resolves whichever is present.
export type ProFaq = {
    id?: number | string
    question?: string
    answer?: string
    q?: string
    a?: string
    title?: string
    description?: string
    // Additional variants seen across stackfood backend versions.
    question_text?: string
    answer_text?: string
    name?: string
    details?: string
    faq_question?: string
    faq_answer?: string
    // Index signature lets us fall back to any remaining string fields
    // without TS errors.
    [key: string]: unknown
}

// The endpoint may return a bare array, an axios-style `{ data: [] }` envelope,
// or a paginated stackfood envelope `{ total, limit, offset, faqs: [] }`.
// Keep the response type generic so callers can handle all variants.
type ProFaqsResponse =
    | ProFaq[]
    | { data?: ProFaq[]; faqs?: ProFaq[] }

const getProFaqs = async (): Promise<ProFaqsResponse> => {
    const { data } = await MainApi.get<ProFaqsResponse>(
        `/api/v1/pro-customer/faqs`
    )
    return data
}

export default function useGetProFaqs(): UseQueryResult<ProFaqsResponse> {
    return useQuery<ProFaqsResponse>('pro-customer-faqs', getProFaqs, {
        onError: onErrorResponse,
        staleTime: 5 * 60 * 1000,
    })
}

// Resolve question/answer from any of the field-name variants the backend may
// use. Shared by the profile page and the in-cart subscription modal so the
// normalization rule lives in exactly one place.
export const resolveFaq = (
    faq: ProFaq
): { question: string; answer: string } => {
    const asString = (v: unknown): string =>
        typeof v === 'string' ? v : ''
    return {
        question:
            asString(faq.question) ||
            asString(faq.q) ||
            asString(faq.title) ||
            asString(faq.question_text) ||
            asString(faq.faq_question) ||
            asString(faq.name) ||
            '',
        answer:
            asString(faq.answer) ||
            asString(faq.a) ||
            asString(faq.description) ||
            asString(faq.answer_text) ||
            asString(faq.faq_answer) ||
            asString(faq.details) ||
            '',
    }
}

// Narrow the union response into a flat `ProFaq[]`. The endpoint may return:
//   - a bare array
//   - an axios-style `{ data: [] }` envelope
//   - a paginated stackfood envelope `{ total, limit, offset, faqs: [] }`
export const toFaqList = (raw: ProFaqsResponse | undefined): ProFaq[] => {
    if (Array.isArray(raw)) return raw
    if (raw && Array.isArray(raw.faqs)) return raw.faqs as ProFaq[]
    if (raw && Array.isArray(raw.data)) return raw.data as ProFaq[]
    return []
}
