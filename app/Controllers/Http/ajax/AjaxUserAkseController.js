'use strict'

const Akses = use("App/Models/VPrivilege")
const SysModule = use("App/Models/SysModule")

class AjaxUserAkseController {
    async getUserModule ({ request }) {
        const req = request.all()
        const data = await Akses.query().where({usertipe: req.usertipe, idmodule: req.idmodule}).first()
        // console.log(data);
        return data
    }
}

module.exports = AjaxUserAkseController
