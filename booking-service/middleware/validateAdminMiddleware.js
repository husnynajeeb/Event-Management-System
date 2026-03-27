const { validateUser } = require("../utils/validateUser");

async function validateAdminMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  const validation = await validateUser(token);

  if (!validation.valid) {
    return res.status(401).json({ error: "User not valid" });
  }

  if (validation.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }

  req.user = validation.user;
  next();
}

module.exports = validateAdminMiddleware;