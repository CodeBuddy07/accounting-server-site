import jwt, { SignOptions } from "jsonwebtoken";
import config from "../config";
import bcrypt from "bcrypt";


// Generate Access Token
export const generateToken = (payload: object, expiresIn: SignOptions["expiresIn"] = "1h") => {
  return jwt.sign(payload,  config.jwt.secret, { expiresIn });
};


// Verify Token
export const verifyToken = (token: string) => jwt.verify(token,  config.jwt.secret);


// Hash Password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare Password
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
