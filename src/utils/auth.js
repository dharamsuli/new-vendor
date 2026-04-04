import jwt from "jsonwebtoken";

export function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    storeName: user.storeName
  };
}
