const _request = require('request')
const MasEquipment = use('App/Models/MasEquipment')
const EquipmentPerformance = use('App/Models/MamEquipmentPerformance')
const moment = require('moment')
const User = use('App/Models/User')
const UserDevice = use('App/Models/UserDevice')

class Utils {
  async infinityCheck(num) {
    return typeof num === 'number' && num === Infinity
  }
  async uniqueArr(arr, key1, key2, key3, key4) {
    const newArr = arr.filter((v, i, a) => a.findIndex(t => t[key1] === v[key1] && t[key2] === v[key2] && t[key3] === v[key3]) === i)
    return newArr
  }
  async equipmentTypeCheck(type) {
    switch (type) {
      case 'hauler truck':
        return 'hauler'
      case 'general support':
        return 'support'
      case 'fuel truck':
        return 'fuel'
      case 'lightning tower':
        return 'tower'
      case 'tower lamp':
        return 'tower'
      case 'water truck':
        return 'water'
      case 'excavator':
        return 'exca'
      case 'bulldozer':
        return 'dozer'
      default:
        return 'hauler'
    }
  }

  async numberFormatter(num, prefix) {
    const _num = num.includes('.') ? num.split('.') : num
    var number_string = num.includes('.') ? _num[0].replace(/[^,\d]/g, '').toString() : num.replace(/[^,\d]/g, '').toString(),
      split = number_string.split(','),
      sisa = split[0].length % 3,
      rupiah = split[0].substr(0, sisa),
      ribuan = split[0].substr(sisa).match(/\d{3}/gi)
    var separator

    // tambahkan titik jika yang di input sudah menjadi angka ribuan
    if (ribuan) {
      separator = sisa ? '.' : ''
      rupiah += separator + ribuan.join('.')
    }

    rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah
    return prefix == undefined && num.includes('.') && _num.length >= 1 ? rupiah + ',' + _num[1] : rupiah
  }

  async sendMessage(device, message, data, platform) {
    let restKey = null
    let appID = null

    if (platform === 'mam reporting ios') {
      appID = '114d2326-9629-4aef-805c-5ed5df7dfd7e'
      restKey = 'ZmZmZGRhZDktYzlkMi00MTcxLWI1MmMtYjNiOWM1YWEwMmNm'
    }

    if (platform === 'mam reporting android') {
      appID = '4f9dc782-1bc1-4a46-8dc6-e1bf266e7beb'
      restKey = 'MGJkODY1OGItNWJiNS00MWNmLWJiMGMtNTBjOGFkMjExNDJj'
    }

    _request(
      {
        method: 'POST',
        uri: 'https://onesignal.com/api/v1/notifications',
        headers: {
          authorization: 'Basic ' + restKey,
          'content-type': 'application/json',
        },
        json: true,
        body: {
          app_id: appID,
          contents: { en: message },
          include_player_ids: Array.isArray(device) ? device : [device],
          data: data
        },
      },
      function (error, response, body) {
        if (!body.errors) {
          console.log(body)
        } else {
          console.error('Error:', body.errors)
        }
      }
    )
  }

  async sendMessage_v2(data, userTipeArr) {
    const construct = new Utils()

    if (Array.isArray(userTipeArr) && userTipeArr.length > 0) {
      try {
        const playersArr = userTipeArr
        const users = (await User.query().whereIn('user_tipe', playersArr).fetch()).toJSON()
        const userDevices = (
          await UserDevice.query()
            .whereIn(
              'user_id',
              users.map(v => v.id)
            )
            .fetch()
        ).toJSON()

        for (const userDevice of userDevices) {
          await construct.notifPlatformDivider(userDevice.platform, userDevice.playerId, data)
        }
      } catch (err) {
        return {
          success: false,
          message: `Failed when sending notification to specific user \n Reason : ` + err.message,
        }
      }
    } else {
      try {
        const userDevices = (await UserDevice.query().fetch()).toJSON()

        for (const userDevice of userDevices) {
          await construct.notifPlatformDivider(userDevice.platform, userDevice.playerId, data)
        }
      } catch (err) {
        return {
          success: false,
          message: `Failed when sending notification to all user \n Reason : ` + err.message,
        }
      }
    }
  }

