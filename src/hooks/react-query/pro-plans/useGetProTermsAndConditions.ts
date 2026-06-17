import { useQuery, UseQueryResult } from 'react-query'
import { onErrorResponse } from '@/components/ErrorResponse'
import MainApi from '../../../api/MainApi'

// The backend may return the body as a raw string, as a `{ content }` /
// `{ page_description }` object, or wrapped in an axios-style `{ data }`
// envelope. Modeling the union keeps one hook usable across those shapes;
// the call site narrows with `typeof`.
type TermsContent =
    | string
    | {
          content?: string
          description?: string
          page_description?: string
          page_title?: string
          title?: string
      }
export type ProTerms =
    | TermsContent
    | { data?: TermsContent }
    | null
    | undefined

const getProTermsAndConditions = async (): Promise<ProTerms> => {
    const { data } = await MainApi.get<ProTerms>(
        `/api/v1/pro-customer/terms-and-conditions`
    )
    return data
}

export default function useGetProTermsAndConditions(): UseQueryResult<ProTerms> {
    return useQuery<ProTerms>(
        'pro-customer-terms-and-conditions',
        getProTermsAndConditions,
        {
            onError: onErrorResponse,
            staleTime: 5 * 60 * 1000,
        }
    )
}

// Reduce any of the supported response shapes down to a single HTML/string
// body. Returns `''` if nothing resolvable is present, so callers can render
// an empty-state without extra null checks.
export const resolveTermsBody = (raw: ProTerms): string => {
    if (!raw) return ''
    if (typeof raw === 'string') return raw

    const inner =
        'data' in raw && raw.data !== undefined ? raw.data : (raw as TermsContent)
    if (!inner) return ''
    if (typeof inner === 'string') return inner
    return (
        inner.page_description ??
        inner.content ??
        inner.description ??
        ''
    )
}

// Optional title companion: when the backend returns `page_title` / `title`,
// callers can surface it as the modal header instead of the hardcoded string.
export const resolveTermsTitle = (raw: ProTerms): string => {
    if (!raw || typeof raw === 'string') return ''
    const inner =
        'data' in raw && raw.data !== undefined ? raw.data : (raw as TermsContent)
    if (!inner || typeof inner === 'string') return ''
    return (inner.page_title ?? inner.title ?? '').trim()
}
