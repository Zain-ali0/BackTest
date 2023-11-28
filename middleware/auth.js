import jwt from "jsonwebtoken";
import Users from "../models/Users.js";

const auth = async (req, res, next) => {
    try {
            const token = req.header("Authorization")
    
            if(!token) return res.status(400).json({msg: "Invalid Authentication."})
    
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            if(!decoded) return res.status(400).json({msg: "Invalid Authentication."})
    
            const user = await Users.findOne({_id: decoded.id})
            
            req.user = user
            next()
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
}


export default auth;