<template>
  <div v-bind="containerAttributes" ref="calendar">
    <div class="bb-base-date-picker__header">
      <div>
        <button
          class="bb-base-date-picker__year-button"
          @click="setSelectionModeToYear"
          type="button"
        >
          {{ currentDate.format("YYYY") }} <span></span>
        </button>
      </div>
      <div class="bb-base-date-picker__selected-day-label">
        <span class="bb-base-date-picker__weekday"
          >{{ currentDate.format("ddd") }},
        </span>
        <span class="bb-base-date-picker__monthday">{{ currentDate.format("DD") }}</span>
        <button
          class="bb-base-date-picker__month-button"
          @click="selectionMode = 'month'"
          type="button"
        >
          {{ currentDate.format("MMMM") }}
        </button>
      </div>
    </div>
    <div class="bb-base-date-picker__small-month-selector" v-if="selectionMode === 'day'">
      <button
        class="bb-base-date-picker__previous-month-button"
        @click="decreaseMonth"
        type="button"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M13.939 4.939 6.879 12l7.06 7.061 2.122-2.122L11.121 12l4.94-4.939z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Transition name="fade" mode="out-in">
        <button
          :key="currentDate.month()"
          class="bb-base-date-picker__current-month-button"
          @click="selectionMode = 'month'"
          type="button"
        >
          {{ currentDate.format("MMMM") }}
        </button>
      </Transition>

      <button
        class="bb-base-date-picker__next-month-button"
        @click="increaseMonth"
        type="button"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="rotate-180">
          <path
            d="M13.939 4.939 6.879 12l7.06 7.061 2.122-2.122L11.121 12l4.94-4.939z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
    <div
      class="bb-base-date-picker__small-year-selector"
      v-if="selectionMode === 'month'"
    >
      <button
        class="bb-base-date-picker__previous-year-button"
        @click="decreaseYear"
        type="button"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M13.939 4.939 6.879 12l7.06 7.061 2.122-2.122L11.121 12l4.94-4.939z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Transition name="fade" mode="out-in">
        <button
          :key="currentDate.year()"
          class="bb-base-date-picker__current-year-button"
          @click="setSelectionModeToYear"
          type="button"
        >
          {{ currentDate.format("YYYY") }}
        </button>
      </Transition>
      <button
        class="bb-base-date-picker__next-year-button"
        @click="increaseYear"
        type="button"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="rotate-180">
          <path
            d="M13.939 4.939 6.879 12l7.06 7.061 2.122-2.122L11.121 12l4.94-4.939z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
    <div class="h-8" v-show="selectionMode === 'year'"></div>
    <div class="bb-base-date-picker-calendar">
      <Transition name="fade" mode="out-in">
        <table :key="currentDate.month()">
          <thead>
            <tr>
              <th v-for="header in mappedHeaders" :key="header.id" scope="col">
                {{ header.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cells, id) in indexedRows" :key="id">
              <td
                v-for="cell in cells"
                :key="cell.id"
                :class="{
                  'bb-base-date-picker-date': true,
                  'bb-base-date-picker-date--selected': cell.selected,
                  'bb-base-date-picker-date--first': cell.first,
                  'bb-base-date-picker-date--middle': cell.middle,
                  'bb-base-date-picker-date--last': cell.last,
                  'bb-base-date-picker-date--highlighted': cell.highlighted,
                }"
              >
                <button
                  class="bb-base-date-picker-date__button"
                  :id="cell.buttonId"
                  @click="onButtonClick"
                  type="button"
                >
                  {{ cell.label }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </Transition>

      <Transition name="fade">
        <div
          v-show="selectionMode === 'month'"
          class="bb-base-date-picker__month-selector"
        >
          <button
            v-for="option in monthOptions"
            :key="option.key"
            :class="{
              'bb-base-date-picker__month-selector-month': true,
              'bb-base-date-picker__month-selector-month--selected': option.selected,
            }"
            @click="option.handler"
            type="button"
          >
            {{ option.text }}
          </button>
        </div>
      </Transition>

      <Transition name="fade">
        <div
          v-show="selectionMode === 'year'"
          class="bb-base-date-picker__year-selector"
          ref="yearSelector"
        >
          <button
            v-for="option in yearOptions"
            :key="option.key"
            :class="{
              'bb-base-date-picker__year-selector-year': true,
              'bb-base-date-picker__year-selector-year--selected': option.selected,
            }"
            @click="option.handler"
            type="button"
          >
            {{ option.text }}
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "@vue/runtime-core";
import dayjs, { Dayjs } from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { groupBy } from "@/js/Utilities/functions/groupBy";
import { isNil } from "@/js/Utilities/functions/isNil";
import "dayjs/locale/it";
import { isNotNil } from "@/js/Utilities/functions/isNotNil";
import { last } from "@/js/Utilities/functions/last";

