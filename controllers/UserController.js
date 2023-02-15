import User from "../models/UserModel.js";
import argon2 from "argon2";
import path from "path";

export const getUsers = async (req, res) => {
  try {
    const response = await User.find({}, { _id: 0, password: 0, __v: 0 });
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const getUserById = async (req, res) => {
  try {
    const response = await User.findOne(
      { uuid: req.params.uuid },
      { _id: 0, password: 0, __v: 0 }
    );
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const createUser = async (req, res) => {
  const { name, email, password, confpassword, role } = req.body;
  if (password !== confpassword)
    return res
      .status(400)
      .json({ message: "Password dan Confirm Password tidak cocok" });
  if (name === "" || name === null)
    return res.status(400).json({ message: "Username tidak boleh kosong" });
  if (email === "" || email === null)
    return res.status(400).json({ message: "Email tidak boleh kosong" });
  if (password === "" || password === null)
    return res.status(400).json({ message: "Password tidak boleh kosong" });
  const hashpassword = await argon2.hash(password);
  try {
    await User.create({
      name: name,
      email: email,
      password: hashpassword,
      role: role,
    });
    res.status(201).json({ message: "Register berhasil" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const updateUser = async (req, res) => {
  const user = await User.findOne({ uuid: req.params.uuid });
  if (!user) return res.status(400).json({ message: "User tidak ditemukan" });
  const { name, email, password, confpassword } = req.body;
  let hashpassword = user.password;
  let Name = user.name;
  let Email = user.email;
  if (password === "" || password === null) {
    hashpassword = user.password;
  } else {
    hashpassword = await argon2.hash(password);
  }
  if (name === "" || name === null) {
    Name = user.name;
  } else {
    Name = req.body.name;
  }
  if (email === "" || email === null) {
    Email = user.name;
  } else {
    Email = req.body.email;
  }
  if (password !== confpassword)
    return res
      .status(400)
      .json({ message: "Password dan Confirm Password tidak cocok" });
  try {
    await User.updateOne(
      { uuid: req.params.uuid },
      {
        $set: {
          name: Name,
          email: Email,
          password: hashpassword,
        },
      }
    );
    res.status(201).json({ message: "Update user berhasil" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const deleteUser = async (req, res) => {
  const user = await User.findOne({ uuid: req.params.uuid });
  if (!user) return res.status(400).json({ message: "User tidak ditemukan" });
  try {
    await User.deleteOne({ uuid: req.params.uuid });
    res.status(200).json({ message: "User berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const uploadProfile = async (req, res) => {
  console.log(req.file);
  const file = req.file;
  const fileSize = file.size;
  // const ext = path.extname(file.name);
  const fileName = file.filename;
  const url = `${req.protocol}://${req.get(
    "host"
  )}/images/profiles/${fileName}`;
  // const allowedType = [".png", ".jpg", ".jpeg"];
  // if (!allowedType.includes(ext.toLocaleLowerCase()))
  //   return res.status(422).json({ message: "Invalid image" });
  if (fileSize > 1000000)
    return res
      .status(422)
      .json({ message: "Gambar tidak boleh lebih dari 1MB" });
  // file.mv(`./public/images/profiles/${fileName}`, async (err) => {
  //   if (err) return res.status(500).json({ message: err.message });
  try {
    await User.updateOne(
      { uuid: req.params.uuid },
      {
        image: fileName,
        imageUrl: url,
      }
    );
    res.status(201).json({ message: "Update profile berhasil" });
  } catch (error) {
    res.status(400).json({message: error.message})
  }
  // });
};

export const updateSubscriptionId = async(req, res) => {
  const subsId = req.body.subscription_id
  const subscriptionStatus = req.body.subscription_status
  const endPeriod = req.body.current_period_end
  try {
    await User.updateOne({uuid: req.session.userId}, {
      subscription_id: subsId,
      subscription_status: subscriptionStatus,
      current_period_end: endPeriod
    })
    res.status(200).json({message: "Berhasil mengupdate data"})
  } catch (error) {
    res.status(400).json({message: error.message})
  }
}

export const deleteSubscriptionStatus30d = async(req, res) => {
  const user = await User.findOne({uuid: req.params.uuid})
  if(!user)return res.status(400).json({message: 'User tidak ditemukan'})
  const targetTimestamp = new Date(user.current_period_end * 1000);
  try {
    user.updateOne(
      { "timestamp": { $eq: targetTimestamp }},
      { $unset: { "subscription_status": "" } },
      (err, result) => {
        if (err) throw err;
        res.status(200).json(result);
      })
  } catch (error) {
    res.status(400).json({message: error.message})
  }
}