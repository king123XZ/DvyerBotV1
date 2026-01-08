class DownloadQueue {
  constructor(limit = 2) {
    this.limit = limit
    this.running = 0
    this.queue = []
  }

  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject })
      this.run()
    })
  }

  async run() {
    if (this.running >= this.limit) return
    const item = this.queue.shift()
    if (!item) return

    this.running++
    try {
      const result = await item.task()
      item.resolve(result)
    } catch (e) {
      item.reject(e)
    } finally {
      this.running--
      this.run()
    }
  }
}

module.exports = new DownloadQueue(2)
