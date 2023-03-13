/**
 * Creator for an Input Function
 * V = Collection Value Type
 * OutputType = The Function Output Type
 */
export type InputFN<V, OutputType> = (value: V, key: K, collection: Collection<V>) => OutputType;

/** The Key Types For Collections */
export type K = string | number;

/**
 * A mutation of an Array and a Map used all around Discord.js User for performance and more custom-made uses.
 * @export
 * @class Collection
 * @extends {Map<K, V>}
 * @template V The Type for the Collection Values
 */
export class Collection<V> extends Map<K, V> {
	/**
	 * The key name used to get the key from values
	 * @type {string}
	 * @memberof Collection
	 */
	public keyName: string;

	/**
	 * A collection used all around Discord.js User for performance and ease of use abilities.
	 * @param {V[]} [values=[]] An array of the default items to put into the collection
	 * @param {string} [key="id"] How the Collection should get the keys of Items
	 * @memberof Collection
	 */
	constructor(values: V[] = [], key: string = "id") {
		let data: any = values;
		if (Array.isArray(values)) data = values.map(v => [v[key], v]);
		super(data);
		this.keyName = key;
	}

	/**
	 * Converts the Collection into a JSON Array
	 * @returns {V[]} The JSON Array
	 * @memberof Collection
	 */
	public toJSON(): V[] {
		return [...this.values()];
	}

	/**
	 * Push items to the Collection (If any items already exist, edits them)
	 * @param {...V[]} items The items to push (REST PARAM)
	 * @returns {this} The Collection after editing
	 * @memberof Collection
	 */
	public push(...items: V[]): this {
		for (const item of items) this.set(item[this.keyName], item);
		return this;
	}

	/**
	 * Remove items from the collection
	 * @param {...V[]} items The items to remove (REST PARAM)
	 * @returns  {this} The Collection after editing
	 * @memberof Collection
	 */
	public remove(...items: V[]): this {
		for (const item of items) this.delete(item[this.keyName]);
		return this;
	}

	/**
	 * Find a singular item in the Collection that match a finder function
	 * @param {InputFN<V, boolean>} fn The finder function
	 * @param {unknown} [thisArg] What should be passed as the `this` item in the function
	 * @returns  {(V | undefined)} The found item (undefined if nothing found)
	 * @memberof Collection
	 */
	public find(fn: InputFN<V, boolean>, thisArg?: unknown): V | undefined {
		if (typeof fn !== "function") throw new TypeError(`${fn} is not a function`);
		if (typeof thisArg !== "undefined") fn = fn.bind(thisArg);
		for (const [key, val] of this) {
			if (fn(val, key, this)) return val;
		}
		return undefined;
	}
	/**
	 * (ASYNC) Find a singular item in the Collection
	 * @param {InputFN<V, Promise<boolean>>} fn The finder function (async)
	 * @param {unknown} [thisArg] What should be passed as the `this` item in the function
	 * @returns  {(Promise<V | undefined>)} The found item (undefined if nothing found)
	 * @memberof Collection
	 */
	public async findAsync(fn: InputFN<V, Promise<boolean>>, thisArg?: unknown): Promise<V | undefined> {
		if (typeof fn !== "function") throw new TypeError(`${fn} is not a function`);
		if (typeof thisArg !== "undefined") fn = fn.bind(thisArg);
		return await Promise.any(
			[...this].map(item =>
				fn(item[1], item[0], this).then(r => {
					if (r) {
						return item[1];
					} else {
						throw "e";
					}
				})
			)
		).catch(() => undefined);
	}

	/**
	 * Find multiple items in the Collection that match a finder function
	 * @param {InputFN<V, boolean>} fn The finder function
	 * @param {unknown} [thisArg] What should be passed as the `this` item in the function
	 * @returns {*} The found items (Empty Array if nothing found)
	 * @memberof Collection
	 */
	public filter(fn: InputFN<V, boolean>, thisArg?: unknown): Collection<V> {
		if (typeof fn !== "function") throw new TypeError(`${fn} is not a function`);
		if (typeof thisArg !== "undefined") fn = fn.bind(thisArg);
		const results = new this.constructor[Symbol.species]<V>([], this.keyName);
		for (const [key, val] of this) {
			if (fn(val, key, this)) results.set(key, val);
		}
		return results;
	}
	/**
	 * (ASYNC) Find multiple items in the Collection that match a finder function
	 * @param {InputFN<V, Promise<boolean>>} fn the finder function (async)
	 * @param {unknown} [thisArg] What should be passed as the `this` item in the function
	 * @returns {*} The found items (Empty Array if nothing found)
	 * @memberof Collection
	 */
	public async filterAsync(fn: InputFN<V, Promise<boolean>>, thisArg?: unknown): Promise<Collection<V>> {
		if (typeof fn !== "function") throw new TypeError(`${fn} is not a function`);
		if (typeof thisArg !== "undefined") fn = fn.bind(thisArg);
		const results = new this.constructor[Symbol.species]<V>([], this.keyName);
		await Promise.allSettled([...this].map(item => fn(item[1], item[0], this).then(r => (r ? results.set(item[0], item[1]) : null))));
		return results;
	}

