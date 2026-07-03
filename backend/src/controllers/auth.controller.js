import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

/**
 * Generates a signed JWT token for authenticated users
 * @param {string} id - User's MongoDB ObjectId
 * @returns {string} Signed JWT token (7-day expiry)
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const register = async (req, res) => {
  try {
    const validated = registerSchema.parse(req.body);
    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validated.password, salt);


    const user = await User.create({
      name: validated.name,
      email: validated.email,
      password: hashedPassword,
      role: validated.role,
      profilePicture: req.body.profilePicture || null,
    });

    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        error: error.errors.map((e) => e.message).join(", "),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already registered" });
    }

    console.error("Registration Error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during registration" });
  }
};

export const login = async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validated.email });

    if (!user || !(await bcrypt.compare(validated.password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        error: error.errors.map((e) => e.message).join(", "),
      });
    }

    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error during login" });
  }
};

export const getProfile = async (req, res) => {
  
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    profilePicture: req.user.profilePicture,
    bio: req.user.bio,
    createdAt: req.user.createdAt,
  });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, bio, profilePicture } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (profilePicture !== undefined)
      updateData.profilePicture = profilePicture;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json(updatedUser);
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};
