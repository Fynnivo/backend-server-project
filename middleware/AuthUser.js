import User from "../models/UserModel.js";

export const verifyUser = async(req, res, next)=>{
    if(!req.session.userId)return res.status(401).json({message: "Mohon login ke akun anda!"})
    const user = await User.findOne({uuid: req.session.userId},{_id: 0, password: 0, __v: 0})
    if(!user)return res.status(400).json({message: "User tidak ditemukan"})
    req.userId = user.uuid
    req.role = user.role
    next()
}

export const adminOnly = async(req, res, next)=>{
    const user = await User.findOne({uuid: req.session.userId},{_id: 0, password: 0, __v: 0})
    if(!user)return res.status(400).json({message: "User tidak ditemukan"})
    if(user.role !== "admin")return res.status(403).json({message: "Akses terlarang!"})
    next()
}
