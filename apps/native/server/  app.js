const express = require('express');
const authRoutes = require('./routes/auth');

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});