'use strict'

class Shift {
  get rules () {
    return {
      kode: 'required',
      name: 'required',
      duration: 'required',
      start_shift: 'required',
      end_shift: 'required'
    }
  }

  get messages () {
    return {
      'kode.required': 'Kode tdk boleh kosong...',
      'name.required': 'Name SHIFT tdk boleh kosong...',
      'duration.required': 'Durasi SHIFT tdk boleh kosong...',
      'start_shift.required': 'Start SHIFT tdk boleh kosong...',
      'end_shift.required': 'End SHIFT tdk boleh kosong...',
    }
  }

  async fails (errorMessages) {
    console.log('errorMessages ', errorMessages)
    return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
  }
}

module.exports = Shift
