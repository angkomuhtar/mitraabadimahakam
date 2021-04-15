var _ = require('underscore')
var moment = require('moment')

const Equipment = use("App/Models/MasEquipment")

class EquipmentPost {
    constructor(rsc, data, usr) {
        this.collection = rsc
        this.data = data
        this.user = usr.username
    }

    async post() {
        
    }
}

module.exports = EquipmentPost