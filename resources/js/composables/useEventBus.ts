
import mitt from "mitt";

type ApplicationEvents = {
  'date:update': void,
  'room:edit': void,
};

const emitter = mitt<ApplicationEvents>();

export const useEventBus = () => {
  return {
    on: emitter.on,
    emit: emitter.emit,
    off: emitter.off
  };
};
