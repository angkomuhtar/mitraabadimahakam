'use strict'

const Helpers = use('Helpers')
const _ = require('underscore')
const moment = use('moment')
const MasBarang = use("App/Models/MasBarang")
const MasEquipment = use("App/Models/MasEquipment")
const MasDepartment = use("App/Models/MasDepartment")
const utils = use('App/Controllers/Http/customClass/utils')
const imgPath = Helpers.publicPath('logo-with-text.png')
const Image64Helpers = use("App/Controllers/Http/Helpers/_EncodingImage")

const MaterialRequestHelpers = use('App/Controllers/Http/Helpers/MaterialRequest')

moment.locale('id')

class MaterialRequestController {
    async index ( { view } ) {
        return view.render('logistik.material-request.index')
    }

    async list ( { auth, request, view } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        const data = await MaterialRequestHelpers.LIST(req)
        return view.render('logistik.material-request.list', { list: data })
    }

    async create ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const department = (await MasDepartment.query().where('status', 'Y').fetch()).toJSON()
        return view.render('logistik.material-request.create', {list: department})
    }

    async store ( { auth, request } ) {
        const req = request.all()
        req.items = JSON.parse(req.items)

        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        req.kode = await utils.GEN_KODE_MATERIAL_REQUEST(req)
        // console.log(req);

        const data = await MaterialRequestHelpers.POST(req, user)
        return data
    }

    async update ( { auth, params, request } ) {
        const req = request.all()
        req.items = JSON.parse(req.items)

        console.log(req);

        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = await MaterialRequestHelpers.UPDATE(req, params, user)
        return data
    }

    async check ( { auth, params } ) {

        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = await MaterialRequestHelpers.CHECK(params, user)
        return data
    }

    async print ( { auth, params } ){
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = await MaterialRequestHelpers.SHOW(params, user)
        console.log(data);
        const logo64 = await Image64Helpers.GEN_BASE64(imgPath)

        let body = [
            [
                {text: 'No', bold: true, alignment: 'center', fontSize: 10, fillColor: '#ddd'},
                {text: 'Items Request', bold: true, alignment: 'left', fontSize: 10, fillColor: '#ddd'},
                {text: 'PartNumber', bold: true, alignment: 'center', fontSize: 10, fillColor: '#ddd'},
                {text: 'Qty', bold: true, alignment: 'center', fontSize: 10, fillColor: '#ddd'},
                {text: 'UOM', bold: true, alignment: 'center', fontSize: 10, fillColor: '#ddd'},
                {text: 'Remarks', bold: true, alignment: 'left', fontSize: 10, fillColor: '#ddd'},
            ]
        ]
        
        data.items.forEach((elm, i) => {
            body.push([
                {text: i + 1, fontSize: 8, alignment: 'center'},
                {text: [
                    {text: elm.barang.kode + '\n', fontSize: 8},
                    {text: elm.barang.descriptions, fontSize: 9, bold: true}
                ]},
                {text: elm.barang.partnumber, fontSize: 9, alignment: 'right'},
                {text: elm.qty, fontSize: 9, alignment: 'right'},
                {text: elm.barang.uom, fontSize: 9, alignment: 'center'},
                {text: `${elm.equipment?.kode || ''}`, fontSize: 9}
            ])
        });

        var dd = {
            content: [
                {
                    style: 'tableExample',
                    table: {
                        widths: [ 'auto', 200, '*'],
                        body: [
                            [
                                {image: logo64, width: 90},
                                {text: 'Material Request', alignment: 'center', fontSize: 20, margin: [0, 10], bold: true},
                                {
                                    style: 'tableExample',
                                    table: {
                                        widths: [ 80, '*'],
                                        body: [
                                            [
                                                {text: 'MR No.', fontSize: 8},
                                                {text: data.kode, fontSize: 8, bold: true, alignment: 'right'},
                                            ],
                                            [
                                                {text: 'Date', fontSize: 8},
                                                {text: moment(data.date).format('ddd, DD MMM YYYY'), fontSize: 8, alignment: 'right'},
                                            ],
                                            [
                                                {text: 'Dept', fontSize: 8},
                                                {text: data.department.nama, fontSize: 8, alignment: 'right'},
                                            ],
                                        ]
                                    }
                                }
                            ],
                        ]
                    },
                    layout: 'noBorders'
                },
                {text: '\n'},
                {
                    style: 'tableExample',
                    table: {
                        headerRows: 1,
                        widths: ['*'],
                        body: [
                            [
                                {
                                    text: [
                                        {text: "Descriptions\n", fontSize: 9, bold: true},
                                        {text: data.narasi, fontSize: 8, italics: true}
                                    ]
                                }
                            ]
                        ]
                    },
                },
                {text: '\n'},
                {
                    style: 'tableExample',
                    table: {
                        headerRows: 1,
                        widths: [ 30, 'auto', 'auto', 30, 'auto', '*'],
                        body: body
                    },
                    layout: 'lightHorizontalLines'
                },
                {text: '\n'},
                
                {text: '\n\n\n'},
                {
                    columns: [
                        {
                            alignment: 'justify',
                            width: '35%',
                            margin: [30, 2, 10, 2],
                            style: 'tableExample',
                            table: {
                                headerRows: 1,
                                widths: ['*'],
                                body: [
                                    [
                                        {
                                            text: 'Request By', 
                                            alignment: 'center', 
                                            fontSize: 9
                                        }
                                    ],
                                    [
                                        {
                                            text: '\n\n\n\n\n', 
                                            alignment: 'center', 
                                            fontSize: 9,
                                            border: [true, false, true, false]
                                        }
                                    ],
                                    [
                                        {
                                            text: data.author.nm_lengkap, 
                                            alignment: 'center', 
                                            fontSize: 8,
                                            border: [true, false, true, false]
                                        }
                                    ],
                                    [
                                        {
                                            text: moment(data.approved_at).format('ddd, DD MMM YYYY'), 
                                            alignment: 'center', 
                                            fontSize: 8
                                        }
                                    ]
                                ]
                            },
                        },
                        {
                            alignment: 'justify',
                            width: '30%',
                            margin: [10, 2],
                            style: 'tableExample',
                            table: {
                                headerRows: 1,
                                widths: ['*'],
                                body: [
                                    [
                                        {
                                            text: 'Approved By', 
                                            alignment: 'center', 
                                            fontSize: 9
                                        }
                                    ],
                                    [
                                        {
                                            text: '\n\n\n\n\n', 
                                            alignment: 'center', 
                                            fontSize: 9,
                                            border: [true, false, true, false]
                                        }
                                    ],
                                    [
                                        {
                                            text: data.approved.nm_lengkap, 
                                            alignment: 'center', 
                                            fontSize: 8,
                                            border: [true, false, true, false]
                                        }
                                    ],
                                    [
                                        {
                                            text: moment(data.approved_at).format('ddd, DD MMM YYYY') + '\n', 
                                            alignment: 'center', 
                                            fontSize: 8
                                        }
                                    ]
                                ]
                            },
                        },
                        {
                            alignment: 'justify',
                            width: '30%',
                            margin: [10, 2],
                            style: 'tableExample',
                            table: {
                                headerRows: 1,
                                widths: ['*'],
                                body: [
                                    [
                                        {
                                            text: 'Accept By', 
                                            alignment: 'center', 
                                            fontSize: 9
                                        }
                                    ],
                                    [
                                        {
                                            text: '\n\n\n\n\n', 
                                            alignment: 'center', 
                                            fontSize: 9,
                                            border: [true, false, true, false]
                                        }
                                    ],
                                    [
                                        {
                                            text: '\n', 
                                            alignment: 'center', 
                                            fontSize: 8,
                                            border: [true, false, true, false]
                                        }
                                    ],
                                    [{text: '\n', alignment: 'center', fontSize: 8}]
                                ]
                            },
                        },
                    ]
                }
            ]
        }
        return dd
    }

    async show ( { auth, params, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = await MaterialRequestHelpers.SHOW(params)
        const department = (await MasDepartment.query().where('status', 'Y').fetch()).toJSON()
        let equipment = (await MasEquipment.query().where('site_id', data.site_id).fetch()).toJSON()

        equipment = _.groupBy(equipment, 'tipe')
        equipment = Object.keys(equipment).map(key => {
            return {
                type: key,
                items: equipment[key]
            }
        })

        let barang = (await MasBarang.query().where('aktif', 'Y').fetch()).toJSON()

        barang = _.groupBy(barang, 'equiptype')
        barang = Object.keys(barang).map(key => {
            return {
                type: key,
                items: barang[key]
            }
        })
        return view.render('logistik.material-request.show', {
            data: {...data, items: data.items.map( obj => {
                return {
                    ...obj,
                    listBarang: barang,
                    listEquipment: equipment
                }
            })}, 
            list: department
        })
    }

    async view ( { auth, params, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = await MaterialRequestHelpers.SHOW(params)
        return view.render('logistik.material-request.view', {data: data})
    }

    async createItems ( { auth, request, view } ) {
        const req = request.all()
        const user = await userValidate(auth)

        if(!user){
            return view.render('401')
        }

        req.length = parseInt(req.length) + 1

        let equipment = (await MasEquipment.query().where('site_id', req.site_id).fetch()).toJSON()

        equipment = _.groupBy(equipment, 'tipe')
        equipment = Object.keys(equipment).map(key => {
            return {
                type: key,
                items: equipment[key]
            }
        })

        let barang = (await MasBarang.query().where('aktif', 'Y').fetch()).toJSON()

        barang = _.groupBy(barang, 'equiptype')
        barang = Object.keys(barang).map(key => {
            return {
                type: key,
                items: barang[key]
            }
        })

        const HTML = '<tr class="item-details">'+
            '    <td>'+req.length+'</td>'+
            '    <td>'+
            '        <div class="form-group" style="margin-bottom:5px">'+
            '            <select class="form-control" name="barang_id">'+
            '               <option value="">Pilih Item Request</option>'+
                                barang.map( v => '<optgroup label="'+v.type+'">'+v.items.map(i => '<option type="'+i.equiptype+'" value="'+i.id+'">'+`[ ${i.kode} ] ${i.descriptions}  ${i.partnumber ? '-- partNum: '+i.partnumber : ''} `+'</option>')+'</optgroup>')+
            '            </select>'+
            '        </div>'+
            '    </td>'+
            '    <td>'+
            '        <div class="form-group" style="margin-bottom:5px">'+
            '            <input class="form-control" type="number" name="qty" value="1"/>'+
            '        </div>'+
            '    </td>'+
            '    <td>'+
            '        <div class="form-group" style="margin-bottom:5px">'+
            '            <select class="form-control" name="equipment_reff">'+
            '               <option value="">Pilih Equipment</option>'+
                                equipment.map( v => '<optgroup label="'+v.type+'">'+v.items.map(i => '<option value="'+i.id+'">'+i.kode+'</option>')+'</optgroup>')+
            '            </select>'+
            '        </div>'+
            '    </td>'+
            '    <td class="text-center">'+
            '        <button type="button" class="btn btn-danger btn-circle remove-items">'+
            '            <i class="icon-trash text-white"></i>'+
            '        </button>'+
            '    </td>'+
            '</tr>';
        return HTML
    }
}

module.exports = MaterialRequestController

async function userValidate(auth){
    let user
    try {
        user = await auth.getUser()
        return user
    } catch (error) {
        console.log(error);
        return null
    }
}