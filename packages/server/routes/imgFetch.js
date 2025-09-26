var express = require('express');
var router = express.Router();
var Jimp = require("jimp");
const fs = require("fs");
const path = require("path");

// https://stackoverflow.com/questions/45965377/node-resize-image-with-url-without-saving-image
// https://stackoverflow.com/questions/31055347/how-to-get-path-variable-in-expressnode-js

router.get('/:imgName',function(req, res){
    var imgName = req.params.imgName
    var protocol = req.protocol
    const host = req.hostname;
    const port = process.env.PORT || 3002;
    const url = `${protocol}://${host}:${port}/uploads/${imgName}`;
    var w = Number(req.query.w) || 32
    var h = Number(req.query.h) || 32

    const imgPath = path.join(__dirname, "../public/uploads", imgName);
    if (!fs.existsSync(imgPath)) {
        //terminate with 404 if file doesn't exist
        return res.status(404).json({ error: "Image not found" });
    }

    Jimp.read(url, function(err,img){
        if (err) {
            return res.status(404).json({ error: "Image not found" });
        }
        img.resize(w, h).getBase64( Jimp.AUTO , function(e,img64){
            if(e) return res.status(500).json({ error: "Failed to process image" });
            res.status(200).send(img64)
        });
    });
});

module.exports = router;