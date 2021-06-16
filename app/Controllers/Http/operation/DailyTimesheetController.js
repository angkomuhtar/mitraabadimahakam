'use strict'

class DailyTimesheetController {
    async index ({ view }) {
        return view.render('operation.daily-timesheet.index')
    }
}

module.exports = DailyTimesheetController
