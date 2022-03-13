'use strict'

const _ = require('underscore')
const moment = require("moment")
const MamIssue = use("App/Models/MamIssue")

class AjaxIssueController {
    async runningText ({ request }) {
        let issue
        try {
            issue = (await MamIssue.query().with('unit').with('user').where( w => {
                w.where('report_at', 'like', `${moment().format('YYYY-MM-DD')}%`)
                // w.where('report_at', 'like', `2022-03-10%`)
            }).fetch()).toJSON()
        } catch (error) {
            console.log(error);
        }

        console.log(issue);
        let data = issue.map(obj => {
            return {
                id: obj.id,
                issue: obj.issue,
                reportby: `${obj.user.nm_lengkap || ''}` ,
                report_time: moment(obj.report_at).format('HH:mm'),
                unit: obj.unit?.kode || ''
            }
        })

        data = _.groupBy(data, 'issue')
        data = Object.keys(data).map(key => {
            return {
                issue: key,
                items: data[key]
            }
        })
        
        return data
    }
}

module.exports = AjaxIssueController
