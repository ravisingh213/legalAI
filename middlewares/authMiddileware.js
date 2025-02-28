const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

const isAdminMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );

    // Find the user by ID
    User.findById(decoded.id)
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Check if the user is an admin
        if (user.isAdmin) {
          req.userIsAdmin = true;
          next();
        } else {
          return res
            .status(403)
            .json({ message: "Access Denied: Not an Admin" });
        }
      })
      .catch((err) => {
        res
          .status(500)
          .json({ message: "Error checking admin status", error: err.message });
      });
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

module.exports = { authMiddleware, isAdminMiddleware };
