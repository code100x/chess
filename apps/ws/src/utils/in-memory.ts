// Copied from: https://github.com/code100x/cms/blob/main/src/db/Cache.ts
export class Cache {
  private inMemoryDb: Map<
    string,
    {
      value: any;
      expiry: number;
    }
  >;
  private static instance: Cache;

  private constructor() {
    this.inMemoryDb = new Map<
      string,
      {
        value: any;
        expiry: number;
      }
    >();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Cache();
    }

    return this.instance;
  }

  set(
    type: string,
    args: string[],
    value: any,
    expirySeconds: number = parseInt(process.env.CACHE_EXPIRE_S || '100', 10),
  ) {
    this.inMemoryDb.set(`${type} ${JSON.stringify(args)}`, {
      value,
      expiry: new Date().getTime() + expirySeconds * 1000,
    });
  }

  get(type: string, args: string[]) {
    const key = `${type} ${JSON.stringify(args)}`;
    const entry = this.inMemoryDb.get(key);
    if (!entry) {
      return null;
    }
    if (new Date().getTime() > entry.expiry) {
      this.inMemoryDb.delete(key);
      return null;
    }
    return entry.value;
  }

  evict(type: string, args: string[]) {
    const key = `${type} ${JSON.stringify(args)}`;
    this.inMemoryDb.delete(key);
    return null;
  }
}
