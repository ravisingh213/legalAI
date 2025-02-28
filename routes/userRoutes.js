const express = require("express");
const {
  edit,
  getUserById,
  getAllUsers,
  deleteUserById,
  getUserByName,
  inviteMember,
  getAllPendingInvites,
  deleteInvitePendingUserById,
  getPendingInviteUserByEmail
} = require("../controllers/userController");
const {
  authMiddleware,
  isAdminMiddleware,
} = require("../middlewares/authMiddileware");

const router = express.Router();

router.post("/edit", authMiddleware, edit);
router.get("/getUser", authMiddleware, getUserById);
router.post("/getUserByName", authMiddleware, isAdminMiddleware, getUserByName);
router.post("/getPendingInviteUserByEmail", authMiddleware, isAdminMiddleware, getPendingInviteUserByEmail);
router.post("/inviteMember", authMiddleware, isAdminMiddleware, inviteMember);
router.get("/getAllUsers", authMiddleware, isAdminMiddleware, getAllUsers);
router.get(
  "/getAllPendingInvites",
  authMiddleware,
  isAdminMiddleware,
  getAllPendingInvites
);
router.delete(
  "/deleteUser/:id",
  authMiddleware,
  isAdminMiddleware,
  deleteUserById
);
router.delete(
  "/deletePendingInviteUser/:id",
  authMiddleware,
  isAdminMiddleware,
  deleteInvitePendingUserById
);

module.exports = router;
