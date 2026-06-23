const router = require("express").Router();
const multer = require("multer");
const { authUser, requireOnboarded } = require("../middlewares/auth.middleware");
const docController = require("../controllers/document.controller");

const upload = multer({ storage: multer.memoryStorage() });

router.use(authUser); // all doc routes require auth
router.use(requireOnboarded); // ...and a verified + onboarded account

router.post("/", docController.createDocument);
router.get("/", docController.getMyDocuments);
router.get("/:id", docController.getDocument);
router.patch("/:id", docController.updateDocument);
router.patch("/:id/move", docController.moveDocument);

// Phase 8 — project overview
router.patch("/:id/description", docController.updateDescription);
router.post("/:id/attachments", upload.single("file"), docController.addAttachment);
router.delete("/:id/attachments/:attachmentId", docController.removeAttachment);

// Phase 8 — flow repository
router.patch("/:id/flows/reorder", docController.reorderFlows);
router.post("/:id/flows", docController.createFlow);
router.post("/:id/flows/:flowId/files", upload.single("file"), docController.addFileToFlow);
router.delete("/:id/flows/:flowId", docController.removeFlow);

router.delete("/:id", docController.deleteDocument);

module.exports = router;
