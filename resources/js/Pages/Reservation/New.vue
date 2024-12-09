<template>
  <Head title="Nuova prenotazione" />

  <AuthenticatedLayout>
    <div class="w-full max-w-8xl">
      <BbForm v-if="form" v-slot="{ valid }">
        <div class="flex justify-between">
          <BbButton
            :disabled="form.processing"
            color="secondary"
            type="button"
            :href="route('dashboard')"
          >
            <BbIcon type="chevron_left" size="7" class="mr-1" />
            <span>Indietro</span>
          </BbButton>
          <div class="flex items-center gap-2">
            <BbIcon
              v-if="alreadyReservedRows.length > 0 || alertMin10Minutes"
              type="triangle_exclamation"
              size="24"
              color="#F44336"
            />
            <BbButton
              :loading="form.processing"
              :disabled="
                !valid ||
                form.processing ||
                !examsIsValid ||
                !startAndEndAreCoherent ||
                loadingCheckAlreadyReserved ||
                alreadyReservedRows.length > 0 ||
                alertMin10Minutes
              "
              color="primary"
              type="button"
              @click="saveReservation()"
            >
              <span>Salva</span>
            </BbButton>
          </div>
        </div>
        <div class="new-reservation-container grid grid-cols-12 gap-4">
          <div
            class="card col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-3 content-start"
          >
            <div
              class="col-span-1 md:col-span-2 font-light flex justify-between"
            >
              <div>
                <button type="button" @click="openRoomModal(roomData?.id)">
                  <span class="label-text pr-1">Stanza:</span>
                  <span class="text-primary font-semibold underline">{{
                    roomData?.name
                  }}</span>
                </button>
                <div v-if="alreadyReservedRows.length > 0">
                  <span class="text-sm text-alert-300 font-medium"
                    >La prenotazione si sovrappone con altre prenotazioni
                  </span>
                  <button
                    type="button"
                    @click="openRoomModal(roomData?.id)"
                    class="text-sm"
                  >
                    (<span class="underline">Vedi</span>)
                  </button>
                </div>
                <div v-if="alertMin10Minutes">
                  <span class="text-sm text-alert-300 font-medium"
                    >La durata deve essere almeno 10 minuti
                  </span>
                </div>
              </div>
              <div class="text-end">
                <p>
                  <span class="label-text pr-1">Orario:</span>
                  <span
                    :class="{
                      'text-primary': reservationDuration >= examsDuration,
                      'text-alert-300': reservationDuration < examsDuration
                    }"
                    class="font-semibold"
                    >{{ timeLabel }}</span
                  >
                </p>
                <p>
                  <span class="label-text pr-1">Durata esami:</span>
                  <span
                    v-if="examsDuration > 0"
                    class="text-primary font-semibold"
                    >{{ examsDuration }} minuti</span
                  >
                  <span v-else class="text-primary font-semibold">-</span>
                </p>
              </div>
            </div>
            <div class="searchbar-container">
              <BbTextInput
                autocomplete="off"
                label="Nominativo"
                v-model="reservationStore.current.name"
                :rules="{ required: true, max: 254 }"
                @update:modelValue="value => debouncedGetPatients(value)"
              ></BbTextInput>
              <div
                v-if="patientsResults?.length > 0"
                class="search-results-container"
              >
                <div
                  v-for="patient in patientsResults"
                  :key="patient.id"
                  class="search-results-row"
                >
                  <button type="button" @click="selectPatient(patient)">
                    <p class="font-semibold">{{ patient.name }}</p>
                    <span class="text-xs font-normal">{{ patient.phone }}</span>
                  </button>
                  <div>
                    <button
                      @click="deletePatient(patient.id)"
                      type="button"
                      class="px-3"
                    >
                      <BbIcon type="close" size="12"></BbIcon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <BbTextInput
              autocomplete="off"
              label="Telefono"
              v-model="reservationStore.current.phone"
              :rules="{ max: 254 }"
            ></BbTextInput>
            <BbTextInput
              autocomplete="off"
              label="Extra"
              v-model="reservationStore.current.extra"
              :rules="{ max: 35 }"
            ></BbTextInput>
            <div></div>
            <div>
              <BbSwitch
                label="Prenotazione libera"
                direction="auto"
                input-position="right"
                v-model="freetime"
                :reverse="true"
              >
                <template #label="{ text }">
                  <span class="inline-block ml-3 text-gray-800">
                    {{ text }}
                  </span>
                </template>
              </BbSwitch>
            </div>
            <div></div>
            <div class="flex flex-col gap-2">
              <div>
                <p class="mb-2 label-text">Ora prenotazione inizio</p>
                <p class="label-text text-xs">Ora</p>
                <BbRadioGroup
                  name="Inizio Ora"
                  legend="Inizio Ora"
                  :items="itemsHours"
                  v-model="reservationStore.current.start_hour"
                  :hideLabel="true"
                  :hideLegend="true"
                  :rules="{ required: !freetime }"
                  :disabled="freetime"
                  @update:modelValue="startTimeUpdate"
                >
                  <template #icon="{ value, text, focused, checked, disabled }">
                    <span
                      class="option text-md !px-0 !py-0 max-w-[240px]"
                      :class="{
                        'option--focused': focused,
                        'option--selected': checked,
                        'option--disabled': disabled
                      }"
                    >
                      <div
                        class="flex gap-2 items-center justify-center w-8 h-8"
                      >
                        <div class="text-left font-medium">{{ text }}</div>
                      </div>
                    </span>
                  </template>
                </BbRadioGroup>
              </div>
              <div>
                <p class="label-text text-xs">Minuti</p>
                <BbRadioGroup
                  name="Inizio Minuti"
                  legend="Inizio Minuti"
                  :items="Array.from({ length: 12 }, (_, i) => i * 5)"
                  :item-text="value => value.toString().padStart(2, '0')"
                  v-model="reservationStore.current.start_minute"
                  :hideLabel="true"
                  :hideLegend="true"
                  :rules="{ required: !freetime }"
                  :disabled="freetime"
                  @update:modelValue="startTimeUpdate"
                >
                  <template #icon="{ value, text, focused, checked, disabled }">
                    <span
                      class="option text-md !px-0 !py-0 max-w-[240px]"
                      :class="{
                        'option--focused': focused,
                        'option--selected': checked,
                        'option--disabled': disabled
                      }"
                    >
                      <div
                        class="flex gap-2 items-center justify-center w-8 h-8"
                      >
                        <div class="text-left font-medium">{{ text }}</div>
                      </div>
                    </span>
                  </template>
                </BbRadioGroup>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div>
                <p class="mb-2 label-text">Ora prenotazione fine</p>
                <p class="label-text text-xs">Ora</p>
                <BbRadioGroup
                  name="Fine Ora"
                  legend="Fine Ora"
                  :items="itemsHours"
                  v-model="reservationStore.current.end_hour"
                  :hideLabel="true"
                  :hideLegend="true"
                  :rules="{ required: !freetime }"
                  :disabled="freetime"
                  @click="() => (endTimeManuallySet = true)"
                  @update:modelValue="endTimeUpdate"
                >
                  <template #icon="{ value, text, focused, checked, disabled }">
                    <span
                      class="option text-md !px-0 !py-0 max-w-[240px]"
                      :class="{
                        'option--focused': focused,
                        'option--selected': checked,
                        'option--disabled': disabled
                      }"
                    >
                      <div
                        class="flex gap-2 items-center justify-center w-8 h-8"
                      >
                        <div class="text-left font-medium">{{ text }}</div>
                      </div>
                    </span>
                  </template>
                </BbRadioGroup>
              </div>
              <div>
                <p class="label-text text-xs">Minuti</p>
                <BbRadioGroup
                  name="Fine Minuti"
                  legend="Fine Minuti"
                  :items="Array.from({ length: 12 }, (_, i) => i * 5)"
                  :item-text="value => value.toString().padStart(2, '0')"
                  v-model="reservationStore.current.end_minute"
                  :hideLabel="true"
                  :hideLegend="true"
                  :rules="{ required: !freetime }"
                  :disabled="freetime"
                  @click="() => (endTimeManuallySet = true)"
                  @update:modelValue="endTimeUpdate"
                >
                  <template #icon="{ value, text, focused, checked, disabled }">
                    <span
                      class="option text-md !px-0 !py-0 max-w-[240px]"
                      :class="{
                        'option--focused': focused,
                        'option--selected': checked,
                        'option--disabled': disabled
                      }"
                    >
                      <div
                        class="flex gap-2 items-center justify-center w-8 h-8"
                      >
                        <div class="text-left font-medium">{{ text }}</div>
                      </div>
                    </span>
                  </template>
                </BbRadioGroup>
              </div>
            </div>
            <div
              v-if="!startAndEndAreCoherent"
              class="col-span-1 md:col-span-2 font-light"
            >
              <span class="text-[#dc2626] text-xs font-medium"
                >Orario selezionato non valido</span
              >
            </div>
          </div>
          <div
            class="col-span-12 md:col-span-3 card exams-card !p-0 overflow-hidden relative"
          >
            <div class="exams-container overflow-auto p-4 relative">
              <BbCheckboxGroup
                name="Esami"
                legend="Esami"
                :items="examsComputed"
                itemText="name"
                itemValue="id"
                v-model="reservationStore.current.exams"
                :hideLabel="true"
                @update:modelValue="examsUpdated"
                :enforceCoherence="true"
              >
                <template #icon="{ value, text, focused, checked, disabled }">
                  <span
                    class="option text-md"
                    :class="{
                      'option--focused': focused,
                      'option--selected': checked,
                      'option--disabled': disabled
                    }"
                  >
                    <div class="flex gap-2 items-center justify-center w-full">
                      <div class="text-left font-medium">{{ text }}</div>
                    </div>
                  </span>
                </template>
              </BbCheckboxGroup>
            </div>
          </div>
        </div>
      </BbForm>
      <BbDialog
        size="lg"
        :title="roomData?.name"
        v-model="roomModal"
        @hidden="closeRoomModal"
      >
        <div
          class="flex flex-col gap-1 justify-start items-center h-full bg-primary-50 p-2"
        >
          <template
            v-if="reservationRows.length"
            v-for="reservation in reservationRows"
            :key="reservation.id"
          >
            <ReservationCard
              :actions="false"
              :reservation="reservation"
              :room="roomData"
              @delete="id => deleteReservation(id)"
            ></ReservationCard>
          </template>
          <p v-else class="text-primary">Nessuna prenotazione</p>
        </div>
      </BbDialog>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import dayjs from 'dayjs'
