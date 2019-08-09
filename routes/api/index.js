const router = require('express').Router()
const auth = require('./auth')
const fileRegister = require('./fileRegister')


router.use('/auth', auth)
router.use('/fileRegister', fileRegister)


module.exports = router