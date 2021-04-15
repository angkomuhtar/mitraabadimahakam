var _ = require('underscore')
var moment = require('moment')
const Drive = use('Drive')

class logger {
    constructor(rsc, data, usr) {
        this.collection = rsc
        this.data = data
        this.user = usr.username
    }

    async () {
        const datetimes = moment().format('DD-MM-YYYY hh:mm:ss')
        const logName = moment().format('DDMMYYYY')
        let baseDir = `${process.cwd()}/log/`
        await Drive.prepend(`${baseDir}${logName}.txt`, Buffer.from(JSON.stringify(this.data, null, 2) + '\r'))
        await Drive.prepend(`${baseDir}${logName}.txt`, Buffer.from(`\r--------------------------------------------------\r`))
        await Drive.prepend(`${baseDir}${logName}.txt`, Buffer.from(`${this.user}\r`))
        await Drive.prepend(`${baseDir}${logName}.txt`, Buffer.from(`${this.collection} \r`))
        await Drive.prepend(`${baseDir}${logName}.txt`, Buffer.from(`# ${datetimes} \r`))
        await Drive.prepend(`${baseDir}${logName}.txt`, Buffer.from(`--------------------------------------------------\r`))
    }
}

module.exports = logger