import { Head, useForm, usePage } from '@inertiajs/vue3'
import { isNil } from 'lodash'
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { useReservation } from '@/js/Store/reservation'
import { useUI } from '@/js/Store/ui'
import { debounce } from '@/js/Utilities/functions/debounce'
import { wait } from '@/js/Utilities/functions/wait'
import { useConfirm } from '@/js/composables/useConfirm'

import AuthenticatedLayout from '@/js/Layouts/AuthenticatedLayout.vue'
import BbButton from '@/js/Components/Common/BbButton.vue'
import BbIcon from '@/js/Components/Common/BbIcon.vue'
import BbCheckboxGroup from '@/js/Components/form-controls/BbCheckboxGroup.vue'
import BbForm from '@/js/Components/form-controls/BbForm.vue'
import BbRadioGroup from '@/js/Components/form-controls/BbRadioGroup.vue'
import BbSwitch from '@/js/Components/form-controls/BbSwitch.vue'
import BbTextInput from '@/js/Components/form-controls/BbTextInput.vue'
import BbDialog from '@/js/Components/Common/BbDialog.vue'
import ReservationCard from '@/js/Components/Dashboard/ReservationCard.vue'

const url = new URL(location.href)

const form = useForm({})

const uiStore = useUI()
const reservationStore = useReservation()

