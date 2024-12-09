<template>
  <div>
    <nav class="base-navigation" :aria-label="t(`components.common.BaseNavigation.navigation`)">
      <ul class="pages">
        <li>
          <button @click="goTo(prevLink)" :disabled="!prevLink || disabled" class="page flex items-center space-x-1">
            <span class="flex">
              <BbIcon type="arrow_simple" :size="8" />
            </span>
          </button>
        </li>
        <li v-for="(link, index) in innerLinks" :key="index">
          <button class="page pageNumber" :disabled="disabled" :class="{ active: link.active }" @click="goTo(link.url)">
            {{ link.label }}
          </button>
        </li>
        <li>
          <button @click="goTo(nextLink)" :disabled="!nextLink || disabled" class="page flex items-center space-x-1">
            <span class="flex rotate-180">
              <BbIcon type="arrow_simple" color="bb-primary-500" :size="8" />
            </span>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import {cloneDeep} from 'lodash'
import BbIcon from './BbIcon.vue'

const props = defineProps({
  links: {
    type: Array
  },
  prevLink: {
    type: String
  },
  nextLink: {
    type: String
  },
  loading: {
    type: Boolean
  },
  rebuildUrl: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['change'])

const { t } = useI18n()

const innerLinks = computed(() => {
    if (props.links && props.links.length > 2) {
        const tmpLinks = cloneDeep(props.links)
        tmpLinks.shift()
        tmpLinks.pop()
        return tmpLinks
    } else {
        return []
    }
})

const goTo = page => {
    const finalURL = buildUrl(page)
    emit('change', finalURL)
}

function buildUrl(page) {
    const currentUrl = window.location.href
    if (!checkURL(currentUrl, page) && props.rebuildUrl) {
        const currentUrl = new URL(window.location.href)
        const linkUrl = new URL(page)
        const linkParams = linkUrl.searchParams

        linkParams.forEach(function(value, key) {
            if (!currentUrl.searchParams.has(key)) {
                currentUrl.searchParams.append(key, value);
            }
        });
        return currentUrl.toString();
    }
    return page
}

function checkURL(urlAttuale, urlSpecificato) {
    let urlAttualeSenzaPage = urlAttuale.replace(/([&?])page=[^&]+/, '');
    let urlSpecificatoSenzaPage = urlSpecificato.replace(/([&?])page=[^&]+/, '');
    // Confronta l'URL attuale senza il parametro "page" con l'URL specificato senza il parametro "page"
    return urlAttualeSenzaPage === urlSpecificatoSenzaPage;
}
</script>
