// import { EventEmitter } from 'events';
const EventEmitter = require('events');
const FtpClient = require('ftp');

class CsvUploader  {
    constructor(options) {
        // super()
        this.file = options.file;
        this.ftp = options.ftp;
        this.mongoose = options.mongoose;
        this.collection = options.collection;
        
    }
    start(cb) {
        let ftpclient = new FtpClient(this.ftp)
        let self = this;
        console.log('calling', this.file,this.ftp)
        ftpclient.get(this.file, function (err, streamdata) {
            console.log('stramdata', streamdata)
            var stream = require('stream');
          
            var echoStream = new stream.Writable();
            echoStream._write = function (chunk, encoding, done) {
                console.log(chunk.toString());
                done();
            };
            streamdata.once('close', function () {
                ftpclient.end()
                cb(null)
            });
            streamdata.pipe(echoStream)
            cb()
            // self.emit('done')
        })
    }
}


    let csvuploader = new CsvUploader({
        ftp: {
            host: 'ftp.filezapp.com',
            port: 21,
            user: 'sunil@filezapp.com',
            password: 'Laxman_usaha90'
        },
        file: '/upload/1/partial-latestcsv.csv',
    })

    var myftp = new FtpClient({
        host: 'ftp.filezapp.com',
        port: 21,
        user: 'sunil@filezapp.com',
        password: 'Laxman_usaha90'
    })
    myftp.list(function(err,data){
        console.log('data',data)
    })
    csvuploader.start(function () {
        console.log('done')
    });
    // csvuploader.once('done', function () {
    //     console.log("----done---")
    // })











