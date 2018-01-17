const FtpClient = require('ftp'),
    fs = require('fs')
class MyFtp {
    constructor(options) {
        let self = this;
        this.ftp = new FtpClient(options);
        this.isReady = false;
        this.options = options || {};
        this.ftp.connect(options);
        this.myFunction = function () {
        }
        this.ftp.on('ready', function () {
            self.isReady = true;
        })
    }
    put(source,destination,cb) {
        if (typeof cb != 'function') cb = this.myFunction;
        let self = this;
        this.ftp.put(source,destination,function (err, list) {
            if (err) throw err
            cb(null, list)
            self.ftp.end();
        });
    }
    ls(cb){
        this.list(cb)
    }
    list(cb) {
        if (typeof cb != 'function') cb = this.myFunction;
        let self = this;
        this.ftp.list(function (err, list) {
            if (err) throw err
            cb(null, list)
            self.ftp.end();
        });
    }
    get(remotepath, localpath, cb) {
        var self = this;
        if (typeof cb != 'function') cb = this.myFunction;
        this.ftp.get(remotepath, function (err, stream) {
            if (err) throw err;
            stream.once('close', function () {
                self.ftp.end()
                cb(null)
            });
            stream.pipe(fs.createWriteStream(localpath));
        })
    }
    mkdir(path, cb) {
        if (typeof cb != 'function') cb = this.myFunction;
        let self = this;
        this.ftp.mkdir(path, true, function (err, list) {
            if (err) throw err
            cb(null, list)
            self.ftp.end();
        });
    }
    rename() {
        if (typeof cb != 'function') cb = this.myFunction;
        let self = this;
        this.ftp.rename(source, destination, function (err, list) {
            if (err) throw err
            cb(null)
            self.ftp.end();
        });
    }
    rmdir(path, recursive) {
        if (typeof cb != 'function') cb = this.myFunction;
        let self = this;
        recursive = recursive || false;
        this.ftp.rmdir(path, recursive, function (err, list) {
            if (err) throw err
            cb(null, list)
            self.ftp.end();
        });
    }
    delete(path) {
        if (typeof cb != 'function') cb = this.myFunction;
        let self = this;
        recursive = recursive || false;
        this.ftp.delete(path, function (err, list) {
            if (err) throw err
            cb(null, list)
            self.ftp.end();
        });
    }
    move(source, destination, cb) {
        if (typeof cb != 'function') cb = this.myFunction;
        let self = this;
        if (destination.indexOf('.') < 0) {
            let fileName = source.split('.').length > 1 ? source.split('.')[1] : '';
            if (fileName) {
                destination = (destination.charAt(destination.length) == '/') ? destination : destination + '/';
                destination += fileName;
            }
        }
        this.ftp.rename(source, destination, function (err, list) {
            if (err) throw err
            cb(null)
            self.ftp.end();
        });
    }
    copy(source, destination, cb) {
        if (typeof cb != 'function') cb = this.myFunction;
        let self = this;
        let localPath = './' + Math.round(Math.random() * 100000000000);
        this.ftp.get(source, localPath, function () {
            if (!err) {
                this.ftp.put(localPath, destination, function (err, list) {
                    if (err) throw err
                    cb(null)
                    fs.unlinkSync(localPath)
                    self.ftp.end();

                });
            }
        })

    }
}
module.exports = MyFtp;
