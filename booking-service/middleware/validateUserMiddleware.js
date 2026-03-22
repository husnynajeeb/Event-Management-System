const { validateUser } = require("../utils/validateUser");
async function validateUserMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  const validation = await validateUser(token);
  if (!validation.valid) {
    return res.status(401).json({ error: "User not valid" });
  }
  req.user = validation.user;
  next();
}

module.exports = validateUserMiddleware;
