const express= require("express");
const onboardingController=require("../controllers/onboarding.controller");
const authMiddleware= require("../middlewares/auth.middleware");
const multer=require("multer");

const router= express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_, file, cb) => cb(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)),
});

router.post("/send-otp",authMiddleware.authUser,onboardingController.sendOTP);
router.post("/verify-otp",authMiddleware.authUser,onboardingController.verifyOTP);
router.post("/profile",authMiddleware.authUser,upload.single("profile_pic"),onboardingController.onboardingProfile);

module.exports=router;