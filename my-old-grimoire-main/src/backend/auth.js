const jwt = require("jsonwebtoken");

function requireAuth(req, res, next){
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer")){
        res.status(401).json({message: "Missing or invalid authorization"})
    }
    
    try{
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, "SECRET");
        req.user = decoded;
        next()
    } catch (error){
        return res.status(401).json({message: "Invalid or expired token"})
    }
}

module.exports = requireAuth;