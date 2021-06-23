'use strict'

const EventHelpers = use("App/Controllers/Http/Helpers/Event")

class AjaxEventController {
    async getALL ({ request }) {
        const req = request.all()
        let result
        try {
            const data = (await EventHelpers.ALL(req)).toJSON()
            if(req.selected){
                result = data.map(item => 
                    item.id === parseInt(req.selected) ?
                    {...item, selected: 'selected'}
                    :
                    {...item, selected: ''}
                )
            }else{
                result = data
            }
        } catch (error) {
            console.log(error);
        }

        return result
    }
}

module.exports = AjaxEventController
