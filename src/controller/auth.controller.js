import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";
import { createUser, findOne } from "../service/auth.service.js";

export const register = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;
    //1. checking is existing user
    const existUser = await findOne({ email }, { id: 1 });
    if (existUser) {
      return res.fail(
        400,
        "User already registered with this email.Please use other email.",
      );
    }
    const bcryptedPass = await bcrypt.hash(password, 10);

    //2. create user
    const user = await createUser({
      name,
      email,
      password: bcryptedPass,
      role,
    });
    //3. generate jwt token
    let token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_KEY,
      {
        expiresIn: "24h",
      },
    );
    user._doc.token = token;

    if (user) {
      return res.success(
        201,
        "User registered successfully.Please go to your email and verify your account",
        user,
      );
    }
    return res.fail(400, "User not registered");
  } catch (error) {
    console.log("Register API Error:", error);
    return res.fail(500, "Internal server error");
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    let user = await findOne({ email });
    //1. checking is existing user
    if (!user) {
      return res.fail(404, "User is not registered with this email.");
    }
    //2. checking is user google login or normal

    //3. compare password
    const comparePass = await bcrypt.compare(password, user.password);
    if (!comparePass) {
      return res.fail(400, "Incorrect password.");
    }

    //4. generate jwt token
    let token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_KEY,
      {
        expiresIn: "24h",
      },
    );
    user._doc.token = token;
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    };
    return res.success(200, "User login successfully.", userResponse);
  } catch (error) {
    console.log("Login API Error:", error);
    return res.fail(500, "Internal server error");
  }
};

export const logout = async (req, res) => {
  try {
    return res.success(200, "Logout successfully");
  } catch (error) {
    console.log("logout API Error:", error);
    return res.fail(500, "Internal server error");
  }
};
