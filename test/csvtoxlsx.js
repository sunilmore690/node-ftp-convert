const FtpConvert = require('../lib/ftpconvert');

// let options = {
//     input : {
//         medium:'local',
//         file:'/Users/sunilmore/Desktop/retailerdomain.csv',
//         type:'csv'
//     },
//     output : {
//         medium:'local',
//         path : '/Users/sunilmore/Documents/output',
//         type:'xlsx'
//     }
// }
let options = 
{
    input : {
        medium:'ftp',
        file:'/upload/full-Products.csv',
        type:'csv',
        ftp:{
            user:'sunil@filezapp.com',
            password:'Laxman_usha90',
            host:'ftp.filezapp.com',
            port:21
        }
    },
    output : {
        medium:'ftp',
        path : '/upload/1/2',
        type:'xlsx',
        ftp:{
            user:'sunil@filezapp.com',
            password:'Laxman_usha90',
            host:'ftp.filezapp.com',
            port:21
        }
    }
}
// let options =
//     {
//         input: {
//             medium: 'local',
//             file: '/Users/sunilmore/Desktop/full-Products.csv',
//             type: 'csv'
//         },
//         output: {
//             medium: 'ftp',
//             path: '/upload/1',
//             type: 'xlsx',
//             ftp: {
//                 user: 'sunil@filezapp.com',
//                 password: 'Laxman_usha90',
//                 host: 'ftp.filezapp.com',
//                 port: 21
//             }
//         }
//     }
let ftpconvert = new FtpConvert(options
)
ftpconvert.start();
ftpconvert.on('done', function () {
    console.log('-----done----')
})
    .on('error', function (error) {
        console.error(error);
    })