import express from "express";
import multer from "multer";
import crypto from "crypto";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  uploadProfile,
  updateSubscriptionId,
  deleteSubscriptionStatus30d
} from "../controllers/UserController.js";
import { verifyUser, adminOnly } from "../middleware/AuthUser.js";

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/profiles");
  },
  filename: (req, file, cb) => {
    const md5 = crypto.createHash("md5");
    md5.update(file.originalname);
    const hash = md5.digest("hex");
    const fileExtension = file.originalname.split(".").pop();
    const hashImage = `${hash}.${fileExtension}`;
    cb(null, hashImage);
  },
  fileFilter: function (req, file, cb) {
    // Only allow JPEG, PNG, and JPEG file types
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

const upload = multer({ storage: storage });

router.get("/users", verifyUser, adminOnly, getUsers);
router.get("/users/:uuid", verifyUser, adminOnly, getUserById);
router.post("/users", createUser);
router.post('/users/delete-subscription-status/:uuid', deleteSubscriptionStatus30d)
router.patch("/users/subs-id", updateSubscriptionId)
router.patch("/users/:uuid", verifyUser, updateUser);
router.patch("/users/profile/:uuid", upload.single("image"), uploadProfile);
router.delete("/users/:uuid", verifyUser, adminOnly, deleteUser);
export default router;