dayjs.extend(weekOfYear);
dayjs.locale("it");

interface Props {
  firstDayOfWeek?: number;
  id?: string;
  modelValue?: string | string[] | null;
  multiple?: boolean;
  range?: boolean;
  width?: number | string;
}

type Header = {
  label: string;
  id: string;
  original: Dayjs;
};

type Cell = {
  label: string;
  id: string;
  buttonId: string;
  original: Dayjs;
  selected: boolean;
  first: boolean;
  last: boolean;
  middle: boolean;
  highlighted: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  width: 290,
  firstDayOfWeek: 1,
});

const emit = defineEmits(["update:modelValue"]);

if (props.multiple && props.range) {
  throw new Error("Date picker cannot be both multiple and range");
}

const calendar = ref<HTMLElement | null>(null);
defineExpose(calendar);

const selectionMode = ref("day");
const yearSelector = ref<HTMLElement | null>(null);

let initialDate = ref(dayjs());

if (Array.isArray(props.modelValue)) {
  if (props.modelValue.length) {
    initialDate.value = dayjs(props.modelValue[0]);
  }
} else if (props.modelValue) {
  initialDate.value = dayjs(props.modelValue);
}

let currentDate = ref(initialDate.value.clone());

const mappedHeaders = computed<Header[]>(() => {
  return (
    new Array(7)
      .fill("")
      // Sort days based on first day of the week
      .map((el, index) => dayjs().day((index + props.firstDayOfWeek) % 7))
      .map((day) => {
        const selected = modelValueMetadata.value.selected(day);
        return {
          label: day.format("dd").slice(0, 1).toUpperCase(),
          id: day.toISOString(),
          original: day,
          selected,
        };
      })
  );
});

const displayedDates = computed<Cell[]>(() => {
  let startOfMonth = currentDate.value.clone().startOf("month");
  let firstValueToDisplay = startOfMonth.clone().startOf("week");
  let endOfMonth = currentDate.value.clone().endOf("month");
  let lastValueToDisplay = endOfMonth.clone().endOf("week");

  let datesInPage: Dayjs[] = [];
  const monthValue = startOfMonth.month();
  for (
    let index = firstValueToDisplay;
    index.isBefore(lastValueToDisplay);
    index = index.add(1, "day")
  ) {
    datesInPage.push(index.clone());
  }
  return datesInPage.map(
    (date): Cell => {
      const id = date.toISOString();
      const selected = !!modelValueMetadata.value.selected(date);

      const first = !!(modelValueMetadata.value.isFirstOfRange(date) && props.range);
      const last = !!(modelValueMetadata.value.isLastOfRange(date) && props.range);
      const middle = !!(selected && !first && !last && props.range);

      const highlighted = date.month() === monthValue;
      return {
        id,
        buttonId: ["date", props.id, id].filter(isNotNil).join("_"),
        label: date.get("D").toString(),
        original: date,
        selected,
        first,
        last,
        middle,
        highlighted,
      };
    }
  );
});

const indexedDates = computed(() => {
  return groupBy(displayedDates.value, (date: Cell) => date.id);
});

const indexedRows = computed<Record<string, Cell[]>>(() => {
  const indexedByWeek = groupBy(displayedDates.value, (cell: Cell) =>
    cell.original.week().toString()
  );
  return indexedByWeek;
});

const modelValueMetadata = computed(() => {
  let min = Infinity;
  let max = -Infinity;
  let selected: { [key: number]: number } = {};

  if (props.modelValue) {
    const arr = ([] as (string | Date)[])
      .concat(props.modelValue)
      .map((value) => dayjs(value).startOf("day"))
      .map((date) => date.valueOf());
    arr.forEach((item, index) => {
      if (item < min) min = item;
      if (item > max) max = item;
      selected[item] = index;
    });
  }
  return {
    min,
    max,
    index: (date: Dayjs) => selected[date.valueOf()],
    selected: (date: Dayjs) => !isNil(selected[date.valueOf()]),
    isFirstOfRange: (date: Dayjs) => date.valueOf() === min,
    isLastOfRange: (date: Dayjs) => date.valueOf() === max,
  };
});

