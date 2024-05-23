class MessageDispatcher {
    private handlers: Map<string, ((payload: any) => void)[]> = new Map();
  
    registerHandler(type: string, handler: (payload: any) => void): () => void {
      const existing = this.handlers.get(type) || [];
      existing.push(handler);
      this.handlers.set(type, existing);
      // Return a function to deregister the handler
      return () => this.handlers.set(type, existing.filter((h) => h !== handler));
    }
  
    dispatch(event: MessageEvent) {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);
      const handler = this.handlers.get(message.type);
      if (handler) {
        handler.forEach((h) => h(message.payload));
      }
    }
  }
  export default MessageDispatcher;