const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
    const token = req.header('auth-system')
    if (!token) return res.status(403).send("Access denied")

    try {
        const verify = jwt.verify(token, process.env.TOKEN_SECRET)
        req.user = verify
        next()
    } catch (err) {
        res.status(400).send("Invalid token")
    }
}
