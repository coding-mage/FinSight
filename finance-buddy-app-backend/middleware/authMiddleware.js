import jwt from 'jsonwebtoken';


const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'Authorization header missing or malformed' });
  }
};

export default authenticateJWT;