const roomData = computed(() => usePage().props.room)
const exams = computed(() => usePage().props.exams)
const otherExams = computed(() => usePage().props.otherExams)
const defaultStartDate = computed(() => usePage().props.defaultStartDate)
const timeSettings = computed(() => usePage().props.timeSettings)

const reservation = computed(() => usePage().props.reservation)

const examsComputed = computed(() => {
  return freetime.value ? otherExams.value : exams.value
})

const examsIsValid = computed(() => {
  return reservationStore.current.exams.length > 0
})

const itemsHours = ref([])

const endTimeManuallySet = ref(false)

const patientsResults = ref([])

const alreadyReservedRows = ref([])

const alertMin10Minutes = ref(false)

onMounted(() => {
  uiStore.dateBar.readOnly = true
  uiStore.dateBar.amOrPm = roomData.value.am_or_pm
  if (roomData.value.am_or_pm === 'AM') {
    itemsHours.value = Array.from(
      {
        length:
          timeSettings.value.morning_end - timeSettings.value.morning_start + 1
      },
      (_, i) => i + timeSettings.value.morning_start
    )
  } else {
    itemsHours.value = Array.from(
      {
        length:
          timeSettings.value.morning_end - timeSettings.value.morning_start + 1
      },
      (_, i) => i + timeSettings.value.afternoon_start
    )
  }

  if (reservation.value) {
    endTimeManuallySet.value = true

    reservationStore.current.name = reservation.value.name
    reservationStore.current.phone = reservation.value.phone
    reservationStore.current.extra = reservation.value.extra
    reservationStore.current.start_date = reservation.value.start_date
    reservationStore.current.end_date = reservation.value.end_date

    if (reservation.value.start_date) {
      reservationStore.current.start_hour = dayjs(
        reservation.value.start_date
      ).hour()
      reservationStore.current.start_minute = dayjs(
        reservation.value.start_date
      ).minute()
    } else {
      freetime.value = true
    }

    if (reservation.value.end_date) {
      reservationStore.current.end_hour = dayjs(
        reservation.value.end_date
      ).hour()
      reservationStore.current.end_minute = dayjs(
        reservation.value.end_date
      ).minute()
    }

    reservationStore.current.exams = reservation.value.exams?.map(
      item => item.id
    )
    getAlreadyReserved()
  } else {
    if (defaultStartDate.value) {
      reservationStore.current.start_hour = dayjs(defaultStartDate.value).hour()
      reservationStore.current.start_minute = dayjs(
        defaultStartDate.value
      ).minute()
    } else {
      reservationStore.current.start_hour = itemsHours.value[0]
      reservationStore.current.start_minute = 0
    }
    startTimeUpdate()
    endTimeUpdate()
  }
})
onUnmounted(() => {
  uiStore.dateBar.readOnly = false
  reservationStore.resetCurrent()
})

