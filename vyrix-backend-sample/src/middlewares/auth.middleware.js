const jwt = require("jsonwebtoken")
const userModel = require("../models/user.models")

async function authUser(req,res,next)
{
    const token= req.cookies.token;
    if(!token)
    {
        return res.status(403).json({
            message:"Unauthorized"
        });
    }

    try{
        const decoded= jwt.verify(token,process.env.JWT_SECRET)
        req.user=decoded
        next();
    }catch(error)
    {
        console.error(error);
        return res.status(403).json({
            message:"You seems to be unauthorized"
        });
    }
}

// Blocks app data access until the user has verified their email AND finished
// onboarding. Use AFTER authUser. Returns 412 so the frontend can route the
// user back to onboarding rather than logging them out.
async function requireOnboarded(req, res, next)
{
    try {
        const user = await userModel
            .findById(req.user.id)
            .select("emailVerified onboardingCompleted");
        if (!user) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        if (!user.emailVerified || !user.onboardingCompleted) {
            return res.status(412).json({
                message: "Please verify your email and complete onboarding",
                emailVerified: user.emailVerified,
                onboardingCompleted: user.onboardingCompleted,
            });
        }
        next();
    } catch (error) {
        console.error("requireOnboarded error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports={authUser, requireOnboarded}