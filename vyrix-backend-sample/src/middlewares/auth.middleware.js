const jwt = require("jsonwebtoken")

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

module.exports={authUser}