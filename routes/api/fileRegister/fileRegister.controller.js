const Files = require('../../../models/file')
const User = require('../../../models/user')
const jwt = require('jsonwebtoken')
var multer = require('multer');
var formdata = require('form-data');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const session = require('express-session');
const crypto = require('crypto');
const Web3 = require('web3');
var Tx = require('ethereumjs-tx');
const fs = require('fs');


const url = 'https://ropsten.infura.io/v3/708c2cbd30464a54a02f12888706f796'
const web3 = new Web3(url)

const account1 = '0x19c5FbD9A883b5124d0DD2AE581f79ACd52E2DC9'
const contractAddress = '0x7cB2a436860daf8e0eb9c9C85e616FbcE10d6bD0'

const privateKey1 = Buffer.from('6164FCC085B764EB9C2A6F267DD3D11C677C8C5CA6A6277E34E655922426A8B2', 'hex') // have to change key when launching
const abi = [{
        "constant": false,
        "inputs": [{
                "name": "pet_owner",
                "type": "bytes32"
            },
            {
                "name": "pet_index",
                "type": "uint32"
            },
            {
                "name": "certificate_index",
                "type": "uint32"
            },
            {
                "name": "hash",
                "type": "bytes32"
            }
        ],
        "name": "regist",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": false,
                "name": "pet_owner",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "name": "pet_index",
                "type": "uint32"
            },
            {
                "indexed": false,
                "name": "certificate_index",
                "type": "uint32"
            },
            {
                "indexed": false,
                "name": "hash",
                "type": "bytes32"
            }
        ],
        "name": "register",
        "type": "event"
    }
]



var upload = multer({
    dest: 'temp_storage/'
})


exports.uploadfile = (req, res) => {
    //session auth 인증후 해야함
    //multi-part/form-data 로 전송
    const fs = require('fs');
    var file_name = [];
    if (req.session.isdoctor >= 1) {

        const make_file_hash = (filepath, next, bin) => {

            var digested_file = crypto.createHash('sha256').update(bin).digest('hex');
            next(digested_file, filepath);
            User.findOneByUsername(req.session.username_to_treat)
                .then(sending = (user) => {
                    if (user) {
                        var pet_owner = user["user_account_address"];
                        console.log(pet_owner);

                        var pet_index = 1;
                        var certificate_index = 1;
                        //var hash = web3.utils.asciiToHex(digested_file);
                        var hash = '0x' + digested_file.toString();
                        console.log(hash);
                        console.log(pet_owner);
                        const pet = new web3.eth.Contract(abi, contractAddress)

                        // web3 version 1.0.0
                        const data = pet.methods.regist(pet_owner, pet_index, certificate_index, hash).encodeABI()

                        web3.eth.getTransactionCount(account1, (err, txCount) => {

                            // Create transaction txObject
                            const txObject = {
                                nonce: web3.utils.toHex(txCount),
                                gasLimit: web3.utils.toHex(800000),
                                gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
                                to: contractAddress,
                                data: data
                            }

                            //Sign the trasnaction
                            const tx = new Tx(txObject)
                            tx.sign(privateKey1)

                            const serializedTx = tx.serialize()
                            const raw = '0x' + serializedTx.toString('hex')

                            //Broadcast the transaction
                            web3.eth.sendSignedTransaction(raw, (err, txHash) => {
                                console.log(pet_owner);
                                console.log('err:', err, 'txHash:', txHash)
                            })
                        })
                    } else {
                        res.json({
                            "message": "no matched name"
                        })
                    }
                });





        }
        const file_name_generate = (file, dd, mm, yyy, h, m) => {
            file.path = 'uploads/' + req.session.username_to_treat.toString() + "/" + yyy.toString() + "-" + mm.toString() + "-" + dd.toString() + "time_" + h.toString() + "_" + m.toString() + ".jpg";
            file_name.push(file.path.toString());
            console.log(file.path);

        }
        var form = new formidable.IncomingForm();
        console.log(req.session.username_to_treat);
        form.parse(req);
        form.on('fileBegin', function (name, file) {
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!
            var yyyy = today.getFullYear();
            var h = today.getHours();
            var m = today.getMinutes();
            file_name_generate(file, dd, mm, yyyy, h, m);
        }).on('file', function (name, file) {
            console.log('Uploaded ' + file.name);
        }).on('end', function () {
            var binary = fs.readFileSync(file_name[0].toString(), 'binary');
            make_file_hash(file_name[0], (hash_value, filepath) => {
                Files.create(req.session.username_to_treat.toString(), hash_value, filepath);
            }, binary);
        });

        res.json({
            message: "uploads complete"
        });

    } else {
        res.json({
            message: "plz auth OTP first"
        })
    }


}

