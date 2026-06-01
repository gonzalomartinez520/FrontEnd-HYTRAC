import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import esNavbar from "./locales/es/navbar.json";
import enNavbar from "./locales/en/navbar.json";
import ptNavbar from "./locales/pt/navbar.json";

import esCommon from "./locales/es/common.json";
import enCommon from "./locales/en/common.json";
import ptCommon from "./locales/pt/common.json";

import esForm from "./locales/es/form.json";
import enForm from "./locales/en/form.json";
import ptForm from "./locales/pt/form.json";


i18n.use(initReactI18next).init({
  resources: {
    es: {
        navbar: esNavbar,
        common: esCommon,
        form: esForm,
    },
    en: {
        navbar: enNavbar,
        common: enCommon,
        form: enForm,
    },
    pt: {
        navbar: ptNavbar,
        common: ptCommon,
        form: ptForm,
    },
    },
  lng: localStorage.getItem("lang") || "es",
  fallbackLng: "es",
  ns: ["navbar", "common", "form"],
  defaultNS: "navbar",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;