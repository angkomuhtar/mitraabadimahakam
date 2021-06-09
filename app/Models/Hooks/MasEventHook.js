'use strict'

const MasEvent = use("App/Models/MasEvent")
const SysError = use("App/Models/SysError")

const MasEventHook = exports = module.exports = {}

MasEventHook.beforeADD = async (event) => {
    const lenData = await MasEvent.query().where('aktif', 'Y').getCount()
    const str = '0'.repeat(3 - `${lenData + 1}`.length)
    event.kode = `${str}${lenData + 1}`
}

MasEventHook.beforeUPDATE = async (event) => {

}
