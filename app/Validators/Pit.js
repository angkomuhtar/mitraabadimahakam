'use strict'

class Pit {
  get rules () {
    return {
      site_id: 'required',
      kode: 'required',
      name: 'required',
      location: 'required'
    }
  }

  get messages () {
    return {
      'site_id.required': 'Site tdk boleh kosong...',
      'kode.required': 'Kode PIT tdk boleh kosong...',
      'name.required': 'Nama PIT tdk boleh kosong...',
      'location.required': 'keterangan PIT tdk boleh kosong...',
    }
  }

  async fails (errorMessages) {
    console.log('errorMessages ', errorMessages)
    return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
  }
}

module.exports = Pit
