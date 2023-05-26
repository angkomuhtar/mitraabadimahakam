$(function () {
	var Table = $('#table-data').DataTable({
		processing: true,
		serverSide: true,
		ordering: false,
		searching: false,
		ajax: {
			headers: { 'x-csrf-token': $('[name=_csrf]').val() },
			url: '/operation/downtime-activity',
			data: function (d) {
				return $.extend({}, d, {
					unit_number: $('#unit_number').val(),
					comp: $('#comp').val(),
					start_date: $('#start').val(),
					end_date: $('#end').val(),
					// bd_type: $('#bd_type').val(),
				})
			},
		},
		language: {
			processing: `Please Wait`,
		},
		columns: [
			{
				data: 'downtime_code',
			},
			{
				data: 'downtime.equipment.kode',
				name: 'equip_name',
			},
			{
				data: 'activity',
			},
			{
				data: 'start',
				render: function (data) {
					return moment(data).format('DD-MM-YYYY HH:mm')
				},
			},
			{
				data: 'end',
				name: 'bd_end',
				render: function (data) {
					return data ? moment(data).format('DD-MM-YYYY HH:mm') : 'Not Set'
				},
			},
			{
				data: 'comp_group.nilai',
			},
			{
				defaultContent: 'Not Set',
				data: 'sts',
				render: (data) => {
					if (data == 1) {
						return `<span class="label label-success">Done</span>`
					} else {
						return `<span class="label label-info">Pending</span>`
					}
				},
			},
		],
	})
	// Table.draw()

	$('select').select2()
	$('body').on('click', 'button#create-form', function () {
		initCreate()
	})

	$('body').on('click', 'button#filter', function () {
		$('#filter-section').toggle('fast')
	})

	$('#unit_number,#comp,#bd_type').bind('change', function () {
		Table.draw()
	})

	$('#start,#end').bind('change', () => {
		Table.draw()
	})

	$('body').on('click', '#clear_filter', function () {
		$('#unit_number,#comp,#bd_type').val('0').change()
		$('#start,#end').val('')
		Table.draw()
	})

	$('#mulai').datetimepicker({
		useCurrent: false, //Important! See issue #1075
	})

	$('#selesai').datetimepicker({
		useCurrent: false, //Important! See issue #1075
	})
	$('#mulai').on('dp.change', function (e) {
		$('#selesai').data('DateTimePicker').minDate(e.date)
	})

	$('#start').datetimepicker({
		format: 'L',
		useCurrent: false, //Important! See issue #1075
	})
	$('#end').datetimepicker({
		format: 'L',
		useCurrent: false, //Important! See issue #1075
	})
	$('#start').on('dp.change', function (e) {
		$('#end').data('DateTimePicker').minDate(e.date)
	})

	$('body').on('click', 'button#bt-back', function () {
		history.back()
	})

	$(document).on('change', '#unit_number', (e) => {
		console.log(e.val)
		$.ajax({
			async: true,
			headers: { 'x-csrf-token': $('[name=_csrf]').val() },
			url: `/operation/downtime-activity/${e.val}/code`,
			method: 'GET',
			beforeSend: () => {
				$('#loader').show()
			},
			success: (res) => {
				if (res.success) {
					console.log(res.data)
					$('#dt_code').val(res.data.downtime_code)
					$('#dt_code').attr('readonly', true)
				} else {
					swal('Not Found', res.msg, 'warning')
				}
			},
			error: (err) => {
				console.log(err)
			},
			complete: () => {
				$('#loader').hide()
			},
		})
	})

	$('body').on('submit', 'form#fm-daily-downtime', function (e) {
		e.preventDefault()
		const formData = new FormData(this)
		$.ajax({
			async: true,
			headers: { 'x-csrf-token': $('[name=_csrf]').val() },
			url: '/operation/downtime-activity',
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

	function initDefault() {
		$('div.content-module').toggle()
	}

	function initCreate() {
		$.ajax({
			async: true,
			url: '/operation/downtime-activity/create',
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
})