exports.check_hash = (req, res) => {
    const {
        username
    } = req.body
    const contract = new web3.eth.Contract(abi, contractAddress);

    contract.getPastEvents(
        'register', {
            fromBlock: 4362097,
            toBlock: 'latest'
        }, (err, events) => {
            User.findOneByUsername(username).then((user) => {
                console.log(username)
                if (user) {
                    console.log(user["publickey"] + " " + user["publickey"].length);
                    var cnt = 0;
                    var find = user["publickey"];
                    for (var k = user["publickey"].length; k < 66; k++) {
                        find = find + '0'
                    }
                    console.log(find);
                    var i = 0;
                    for (i = 0; i < events.length; i++) {
                        console.log(events[i]["returnValues"]);
                        if (events[i]["returnValues"]["pet_owner"] == find) {

                            cnt++;
                            break;
                        }
                    }
                    if (cnt == 1) {
                        res.send("matched");
                    } else {
                        res.send("Non_matched value");
                    }


                } else {
                    console.log("error!");
                    res.json({
                        "message": "Non-matched person"
                    })
                }

            })
        }
    )


}
exports.send_file_list = (req, res) => {
    console.log("session is " + req.session.isdoctor);
    if (req.session.logined == "user" || req.session.isdoctor >= 1) {

        const testFolder = 'uploads/' + req.session.username_to_treat.toString() + '/';
        const fs = require('fs');
        const direct_list = [];
        const json_to_send = new Object();
        var cnt = 0;
        const send = (j2s) => {
            res.json(j2s);
        }

        const send_direct = () => {
            for (var i = 0; i < cnt; i++) {
                console.log(direct_list[i]);
            }
            console.log("total file cnt " + cnt);
            json_to_send.file_list = direct_list;
            send(json_to_send);

        }

        fs.readdir(testFolder, (err, files) => {
            files.forEach(file => {
                direct_list.push(file);
                cnt++;

            });
            send_direct();

        })
    } else {
        res.json({
            "file_list": "plz login first"
        })
    }

    /* var json_to_send = [];
     for (var i = 0; i < 3; i++) {
         json_to_send = json_to_send.push(direct_list.list[i].toString());
     }
     console.log(json_to_send);
     console.log(direct_list.connt);
     res.send("asdf");

      } else {
          res.json({
              message: "plz login first"
          })
      }*/
}

exports.downloadfile = (req, res) => {
    console.log(req.session.isdoctor);
    //req.session.isdoctor++;
    // if (req.session.isdoctor >= 1) {
    /*   const {
        username,
        filename
    } = req.body
    var path = "uploads/" + username.toString() + "/" + filename.toString();
    console.log(path);
*/
    //var img = fs.readFileSync(path);
    /*res.writeHead(200, {
        'Content-Type': 'image/jpg'
    });*/
    /*
    res.download(path);*/

    //var path = "/Users/haseongjun/PetBlock_final/petblock/Server/uploads/jodicks/2018-11-28time_22:38.jpg";
    var path = "/Users/haseongjun/PetBlock_final/petblock/Server/uploads/" + req.params.username.toString() + "/" + req.params.filename.toString();
    //var path = "uploads/jodicks/2018-11-28.jpg";
    console.log(path);

    //var img = fs.readFileSync(path);
    /*res.writeHead(200, {
        'Content-Type': 'image/jpg'
    });*/
    res.sendFile(path);
    //res.sendFIle(path);



    /*  } else {
          res.json({
              message: "plz auth OTP first"
          })
      }*/
}



exports.register = (req, res) => {
    const {
        file_hash,
        file_name
    } = req.body
    console.log("acccsdcs")
    const create = (err) => {
        console.log(err)
        console.log(file_hash + file_name)
        if (err) {
            throw new Error('file exist')
        } else {
            return Files.create(file_hash, file_name)
        }
    }


    // respond to the client
    const respond = () => {
        res.json({
            message: 'file uploaded!!'
        })
    }

    // run when there is an error (username exists)
    const onError = (error) => {
        res.status(409).json({
            message: error.message
        })
    }

    // check username duplication

    Files.findOneByFileName(file_name)
        .then(create)
        .then(respond)
        .catch(onError)
}