	/**
	 * Edit every item in the Collection
	 * @template T The data type for after the Map
	 * @param {InputFN<V, T>} fn The editor function
	 * @param {unknown} [thisArg] What should be passed as the `this` item in the function
	 * @returns {*} The Edited Collection
	 * @memberof Collection
	 */
	public map<T>(fn: InputFN<V, T>, thisArg?: unknown): Collection<T> {
		if (typeof fn !== "function") throw new TypeError(`${fn} is not a function`);
		if (typeof thisArg !== "undefined") fn = fn.bind(thisArg);
		const coll = new this.constructor[Symbol.species]<T>([], this.keyName);
		for (const [key, val] of this) coll.set(key, fn(val, key, this));
		return coll;
	}
	/**
	 * (ASYNC) Edit every item in the Collection
	 * @template T The data type for after the Map
	 * @param {InputFN<V, Promise<T>>} fn The editor function (async)
	 * @param {unknown} [thisArg] What should be passed as the `this` item in the function
	 * @returns {*} The Edited Collection
	 * @memberof Collection
	 */
	public async mapAsync<T>(fn: InputFN<V, Promise<T>>, thisArg?: unknown): Promise<Collection<T>> {
		if (typeof fn !== "function") throw new TypeError(`${fn} is not a function`);
		if (typeof thisArg !== "undefined") fn = fn.bind(thisArg);
		const coll = new this.constructor[Symbol.species]<T>([], this.keyName);
		await Promise.allSettled([...this].map(item => fn(item[1], item[0], this).then(v => coll.set(item[0], v))));
		return coll;
	}

	/**
	 * Get a singular random item from the Collection
	 * @returns {*} The random item found
	 * @memberof Collection
	 */
	public randomItem(): V {
		return [...this.values()][Math.floor(Math.random() * this.size)];
	}
	/**
	 * Get multiple random items from the Collection
	 * @param {number} [amount=1] The amount to get (Defaults to 1)
	 * @returns {*} An array containing the passed amount of random items
	 * @memberof Collection
	 */
	public random(amount: number = 1): V[] {
		const arr = [...this.values()];
		if (!arr?.length) return [];
		return Array.from({ length: Math.min(amount, arr.length) }, (): V => arr.splice(Math.floor(Math.random() * arr.length), 1)[0]!);
	}

	/**
	 * Reverse the Collection
	 *
	 * WARNING: THIS EDITS THE COLLECTION
	 * @returns {*} The Collection after editing
	 * @memberof Collection
	 */
	public reverse(): this {
		const entries = [...this.entries()].reverse();
		this.clear();
		for (const [key, value] of entries) this.set(key, value);
		return this;
	}

	/**
	 * Removes items that satisfy the provided filter function
	 * @param {InputFN<V, boolean>} fn The filter function
	 * @param {unknown} [thisArg] What should be passed as the `this` item in the function
	 * @returns {*} The number of removed entries
	 * @memberof Collection
	 */
	public sweep(fn: InputFN<V, boolean>, thisArg?: unknown): number {
		if (typeof fn !== "function") throw new TypeError(`${fn} is not a function`);
		if (typeof thisArg !== "undefined") fn = fn.bind(thisArg);
		const previousSize = this.size;
		for (const [key, val] of this) {
			if (fn(val, key, this)) this.delete(key);
		}
		return previousSize - this.size;
	}
	/**
	 * (ASYNC) Removes items that satisfy the provided filter function
	 * @param {InputFN<V, Promise<boolean>>} fn The filter function (async)
	 * @param {unknown} [thisArg] What should be passed as the `this` item in the function
	 * @returns {*} The number of removed entries
	 * @memberof Collection
	 */
	public async sweepAsync(fn: InputFN<V, Promise<boolean>>, thisArg?: unknown): Promise<number> {
		if (typeof fn !== "function") throw new TypeError(`${fn} is not a function`);
		if (typeof thisArg !== "undefined") fn = fn.bind(thisArg);
		const previousSize = this.size;
		await Promise.allSettled([...this].map(item => fn(item[1], item[0], this).then(passed => (passed ? this.delete(item[0]) : null))));
		return previousSize - this.size;
	}
}