const freetime = ref(false)

watch(freetime, value => {
  if (!value) {
    startTimeUpdate()
    endTimeUpdate()
  } else {
    reservationStore.current.start_date = null
    reservationStore.current.end_date = null
  }
})

const startAndEndAreCoherent = computed(() => {
  if (
    isNil(reservationStore.current.start_hour) ||
    isNil(reservationStore.current.start_minute) ||
    isNil(reservationStore.current.end_hour) ||
    isNil(reservationStore.current.end_minute)
  )
    return true
  const start = dayjs()
    .set('hour', reservationStore.current.start_hour ?? 0)
    .set('minute', reservationStore.current.start_minute ?? 0)
    .set('second', 30)
  const end = dayjs()
    .set('hour', reservationStore.current.end_hour ?? 0)
    .set('minute', reservationStore.current.end_minute ?? 0)
    .set('second', 30)

  return start.isBefore(end)
})

const saveReservation = () => {
  if (reservation.value) {
    form
      .transform(data => ({
        ...data,
        room_id: roomData.value.id,
        name: reservationStore.current.name,
        exams: reservationStore.current.exams,
        phone: reservationStore.current.phone,
        start_date: reservationStore.current.start_date,
        end_date: reservationStore.current.end_date,
        extra: reservationStore.current.extra
      }))
      .put(
        route('reservations.update', {
          reservation: reservation.value.id
        }),
        {
          preserveScroll: true,
          preserveState: true,
          onSuccess: () => {
            console.log('onSuccess', reservationStore.current)
          },
          onError: () => {
            console.log('onError', reservationStore.current)
          }
        }
      )
  } else {
    form
      .transform(data => ({
        ...data,
        room_id: roomData.value.id,
        name: reservationStore.current.name,
        exams: reservationStore.current.exams,
        phone: reservationStore.current.phone,
        start_date: reservationStore.current.start_date,
        end_date: reservationStore.current.end_date,
        extra: reservationStore.current.extra
      }))
      .post(route('reservations.store'), {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          console.log('onSuccess', reservationStore.current)
        },
        onError: () => {
          console.log('onError', reservationStore.current)
        }
      })
  }
}

