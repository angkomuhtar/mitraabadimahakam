$(function () {
	initDeafult()

	$('body').on('click', 'button#bt-back', function () {
		initDeafult()
	})

	$('body').on('click', 'button#bt-cancel-create', function (e) {
		e.preventDefault()
		window.location.reload()
	})

	$('body').on('click', 'button#create-form', function () {
		initCreate()
	})	

	$('body').on('click', 'button#bt-cancel-update', function (e) {
		e.preventDefault()
		initDeafult()
	})

	$('body').on('click', 'button#hm-add-unit', function (e) {
		addNewUnitHM()
	})

	$('body').on('click', 'button.bt-edit-data', function (e) {
		e.preventDefault()
		var id = $(this).data('id')
		initShow(id)
	})

	$('body').on('keyup', 'input#keywordTimeSheet', function (e) {
		if (e.key === 'Enter') {
			searchKeyword()
		}
	})

	$('body').on('click', 'button#bt-search-keyword', function (e) {
		searchKeyword()
	})

	$('body').on('change', 'input#equipment_id', function (e) {
		console.log('qwe')
	})

	// $('#hm-unit-list tr'). click(function (event) {
	// 	 var elID = $(this). attr('id'); alert(elID); 

	// 	});

	$('body').on('click', 'a.btn-pagging', function (e) {
		e.preventDefault()
		var page = $(this).data('page')
		var keyword = $('#keywordTimeSheet').val()
		var url = window.location.pathname + '/list?page=' + page + '&keyword=' + keyword
		$.ajax({
			async: true,
			url: url,
			method: 'GET',
			success: function (result) {
				$('div#list-content').children().remove()
				$('div#list-content').html(result).show()
				listNoBerkas()
			},
			error: function (err) {
				console.log(err)
			},
		})
	})

	function listNoBerkas() {
		$('small.nomor-berkas').each(function () {
			var no = $(this).data('id')
			var str = '0'.repeat(5 - no.toString().length) + no
			$(this).html('No : ' + str)
		})
	}

	function addNewUnitHM() {
		const site_id = parseInt($('select[name="site_id').val())
		$.ajax({
			async: true,
			url: '/operation/daily-timesheet/create/addItems',
			method: 'GET',
			data: {
				site_id: site_id,
			},
			success: function (result) {
				if (result.success) {
					$('tbody#hm-unit-list').append(result.data)
				} else {
					swal('Oops!', result.message, 'warning')
				}
			},
			error: function (err) {
				console.log('err >> ', err)
			},
		})
	}

    // function getUnitLastHM() {
	// 	const site_id = parseInt($('select[name="site_id').val())
	// 	$.ajax({
	// 		async: true,
	// 		url: '/operation/daily-timesheet/getLastHM',
	// 		method: 'GET',
	// 		data: {
	// 			site_id: site_id,
	// 		},
	// 		success: function (result) {
	// 			if (result.success) {
	// 				$('tbody#hm-unit-list').append(result.data)
	// 			} else {
	// 				swal('Oops!', result.message, 'warning')
	// 			}
	// 		},
	// 		error: function (err) {
	// 			console.log('err >> ', err)
	// 		},
	// 	})
	// }

	function searchKeyword() {
		var keyword = $('input#keywordTimeSheet').val()
		var url = window.location.pathname + '/list?keyword=' + keyword
		$.ajax({
			async: true,
			url: url,
			method: 'GET',
			success: function (result) {
				$('div#list-content').children().remove()
				$('div#list-content').html(result).show()
				listNoBerkas()
			},
			error: function (err) {
				console.log(err)
			},
		})
	}

	function initDeafult() {
		$('div.content-module').css('display', 'none')
		$.ajax({
			async: true,
			url: '/operation/daily-timesheet/list',
			method: 'GET',
			success: function (result) {
				$('div#list-content').children().remove()
				$('div#list-content').html(result).show()
				listNoBerkas()
				// getAllSite()
			},
			error: function (err) {
				console.log(err)
			},
		})
	}

	// function getAllSite() {
	//     $.ajax({
	//       async: true,
	//       url: '/master/site/all',
	//       method: 'GET',
	//       success: function (result) {
	//         console.log('result data >> ', result.data);
	//         $('body')
	//           .find('select[name="site_id"]')
	//           .html(result.data.map(s => '<option value="' + s.id + '">' + s.name + '</option>'))
	//         $('body').find('select[name="site_id"]').prepend('<option value="" selected> Pilih </option>')
	//       },
	//       error: function (err) {
	//         console.log(err)
	//       },
	//     })
	//   }

	function initCreate() {
		$.ajax({
			async: true,
			url: '/operation/daily-timesheet/create',
			method: 'GET',
			success: function (result) {
				$('div#form-create').html(result).show()
				$('div#form-show').html('')
				$('div#list-content').html('')
			},
			error: function (err) {
				console.log(err)
			},
		})
	}

	function initShow(id) {
		console.log(id)
		$('div.content-module').css('display', 'none')
		$.ajax({
			async: true,
			url: '/operation/daily-timesheet/' + id + '/show',
			method: 'GET',
			success: function (result) {
				$('div#form-show').children().remove()
				$('div#form-show').html(result).show()
			},
			error: function (err) {
				console.log(err)
			},
		})
	}
})
