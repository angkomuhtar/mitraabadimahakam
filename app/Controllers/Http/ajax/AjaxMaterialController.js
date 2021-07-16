'use strict'

const MaterialHelpers = use("App/Controllers/Http/Helpers/Material")

class AjaxMaterialController {
    async getMaterial ({ request }) {
        const req = request.all()
        let result
        try {
            const data = (await MaterialHelpers.ALL(req)).toJSON()
            if(req.selected){
                result = data.data.map(item => 
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

module.exports = AjaxMaterialController
