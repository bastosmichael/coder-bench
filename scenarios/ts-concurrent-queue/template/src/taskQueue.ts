
// @ts-nocheck
export class TaskQueue {
    constructor(opts) { }
    add(task) { throw new Error("Not implemented"); }
    status() { return { pending: 0, running: 0, completed: 0, failed: 0 }; }
}
