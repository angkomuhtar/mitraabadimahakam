'use strict'

var moment = require('moment')

const Employee = use("App/Models/MasEmployee")

const EmployeeHook = exports = module.exports = {}

EmployeeHook.addDatas = async (employee) => {
    const grp = employee.tipe_employee
    const join = new Date(employee.join_date)
    employee.nik = await genNIK (grp, join)
    employee.tipe_idcard = (employee.tipe_idcard).toLowerCase()
    employee.email = (employee.email).toLowerCase()
    
}

EmployeeHook.editDatas = async (employee) => {
    const grp = employee.tipe_employee
    const join = new Date(employee.join_date)

    employee.nik = await genNIK (grp, join)
    employee.tipe_idcard = (employee.tipe_idcard).toLowerCase()
    employee.email = (employee.email).toLowerCase()
}



async function genNIK (grp, join) {
    const prefixYYMM = moment(join).format('YYMM')
    // const prefixMMDD = moment(join).format('MMDD')
    const urut = await Employee.query().where({tipe_employee: grp, aktif: 'Y'}).getCount() + 1
    var prefixUrut = '0'.repeat(4 - `${urut}`.length) + urut
    var result = `MAM${grp}${prefixYYMM}${prefixUrut}`
    // switch (grp) {
    //     case '01':
    //         var prefixUrut = '0'.repeat(3 - `${urut}`.length) + urut
    //         var result = `MAM-${prefixMMDD}${grp}${prefixUrut}`
    //         break;
    //     case '02':
    //         var prefixUrut = '0'.repeat(3 - `${urut}`.length) + urut
    //         var result = `MAM-${prefixMMDD}${grp}${prefixUrut}`
    //         break;
    //     default:
    //         var prefixUrut = '0'.repeat(4 - `${urut}`.length) + urut
    //         var result = `MAM${prefixYYMM}${grp}${prefixUrut}`
    //         break;
    // }

    return result
}