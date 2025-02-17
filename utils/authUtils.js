const jwt = require('jsonwebtoken');
require('dotenv').config();

// Генерация access токена
function generateAccessToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role }, // Включаем роль
        process.env.JWT_SECRET,
        { expiresIn: '1m' }
    );
}

// Генерация refresh токена
function generateRefreshToken(user) {
    return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

module.exports = { generateAccessToken, generateRefreshToken };