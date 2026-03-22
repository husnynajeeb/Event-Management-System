import { validateUser } from "../utils/userServiceClient.js";

export async function validateAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  const validation = await validateUser(token);

  if (!validation.valid) {
    return res.status(401).json({ message: "User not valid" });
  }
  if (validation.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin only can create event." });
  }
  req.user = validation.user;
  next();
}
