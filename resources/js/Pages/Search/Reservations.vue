<template>
  <Head title="Dashboard" />

  <AuthenticatedLayout>
    <div class="search-page grid grid-cols-1 gap-4 w-full max-w-8xl h-full">
      <div class="search-container">
        <div
          class="flex flex-col items-start gap-2 w-full bg-gray-50 rounded-lg shadow p-5 border border-gray-200"
        >
          <div class="flex justify-between w-full gap-4">
            <div>
              <p class="h3 font-poppins text-primary-800">Cerca prenotazioni</p>
            </div>
            <div class="space-x-2">
              <BbButton
                :href="route('reservations.search')"
                size="sm"
                color="primary"
              >
                Prenotazioni
              </BbButton>
              <BbButton
                :href="route('rooms.search')"
                size="sm"
                color="tertiary"
              >
                Stanze
              </BbButton>
            </div>
          </div>
          <div class="flex mt-2 gap-4 items-center">
            <div>
              <BbTextInput
                class="md:!w-96"
                :hideLabel="true"
                v-model="searchQuery"
                label="Cerca"
                placeholder="Cerca per Nominativo o Telefono"
              >
              </BbTextInput>
            </div>

            <BbSwitch
              v-model="filters.historical"
              label="Includi appuntamenti passati"
              direction="auto"
              input-position="right"
              :reverse="true"
            >
              <template #label="{ text }">
                <span class="inline-block ml-3 text-gray-800">
                  {{ text }}
                </span>
              </template></BbSwitch
            >
          </div>
        </div>
        <div v-if="searchQuery && reservations" class="mt-2">
          <BbTable
            class="search-table"
            :columns="headers"
            :paginatedItems="reservations"
            :actions="false"
          >
            <template #name="{ item }">
              <button
                @click="goToday(item.room.date, item.room.am_or_pm)"
                type="button"
                class="text-primary-700 font-semibold"
              >
                {{ item.name }}
              </button>
            </template>
          </BbTable>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
<script setup>
import dayjs from 'dayjs'
import { Head, usePage, router } from '@inertiajs/vue3'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSearch } from '@/js/composables/useSearch'
import { useUI } from '@/js/Store/ui'

import AuthenticatedLayout from '@/js/Layouts/AuthenticatedLayout.vue'
import BbTable from '@/js/Components/Common/BbTable.vue'
import BbTextInput from '@/js/Components/form-controls/BbTextInput.vue'
import BbSwitch from '@/js/Components/form-controls/BbSwitch.vue'
import BbButton from '@/js/Components/Common/BbButton.vue'

const reservations = computed(() => usePage().props.reservations)

const uiStore = useUI()

onMounted(() => {
  uiStore.dateBar.readOnly = true
})
onUnmounted(() => {
  uiStore.dateBar.readOnly = false
})

const { searchQuery, filters } = useSearch(
  {
    historical: false
  },
  {
    queryName: 'search'
  }
)

const headers = ref([
  {
    label: 'Nominativo',
    key: 'name'
  },
  {
    label: 'Telefono',
    key: 'phone'
  },
  {
    label: 'Stanza',
    key: 'room.name'
  },
  {
    label: 'Data',
    key: 'start_date',
    formatter: (value, key, item) =>
      item.start_date
        ? dayjs(item.start_date).format('DD/MM/YYYY')
        : dayjs(item.room.date).format('DD/MM/YYYY')
  },
  {
    label: 'Ora inizio',
    key: 'start_date',
    formatter: value => (value ? dayjs(value).format('HH:mm') : '-')
  },
  {
    label: 'Ora fine',
    key: 'end_date',
    formatter: value => (value ? dayjs(value).format('HH:mm') : '-')
  },
  {
    label: 'Esami',
    key: 'exams',
    formatter: value => value.map(e => e.name).join(', ')
  }
])

const goToday = (date, amOrPm) => {
  uiStore.dateBar.amOrPm = amOrPm
  uiStore.dateBar.date = dayjs(date).valueOf()
  router.visit('/')
}
</script>
<style lang="scss">
.search-page {
  .search-table {
    .bb-base-table {
      min-width: 100%;
    }
  }
}
</style>
