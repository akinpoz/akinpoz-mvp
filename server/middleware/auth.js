const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
dotenv.config();

/**
 * Auth middleware function to check for JWT token
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
function auth(req, res, next) {
    const token = req.header('x-auth-token') || req.body.token.headers['x-auth-token']
    // Check for token
    if (!token) return res.status(401).json({ msg: 'Unauthorized' })
    try {
        // Verify Token
        const decoded = jwt.verify(token, process.env.JWTSECRET)
        // Add user from payload
        req.user = decoded
        next()
    }
    catch (e) {
        console.error(e);
        res.status(400).json({msg: "Token is not valid"})
    }
}

module.exports = auth
