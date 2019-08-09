exports.authreq = (req, res) => {
    const {
        username
    } = req.body
    var random = Math.random();
    req.session.mes = random.toString();
    req.session.username = username;
    console.log(req.session.mes)
    res.send(random.toString());
}

exports.signature = (req, res) => {
    const {
        message
    } = req.body
    var value = req.session.mes.toString();
    var name = req.session.username;
    console.log(name);
    const verify = (user) => {

        if (user) {
            //RSA verify code

            //const pubkey=req.session.publickey
            const key = new NodeRSA();
            const sig = new Buffer(message, 'base64');
            console.log("message is " + message);
            console.log("sig is " + sig);

            key.importKey(pubkey);
            const isSignatureValid = key.verify(value, sig);

            if (isSignatureValid) {
                console.log("valid signature!");
            }

            var random = Math.random() * 10000;
            var originrand = random;
            random = Math.floor(random);
            random = random.toString();
            // console.log(user + "asdf");
            res.json({
                OTP: random,
                Origin: originrand
            })
            OTP_schema.create(random, name);


        } else {

            res.json({
                message: "user not find"
            })
        }

    }
    User.findOneByUsername(name)
        .then(verify)
}