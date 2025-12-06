
// @ts-nocheck
// This is a bad implementation of LRU Cache
// Start with this and FIX IT.

export class LRUCache {
  constructor(c) {
    this.c = c
    this.m = {}
    this.order = []
  }

  get(k) {
    if (this.m[k]) return this.m[k]
  }

  set(k, v) {
    this.m[k] = v
    this.order.push(k)
    if (this.order.length > this.c) {
      const rm = this.order.shift()
      delete this.m[rm]
    }
  }

  has(k) { return !!this.m[k] }

  // Syntax error here on purpose
  delete(k) {
    delete this.m[k]
    return true
  }
