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
    async index ({ auth, request, response }) {
      const usr = await auth.getUser()
      const fileName = `ritase-hourly${moment().format('DDMMYYHHmmss')}`

      await ReportPDF.RIT_PER_JAM()

      var docDefinition = {
        content: [
          {text: 'Laporan Ritase Per Jam', style: 'header'},
          {text: `Tanggal ${moment().format('dddd, DD MMMM YYYY')}`, style: 'subheader'},
          {
            style: 'tabRitase',
            table: {
              widths: [100, 'auto', 100, 200],
              body: [
                [
                  {text: 'Jam', alignment: 'center', margin: [5, 10, 0, 5], fillColor: '#dddddd'},
                  {text: 'Equipment', alignment: 'center', margin: [5, 10, 0, 5], fillColor: '#dddddd'},
                  {text: 'Ritase', alignment: 'center', margin: [5, 10, 0, 5], fillColor: '#dddddd'},
                  {text: 'BCM', alignment: 'center', margin: [5, 10, 0, 5], fillColor: '#dddddd'},
                ],
                [
                  {text: '07:01 - 08:00', alignment: 'center'},
                  {text: 'ME0022'},
                  {text: '32 RIT', alignment: 'center'},
                  {text: '10.000 BCM', alignment: 'center'}
                ]
              ]
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
            fontSize: 13,
            color: 'black'
          }
        },
        defaultStyle: {
          font: 'Helvetica'
        }
      }
      // await PDF_HOURLY_RITASE(docDefinition, fileName)

      // const url = request.headers().host
      // const protocol = request.protocol()
      // const mamDownload = new MamDownload()
      // mamDownload.fill({
      //   user_id: usr.id,
      //   url_download: `${url}/download/${fileName}.pdf`
      // })
      // await mamDownload.save()

      // return response.redirect(`${protocol}://${url}/download/${fileName}.pdf`)
    }
}

module.exports = HourlyRitaseObController

async function PDF_HOURLY_RITASE(dd, fileName) {
  var pdfDoc = printer.createPdfKitDocument(dd);
  pdfDoc.pipe(fs.createWriteStream(`public/download/${fileName}.pdf`));
  pdfDoc.end();
}