const examsDuration = computed(() => {
  const selectedItems = exams.value.filter(item =>
    reservationStore.current.exams.includes(item.id)
  )
  const sumDuration = selectedItems.reduce(
    (sum, item) => sum + (item.duration ?? 0),
    0
  )
  return sumDuration
})

const reservationDuration = computed(() => {
  if (
    reservationStore.current.start_date &&
    reservationStore.current.end_date &&
    startAndEndAreCoherent.value
  ) {
    return dayjs(reservationStore.current.end_date).diff(
      reservationStore.current.start_date,
      'minute'
    )
  }
  return 0
})

const examsUpdated = () => {
  if (examsDuration.value > 0 && !endTimeManuallySet.value) {
    let end = dayjs(roomData.value.date)
      .set('hour', reservationStore.current.start_hour ?? 0)
      .set('minute', reservationStore.current.start_minute ?? 0)
      .add(examsDuration.value, 'minute')

    if (roomData.value.am_or_pm === 'AM') {
      if (end.hour() > timeSettings.value.morning_end) {
        end = dayjs(roomData.value.date)
          .set('hour', timeSettings.value.morning_end)
          .set('minute', 55)
      }
    } else {
      console.log('end', end.hour(), timeSettings.value.afternoon_end)
      if (end.hour() > timeSettings.value.afternoon_end) {
        end = dayjs(roomData.value.date)
          .set('hour', timeSettings.value.afternoon_end)
          .set('minute', 55)
      }
    }

    reservationStore.current.end_hour = end.hour()
    reservationStore.current.end_minute = end.minute()

    endTimeUpdate()
  }
}
const startTimeUpdate = () => {
  if (
    !isNil(reservationStore.current.start_hour) &&
    !isNil(reservationStore.current.start_minute)
  ) {
    const start = dayjs(roomData.value.date)
      .set('hour', reservationStore.current.start_hour ?? 0)
      .set('minute', reservationStore.current.start_minute ?? 0)
      .format('YYYY-MM-DD HH:mm:ss')
    reservationStore.current.start_date = start

    examsUpdated()
    getAlreadyReserved()
  }
}

const endTimeUpdate = () => {
  if (
    !isNil(reservationStore.current.end_hour) &&
    !isNil(reservationStore.current.end_minute)
  ) {
    const end = dayjs(roomData.value.date)
      .set('hour', reservationStore.current.end_hour ?? 0)
      .set('minute', reservationStore.current.end_minute ?? 0)
      .format('YYYY-MM-DD HH:mm:ss')
    reservationStore.current.end_date = end
  }
  getAlreadyReserved()

  if (reservationDuration.value < 10 && reservationDuration.value > 0) {
    alertMin10Minutes.value = true
  } else {
    alertMin10Minutes.value = false
  }
}
const timeLabel = computed(() => {
  let ret = '-'
  if (startAndEndAreCoherent.value) {
    if (reservationStore.current.start_date) {
      ret = dayjs(reservationStore.current.start_date).format('HH:mm')
    }
    if (reservationStore.current.end_date) {
      ret += ' - ' + dayjs(reservationStore.current.end_date).format('HH:mm')
    }
    if (reservationDuration.value) {
      ret += ' (' + reservationDuration.value + ' minuti)'
    }
  }
  return ret
})

const debouncedGetPatients = debounce(async search => {
  getPatients(search)
}, 200)

const getPatients = async search => {
  if (!search) return (patientsResults.value = [])
  const response = await axios.get(route('patients.get', { name: search }))
  patientsResults.value = response.data
}

const selectPatient = patient => {
  reservationStore.current.name = patient.name
  reservationStore.current.phone = patient.phone
  patientsResults.value = []
}

