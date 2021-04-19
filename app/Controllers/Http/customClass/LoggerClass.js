var _ = require('underscore')
var moment = require('moment')
// const Drive = use('Drive')
const Logger = use('Logger')

class logger {
    constructor(url, data, usr, method, success) {
        this.url = url
        this.data = data
        this.user = usr.username
        this.method = method
        this.success = success
    }
    
    async tempData () {
        const jam = moment().format('DD-MM-YYYY HH:mm:ss')
        Logger.transport('file').info({'start': jam+'-----------------------------------------------------------------------'})
        Logger.transport('file').info({uri: this.url, data: this.data, user: this.user, method: this.method, success: this.success})
        Logger.transport('file').info({'end': jam+'-------------------------------------------------------------------------'})

    }

    // async () {
    //     const datetimes = moment().format('DD-MM-YYYY hh:mm:ss')
    //     const logName = moment().format('DDMMYYYY')
    //     let baseDir = `${process.cwd()}/log/`
    //     await Drive.prepend(`${baseDir}${logName}.txt`, Buffer.from(JSON.stringify(this.data, null, 2) + '\r'))
    //     await Drive.prepend(`${baseDir}${logName}.txt`, Buffer.from(`\r--------------------------------------------------\r`))
    //     await Drive.prepend(`${baseDir}${logName}.txt`, Buffer.from(`${this.user}\r`))
    //     await Drive.prepend(`${baseDir}${logName}.txt`, Buffer.from(`${this.collection} \r`))
    //     await Drive.prepend(`${baseDir}${logName}.txt`, Buffer.from(`# ${datetimes} \r`))
    //     await Drive.prepend(`${baseDir}${logName}.txt`, Buffer.from(`--------------------------------------------------\r`))
    // }
}

module.exports = logger