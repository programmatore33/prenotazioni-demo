<template>
  <Head title="Dashboard" />

  <AuthenticatedLayout>
    <div
      class="main-dashboard grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-8xl h-full"
    >
      <template v-if="!loading">
        <template v-for="room in roomsData" :key="room.id">
          <Room :id="room.id" :room="room"></Room>
        </template>

        <div
          class="room-card flex flex-col rounded-lg border-2 border-primary overflow-hidden print:hidden"
          v-if="(!roomsData || roomsData.length < 4) && !isPast"
        >
          <div
            class="flex flex-col flex-auto gap-2 items-center justify-center p-6 text-primary min-h-[280px]"
          >
            <button type="button" @click="openRoomModal()">
              <BbIcon type="plus_circle" size="36"></BbIcon>
              <p>Aggiungi Stanza</p>
            </button>
          </div>
        </div>
        <div
          class="flex justify-center col-span-2"
          v-else-if="!roomsData || roomsData.length == 0"
        >
          <p>Nessuna stanza presente</p>
        </div>
      </template>
      <Transition name="fade">
        <div class="loader-overlay" v-if="loading"></div>
      </Transition>
    </div>

    <BbDialog
      size="md"
      title="Aggiungi stanza"
      v-model="roomModal"
      @hidden="closeRoomModal"
    >
      <BbForm v-if="form" v-slot="{ valid }" @submit="saveRoom">
        <div class="grid grid-cols-1 gap-4 px-8 py-4">
          <BbTextInput
            placeholder="Es. Dott. Rossi"
            label="Nome stanza*"
            :rules="{ required: true, max: 254 }"
            v-model="form.name"
          />

          <BbSelect
            :disabled="!!form.id"
            placeholder="Seleziona..."
            legend="Tipologia"
            label="Tipologia"
            :items="typologies"
            itemText="name"
            itemValue="id"
            v-model="form.typology_id"
          />

          <div class="flex justify-end gap-2 my-4">
            <BbButton
              :disabled="form.processing"
              color="tertiary"
              type="button"
              @click="closeRoomModal"
            >
              <span>Annulla</span>
            </BbButton>
            <BbButton
              :loading="form.processing"
              :disabled="!valid || form.processing"
              color="primary"
              type="submit"
            >
              <span>Salva</span>
            </BbButton>
          </div>
        </div>
      </BbForm>
    </BbDialog>
  </AuthenticatedLayout>
</template>
<script setup>
import axios from 'axios'
import { Head, useForm, usePage } from '@inertiajs/vue3'
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { useUI } from '@/js/Store/ui'
import { useEventBus } from '@/js/composables/useEventBus'
import { wait } from '@/js/Utilities/functions/wait'
import dayjs from 'dayjs'
import { debounce } from '@/js/Utilities/functions/debounce'

import AuthenticatedLayout from '@/js/Layouts/AuthenticatedLayout.vue'
import BbDialog from '@/js/Components/Common/BbDialog.vue'
import BbButton from '@/js/Components/Common/BbButton.vue'
import BbForm from '@/js/Components/form-controls/BbForm.vue'
import BbIcon from '@/js/Components/Common/BbIcon.vue'
import BbSelect from '@/js/Components/form-controls/BbSelect.vue'
import BbTextInput from '@/js/Components/form-controls/BbTextInput.vue'
import Room from '@/js/Components/Common/Room.vue'

const { on, off } = useEventBus()

onMounted(() => {
  on('date:update', debouncedGetRoomsData)
  on('room:edit', openRoomModal)
})
onBeforeUnmount(() => {
  off('date:update', debouncedGetRoomsData)
  off('room:edit', openRoomModal)
})

const UI = useUI()

const roomsData = ref(null)
const roomModal = ref(false)

const typologies = computed(() => usePage().props.typologies)

const isPast = computed(() => dayjs(UI.dateBar.date).isBefore(dayjs(), 'day'))

const form = useForm({
  id: null,
  name: null,
  typology_id: null
})

const init = async () => {
  await getRoomsData()
}

onMounted(() => {
  init()
})

const loading = ref(false)
const getRoomsData = async () => {
  loading.value = true
  roomsData.value = null
  const [response] = await Promise.all([
    axios.get(
      route('rooms.get-data', {
        amPm: UI.dateBar.amOrPm,
        date: dayjs(UI.dateBar.date).format('DD MMMM YYYY')
      })
    ),
    wait(50)
  ])
  roomsData.value = response.data
  loading.value = false
}

const debouncedGetRoomsData = debounce(async () => {
  getRoomsData()
}, 400)

const openRoomModal = async (id = null) => {
  if (id) await getRoomData(id)
  roomModal.value = true
}

const closeRoomModal = () => {
  roomModal.value = false
  form.id = null
  form.name = null
  form.typology_id = null
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
  form.id = response?.data.id
  form.name = response?.data.name
  form.typology_id = response?.data.typology_id
}

const saveRoom = async () => {
  if (form.id) {
    await form.put(route('rooms.update', { room: form.id }), {
      onSuccess: () => {
        closeRoomModal()
        init()
      },
      onError: () => {}
    })
  } else {
    await form
      .transform(data => ({
        ...data,
        date: dayjs(UI.dateBar.date).format('DD MMMM YYYY'),
        am_or_pm: UI.dateBar.amOrPm
      }))
      .post(route('rooms.store'), {
        onSuccess: () => {
          closeRoomModal()
          init()
        },
        onError: () => {}
      })
  }
}
</script>
<style lang="postcss">
.main-dashboard {
  @apply relative;
  .loader-overlay {
    @apply flex justify-center gap-x-4 items-start p-10 absolute inset-0 bg-gray-100;
  }
}
</style>
