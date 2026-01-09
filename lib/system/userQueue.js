const queues = new Map()

function enqueue(user, task) {
  if (!queues.has(user)) queues.set(user, [])
  queues.get(user).push(task)
}

async function process(user) {
  const queue = queues.get(user)
  if (!queue || queue.processing) return

  queue.processing = true

  while (queue.length > 0) {
    const task = queue.shift()
    try {
      await task()
    } catch (e) {
      console.error("QUEUE ERROR:", e.message)
    }
  }

  queue.processing = false
}

module.exports = { enqueue, process }

