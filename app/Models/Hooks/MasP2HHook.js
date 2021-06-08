'use strict'

const MasP2H = use("App/Models/MasP2H")
const SysError = use("App/Models/SysError")

const MasP2HHook = exports = module.exports = {}

MasP2HHook.beforeADD = async (p2h) => {
    const lenData = await MasP2H.query().where('sts', 'Y').getCount()
    p2h.urut = lenData + 1
}

MasP2HHook.beforeUPDATE = async (p2h) => {

}
