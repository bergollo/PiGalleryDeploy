var process = require('process');
var os = require('os');
var express = require('express');
var router = express.Router();
var multer  = require('multer');

const fs = require('fs');
const path = require('path');

// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     console.log("bergo dest")
//     cb(null, `${process.cwd()}/public/uploads/`);
//   },
//   filename: function(req, file, cb) {
//     console.log("bergo file")
//     const ext = file.originalname.split('.')[1];
//     const filename = `${Date.now()}.${ext}`;
//     cb(null, filename);
//   }
// });

var storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function (req, file, cb) {
      return cb(null, file.originalname)
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});
// const upload = multer({ dest: `uploads/` });

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.get('/', function (req, res, next) {
  const filenames = fs.readdirSync('./public/uploads');
  res.status(200).json({filenames: filenames});
});

router.post('/', upload.array('files'), function (req, res, next) {
  res.send('File uploaded successfully');
});

router.delete('/:filename', function (req, res, next) {
  const filename = req.params.filename;
  // Define the path to the file (adjust the directory as needed)
  const filePath = path.join(__dirname, '../public/uploads', filename);
  // Use fs.unlink to delete the file
  fs.unlink(filePath, (err) => {
    if (err) {
        // If an error occurs, send a 404 response if the file was not found
        if (err.code === 'ENOENT') {
            return res.status(404).send('File not found');
        }
        // For other errors, send a 500 response
        return res.status(500).send('Error deleting file');
    }
    // If successful, send a success response
    res.send(`File ${filename} deleted successfully`);
  });
});

module.exports = router;
