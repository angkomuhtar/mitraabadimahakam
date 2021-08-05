'use strict'

const MasDocumentation = use("App/Models/MasDocumentation")

const DocumentationHook = exports = module.exports = {}

DocumentationHook.beforeSave = async (doc) => {
    if(!doc.urut){
        const len = await MasDocumentation.query().where('aktif', 'Y').getCount()
        doc.urut = len + 1
    }
}
