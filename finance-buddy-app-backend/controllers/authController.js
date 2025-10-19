import User from '../models/User.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, region } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // // Create userId manually or generate via UUID/nanoid
    // const userId = `USER-${Date.now()}`;

    const user = await User.create({
      name,
      email,
      password,
      region
    });

    const token = user.generateAuthToken();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      region: user.region,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = user.generateAuthToken();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      region: user.region,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};
