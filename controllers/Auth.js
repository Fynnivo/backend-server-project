import User from "../models/UserModel.js";
import argon2 from "argon2";

export const Login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ message: "User tidak ditemukan" });
  const match = await argon2.verify(user.password, req.body.password);
  if (!match) return res.status(400).json({ message: "Password salah" });
  const rememberMe = req.body.rememberMe;
  if (rememberMe) {
    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    req.session.userId = user.uuid;
  } else {
    req.session.userId = user.uuid;
  }
  const uuid = user.uuid;
  const name = user.name;
  const email = user.email;
  const role = user.role;
  res.status(200).json({ uuid, name, email, role });
};

export const Me = async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({
      message: "Mohon login ke akun anda!",
    });
  const user = await User.findOne(
    { uuid: req.session.userId },
    { _id: 0, password: 0, __v: 0 }
  );
  if (!user) return res.status(400).json({ message: "User tidak ditemukan" });
  res.status(200).json(user);
};

export const Logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err)
      return res
        .status(400)
        .json({ message: "Terdapat kesalahan mohon tunggu" });
    res.status(200).json({ message: "Anda telah Logout" });
  });
};
