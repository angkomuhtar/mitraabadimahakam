'use strict'

const SysOption = use("App/Models/SysOption")
const SysError = use("App/Models/SysError")

const OptionHook = exports = module.exports = {}

OptionHook.addOptions = async (options) => {
    const grp = options.group
    const dataLen = await SysOption.query().where('group', grp).getCount()
    const validateInp = await SysOption.query().where({group: grp, nilai: options.nilai}).getCount()
    if(validateInp > 0){
        const err = new SysError()
        err.fill({name: 'E_DUPLICATED_DATA', message: 'duplikasi data', error_by: null})
        await err.save()
        throw new Error('Duplicated data input...')
    }
    options.group = (options.group).toLowerCase()
    options.nilai = (options.nilai).toLowerCase()
    options.urut = dataLen + 1
}

OptionHook.editOptions = async (options) => {
    options.group = (options.group).toLowerCase()
    options.nilai = (options.nilai).toLowerCase()
}
