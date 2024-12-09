import { defineStore } from "pinia";
import { cloneDeep } from "@/js/Utilities/functions/cloneDeep";
import { merge } from "@/js/Utilities/functions/merge";

const model = {
    start_date: null,
    end_date: null,
    start_hour: null,
    start_minute: null,
    end_hour: null,
    end_minute: null,
    name: null,
    phone: null,
    extra: null,
    fiscal_code: null,
    room: null,
    exams: [],
};

export const useReservation = defineStore("reservation", {
    state: () => {
        return {
            current: cloneDeep(model),
        };
    },
    actions: {
        async getCurrent(id: number) {},
        setCurrent(item: any) {
            this.current = merge(this.current, item);
        },
        resetCurrent() {
            this.current = cloneDeep(model);
        },
    },
});
