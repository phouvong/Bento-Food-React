import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { english } from './en'
import { lao } from './lo'
import { bengali } from './bn'
import { arabic } from './ar'
import { spanish } from './es'

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
    en: {
        translation: english,
    },
    lo: {
        translation: lao,
    },
    bn: {
        translation: bengali,
    },
    ar: {
        translation: arabic,
    },
    es: {
        translation: spanish,
    },
}

i18n.use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng: 'lo', // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
        // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
        // if you're using a language detector, do not define the lng option
        fallbackLng: 'lo',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    })

export default i18n