  async notifPlatformDivider(platform, device, data) {
    let appID
    let restKey

    if (platform === 'mam reporting ios') {
      appID = '114d2326-9629-4aef-805c-5ed5df7dfd7e'
      restKey = 'ZmZmZGRhZDktYzlkMi00MTcxLWI1MmMtYjNiOWM1YWEwMmNm'
    }

    if (platform === 'mam reporting android') {
      appID = '4f9dc782-1bc1-4a46-8dc6-e1bf266e7beb'
      restKey = 'MGJkODY1OGItNWJiNS00MWNmLWJiMGMtNTBjOGFkMjExNDJj'
    }

    _request(
      {
        method: 'POST',
        uri: 'https://onesignal.com/api/v1/notifications',
        headers: {
          authorization: 'Basic ' + restKey,
          'content-type': 'application/json',
        },
        json: true,
        body: {
          app_id: appID,
          headings: { en: data.headings },
          subtitle: { en: data.title },
          contents: { en: data.message },
          include_player_ids: Array.isArray(device) ? device : [device],
          data: data,
        },
      },
      function (error, response, body) {
        if (!body.errors) {
          console.log(body)
        } else {
          console.error('Error:', body.errors)
        }
      }
    )
  }

  async equipmentCheck(name, model) {
    const equipmentNameCheck = await MasEquipment.query().where('kode', name).first()

    if (!equipmentNameCheck) {
      return {
        isSuccess: false,
        checkMsg: `Equipment ${name} tidak ditemukan, silahkan input terlebih dahulu!.`,
      }
    }

    const equipmentModelCheck = await MasEquipment.query().where('kode', name).first()
    if (equipmentModelCheck && equipmentModelCheck.unit_model !== model) {
      return {
        isSuccess: false,
        checkMsg: `Model Equipment ${name} salah / tidak sesuai, harap di perbaikin terlebih dahulu!.`,
      }
    }
  }

  async addEquipmentToMonthlyEquipmentPerformance(month, user, equipment, totalHours) {
    const newEquipmentPerformance = new EquipmentPerformance()
    newEquipmentPerformance.fill({
      month: month,
      equip_id: equipment.id,
      upload_by: user.id,
      mohh: totalHours,
      target_downtime_monthly: totalHours * (1 - 0 / 100),
    })
    await newEquipmentPerformance.save()
  }
  async GEN_KODE_PURCHASING_ORDER(site_id) {
    const PurchasingRequest = use('App/Models/MamPurchasingRequest')
    const MasSite = use('App/Models/MasSite')

    let purchasingRequest
    let kode

    const strPrefix = teks => {
      if (teks) {
        let str = teks.substr(11, 5)
        let strToNum = parseInt(str) + 1
        let prefix = '0'.repeat(5 - strToNum) + strToNum
        return prefix
      } else {
        return '00001'
      }
    }

    if (!site_id) {
      purchasingRequest = await PurchasingRequest.query()
        .where(w => {
          w.where('kode', 'like', '%HOA%')
          w.where('date', '>=', moment().startOf('month').format('YYYY-MM-DD HH:mm'))
          w.where('date', '<=', moment().endOf('month').format('YYYY-MM-DD HH:mm'))
        })
        .orderBy('date', 'asc')
        .last()

      kode = 'PR' + moment().format('YYMMDD') + 'HOA' + strPrefix(purchasingRequest?.kode)
    } else {
      const site = await MasSite.query().where('id', site_id).last()
      purchasingRequest = await PurchasingRequest.query()
        .where(w => {
          w.where('site_id', site_id)
          w.where('date', '>=', moment().startOf('month').format('YYYY-MM-DD HH:mm'))
          w.where('date', '<=', moment().endOf('month').format('YYYY-MM-DD HH:mm'))
        })
        .orderBy('date', 'asc')
        .last()

      kode = 'PR' + moment().format('YYMMDD') + site.kode + strPrefix(purchasingRequest?.kode)
    }

    return kode
  }
}

module.exports = new Utils()
