const express        = require("express");
const authController = require("../controllers/auth.controller");
const { authUser }   = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register",         authController.registerUser);
router.post("/login",            authController.loginUser);
router.post("/google",           authController.googleAuth);
router.post("/logout",           authController.logoutUser);
router.get( "/me",               authUser, authController.getMe);
router.post("/heartbeat",        authUser, authController.heartbeat);
router.post("/usage",            authUser, authController.logUsage);
router.get( "/google-redirect",  authController.googleRedirect);
router.get( "/google-callback",  authController.googleCallback);

module.exports = router;
