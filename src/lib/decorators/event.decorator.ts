export interface EventDefinition {
  name: string;
  action: Function;
  disabled: boolean;
  once: boolean;
  module: string;
}
export const EVENTS: Record<string, [EventDefinition]> = {};
const Event = (event: string, once: boolean = false, disabled = false) => {
  return <MethodDecorator>(
    function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      let t = new target.constructor();
      if (EVENTS.hasOwnProperty(event)) {
        EVENTS[event].push({
          action: descriptor.value,
          name: event,
          disabled: disabled,
          once: once,
          module: t.name,
        });
      } else {
        EVENTS[event] = [
          {
            action: descriptor.value,
            name: event,
            disabled: disabled,
            once: once,
            module: t.name,
          },
        ];
      }
    }
  );
};
export default Event;
