'use strict'

const MasEmployee = use("App/Models/MasEmployee")

class Employee {
    async ALL (req) {
        let employee
        if(req.keyword){
            employee = 
                await MasEmployee
                .query()
                .where(w => {
                    w.where('fullname', 'like', `%${req.keyword}%`)
                    orWhere('email', 'like', `%${req.keyword}%`)
                    orWhere('no_idcard', 'like', `%${req.keyword}%`)
                })
                .andWare('aktif', 'Y')
                .fetch()
        }else{
            employee = await MasEmployee.query().where({aktif: 'Y'}).fetch()
        }
        return employee
    }

    async OPERATOR (req) {
        let operator
        if(req.keyword){
            employee = 
                await MasEmployee
                .query()
                .where(w => {
                    w.where('fullname', 'like', `%${req.keyword}%`)
                    orWhere('email', 'like', `%${req.keyword}%`)
                    orWhere('no_idcard', 'like', `%${req.keyword}%`)
                })
                .andWare('is_operator', 'Y')
                .fetch()
        }else{
            operator = await MasEmployee.query().where({is_operator: 'Y'}).fetch()
        }

        return operator
    }
}

module.exports = new Employee()