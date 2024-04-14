import { Client } from "redis-om";

class Redis {
  private client: Client;
  private url: string;
  constructor({ url }: { url: string }) {
    this.client = new Client();
    this.url = url;
  }

  async open() {
    await this.client.open(this.url);
  }

  async close() {
    await this.client.close();
  }
}

export default Redis;
