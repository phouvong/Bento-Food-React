import MainApi from '../../api/MainApi'

export const landingPageApi = {
    getLandingPageImages: () => MainApi.get('/api/v1/react-landing-page'),
}
