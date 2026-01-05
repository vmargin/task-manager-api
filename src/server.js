const express = require("express");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const auth = require("./middleware/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Create a user
app.post("/users", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    res.json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// User login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Apply authentication middleware to all /tasks routes
app.use("/tasks", auth);

// Create a task
app.post("/tasks", async (req, res) => {
  console.log("User from middleware:", req.user); // Check the logs!
  const { title, description, status } = req.body;
  try {
    const task = await prisma.task.create({
      data: { 
        title, 
        description, 
        status, 
        userId: req.user.userId // Matches the payload in login token
      },
    });
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// Get all tasks for the logged-in user
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.userId }
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Get a task by ID
app.get("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task || task.userId !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden: You do not own this task" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Error fetching task" });
  }
});

// Update a task (Full Update)
app.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  try {
    // First verify ownership
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask || existingTask.userId !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const task = await prisma.task.update({
      where: { id },
      data: { title, description, status },
    });
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Patch a task (Partial Update)
app.patch("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task || task.userId !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { title, description, status },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to patch task" });
  }
});

// Delete a task
app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task || task.userId !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prisma.task.delete({ where: { id } });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));