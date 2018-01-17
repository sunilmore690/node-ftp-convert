const MyFtp = require('./ftp'),
    fs = require('fs'),
    EventEmitter = require('events'),
    path = require('path'),
    os = require('os')
/*
options = {
    input : {
        medium:'ftp/local',
        file:<File Path>
        ftp:{
            user:<ftp user>
            password:<ftp user>
            host:<ftp host>
            port:<port
        },
        type:<input file type>
    },
    output : {
        medium:'ftp/local',
        path : <File Path>
        ftp:{
            user:<ftp user>
            password:<ftp user>
            host:<ftp host>
            port:<port
        },   
    }
}


*/
let  makeInputFileReady = Symbol(),
    convert =Symbol(),
    csvConvert = Symbol(),
    json2xlsx = Symbol(),
    uploadToFtp = Symbol();
class FtpConvert extends EventEmitter {
    constructor(options) {
        super();
        this.options = options || {};
        this.options.input = this.options.input || {};
        this.options.output = this.options.output || {};
        this.options.input.medium = this.options.input.medium || 'local'
        this.options.output.medium = this.options.output.medium || 'local';
        this.options.output.path = (this.options.output.path.charAt(this.options.output.path.length) == '/') ? this.options.output.path : this.options.output.path + '/';
        this.tempDir = os.tmpdir() + '/';
        this.myfunction = function () { }
        this.tempOutputFile = this.tempDir + (Math.round(Math.random() * 100000)) + '.' + this.options.output.type;
        this.fileName = path.basename(this.options.input.file) ? path.basename(this.options.input.file).split('.')[0] : ''
        this.destination = this.options.output.path + this.fileName + '.' + this.options.output.type
        this.inputFile = this.options.input.file;
        this.formats = {
            csv: ['xlsx', 'json'],
            jpg: ['png']
        }
    }
    start() {
        if (this.options.input.medium == 'ftp') {
            this[makeInputFileReady]();
        } else {
            this.inputFile = this.options.input.file;
            this[convert]()

        }
    }
    [makeInputFileReady]() {
        let myFtp = new MyFtp(this.options.input.ftp)
        let self = this;
        let inputTmpFile = this.tempDir + (Math.round(Math.random() * 10000000000)) + '.' + this.options.input.type;
        myFtp.get(this.options.input.file, inputTmpFile, function (err) {
            if (!err) {
                self.inputFile = inputTmpFile;
                self[convert]();
            }
        })
    }
    [convert](cb) {
        if (typeof cb != 'function') cb = this.myfunction;
        this.callback = cb;
        // if (typeof this[this.options.input.type + 'Convert'] != 'function') {
        //     return this.emit('error', this.options.input.type + 'format not supperted')
        // }
        this[eval(this.options.input.type + 'Convert')]();
    }
    [csvConvert]() {
        const csv = require('csvtojson')
        let jsonArray = [];
        let self = this;
        let csvconvert = csv()
            .fromFile(this.inputFile)
            .on('json', (jsonObj) => { // this func will be called 3 times
                // console.log('json',jsonObj)
                jsonArray.push(jsonObj)
            })
            .on('done', () => {
                if (self.options.output.type == 'json') {
                    fs.writeFileSync(self.options.output.path + self.fileName + '.json', JSON.stringify(jsonArray), 'binary');
                    self.emit('done')
                } else {
                    fs.writeFileSync(self.tempOutputFile, JSON.stringify(jsonArray), 'binary');
                    self[eval('json2' + self.options.output.type)]();
                }
            })
    }
    [json2xlsx]() {
        let self = this;
        const jsonfile = require('jsonfile'),
            Excel = require('exceljs');
        let inputFile = this.tempOutputFile;
        let jsonArray = jsonfile.readFileSync(inputFile)
        var keys = Object.keys(jsonArray[0] || [])
        let workbook = new Excel.Workbook();
        var Sheet = workbook.addWorksheet('Sheet1', { worksheetMetrics: { columnCount: keys.length } });
        let columns = [];
        keys.forEach(function (key) {
            columns.push({ header: key, key: key })
        })
        Sheet.columns = columns;
        jsonArray.forEach(function (obj) {
            let tempObj = {};
            keys.forEach(function (key) {
                tempObj[key] = obj[key] || ' '
            })
            Sheet.addRow(tempObj)
        })
        let outputFile;
        if (this.options.output.medium == 'local') {
            outputFile = this.destination;
        } else {
            outputFile = this.tempDir + self.fileName + '.' + this.options.output.type
        }
        workbook.xlsx.writeFile(outputFile).then(function (err) {
            if (err) {
                return self.emit('error', err)
            }
            if (self.options.output.medium == 'local') {
                self.emit('done')
            } else {
                self[uploadToFtp](outputFile, self.destination, self.options.output.ftp)
            }
        })
    }
    [uploadToFtp](localFile, destination, ftp) {
        let myFtp = new MyFtp(ftp)
        let self = this;
        myFtp.put(localFile, destination, function (err) {
            if (!err) self.emit('done')
        })
    }
}
module.exports = FtpConvert;