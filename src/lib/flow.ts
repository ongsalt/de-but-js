/**
 * Just an observable
 * But I like this name from kotlin more
 */

export class Flow<T> {
    subscriber = new Set<(value: T, oldValue: T | undefined) => any>()

    constructor(protected _value: T) {}

    public get value(): T {
        return this._value
    }

    public set value(newValue: T) {
        this.subscriber.forEach(it => {
            it(newValue, this._value)
        })
        this._value = newValue
    }

    subscribe(fn: (value: T, oldValue: T | undefined) => any, fetchFirst = false) {
        this.subscriber.add(fn)
        if (fetchFirst) {
            fn(this.value, undefined)
        }
    }

    unsubscribe(fn: (value: T, oldValue: T | undefined) => any) {
        this.subscriber.delete(fn)
    }

    /**
     * T must be primitive 
     */
    on(value: T, fn: (value: T) => any) {
        this.subscriber.add(newValue => {
            if (newValue === value) {
                fn(newValue)
            }
        })
    }

    combine<S,U>(other: Flow<S>, combineFn: (t: T, s: S) => U): Flow<U> {
        const result = new Flow(combineFn(this.value, other.value))
        this.subscribe(it => result.value = combineFn(it, other.value))
        other.subscribe(it => result.value = combineFn(this.value, it))
        return result
    }
}