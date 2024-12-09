import "./bootstrap";
import "../css/app.css";
import '@/js/Validation/index'

import { createApp, h } from "vue";
import { createPinia } from 'pinia'
import { createInertiaApp } from "@inertiajs/vue3";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { ZiggyVue } from "../../vendor/tightenco/ziggy/dist/vue.m";
import {
    // Directives
    VTooltip,
    VClosePopper,
    // Components
    Dropdown,
    Tooltip,
} from "floating-vue";
import { Link } from "@inertiajs/vue3";
import "floating-vue/dist/style.css";
import { i18n, loadLocaleMessages } from './i18n/locales'

const appName = import.meta.env.VITE_APP_NAME || "Laravel";
const pinia = createPinia()

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.vue`,
            import.meta.glob("./Pages/**/*.vue")
        ),
    setup({ el, App, props, plugin }) {
        return createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(i18n)
            .use(ZiggyVue)
            .directive("tooltip", VTooltip)
            .directive("close-popper", VClosePopper)
            .component("VDropdown", Dropdown)
            .component("VTooltip", Tooltip)
            .component("inertia-link", Link)
            .use(pinia)
            .mount(el);
    },
    progress: {
        color: "#4B5563",
    },
});
