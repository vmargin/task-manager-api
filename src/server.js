const express = require("express");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const auth = require("./middleware/auth");
const jwt = require("jsonwebtoken");
const app = express();
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");


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
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// User login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isMatch = await require("bcrypt").compare(
    password,
    user.password
  );

  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  

const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

res.json({ token });

});

// Apply authentication middleware to all /tasks routes
app.use("/tasks", auth);

// Create a task
app.post("/tasks", async (req, res) => {
    console.log("User from middleware:", req.user); // Check the logs!
  const { title, description, status } = req.body; // Remove userId from here
  try {
    const task = await prisma.task.create({
      data: { 
        title, 
        description, 
        status, 
        userId: req.user.userId // This must match what you named it in your auth.js
      },
    });
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create task" });
  }
});


// Get a task by ID
app.get("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const task = await prisma.task.findUnique({ where: { id } });

  if (!task || task.userId !== req.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.json(task);
});



// Update a task
app.put("/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status } = req.body;
  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { title, description, status },
    });
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Patch a task
app.patch("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== req.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const updated = await prisma.task.update({
    where: { id },
    data: { title, description, status },
  });
  res.json(updated);
});


// Delete a task
app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== req.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  await prisma.task.delete({ where: { id } });
  res.json({ message: "Task deleted" });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
