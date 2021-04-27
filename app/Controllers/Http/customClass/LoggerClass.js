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
        Logger.transport('file').info({uri: this.url, method: this.method, user: this.user, data: this.data, success: this.success})
        Logger.transport('file').info({'end': jam+'-------------------------------------------------------------------------'})

    }
}

module.exports = logger