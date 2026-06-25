const router = require("express").Router();
const { authUser } = require("../middlewares/auth.middleware");
const feedbackController = require("../controllers/feedback.controller");

router.use(authUser); // feedback requires a logged-in user

router.post("/", feedbackController.submitFeedback);

module.exports = router;
