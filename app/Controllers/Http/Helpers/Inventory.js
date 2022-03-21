'use strict'

const moment = require('moment')
const excelToJson = require('convert-excel-to-json');

class Inventory {
        async GET_MONTH_EXCEL_DATA_PURCHASE_REQUEST_INVENTORY(filePath, req) {
            const sampleSheet = req.sheet;


            const xlsx = excelToJson({
                  sourceFile: filePath,
                  header: 1
            });


            // excluding the header indexes
            const data = xlsx[sampleSheet].slice(5, xlsx.length)


            // build the format
            const parsedData = [];


            for(const value of data) {
                const obj = {
                    mechanicOrderList : value.B || null,
                    purchaseRequestNumber : value.C,
                    purchaseRequestDate : value.D,
                    contactAccount : value.F,
                    partNumber : value.G || null,
                    itemDescription : value.H || null,
                    purchaseRequestQty : value.I,
                    itemUnit : value.J,
                    codeUnit : value.K || null,
                    department : value.M || null,
                    personInCharge : value.N || null,
                    description : value.O || null,
                    dateReceived : value.P,
                    qtyReceived : value.Q || 0,
                    kurangKirim : value.R || 0,
                    orderStatus : value.S,
                    suratJalan : value.T || null
                }
                parsedData.push(obj)
            }


            const headersData = xlsx[sampleSheet]

            const masterData = {
                site : headersData[1].B.split(' : ')[1],
                description : headersData[2].C,
                periodStart : moment(headersData[3].F).add(1,'days').format('YYYY-MM-DD'),
                periodEnd : moment(headersData[3].H).add(1, 'days').format('YYYY-MM-DD'),
                daysOfPeriod : headersData[3].I,
                data : parsedData
            }

            console.log('master data purchase request >> ', masterData)

        };


        async GET_MONTH_EXCEL_DATA_STOCK_INVENTORY(filePath, req) {
            const sampleSheet = req.sheet


            const xlsx = excelToJson({
                  sourceFile: filePath,
                  header: 1
            })


            // excluding the header indexes
            const data = xlsx[sampleSheet].slice(5, xlsx.length)


            // build the format
            const parsedData = []


            for(const value of data) {
                const obj = {
                    no : value.A || null,
                    itemCode : value.C,
                    controlAccount : value.B,
                    partNumber : value.D || null,
                    itemDescription : value.E || null,
                    partType : value.F || null,
                    manufacturer : value.G || null,
                    equipmentType : value.H || null,
                    planModel : value.I || null,
                    itemUnit : value.J,
                    itemQty : value.K,
                    itemIn : value.L,
                    itemOut : value.M,
                    itemStock : value.N,
                    location : value.O || null,
                    remarks : value.P || null
                }
                parsedData.push(obj)
            }


            const headersData = xlsx[sampleSheet]

            const masterData = {
                site : headersData[1].A.split(' : ')[1],
                description : headersData[2].A,
                periodStart : moment(headersData[3].E).add(1,'days').format('YYYY-MM-DD'),
                periodEnd : moment(headersData[3].G).add(1, 'days').format('YYYY-MM-DD'),
                daysOfPeriod : headersData[3].H,
                data : parsedData
            }

            console.log('master data stock inventory >> ', masterData)

        };
}

module.exports = new Inventory()
