const http = require('http'),
    inspect = require('util').inspect;
const Busboy = require('busboy');
const port = 8000;
let status = 0;
const fs = require('fs');

const express = require("express");
const app = express();

app.use('', (req, res) => {
    res.render('index.html')
})

http.createServer(function(req, res) {
  if (req.method === 'POST') {
    const busboy = new Busboy({ headers: req.headers });
    let total = req.headers['content-length'];
    let progress = 0;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
        if (filename === '') {
            console.error('No file has been selected, please select a file')
        }
        file.on('data', (data) => {
            progress += data.length;
            const percent = Math.round((progress / total) * 100);
            console.log(`Uploading file ${percent} %`);
            status = percent;
        });
        if (status !== progress) {
            console.error('Upload failed');
        }
    });
    busboy.on('error', function(err) {
        console.error('An error has occured: \n' + err);
    });
    busboy.on('finish', () => {
        console.log('Done parsing form!');
        //   console.log(res);
        res.writeHead(303, { Connection: 'close', Location: '/' });
        res.end();
    });
    req.pipe(busboy);
  } else if (req.method === 'GET') {
    if (req.url === '') {
        res.end(status.toString());
        return;
    }
    fs.createReadStream('index.html').pipe(res)
  }
}).listen(port, () => {
  console.log(`Listening for requests on port ${port}`);
});
