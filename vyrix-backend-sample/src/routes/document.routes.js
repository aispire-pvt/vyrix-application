const router = require("express").Router();
const { authUser } = require("../middlewares/auth.middleware");
const docController = require("../controllers/document.controller");

router.use(authUser); // all doc routes require auth

router.post("/", docController.createDocument);
router.get("/", docController.getMyDocuments);
router.get("/:id", docController.getDocument);
router.patch("/:id", docController.updateDocument);
router.patch("/:id/move", docController.moveDocument);
router.delete("/:id", docController.deleteDocument);

module.exports = router;
