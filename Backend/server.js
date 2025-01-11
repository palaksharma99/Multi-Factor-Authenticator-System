const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/authDemo/users', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.json({ success: false, message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        username,
        email,
        password: hashedPassword
    });

    await newUser.save();
    res.json({ success: true, message: 'User registered successfully.' });
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
    res.json({ success: true, message: 'Login successful.', token });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
