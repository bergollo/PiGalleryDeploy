var express = require('express');
var router = express.Router();
var Jimp = require("jimp");

// https://stackoverflow.com/questions/45965377/node-resize-image-with-url-without-saving-image
// https://stackoverflow.com/questions/31055347/how-to-get-path-variable-in-expressnode-js

router.get('/:imgName',function(req, res){
    var imgName = req.params.imgName
    var protocol = req.protocol
    const host = req.hostname;
    const port = process.env.PORT || 3002;
    var url = protocol + '://' + host + ':' + port + '/uploads/' + imgName
    var w = Number(req.query.w) || 32
    var h = Number(req.query.h) || 32
    Jimp.read(url, function(err,img){
        if (err) throw err;
        img.resize(w, h).getBase64( Jimp.AUTO , function(e,img64){
            if(e)throw e
            // res.status(200).send('<img src="'+img64+'">')
            // res.status(200).send(`<img
            // srcSet="${img64}"
            // src="${img64}"
            // alt="${img64}"
            // loading="lazy" />`)
            res.status(200).send(img64)
        });
    });
});

module.exports = router;