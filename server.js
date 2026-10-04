/**
 * Express Backend Server
 * In-Memory Task Storage with Timestamp-based Conflict Resolution
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory Task Database
let tasks = [
  {
    id: 'task_default_1',
    text: 'Welcome to Offline Campus Connect!',
    updatedAt: new Date().toISOString()
  }
];

// GET / - Root Health Check
app.get('/', (req, res) => {
  res.json({ message: 'Offline Campus Connect API is running online.' });
});

// GET /tasks - Fetch all tasks
app.get('/tasks', (req, res) => {
  res.status(200).json(tasks);
});

// POST /tasks - Create or Update task with Conflict Handling
app.post('/tasks', (req, res) => {
  const { id, text, updatedAt } = req.body;

  // Validation
  if (!id || !text || !updatedAt) {
    return res.status(400).json({ error: 'Missing required task fields: id, text, or updatedAt.' });
  }

  const existingIndex = tasks.findIndex(t => t.id === id);

  if (existingIndex !== -1) {
    const existingTask = tasks[existingIndex];
    const incomingTime = new Date(updatedAt).getTime();
    const existingTime = new Date(existingTask.updatedAt).getTime();

    if (incomingTime > existingTime) {
      // Incoming task is newer -> Overwrite
      tasks[existingIndex] = { id, text, updatedAt };
      return res.status(200).json({
        status: 'conflict',
        message: 'Conflict resolved: newer version kept',
        task: tasks[existingIndex]
      });
    } else {
      // Server task is newer or equal -> Keep server version
      return res.status(200).json({
        status: 'conflict',
        message: 'Conflict resolved: server version kept',
        task: existingTask
      });
    }
  }

  // Create new task
  const newTask = { id, text, updatedAt };
  tasks.push(newTask);
  return res.status(201).json({
    status: 'created',
    message: 'Task created successfully',
    task: newTask
  });
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = tasks.length;
  tasks = tasks.filter(t => t.id !== id);

  if (tasks.length < initialLength) {
    return res.status(200).json({ status: 'deleted', message: `Task ${id} deleted successfully.` });
  } else {
    return res.status(404).json({ error: 'Task not found.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`[Server] Offline Campus Connect API running on http://localhost:${PORT}`);
});