const queues = new Map()

class UserQueue {
  constructor(limit = 1) {
    this.limit = limit
    this.running = 0
    this.queue = []
  }

  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject })
      this.next()
    })
  }

  async next() {
    if (this.running >= this.limit || this.queue.length === 0) return

    const { task, resolve, reject } = this.queue.shift()
    this.running++

    try {
      const result = await task()
      resolve(result)
    } catch (err) {
      reject(err)
    } finally {
      this.running--
      this.next()
    }
  }
}

module.exports = function getQueue(userId) {
  if (!queues.has(userId)) {
    queues.set(userId, new UserQueue(1)) // 1 descarga por usuario
  }
  return queues.get(userId)
}
