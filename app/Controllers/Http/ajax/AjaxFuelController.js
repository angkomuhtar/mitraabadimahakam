'use strict'

const FuelHelpers = use("App/Controllers/Http/Helpers/Fuel")

class AjaxFuelController {
    async getFuelType ({ request }) {
        const req = request.all()
        let result
        try {
            const data = (await MaterialHelpers.ALL_FUEL(req)).toJSON()
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

module.exports = AjaxFuelController
