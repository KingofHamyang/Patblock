const router = require('express').Router()
const controller = require('./auth.controller')
const session = require('express-session')

router.use(session({
    secret: '1@%24^%$3^*&98&^%$', // 쿠키에 저장할 connect.sid값을 암호화할 키값 입력
    resave: false, //세션 아이디를 접속할때마다 새롭게 발급하지 않음
    saveUninitialized: true //세션 아이디를 실제 사용하기전에는 발급하지 않음
}))


router.post('/register', controller.register)

router.post('/OTPauth', controller.OTPauth)
router.post('/OTPreq', controller.OTPreq)

router.post('/authreq', controller.authreq)

router.post('/signature', controller.signature)
router.post('/filedown', controller.filedown)

module.exports = router