const onButtonClick = (event: MouseEvent) => {
  if (event.target instanceof HTMLButtonElement) {
    const id = last(event.target.id.split("_"));
    const date = indexedDates.value[id][0];
    onDateselected(date);
  }
};

const onDateselected = (date: Cell) => {
  if (props.range) {
    if (props.modelValue && Array.isArray(props.modelValue)) {
      if (props.modelValue.length !== 1) {
        emit("update:modelValue", [date.original.toISOString()]);
      } else {
        if (props.modelValue.length) {
          let [from, to] = [dayjs(props.modelValue[0]), date.original].sort((a, b) =>
            a.valueOf > b.valueOf ? 1 : a.valueOf() < b.valueOf() ? -1 : 0
          );
          to = to.add(1, "day");
          const startDate = dayjs(from);

          let datesToEmit: Dayjs[] = [];
          for (let index = startDate; index.isBefore(to); index = index.add(1, "day")) {
            datesToEmit.push(index.clone());
          }
          const valueToEmit = datesToEmit.map((el) => el.toISOString());
          emit("update:modelValue", valueToEmit);
        } else {
          const valueToEmit = [...props.modelValue, date.original.toISOString()];
          emit("update:modelValue", valueToEmit);
        }
      }
    } else {
      throw new Error("Date picker is set to range but modelValue is not an array.");
    }
  } else if (props.multiple) {
    if (props.modelValue && Array.isArray(props.modelValue)) {
      if (!date.selected) {
        emit("update:modelValue", [...props.modelValue, date.original.toISOString()]);
      } else {
        const asString = date.original.toISOString();
        const valueToEmit = props.modelValue.filter((el) => el !== asString);
        emit("update:modelValue", valueToEmit);
      }
    } else {
      throw new Error("datepicker is set to multiple but modelValue is not an array.");
    }
  } else {
    if (date.selected) {
      emit("update:modelValue", null);
    } else {
      emit("update:modelValue", date.original.toISOString());
    }
  }
};

const monthOptions = computed(() => {
  const currentMonth = currentDate.value.month();
  return new Array(12)
    .fill(currentDate.value.clone().startOf("year"))
    .map((date: Dayjs, index) => date.add(index, "month"))
    .map((date) => ({
      text: date.format("MMMM"),
      key: date.unix(),
      selected: date.month() === currentMonth,
      handler: () => setDateToMonth(date),
    }));
});

const decreaseMonth = () => {
  currentDate.value = currentDate.value.subtract(1, "month");
};
const increaseMonth = () => {
  currentDate.value = currentDate.value.add(1, "month");
};

const setDateToMonth = (date: Dayjs) => {
  const month = date.get("month");
  const toEmit = currentDate.value.set("month", month);
  emit("update:modelValue", toEmit.toISOString());
  selectionMode.value = "day";
};

const setSelectionModeToYear = async () => {
  selectionMode.value = "year";
  await nextTick();
  const selectedYear = yearSelector.value?.querySelector(
    ".bb-base-date-picker__year-selector-year--selected"
  );
  if (selectedYear) {
    selectedYear.scrollIntoView({ block: "center", inline: "center" });
  }
};

const yearOptions = computed(() => {
  const currentYear = currentDate.value.year();
  const pastYears = new Array(100)
    .fill(currentDate.value.clone())
    .map((date: Dayjs, index, arr) => date.year(currentYear - arr.length + index));
  const futureYears = new Array(100)
    .fill(currentDate.value.clone())
    .map((date: Dayjs, index, arr) => date.year(currentYear + index + 1));
  return pastYears
    .concat(currentDate.value.clone())
    .concat(futureYears)
    .map((date) => ({
      text: date.format("YYYY"),
      key: date.unix(),
      selected: date.year() === currentYear,
      handler: () => setDateToYear(date),
    }));
});

const decreaseYear = () => {
  const toEmit = currentDate.value.subtract(1, "year");
  emit("update:modelValue", toEmit.toISOString());
};
const increaseYear = () => {
  const toEmit = currentDate.value.add(1, "year");
  emit("update:modelValue", toEmit.toISOString());
};

const setDateToYear = (date: Dayjs) => {
  const year = date.get("year");
  const toEmit = currentDate.value.set("year", year);
  emit("update:modelValue", toEmit.toISOString());
  selectionMode.value = "month";
};

