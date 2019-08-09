const router = require('express').Router()
const controller = require('./fileRegister.controller')
var multer = require('multer');
var formdata = require('form-data');
const bodyParser = require('body-parser');
const formidable = require('formidable')



var upload = multer({
    dest: 'temp_storage/'
})

router.post('/uploadfile', controller.uploadfile)
router.get('/filedownloads/:username/:filename', controller.downloadfile)
router.post('/file_list', controller.send_file_list)
router.post('/check_hash', controller.check_hash)



module.exports = router