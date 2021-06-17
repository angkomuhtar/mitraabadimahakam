'use strict'

const EquipUnit = use("App/models/MasEquipment")

class EquipmentList {
    async ALL (req) {
        let equipment
        if(req.keyword){
            equipment = 
                await EquipUnit
                    .query()
                    .where(word => {
                        word.where('kode', 'like', `%${req.keyword}%`)
                        word.orWhere('brand', 'like', `%${req.keyword}%`)
                        word.orWhere('tipe', 'like', `%${req.keyword}%`)
                        word.orWhere('unit_model', 'like', `%${req.keyword}%`)
                    })
                    .andWhere({aktif: 'Y'})
                    .fetch()
        }else{
            equipment = await EquipUnit.query().where({aktif: 'Y'}).fetch()
        }
        
        return equipment
    }
}

module.exports = new EquipmentList()