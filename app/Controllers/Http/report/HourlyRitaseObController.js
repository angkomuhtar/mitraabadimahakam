'use strict'

const ReportPDF = use("App/Controllers/Http/Helpers/ReportPDF")
const MamDownload = use("App/Models/MamDownload")
const moment = require('moment')
var fonts = {
    Courier: {
      normal: 'Courier',
      bold: 'Courier-Bold',
      italics: 'Courier-Oblique',
      bolditalics: 'Courier-BoldOblique'
    },
    Helvetica: {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique',
      bolditalics: 'Helvetica-BoldOblique'
    },
    Times: {
      normal: 'Times-Roman',
      bold: 'Times-Bold',
      italics: 'Times-Italic',
      bolditalics: 'Times-BoldItalic'
    },
    Symbol: {
      normal: 'Symbol'
    },
    ZapfDingbats: {
      normal: 'ZapfDingbats'
    }
}
  
var PdfPrinter = require('pdfmake');
var printer = new PdfPrinter(fonts);
var fs = require('fs');


class HourlyRitaseObController {
    async index ({ auth, request, params, response }) {
      const usr = await auth.getUser()
      const { hh } = params
      const fileName = `ritase-perjam-${moment().format('DDMMYYHHmmss')}`

      const start = moment().format('YYYY-MM-DD') + ' ' + '0'.repeat(2 - `${hh}`.length) + hh + ':00'
      const end = moment().format('YYYY-MM-DD') + ' ' + '0'.repeat(2 - `${hh}`.length) + hh + ':59'

      let data = await ReportPDF.RIT_PER_JAM(start, end)
      data = data.map(obj => {
        return {
          exca: obj.exca_unit,
          ritase: obj.details.length,
          dtl: GROUPING_DATA(obj.details)
        }
      })

      

      let headerTable = [
        {text: 'Unit Excavator', alignment: 'center', margin: [5, 10, 0, 5], fillColor: '#dddddd'},
        {text: 'Tot.Ritase', alignment: 'center', margin: [5, 10, 0, 5], fillColor: '#dddddd'},
        {text: 'Unit Hauler', alignment: 'center', margin: [5, 10, 0, 5], fillColor: '#dddddd'},
        {text: 'Hauler Ritase', alignment: 'center', margin: [5, 10, 0, 5], fillColor: '#dddddd'},
        {text: 'BCM', alignment: 'center', margin: [5, 10, 0, 5], fillColor: '#dddddd'},
      ]

      let bodyTable = []
      bodyTable.push(headerTable)

      
      const parsing = data.map(obj => {
        var res = []
        obj.dtl.map(x => {
          res.push({
            excavator: obj.exca,
            ritase: obj.ritase,
            volume: x.volume,
            hauler_unit: x.hauler_unit,
            rit: x.rit
          })
        })
        return res
      })
      
      console.log(parsing);
      for (const item of parsing) {
        item.map(v => {
          bodyTable.push([
            {text: v.excavator, fontSize: 15, bold: true},
            {text: v.ritase+' RIT'},
            {text: v.hauler_unit, alignment: 'left'},
            {text: `${v.rit} RIT`, alignment: 'right'},
            {text: `${v.volume} BCM`, alignment: 'right'}
          ])
        })
      }

      var docDefinition = {
        watermark: { 
          text: 'PT. Mitra Abadi Mahakam', 
          color: 'red', 
          opacity: 0.3, 
          bold: true, 
          italics: true, 
          angle: 0,
          fontSize: 30
        },
        content: [
          {text: 'Laporan Ritase Hauling OB Per Jam', style: 'header'},
          {text: `Tanggal ${moment().format('dddd, DD MMMM YYYY')}`, style: 'subheader'},
          {text: `Periode ${start} s/d ${end}`, fontSize: 12, bold: true},
          {
            style: 'tabRitase',
            table: {
              widths: ['auto', 'auto', 'auto', 100, '*'],
              body: bodyTable
            }
          }
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true
          },
          subheader: {
            fontSize: 8,
            bold: false,
            margin: [0, 0, 0, 20]
          },
          tabRitase: {
            margin: [0, 5, 0, 15]
          },
          tableHeader: {
            bold: true,
            fontSize: 14,
            color: 'black'
          }
        },
        defaultStyle: {
          font: 'Helvetica'
        }
      }
      await PDF_HOURLY_RITASE(docDefinition, fileName)

      const url = request.headers().host
      const protocol = request.protocol()
      const mamDownload = new MamDownload()
      mamDownload.fill({
        user_id: usr.id,
        url_download: `${url}/download/${fileName}.pdf`
      })
      await mamDownload.save()

      return response.redirect(`${protocol}://${url}/download/${fileName}.pdf`)
    }
}

module.exports = HourlyRitaseObController

async function PDF_HOURLY_RITASE(dd, fileName) {
  var pdfDoc = printer.createPdfKitDocument(dd);
  pdfDoc.pipe(fs.createWriteStream(`public/download/${fileName}.pdf`));
  pdfDoc.end();
}

function GROUPING_DATA(arr) {
    var grouped = [];

    arr.forEach(function (data) {    
      if (!this[data.hauler_unit]) {        
        this[data.hauler_unit] = { volume: 0, hauler_unit: data.hauler_unit, rit: 0};        
        grouped.push(this[data.hauler_unit]);    
      }    
      this[data.hauler_unit].volume += data.volume;
      this[data.hauler_unit].rit += data.rit;
    }, Object.create(null));
  return grouped
}