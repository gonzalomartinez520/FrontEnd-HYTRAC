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

import esTransportista from "./locales/es/transportista.json";
import enTransportista from "./locales/en/transportista.json";
import ptTransportista from "./locales/pt/transportista.json";

import esSupervisor from "./locales/es/supervisor.json";
import enSupervisor from "./locales/en/supervisor.json";
import ptSupervisor from "./locales/pt/supervisor.json";

import esOperador from "./locales/es/operador.json";
import enOperador from "./locales/en/operador.json";
import ptOperador from "./locales/pt/operador.json";


i18n.use(initReactI18next).init({
  resources: {
    es: {
        navbar: esNavbar,
        common: esCommon,
        form: esForm,
      transportista: esTransportista,
      supervisor: esSupervisor,
      operador: esOperador,
    },
    en: {
        navbar: enNavbar,
        common: enCommon,
        form: enForm,
      transportista: enTransportista,
      supervisor: enSupervisor,
      operador: enOperador,
    },
    pt: {
        navbar: ptNavbar,
        common: ptCommon,
        form: ptForm,
      transportista: ptTransportista,
      supervisor: ptSupervisor,
      operador: ptOperador,
    },
    },
  lng: localStorage.getItem("lang") || "es",
  fallbackLng: "es",
    ns: ["navbar", "common", "form", "transportista", "supervisor", "operador"],
  defaultNS: "navbar",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;