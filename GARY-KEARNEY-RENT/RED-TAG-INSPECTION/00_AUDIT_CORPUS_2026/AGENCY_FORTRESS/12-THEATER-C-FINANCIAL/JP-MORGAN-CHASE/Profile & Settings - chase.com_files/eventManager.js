define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.eventManager = void 0;
    // These references are kept in order to pass back to removeEventListener
    // They are kept as a local reference so that applications cannot `.off` events they didn't register
    const callbackReferences = {};
    const rootElem = document.body;
    const options = { passive: true };
    rootElem.eventCallbacks = rootElem.eventCallbacks || [];
    rootElem.eventBuffer = rootElem.eventBuffer || [];
    const EventManagerConstructor = () => {
        const hasOnCallback = (eventName) => rootElem.eventCallbacks?.includes(eventName);
        const on = (eventName, callback) => {
            // Preparation
            const wrappedCallback = (event) => {
                event && event.stopPropagation();
                return callback(event);
            };
            // Store for later
            callbackReferences[eventName] = callbackReferences[eventName] ?? [];
            callbackReferences[eventName].push(wrappedCallback);
            if (!hasOnCallback(eventName)) {
                rootElem.eventCallbacks?.push(eventName);
            }
            rootElem.addEventListener(eventName, wrappedCallback, options);
            handleEventBuffer(eventName);
        };
        const off = (eventName) => {
            if (eventName) {
                const callbackList = callbackReferences[eventName] ?? [];
                callbackList.forEach((callback) => {
                    rootElem.removeEventListener(eventName, callback, options);
                });
            }
        };
        const fire = (eventName, data) => {
            // If there isn't a listener for this event, buffer it
            if (!hasOnCallback(eventName)) {
                rootElem.eventBuffer?.push({ eventName, data });
            }
            // Still fire the event
            const event = new CustomEvent(eventName, { detail: data });
            return rootElem.dispatchEvent(event);
        };
        const handleEventBuffer = (eventName) => {
            // Fire any events that were registered before the listener was added
            rootElem.eventBuffer
                ?.filter((bufferEvent) => bufferEvent.eventName === eventName)
                .forEach((bufferEvent) => fire(eventName, bufferEvent.data));
            // Clean up event buffer
            rootElem.eventBuffer = rootElem.eventBuffer?.filter((bufferEvent) => bufferEvent.eventName !== eventName);
        };
        return {
            on,
            off,
            fire,
        };
    };
    exports.eventManager = EventManagerConstructor();
});
