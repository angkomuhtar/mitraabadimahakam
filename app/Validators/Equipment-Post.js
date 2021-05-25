'use strict'

class EquipmentPost {
  get rules () {
    return {
      kode: 'required',
      received_date: 'required',
      received_hm: 'required',
      unit_sn: 'required',
      engine_sn: 'required',
      engine_model: 'required',
      fuel_capacity: 'required',
      dealer_id: 'required'
    }
  }

  get messages () {
    return {
      'kode.required': 'Kode unit tdk boleh kosong...',
      'received_date.required': 'Date Received unit tdk boleh kosong...',
      'received_hm.required': 'HM Received awal unit tdk boleh kosong...',
      'unit_sn.required': 'Kode Serial Number Transmisi unit tdk boleh kosong...',
      'engine_sn.required': 'Kode Serial Number mesin unit tdk boleh kosong...',
      'engine_model.required': 'Kode Model unit tdk boleh kosong...',
      'fuel_capacity.required': 'Daya tampung BBM unit tdk boleh kosong...',
      'dealer_id.required': 'Nama Dealer unit tdk boleh kosong...'
    }
  }

  async fails (errorMessages) {
    console.log('errorMessages ', errorMessages)
    return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
  }
}

module.exports = EquipmentPost