const loadingCheckAlreadyReserved = ref(false)
const getAlreadyReserved = async () => {
  loadingCheckAlreadyReserved.value = true
  if (
    reservationStore.current.start_date &&
    reservationStore.current.end_date &&
    startAndEndAreCoherent.value
  ) {
    const response = await axios.get(
      route('room.check', {
        start_date: reservationStore.current.start_date,
        end_date: reservationStore.current.end_date,
        room: roomData.value.id,
        reservation: reservation.value?.id
      })
    )
    alreadyReservedRows.value = response.data
  } else {
    alreadyReservedRows.value = []
  }
  loadingCheckAlreadyReserved.value = false
}

const reservationRows = ref([])
const roomModal = ref(false)
const openRoomModal = async (id = null) => {
  if (id) await getRoomData(id)
  roomModal.value = true
}

const closeRoomModal = () => {
  roomModal.value = false
  reservationRows.value = []
}

const getRoomData = async id => {
  const [response] = await Promise.all([
    axios.get(
      route('room.get-data', {
        room: id
      })
    ),
    wait(50)
  ])
  reservationRows.value = response?.data?.reservations ?? []
}

const deletePatient = async id => {
  const { confirm, close } = useConfirm()
  const res = await confirm({
    title: 'Elimina',
    text: `Vuoi eliminare questo suggerimento salvato?`,
    yesText: 'Elimina'
  })
  if (res) {
    await axios.delete(route('patients.destroy', { patient: id }))
    await getPatients(reservationStore.current.name)
  }
  close()
}
</script>
<style lang="scss">
.new-reservation-container {
  @apply mt-4;
  .label-text {
    @apply text-grey-700 font-semibold;
    line-height: 24px;
  }
  .card {
    @apply bg-gray-50 rounded-lg shadow p-5 border border-gray-200;
  }
  .exams-card {
    @apply bg-gray-50 rounded-lg shadow p-5 border border-gray-200;
    @media screen and (min-width: 641px) {
      .exams-container {
        height: calc(100vh - 13rem);
      }
    }
  }
  .searchbar-container {
    @apply relative;
    &:focus-within {
      .search-results-container:not(:empty) {
        @apply w-full h-auto max-h-[345px] overflow-auto pb-0;
      }
    }

    .search-results-container {
      @apply absolute top-[60px] md:top-[70px] left-0 z-10 w-full h-0 max-h-0 py-0 px-0 overflow-hidden transition-all rounded-lg bg-white text-primary-800 font-poppins leading-6 shadow-lg;
      .search-results-row {
        @apply flex items-center justify-start text-left w-full hover:bg-primary-500 hover:text-white px-4 min-h-[48px];
        button {
          @apply min-h-[48px] w-full flex flex-col items-start justify-center text-left;
          p {
            @apply flex justify-start;
          }
        }
      }
      .search-results-row:hover .paragraph-small {
        @apply text-primary-300;
      }
    }
  }
  .bb-base-radio-group__container {
    @apply flex gap-y-4 gap-x-0.5 flex-wrap;
    .bb-base-radio-group-option {
      @apply mr-0 w-auto;
    }
    .bb-base-radio {
      @apply flex;
      .bb-base-radio-container {
        .option {
          @apply w-auto inline-block bg-white rounded-xl py-2 px-4 text-grey-800 font-medium transition-colors border border-grey-200;

          &__image {
            @apply rounded-2xl;
          }

          &--focused {
            @apply border-primary;
          }
          &--selected {
            @apply bg-primary-100 border-primary  text-primary;
          }
          &--disabled {
            @apply opacity-40 cursor-default;
          }
        }
      }
    }
  }
  .bb-base-checkbox-group__container {
    @apply flex flex-col gap-y-2.5 gap-x-0.5 flex-wrap px-4;
    .bb-base-checkbox-group-option {
      @apply mr-0 w-full;
    }
    .bb-base-checkbox {
      @apply flex w-full;
      .bb-base-checkbox-container {
        @apply w-full;
        .option {
          @apply w-full inline-block bg-white rounded-full py-2 px-4 text-grey-800 font-medium transition-colors border border-grey-200;

          &__image {
            @apply rounded-2xl;
          }

          &--focused {
            @apply border-primary;
          }
          &--selected {
            @apply bg-primary-100 border-primary  text-primary;
          }
          &--disabled {
            @apply opacity-40 cursor-default;
          }
        }
      }
    }
  }
}
</style>
