$(function () {
	var Table = $('#table-data').DataTable({
		processing: true,
		serverSide: true,
		ordering: false,
		searching: false,
		scrollX: true,
		scrollCollapse: true,
		fixedColumns: {
			left: 1,
		},
		ajax: {
			headers: { 'x-csrf-token': $('[name=_csrf]').val() },
			url: '/operation/equipment-performance/list',
			data: function (d) {
				return $.extend({}, d, {
					unit_number: $('#unit_number').val(),
					sts: $('#f_sts').val(),
					bd_sts: $('#f_bd_sts').val(),
					bd_type: $('#f_bd_type').val(),
					start_t: $('#f_start').val(),
					end_t: $('#f_end').val(),
					periode: $('#periode').val(),
				})
			},
		},
		language: {
			processing: `Please Wait`,
		},
		columns: [
			{
				name: 'periode',
				data: 'periode',
			},
			{
				name: 'equip_code',
				data: 'kode',
			},
			// {
			// 	name: 'budget_pa',
			// 	data: 'id',
			// },
			{
				name: 'mohh',
				data: 'mohh',
			},
			{
				name: 'hm',
				data: 'hm',
			},
			// {
			// 	name: 'work_hours',
			// 	data: 'id',
			// },
			// {
			// 	name: 'standby',
			// 	data: 'id',
			// },
			{
				name: 'sch_h',
				data: 'sch_h',
				class: 'nowrap',
			},
			{
				name: 'uns_h',
				data: 'uns_h',
				class: 'nowrap',
			},
			{
				name: 'acd_h',
				data: 'ac_h',
				class: 'nowrap',
			},
			{
				name: 'tot_h',
				data: 'tot_h',
				class: 'nowrap',
			},
			{
				name: 'sch',
				data: 'sch',
			},
			{
				name: 'uns',
				data: 'uns',
			},
			{
				name: 'ac',
				data: 'ac',
			},
			{
				name: 'total',
				data: 'total_bd',
			},
			{
				data: 'pa',
			},
			{
				data: 'eu',
				render: (data) => {
					return data + '%'
				},
			},
			{
				data: 'ua',
			},
			{
				data: 'ma',
			},
			{
				data: 'mttr',
			},
			{
				data: 'mtbs',
			},
		],
	})

	$('select').select2()

	$('body').on('click', 'button#filter', function () {
		$('#filter-section').toggle('fast')
	})

	$('#periode').datetimepicker({
		viewMode: 'years',
		format: 'MM YYYY',
	})

	$('#periode').bind('dp.change', () => {
		// alert()
		Table.draw()
	})

	$('#unit_number').bind('change', function () {
		Table.draw()
	})
	/*
	initDefault()
	getAllSite()

	$('body').on('click', 'button#bt-back', function () {
		initDefault()
	})

	$('body').on('click', 'button#create-form', function () {
		getAllSite()
		initCreate()
	})

	$('body').on('click', 'button#create-form-details', function () {
		initCreateDetails()
	})

	$('body').on('click', 'button#bt-cancel-update', function (e) {
		e.preventDefault()
		initDefault()
	})

	$('body').on('click', 'button.bt-edit-data', function (e) {
		var id = $(this).data('id')
		initShow(id)
	})

	// $('body').on('click', 'button.bt-edit-data', function (e) {
	//   var id = $(this).data('id')
	//   initShowDetails(id)
	// })

	$('body').on('change', 'select#fitur_id', function () {
		var values = $(this).val()
		var desc = $(this)
			.find('option[value="' + values + '"]')
			.data('desc')
		$('textarea[name="desc"]').val(desc)
	})

	$('body').on('click', 'a.btn-pagging', function (e) {
		e.preventDefault()
		var page = $(this).data('page')
		var keyword = $('input#inpKeyworddoc').val()
		var url = window.location.pathname + '/list?page=' + page + '&keyword=' + keyword
		$.ajax({
			async: true,
			url: url,
			method: 'GET',
			success: function (result) {
				$('div#form-content-details').children().remove()
				$('div#list-content').html(result).show()
			},
			error: function (err) {
				console.log(err)
			},
		})
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

	// get the file data
	$('body').on('change', 'input[name="daily_downtime_upload"]', function () {
		var data = new FormData()

		data.append('daily_downtime_upload', $(this)[0].files[0])
		$.ajax({
			async: true,
			headers: { 'x-csrf-token': $('[name=_csrf]').val() },
			url: '/operation/daily-downtime/uploadFile',
			method: 'POST',
			data: data,
			dataType: 'json',
			processData: false,
			mimeType: 'multipart/form-data',
			contentType: false,
			beforeSend: function () {
				swal('Please wait!', 'Data sedang di proses...')
			},
			success: function (result) {
				$('body').find('input[name="current_file_name"]').val(JSON.stringify(result.fileName, null, 2))
				$('body')
					.find('select[name="sheet"]')
					.html(result.title.map((s) => '<option value="' + s + '"> Sheet [ ' + s + ' ]</option>'))
				$('body').find('select[name="sheet"]').prepend('<option value="" selected> Pilih </option>')
				swal('Okey!', 'Data Excel Berhasil dibaca ....', 'success')
			},
			error: function (err) {
				console.log(err)
				const { message } = err.responseJSON
				swal('Opps,,,!', message, 'warning')
			},
		})
	})

	$('body').on('submit', 'form#fm-submit-equipment-performance', function (e) {
		e.preventDefault()

		const formData = new FormData(this)

		swal(
			{
				title: 'Apakah anda yakin?',
				text: 'Pastikan Anda memilih bulan dengan benar!',
				type: 'warning',
				showCancelButton: true,
				confirmButtonClass: 'btn-warning',
				confirmButtonText: 'Okey!',
				closeOnConfirm: false,
			},
			function (isConfirm) {
				swal('Please wait.....')
				if (isConfirm) {
					$.ajax({
						async: true,
						headers: { 'x-csrf-token': $('[name=_csrf]').val() },
						url: '/operation/equipment-performance',
						method: 'POST',
						data: formData,
						dataType: 'json',
						processData: false,
						mimeType: 'multipart/form-data',
						contentType: false,
						success: function (result) {
							console.log(result)
							if (result.success) {
								swal('Okey!', result.message, 'success')
								$('body form#fm-submit-equipment-performance').trigger('reset')
								//   window.location.reload()
							} else {
								alert(result.message)
							}
						},
						error: function (err) {
							console.log('error upload >> ', JSON.stringify(err))
							const { message } = err.responseJSON
							swal('Opps,,,!', message, 'warning')
						},
					})
				} else {
					swal('Okey!', 'you cancel upload data...', 'success')
				}
			},
		)
	})

	function initDefault() {
		$('div.content-module').css('display', 'none')
		$.ajax({
			async: true,
			url: '/operation/equipment-performance/list?limit=',
			method: 'GET',
			data: {
				date: moment().format('YYYY-MM-DD'),
			},
			success: function (result) {
				$('content-module').css('display', 'none')
				$('div#list-content').html(result).show()
			},
			error: function (err) {
				console.log(err)
			},
		})
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
				$('body').find('select[name="site_id"]').prepend('<option value="" selected> Pilih </option>')
			},
			error: function (err) {
				console.log(err)
			},
		})
	}

	function initCreate() {
		// $('div.content-module').css('display', 'none')
		$.ajax({
			async: true,
			url: '/operation/equipment-performance/create',
			method: 'GET',
			success: function (result) {
				$('div#list-content').children().remove()
				$('div#form-content').html(result).show()
			},
			error: function (err) {
				console.log(err)
			},
		})
	}

	function initShow(id) {
		$.ajax({
			async: true,
			url: '/operation/equipment-performance/' + id + '/show',
			method: 'GET',
			success: function (result) {
				console.log('result >> ', result)
				$('div#list-content').children().remove()
				$('div#form-content').html(result).show()
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
  */
})
