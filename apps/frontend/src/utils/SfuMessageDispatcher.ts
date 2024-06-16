import {ClientMessage,ClientMessageType} from "@repo/common/sfu";

type PayloadType<T extends ClientMessageType> = Extract<ClientMessage, { type: T }>['payload'];

class SfuMessageDispatcher {

    private handlers: Map<ClientMessageType, ((payload: any) => void)[]> = new Map();
  
    registerHandler<T extends ClientMessageType>(type: T, handler:  (payload: PayloadType<T>) => Promise<void>): () => void {
      const existing = this.handlers.get(type) || [];
      existing.push(handler);
      this.handlers.set(type, existing);
      // Return a function to deregister the handler
      return () => this.handlers.set(type, existing.filter((h) => h !== handler));
    }
  
    dispatch(event: MessageEvent) {
      const message = JSON.parse(event.data) as ClientMessage;
      console.log('Received message:', message);
      const handler = this.handlers.get(message.type);
      if (handler) {
        handler.forEach((h) => h(message.payload));
      }
    }
  }
  export default SfuMessageDispatcher;