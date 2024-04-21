const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { GOOGLE_CLIENT_ID, JWT_SECRET } = require('../config');

const router = express.Router();
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw error;
  }
};

const generateJWT = (payload) => {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  return token;
};

router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    const payload = await verifyGoogleToken(idToken);
    const userId = payload['sub'];
    const email = payload['email'];
    const name = payload['name'];

    // Check if the user already exists in your database 
    
    // If not, create a new user account

    // Generate and return a JWT token
    const token = generateJWT({ userId, email, name });
    res.json({ token });
  } catch (error) {
    console.error('Error handling Google authentication:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});

module.exports = router;