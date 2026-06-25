const express            = require("express");
const { authUser }       = require("../middlewares/auth.middleware");
const catalogController  = require("../controllers/catalog.controller");

const router = express.Router();

router.use(authUser);
router.post("/upsert", catalogController.upsertCatalog);

module.exports = router;
