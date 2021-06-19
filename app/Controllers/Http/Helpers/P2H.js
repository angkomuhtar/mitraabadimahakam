'use strict'

const MasP2H = use("App/Models/MasP2H")

class P2H {
    async ALL (req) {
        let masP2H
        if(req.keyword){
            masP2H = 
                await MasP2H
                .query()
                .where('task', 'like', `%${req.keyword}%`)
                .andWare('sts', 'Y')
                .fetch()
        }else{
            masP2H = await MasP2H.query().where({sts: 'Y'}).fetch()
        }
        
        return masP2H
    }
}

module.exports = new P2H()