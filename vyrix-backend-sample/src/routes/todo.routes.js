const router = require("express").Router();
const { authUser, requireOnboarded } = require("../middlewares/auth.middleware");
const todoController = require("../controllers/todo.controller");

router.use(authUser); // all todo routes require auth
router.use(requireOnboarded); // ...and a verified + onboarded account

router.get("/", todoController.getMyTodos);
router.post("/", todoController.createTodo);
router.patch("/:id", todoController.updateTodo);
router.delete("/:id", todoController.deleteTodo);

module.exports = router;
