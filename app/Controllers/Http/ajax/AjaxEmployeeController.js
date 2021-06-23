'use strict'

const EmployeeHelpers = use("App/Controllers/Http/Helpers/Employee")

class AjaxEmployeeController {
    async all ({ request }) {
        const req = request.all()
        const data = await EmployeeHelpers.ALL(req)
        const result = data.toJSON()
        return result
    }

    async operator ({ request }) {
        const req = request.all()
        const data = await EmployeeHelpers.OPERATOR(req)
        const result = data.toJSON()
        console.log(req.selected);
        const dataMap = result.map(item => item.id === parseInt(req.selected) ? {...item, selected: 'selected'} : {...item, selected: ''})
        return dataMap
    }
}

module.exports = AjaxEmployeeController
