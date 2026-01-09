const userQueues = new Map()

function addQueue(user, task) {
  if (!userQueues.has(user)) {
    userQueues.set(user, { running: false, tasks: [] })
  }

  userQueues.get(user).tasks.push(task)
}

async function runQueue(user) {
  const queue = userQueues.get(user)
  if (!queue || queue.running) return

  queue.running = true

  while (queue.tasks.length > 0) {
    const job = queue.tasks.shift()
    try {
      await job()
    } catch (e) {
      console.log("QUEUE ERROR:", e.message)
    }
  }

  queue.running = false
}

module.exports = {
  addQueue,
  runQueue
}

