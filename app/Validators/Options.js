'use strict'

class Options {
  get rules () {
    return {
      group: 'required',
      teks: 'required',
      nilai: 'required'
    }
  }

  get messages () {
    return {
      'group.required': 'Group Options tdk boleh kosong...',
      'teks.required': 'Teks Options tdk boleh kosong...',
      'nilai.required': 'Nilai Options tdk boleh kosong...',
      'urut.required': 'Urut Options harus di tentukan...',
    }
  }

  async fails (errorMessages) {
    console.log('errorMessages ', errorMessages)
    return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
  }
}

module.exports = Options
