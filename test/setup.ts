import '@testing-library/jest-dom'
import { initReactI18next } from 'react-i18next'
import i18n from 'i18next'

i18n.use(initReactI18next).init({
  lng: 'cimode',
  resources: {},
  interpolation: { escapeValue: false },
})
