'use strict'

class Site {
  get rules () {
    return {
      kode: 'required',
      name: 'required',
      keterangan: 'required'
    }
  }

  get messages () {
    return {
      'kode.required': 'Kode Site tdk boleh kosong...',
      'name.required': 'Nama Site tdk boleh kosong...',
      'keterangan.required': 'keterangan site tdk boleh kosong...',
    }
  }

  async fails (errorMessages) {
    console.log('errorMessages ', errorMessages)
    return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
  }
}

module.exports = Site
