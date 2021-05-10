'use strict';

const Database = use('Database');

class UnitStopOperationReasons {

    async fetchData({ request, response }) {

        try {

            const data = (await Database
                .from('unit_stop_operation_reason')
                .select('id')
                .select('name'))

            return response.status(201).json({
                data,
            });

        } catch (err) {
            return response.status(401).json({
                data: null,
            });
        }
    };

};

module.exports = UnitStopOperationReasons;