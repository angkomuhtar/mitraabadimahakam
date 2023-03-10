function convertMinutes(minutes) {
	const days = Math.floor(minutes / 1440)
	const hours = Math.floor((minutes % 1440) / 60)
	const remainingMinutes = minutes % 60
	return `${days > 0 ? days + 'hari, ' : ''} ${hours > 0 ? hours + 'jam, ' : ''} ${remainingMinutes} menit`
}

$(function () {
	var Table = $('#table-data').DataTable({
		processing: true,
		serverSide: true,
		ordering: false,
		searching: false,
		scrollX: true,
		// scrollCollapse: true,
		ajax: {
			headers: { 'x-csrf-token': $('[name=_csrf]').val() },
			url: '/operation/daily-downtime',
			data: function (d) {
				return $.extend({}, d, {
					unit_number: $('#f_unit_number').val(),
					sts: $('#f_sts').val(),
					bd_sts: $('#f_bd_sts').val(),
					bd_type: $('#f_bd_type').val(),
					start_t: $('#f_start').val(),
					end_t: $('#f_end').val(),
				})
			},
		},
		language: {
			processing: `Please Wait`,
		},
		columns: [
			{
				data: 'downtime_code',
				render: (data, type, row) => {
					return `
					<div style="display:flex; align-items:center">
					<a href="/operation/downtime-activity/${row.downtime_code}/activity" class="btn-add"><i class="ti-plus"></i></a>
					<a href="/operation/downtime-activity/${row.downtime_code}/activity" class="btn-edit"><i class="ti-pencil"></i></a>
					</div>
					`
				},
			},
			{
				data: 'equipment.kode',
				name: 'equip_name',
			},
			{
				data: 'location',
			},

			{
				data: 'problem_reported',
			},
			{
				data: 'breakdown_start',
				render: function (data) {
					return moment(data).format('DD-MM-YYYY HH:mm')
				},
			},
			{
				data: 'breakdown_finish',
				render: function (data) {
					return data ? moment(data).format('DD-MM-YYYY HH:mm') : 'Not Set'
				},
			},
			{
				data: 'downtime_total',
				render: (data) => {
					return convertMinutes(data)
				},
			},
			{
				data: 'status',
			},
			{
				defaultContent: 'Not Set',
				data: 'downtime_status',
			},
			{
				// defaultContent: 'Not Set',
				data: 'type_break',
				render: (data) => {
					if (data?.teks) {
						return data.teks + ' - ' + data.nilai
					} else {
						return 'Not Set'
					}
				},
			},
		],
	})
	// Table.draw()

	// filter SECTION

	$('select').select2()

	$('body').on('click', 'button#filter', function () {
		$('#filter-section').toggle('fast')
	})

	$('#f_unit_number,#f_sts,#f_bd_sts,#f_bd_type').bind('change', function () {
		Table.draw()
	})

	$('#f_start,#f_end').bind('dp.change', () => {
		Table.draw()
	})

	$('body').on('click', '#clear_filter', function () {
		$('#f_unit_number,#f_bd_sts,#f_bd_type,#f_sts').val('0').change()
		$('#f_start,#f_end').val('')
		Table.draw()
	})

	$('#f_start').datetimepicker({
		format: 'L',
		useCurrent: false, //Important! See issue #f_1075
	})
	$('#f_end').datetimepicker({
		format: 'L',
		useCurrent: false, //Important! See issue #f_1075
	})
	$('#f_start').on('dp.change', function (e) {
		$('#f_end').data('DateTimePicker').minDate(e.date)
	})
	// end filter SECTION

	// initDefault()
	// getAllSite()

	$('body').on('click', 'button#bt-back', function () {
		initDefault()
	})

	$('body').on('click', 'button#create-form', function () {
		initCreate()
		getAllSite()
	})

	$('body').on('change', 'select[name="sts_approve"]', function () {
		const value = $(this).val()

		if (value === 'no') {
			$('body').find('div#approved_date_div').addClass('hidden')
			$('body').find('input[name="approved_date"]').removeAttr('required')
			$('body').find('input[name="approved_date"]').val('')
		} else {
			$('body').find('div#approved_date_div').removeClass('hidden')
		}
	})
	// serach downtime
	$(document).on('change', '#unit_number', (e) => {
		console.log(e.val)
		$.ajax({
			async: true,
			headers: { 'x-csrf-token': $('[name=_csrf]').val() },
			url: `/operation/daily-downtime/${e.val}/searchDT`,
			method: 'GET',
			beforeSend: () => {
				$('#loader').show()
			},
			success: (res) => {
				$('#problem').val(res.data.problem_reported)
				$('#hm').val(res.data.hour_meter)
				$('#start_time').val(moment(res.data.breakdown_start).format('DD/MM/YYYY HH.mm'))
				$('#start_time').attr('readonly', true)
			},
			error: (err) => {
				console.log('ini error', err)
				$('#problem').val('')
				$('#hm').val('')
				$('#start_time').val('')
				$('#start_time').attr('readonly', false)
			},
			complete: () => {
				$('#loader').hide()
			},
		})
	})

	// /Using Form
	$('body').on('submit', 'form#fm-daily-downtime', function (e) {
		e.preventDefault()
		const formData = new FormData(this)
		$.ajax({
			async: true,
			headers: { 'x-csrf-token': $('[name=_csrf]').val() },
			url: '/operation/daily-downtime',
			method: 'POST',
			data: formData,
			dataType: 'json',
			processData: false,
			mimeType: 'multipart/form-data',
			contentType: false,
			beforeSend: function () {
				$('#loader').show()
			},
			success: function (result) {
				if (result.success) {
					swal(
						{
							title: 'Okey!',
							text: result.message,
							type: 'success',
						},
						(isConfirm) => {
							if (isConfirm) {
								window.location.reload()
							}
						},
					)
				} else {
					swal('Error', result?.type ? result.message : 'Something went wrong, Try Again.!!', result?.type ? 'warning' : 'error')
				}
			},
			error: function (err) {
				console.log('error upload >> ', JSON.stringify(err))
				const { message } = err.responseJSON
				swal('Opps,,,!', 'error when update data', 'error')
			},
			complete: function () {
				$('#loader').hide()
			},
		})
	})
	// Using Excell
	$('body').on('submit', 'form#fm-upload-daily-downtime', function (e) {
		e.preventDefault()
		const formData = new FormData(this)
		formData.append('daily_downtime_upload', $('input[name="daily_downtime_upload"]')[0].files[0])
		$.ajax({
			async: true,
			headers: { 'x-csrf-token': $('[name=_csrf]').val() },
			url: '/operation/daily-downtime',
			method: 'POST',
			data: formData,
			dataType: 'json',
			processData: false,
			mimeType: 'multipart/form-data',
			contentType: false,
			beforeSend: function () {
				$('#loader').show()
			},
			success: function (result) {
				if (result.success) {
					swal('Okey!', result.message, 'success')
					$('#form_id').trigger('reset')
				} else {
					swal('Error', result?.type ? result.message : 'Something went wrong, Try Again.!!', result?.type ? 'warning' : 'error')
				}
			},
			error: function (err) {
				console.log('error upload >> ', JSON.stringify(err))
				const { message } = err.responseJSON
				swal('Opps,,,!', 'error when update data', 'error')
			},
			complete: function () {
				$('#loader').hide()
			},
		})
	})

	function initDefault() {
		$('div.content-module').css('display', 'none')
		$('div#list-content').toggle()
	}

	function initCreate() {
		$.ajax({
			async: true,
			url: '/operation/daily-downtime/create',
			method: 'GET',
			success: function (result) {
				$('div#list-content').toggle()
				$('div#form-content').html(result).show()
			},
			error: function (err) {
				console.log(err)
			},
		})
	}

	function initShow(id) {
		// $.ajax({
		// 	async: true,
		// 	url: '/operation/sop/' + id + '/show',
		// 	method: 'GET',
		// 	success: function (result) {
		// 		$('div#list-content').children().remove()
		// 		$('div#form-content').html(result).show()
		// 	},
		// 	error: function (err) {
		// 		console.log(err)
		// 	},
		// })
	}

	function getAllSite() {
		$.ajax({
			async: true,
			url: '/master/site/all',
			method: 'GET',
			success: function (result) {
				$('body')
					.find('select[name="site_id"]')
					.html(result.data.map((s) => '<option value="' + s.id + '">' + s.name + '</option>'))
			},
			error: function (err) {
				console.log(err)
			},
		})
	}

	function ajaxSearch(value) {
		var url = window.location.pathname + '/list?keyword=' + value
		$.ajax({
			async: true,
			url: url,
			method: 'GET',
			success: function (result) {
				$('div#list-content').children().remove()
				$('div#list-content').html(result).show()
			},
			error: function (err) {
				console.log(err)
			},
		})
	}
})
