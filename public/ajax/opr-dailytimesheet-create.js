$(function () {
	itemEventHTML()
	getListP2H($('form#fm-timesheeet-upd').data('id'))

	$('#editable-datatable').DataTable({
		columns: [{ width: '8%' }, null, null],
	})

	function getListP2H(id) {
		console.log('GET DATA P2H')
		$.ajax({
			async: true,
			url: '/operation/daily-timesheet/list-p2h?id=' + id,
			method: 'GET',
			success: function (result) {
				$('tbody#list-p2h').children().remove()
				$('tbody#list-p2h').html(result).show()
			},
			error: function (err) {
				console.log(err)
			},
		})
	}

	function setUrutTR() {
		$('tbody.item-event > tr').each(function (i) {
			$(this)
				.find('td.text-center > h1')
				.html(i + 1)
		})
	}

	function GET_INPUT_DATA_TIMESHEET() {
		var keys = []
		var values = []
		$('.inp-timesheet').each(function () {
			keys.push($(this).attr('name'))
			values.push($(this).val())
		})

		var obj = _.object(keys, values)
		delete obj['undefined']
		return obj
	}

	function GET_INPUT_DATA_REFUEL() {
		var keys = []
		var values = []
		keys.push('timesheet_id')
		values.push($('form#fm-timesheeet-upd').data('id'))

		keys.push('equip_id')
		values.push($('select#unit_id').val())

		$('.inp-dailyrefuel').each(function () {
			keys.push($(this).attr('name'))
			values.push($(this).val())
		})
		return _.object(keys, values)
	}

	function GET_INPUT_DATA_P2H() {
		var arr = []
		$('tr.item-p2h').each(function () {
			var id = $(this).data('id')
			var names = []
			var values = []
			$('.inp-p2h').each(function () {
				if ($(this).attr('name')) {
					var attribute = $(this).attr('name')
					names.push(attribute)
					values.push($('#' + attribute + 'p2h' + id).val() != '' ? $('#' + attribute + 'p2h' + id).val() : null)
				}
			})
			arr.push(_.object(names, values))
		})
		console.log(arr)
		return arr
	}

	function GET_INPUT_DATA_EVENT() {
		var arr = []
		$('tr.item-event').each(function () {
			var id = $(this).data('id')
			var names = []
			var values = []
			$('.inp-dailyevent').each(function () {
				if ($(this).attr('name')) {
					var attribute = $(this).attr('name')
					names.push(attribute)
					values.push($('#' + attribute + id).val() != '' ? $('#' + attribute + id).val() : null)
				}
			})
			arr.push(_.object(names, values))
		})
		console.log(arr)
		return arr
	}

	function itemEventHTML() {
		$.ajax({
			async: true,
			url: 'daily-timesheet/add-event',
			method: 'GET',
			dataType: 'html',
			processData: false,
			mimeType: 'multipart/form-data',
			contentType: false,
			success: function (result) {
				$('body').find('tbody.item-event').append(result)
			},
			error: function (err) {
				console.log(err)
			},
			complete: function (comp) {
				setUrutTR()
			},
		})
	}

	$('button#bt-add-event').on('click', function (e) {
		e.preventDefault()
		itemEventHTML()
	})

	$('body').on('change', 'input[name="start_at"]', function (e) {
		e.preventDefault()
		var id = $(this).data('id')
		var begin_with = $(this).val()
		var end_with = $('input#end_at' + id).val()
		var x = new moment(begin_with)
		var y = new moment(end_with)
		var duration = moment.duration(y.diff(x)).as('minutes')
		var parseSmu = parseFloat(duration) / 60
		$('input#smu_event' + id).val(parseSmu.toFixed(2))
	})

	$('body').on('change', 'input[name="end_at"]', function (e) {
		e.preventDefault()
		var id = $(this).data('id')
		var begin_with = $('input#start_at' + id).val()
		var end_with = $(this).val()
		var x = new moment(begin_with)
		var y = new moment(end_with)
		var duration = moment.duration(y.diff(x)).as('minutes')
		var parseSmu = parseFloat(duration) / 60
		$('input#smu_event' + id).val(parseSmu.toFixed(2))
	})

	$('body').on('change', 'select[name="equipment_id"]', function (e) {
		const unitId = e.target.value
		const siteId = $('body').find('select#site_id').val()
		const data = getLastHM(unitId, siteId)
		console.log('data >> ', data)
		const { responseJSON } = data
		const elm = $(this).parents('tr').find('input[name="begin_smu"]').val(responseJSON.data.prevHM)
	})

	$('body').on('change', 'input[name="begin_smu"]', function (e) {
		e.preventDefault()
		console.log(event.target)
	})

	$('body').on('change', 'select[name="event_id"]', function () {
		var values = $(this).val()
		var isRequired = values != ''
		$('input[id*="smu_event"]').prop('required', isRequired)
		$('input[id*="start_at"]').prop('required', isRequired)
	})

	$('body').on('click', 'button.bt-remove-event', function (e) {
		e.preventDefault()
		$(this).parents('tr').remove()
		setUrutTR()
	})

	$('body').on('change', 'select.check-status-p2h', function (e) {
		e.preventDefault()
		var id = $(this).data('id')
		var isValues = $(this).val()
		if (isValues != 'Y') {
			$('textarea#descriptionp2h' + id).prop('required', true)
		} else {
			$('textarea#descriptionp2h' + id).prop('required', false)
		}
	})

	$('form#fm-timesheeet').submit(function (e) {
		e.preventDefault()
		var DATA_TIMESHEET = GET_INPUT_DATA_TIMESHEET()
		// var DATA_P2H = GET_INPUT_DATA_P2H()
		// var DATA_EVENT = GET_INPUT_DATA_EVENT()
		// var DATA_REFUELING = GET_INPUT_DATA_REFUEL()
		// var SUM_DATA = {
		//     ...DATA_TIMESHEET,
		//     p2h: DATA_P2H,
		//     event: DATA_EVENT,
		//     refueling: DATA_REFUELING
		// }

		$.ajax({
			async: true,
			headers: { 'x-csrf-token': $('[name=_csrf]').val() },
			url: '/operation/daily-timesheet',
			method: 'POST',
			data: JSON.stringify(DATA_TIMESHEET),
			dataType: 'json',
			processData: false,
			mimeType: 'multipart/form-data',
			contentType: false,
			success: function (result) {
				console.log(result)
				if (result.success) {
					swal('Okey,,,!', result.message, 'success')
				} else {
					alert(result.message)
				}
			},
			error: function (err) {
				console.log(err)
				const { message } = err.responseJSON
				swal('Opps,,,!', message, 'warning')
			},
			complete: function () {
				window.location.reload()
			},
		})
	})

	function getLastHM(unitId, siteId) {
		$.ajax({
			async: true,
			url: 'daily-timesheet/getLastHM',
			method: 'POST',
			data: {
				unit_id: unitId,
				site_id: siteId,
			},
			dataType: 'json',
			success: function (result) {
				console.log(result.data)
				console.log(result.data.prevHM)
				if (result.success) {
					data = {
						lastHM: result.data.prevHM,
					}
				} else {
					data = {
						lastHM: 0,
					}
				}
			},
			error: function (err) {
				console.log('error get last hm >> ', err)
			},
		})
	}
})
