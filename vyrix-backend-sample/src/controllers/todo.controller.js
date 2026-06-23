const todoModel = require("../models/todo.model");

// GET /api/todos — the current user's todos, oldest first.
async function getMyTodos(req, res) {
    try {
        const todos = await todoModel
            .find({ owner: req.user.id })
            .sort({ createdAt: 1 });
        return res.status(200).json({ todos });
    } catch (error) {
        console.error("getMyTodos error:", error);
        return res.status(500).json({ message: "Failed to fetch todos" });
    }
}

// POST /api/todos — create a todo.
async function createTodo(req, res) {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Task text is required" });
        }
        const todo = await todoModel.create({
            text: text.trim(),
            owner: req.user.id,
        });
        return res.status(201).json({ todo });
    } catch (error) {
        console.error("createTodo error:", error);
        return res.status(500).json({ message: "Failed to create todo" });
    }
}

// PATCH /api/todos/:id — toggle done and/or edit text.
async function updateTodo(req, res) {
    try {
        const todo = await todoModel.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }
        if (todo.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }
        const { text, done } = req.body;
        if (text !== undefined) todo.text = text.trim();
        if (done !== undefined) todo.done = !!done;
        await todo.save();
        return res.status(200).json({ todo });
    } catch (error) {
        console.error("updateTodo error:", error);
        return res.status(500).json({ message: "Failed to update todo" });
    }
}

// DELETE /api/todos/:id — delete a todo.
async function deleteTodo(req, res) {
    try {
        const todo = await todoModel.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }
        if (todo.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }
        await todo.deleteOne();
        return res.status(200).json({ message: "Deleted" });
    } catch (error) {
        console.error("deleteTodo error:", error);
        return res.status(500).json({ message: "Failed to delete todo" });
    }
}

module.exports = { getMyTodos, createTodo, updateTodo, deleteTodo };