watch(
  () => props.modelValue,
  () => {
    if (props.modelValue) {
      if (Array.isArray(props.modelValue)) {
        if (props.modelValue.length) {
          currentDate.value = dayjs(props.modelValue[0]);
        } else {
          currentDate.value = dayjs();
        }
      } else {
        currentDate.value = dayjs(props.modelValue);
      }
    } else currentDate.value = dayjs();
  }
);

const containerAttributes = computed(() => {
  const classes = {
    "bb-base-date-picker": true,
  };
  let width: string;
  // If the width is a css unit string use it, if it is a number or number string add px
  if (typeof props.width === "string" && Number.isNaN(Number(props.width))) {
    width = props.width;
  } else {
    width = `${props.width}px`;
  }
  const style = {
    width: width,
  };

  return {
    class: classes,
    style,
  };
});
</script>

<style lang="postcss">
.bb-base-date-picker {
  @apply border rounded-lg bg-white;

  &__header {
    @apply py-2 pl-3 bg-primary-600 -ml-[1px] -mr-[1px] -mt-[1px] rounded-t-lg text-white;

    .bb-base-date-picker__year-button {
      @apply text-xl mr-5 opacity-75 hover:opacity-100;
    }

    .bb-base-date-picker__selected-day-label {
      @apply text-2xl capitalize;

      .bb-base-date-picker__weekday {
        @apply inline-block mr-1;
      }
      .bb-base-date-picker__monthday {
        @apply inline-block mr-1;
      }
      .bb-base-date-picker__month-button {
        @apply capitalize;
      }
    }
  }

  &__small-month-selector {
    @apply relative flex items-center justify-between px-4 gap-x-3 mt-2 font-bold;

    .bb-base-date-picker__previous-month-button,
    .bb-base-date-picker__next-month-button {
      @apply bg-primary-500 h-5 w-5 rounded-full inline-flex items-center justify-center text-white;
    }
    .bb-base-date-picker__current-month-button {
      @apply capitalize absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2;
    }
  }
  &__small-year-selector {
    @apply flex items-center justify-between px-4 gap-x-3 mt-2 font-bold;

    .bb-base-date-picker__previous-year-button,
    .bb-base-date-picker__next-year-button {
      @apply bg-primary-500 h-5 w-5 rounded-full inline-flex items-center justify-center text-white;
    }
    .bb-base-date-picker__current-year-button {
      @apply capitalize;
    }
  }

  &-calendar {
    @apply relative p-2 h-[270px];

    > table {
      @apply w-full;

      td {
        @apply aspect-square;
      }
    }
  }
  &-date {
    &--selected {
      .bb-base-date-picker-date__button {
        @apply bg-primary-300 text-white;
      }
    }
    &--first {
      .bb-base-date-picker-date__button {
        @apply rounded-l-full;
      }
    }
    &--middle {
      .bb-base-date-picker-date__button {
        @apply rounded-none;
      }
    }
    &--last {
      .bb-base-date-picker-date__button {
        @apply rounded-r-full;
      }
    }
    &--highlighted {
      .bb-base-date-picker-date__button {
        @apply text-black;
      }
    }
    &:not([class*="--first"]):not([class*="--last"]):not([class*="--middle"]) {
      .bb-base-date-picker-date__button {
        @apply rounded-full;
      }
    }
    &__button {
      @apply inline-block w-full h-9 transition-colors text-gray-300;
    }
  }

  &__month-selector {
    @apply absolute inset-0 py-5 px-2 bg-white grid grid-cols-3 grid-rows-4 gap-x-2 gap-y-4;

    &-month {
      @apply rounded-md hover:bg-primary-200   capitalize whitespace-nowrap text-ellipsis px-1 overflow-hidden transition-colors;

      &--selected {
        @apply bg-primary-500 text-white;
      }
    }
  }
  &__year-selector {
    @apply absolute inset-0 -mt-6 bg-white overflow-auto;

    &-year {
      @apply inline-block w-full p-2 hover:bg-primary-200;

      &--selected {
        @apply bg-primary-500 hover:bg-primary-500 text-white;
      }
    }
  }
}

.fade-enter-active {
  transition: all 0.15s ease-out;
}

.fade-leave-active {
  transition: all 0.15s cubic-bezier(1, 0.5, 0.8, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
