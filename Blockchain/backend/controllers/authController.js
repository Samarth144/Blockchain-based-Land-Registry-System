import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export async function signup(req, res) {
  try {
    const { username, email, password, role, walletAddress } = req.body;

    const newUser = new User({ username, email, password, role, walletAddress });
    await newUser.save();

    res.status(201).json({ success: true, message: 'User registered successfully.' });
  } catch (err) {
    console.error('Error in signup:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ success: true, token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getCurrentUser(req, res) {
  try {
    // The user object is attached to the request by the auth middleware
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    console.error('Error in getCurrentUser:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAvailableRoles(req, res) {
  try {
    const roles = ['user', 'admin', 'legal_officer'];
    res.json({ success: true, data: roles });
  } catch (err) {
    console.error('Error in getAvailableRoles:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}