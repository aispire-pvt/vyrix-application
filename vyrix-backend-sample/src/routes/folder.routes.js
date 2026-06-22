const router = require("express").Router();
const { authUser } = require("../middlewares/auth.middleware");
const folderController = require("../controllers/folder.controller");

router.use(authUser); // all folder routes require auth

router.post("/", folderController.createFolder);
router.get("/", folderController.getMyFolders);
router.get("/:id/docs", folderController.getFolderDocs);
router.patch("/:id", folderController.renameFolder);
router.delete("/:id", folderController.deleteFolder);

module.exports = router;
