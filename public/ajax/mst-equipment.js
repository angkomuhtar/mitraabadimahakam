'use strict'

$(function () {
	$('.dropify').dropify()

	$('body').on('click', 'button#create-form', function () {
		initCreate()
	})
	$('body').on('click', 'button#bt-back, #bt-cancel-create', function (e) {
		e.preventDefault()
		$('#fm-equipment').trigger('reset')
		$('input[name=id]').val('')
		initCreate()
	})

	var Table = $('#table-data').DataTable({
		processing: true,
		serverSide: true,
		ordering: false,
		searching: false,
		ajax: {
			headers: { 'x-csrf-token': $('[name=_csrf]').val() },
			url: '/master/equipment',
			data: function (d) {
				return $.extend({}, d, {
					f_code: $('#f_code').val(),
					f_brand: $('#f_brand').val(),
					f_type: $('#f_type').val(),
					f_model: $('#f_model').val(),
				})
			},
		},
		language: {
			processing: `Please Wait`,
		},
		columns: [
			{
				data: 'id',
				render: (data, type, row) => {
					return `
					<div style="display:flex; align-items:center">
					    <button class="btn btn-outline btn-warning btn-xs bt-edit-data" data-id="${data}">edit</button>
					</div>
					`
				},
			},
			{
				data: 'kode',
			},
			{
				data: 'unit_sn',
			},
			{
				data: 'unit_model',
			},
			{
				data: 'brand',
			},
			{
				data: 'qty_capacity',
			},
			{
				data: 'fuel_capacity',
			},
			{
				data: 'engine_model',
			},
			{
				data: 'engine_sn',
			},
			{
				data: 'received_date',
				render: (data) => {
					return moment(data).format('DD-MM-YYYY')
				},
			},
			{
				data: 'received_hm',
			},
			{
				data: 'is_owned',
			},
			{
				data: 'is_warranty',
			},
			// {
			// 	data: 'img_uri',
			// 	render: (data, type, row) => {
			// 		if (data)
			// 			return `<a class="image-popup-vertical-fit" href="${row.img_uri}" title="${row.brand}">
			//                     <img src="${row.img_uri}" alt="${row.kode}" class="img-responsive">
			//                 </a>`
			// 		else
			// 			return `<a class="image-popup-vertical-fit" href="${'img-notfound.png'}" title="${row.brand}">
			//                         <img src="${'img-notfound.png'}" alt="${row.kode}" class="img-responsive">
			//                     </a>`
			// 	},
			// },
		],
	})

	$('#filter-section select').select2()

	$('#filter').on('click', function () {
		$('#filter-section').toggle('fast')
	})
	$('#f_code').bind('keyup', function () {
		Table.draw()
	})
	$('#f_model,#f_type,#f_brand').bind('change', function () {
		Table.draw()
	})
	$('#clear_filter').click(() => {
		$('#f_model,#f_type,#f_brand').val('0').change()
		$('#f_code').val('')
		Table.draw()
	})

	$(document).on('click', '.bt-edit-data', function () {
		$.ajax({
			async: true,
			url: `/master/equipment/${$(this).data('id')}/show`,
			method: 'GET',
			success: function (result) {
				let { data } = result
				initCreate()
				$('input[name=id]').val(data.id)
				$('select[name=site_id]').val(data.site_id)
				$('input[name=kode]').val(data.kode)
				$('select[name=tipe]').val(data.tipe)
				$('select[name=brand]').val(data.brand)
				$('input[name=received_date]').val(moment(data.received_date).format('YYYY-MM-DD'))
				$('input[name=received_hm]').val(data.received_hm)
				$('select[name=is_warranty]').val(data.is_warranty)
				$('input[name=warranty_date]').val(moment(data.warranty_date).format('YYYY-MM-DD'))
				$('select[name=is_owned]').val(data.is_owned)
				$('input[name=unit_sn]').val(data.unit_sn)
				$('input[name=unit_model]').val(data.unit_model)
				$('input[name=engine_sn]').val(data.engine_sn)
				$('input[name=engine_model]').val(data.engine_model)
				$('input[name=fuel_capacity]').val(data.fuel_capacity)
				$('input[name=qty_capacity]').val(data.qty_capacity)
				$('select[name=satuan]').val(data.satuan)
			},
			error: function (err) {
				console.log(err)
			},
		})
	})

	// $('select.select2').each(function(){
	//     var group = $(this).data('title')
	//     var selected = $(this).data('check')
	//     var id = $(this).attr('id')
	//     var elm = $(this)
	//     // console.log('SET DATA OPTION FROM INDEX PUBLIC')
	//     if(group != undefined){
	//         $.get('/ajax/sys-options?group='+group+'&selected='+selected, function(data){
	//             elm.children().remove()
	//             const list = data.map(nod => '<option value="'+nod.nilai+'" '+nod.selected+'>'+nod.teks+'</option>')
	//             elm.html(list)
	//         })
	//     }
	// })

	// $('select[name="dealer_id"]').on('change', function(){
	//     var id = $(this).val()
	//     if(id != ''){
	//         $.get('/ajax/dealer/'+id, function(data){
	//             $('input[name=cp_name]').val(data.cp_name)
	//             $('input[name=cp_email]').val(data.cp_email)
	//             $('input[name=cp_phone]').val(data.cp_phone)
	//             $('textarea[name=dealer_desc]').val(data.dealer_desc)
	//         })
	//     }else{
	//         $('.inpdealer').each(function(){$(this).val('')})
	//     }
	// })

	// function initDeafult(){
	//     $('div.content-module').css('display', 'none')
	//     $.ajax({
	//         async: true,
	//         url: '/master/equipment/list?limit=25&keyword=',
	//         method: 'GET',
	//         success: function(result){
	//             $('div#list-content').children().remove()
	//             $('div#list-content').html(result).show()
	//         },
	//         error: function(err){
	//             console.log(err);
	//         }
	//     })

	// }
	function initCreate() {
		$('div#form-create').toggle('fast')
		$('#list-content').toggle('fast')
		Table.draw()
	}

	// function initShow(){
	//     $('div.content-module').each(function(){ $(this).hide() })
	//     $('div#form-show').show()
	// }

	// $('button.bt-show-form').on('click', function(e){
	//     e.preventDefault()
	//     var id = $(this).data('id')
	//     $.get('/setting/sys-options/'+id+'/show', function(data){
	//         $("div#form-show").html(data)
	//         initShow()
	//     })
	// })

	// $('body').on('click', 'button.bt-cancel', function(e){
	//     e.preventDefault()
	//     initDeafult()
	// })

	// // Post Data
	$('form#fm-equipment').on('submit', function (e) {
		e.preventDefault()
		var data = new FormData(this)

		$.ajax({
			headers: { 'x-csrf-token': $('[name=_csrf]').val() },
			method: 'POST',
			data: data,
			dataType: 'json',
			processData: false,
			mimeType: 'multipart/form-data',
			contentType: false,
			success: function (data) {
				console.log(data)
				if (data.success) {
					swal('Okey,,,!', data.message, 'success')
					$('#fm-equipment').trigger('reset')
					$('input[name=id]').val('')
					initCreate()
				} else {
					swal('Opps,,,!', data.message, 'warning')
				}
			},
			error: function (err) {
				console.log(err)
				const { message } = err.responseJSON
				swal('Error 404!', message, 'error')
			},
		})
	})

	// $('body').on('click', 'a.btn-pagging', function(e){
	//     e.preventDefault()
	//     var page = $(this).data('page')
	//     var keyword = $('#inpKeyword').val()
	//     var limit = $('input#inpLimit').val()
	//     var url = window.location.pathname+'/list?page='+page+'&limit='+limit+'&keyword='+keyword
	//     $.ajax({
	//         async: true,
	//         url: url,
	//         method: 'GET',
	//         success: function(result){
	//             $('div#list-content').children().remove()
	//             $('div#list-content').html(result).show()
	//         },
	//         error: function(err){
	//             console.log(err);
	//         }
	//     })
	// })

	// function setDateString() {
	//     $('.myDateFormat').each(function(){
	//         var date = $(this).data(date)
	//         var elm = $(this).data('elm')
	//         var dateString = moment(date.date).format('DD-MM-YYYY')
	//         console.log(date.date);
	//         if(elm != undefined){
	//             $(this).find(elm).html(dateString)
	//         }else{
	//             $(this).html(dateString)
	//         }
	//     })
	// }
})
