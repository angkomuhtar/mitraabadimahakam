"use strict";

const { performance } = require('perf_hooks')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const ReportPDF = use("App/Controllers/Http/Helpers/ReportPDF")
const MamDownload = use("App/Models/MamDownload")
const moment = require('moment')
var fonts = {
  Courier: {
    normal: "Courier",
    bold: "Courier-Bold",
    italics: "Courier-Oblique",
    bolditalics: "Courier-BoldOblique",
  },
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
  Times: {
    normal: "Times-Roman",
    bold: "Times-Bold",
    italics: "Times-Italic",
    bolditalics: "Times-BoldItalic",
  },
  Symbol: {
    normal: "Symbol",
  },
  ZapfDingbats: {
    normal: "ZapfDingbats",
  },
};

var PdfPrinter = require("pdfmake");
var printer = new PdfPrinter(fonts);
var fs = require("fs");

class HourlyRitaseObController {
    async index ({ auth, request, params, response }) {
      var t0 = performance.now()
      const usr = await auth.getUser()
      const req = request.all()
      const { hh } = params
      const fileName = `ritase-perjam-${moment().format('DDMMYYHHmmss')}`

      const start = moment().format('YYYY-MM-DD') + ' ' + '0'.repeat(2 - `${hh}`.length) + hh + ':00'
      const end = moment().format('YYYY-MM-DD') + ' ' + '0'.repeat(2 - `${hh}`.length) + hh + ':59'

      let data = await ReportPDF.RIT_PER_JAM(start, end)
      data = data.map(obj => {
        return {
          exca: obj.exca_unit,
          ritase: obj.details.length,
          rowspan: GROUPING_DATA(obj.details).length,
          dtl: GROUPING_DATA(obj.details)
        }
      })

      let x = []
      data.map(v => {
        v.dtl.map(z => {
          x.push([
            {text: v.exca, rowSpan: v.rowspan, margin: [ 0, 10, 0, 0 ], bold: true, fontSize: 16},
            {text: v.ritase + ' RIT', rowSpan: v.rowspan, margin: [ 0, 10, 0, 0 ], alignment: 'right'},
            {text: parseInt(v.ritase) * 22 + ' BCM', rowSpan: v.rowspan, margin: [ 0, 10, 0, 0 ], alignment: 'right'},
            {text: z.hauler_unit},
            {text: z.rit + ' RIT', alignment: 'right'},
            {text: parseInt(z.rit) * 22 + ' BCM', alignment: 'right'}
          ])
        })
      })
      

      let headerTable = [
        {text: 'Unit Excavator', alignment: 'center', margin: [5, 10, 0, 5], fillColor: '#dddddd'},
        {text: 'Tot.Ritase', alignment: 'center', margin: [5, 10, 0, 5], fillColor: '#dddddd'},
        {text: 'Tot.Productivity', alignment: 'center', margin: [5, 10, 0, 5], fillColor: '#dddddd'},
        {text: 'Unit Hauler', alignment: 'center', margin: [5, 10, 0, 5], fillColor: '#dddddd'},
        {text: 'Hauler Ritase', alignment: 'center', margin: [5, 10, 0, 5], fillColor: '#dddddd'},
        {text: 'Hauler BCM..', alignment: 'center', margin: [5, 10, 0, 5], fillColor: '#dddddd'},
      ]

      let bodyTable = []
      bodyTable.push(headerTable)
      x.map(i => {
        bodyTable.push(i)
      })

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
              widths: ['auto', 'auto', 'auto', 'auto', 80, '*'],
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
        },
        defaultStyle: {
          font: 'Helvetica'
        }
      }
      await PDF_HOURLY_RITASE(docDefinition, fileName)

      const url = process.env.APP_URL
      const mamDownload = new MamDownload()
      mamDownload.fill({
        user_id: usr.id,
        url_download: `/download/${fileName}.pdf`
      })

      await mamDownload.save()

      if(req.platform === 'mobile'){
        let durasi = await diagnoticTime.durasi(t0)
        return response.status(200).json({
          diagnostic: {
              times: durasi, 
              error: false
          },
          data: mamDownload
        })
      }else{
        if(process.env.NODE_ENV === 'development'){
          return response.redirect(`${url}/download/${fileName}.pdf`)
        }else{
          return response.redirect(`http://offices.mitraabadimahakam.id/download/${fileName}.pdf`)
        }
      }
    }

    // async mobile ({ auth, request, params, response }) {
    //   var t0 = performance.now()
    //     const req = request.only(['keyword'])
    //     try {
    //         await auth.authenticator('jwt').getUser()
    //     } catch (error) {
    //         console.log(error)
    //         let durasi = await diagnoticTime.durasi(t0)
    //         return response.status(403).json({
    //             diagnostic: {
    //                 times: durasi, 
    //                 error: true,
    //                 message: error.message
    //             },
    //             data: {}
    //         })
    //     }
    // }
}

module.exports = HourlyRitaseObController;

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


function setTopMarginOfCellForVerticalCentering(ri, node){
  const cellHeights = node.table.body[ri].map(cell => {
    if(cell._inlines && cell._inlines.length) {
      return cell._inlines[0].height
    } else if(cell.stack) {
      return cell.stack[0]._inlines[0].height * cell.stack.length
    }
    return null
  })

  const maxRowHeight = Math.max(...cellHeights)
  node.table.body[ri].forEach((cell, ci) => {
    if(cellHeights[ci] && maxRowHeight > cellHeights[ci]) {
      let topMargin = (maxRowHeight - cellHeights[ci]) / 2
      if(cell._margin) {
        cell._margin[1] = topMargin
      } else {
        cell._margin = [0, topMargin, 0, 0]
      }
    }
  })

  return 2
}
