'use strict'
$(function(){
    $('input[type="date"]').each(function(){
        var isNow = $(this).data('date')
        var existingData = $(this).data('value')
        if(isNow){
            $(this).val(moment().format('YYYY-MM-DD'))
        }else{
            $(this).val(moment(existingData).format('YYYY-MM-DD'))
        }
    })

    $('select.select2').each(function(){
        var group = $(this).data('title')
        var selected = $(this).data('check')
        var id = $(this).attr('id')
        var elm = $(this)
        // console.log('SET DATA OPTION FROM INDEX PUBLIC')
        if(group != undefined){
            $.get('/ajax/sys-options?group='+group+'&selected='+selected, function(data){
                elm.children().remove()
                const list = data.map(nod => '<option value="'+nod.nilai+'" '+nod.selected+'>'+nod.teks+'</option>')
                elm.html(list)
            })
        }
    })

    $('select.select2dealer').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        elm.append('<option value="">Pilih</option>')
        $.get('/ajax/dealer?selected='+selected, function(data){
            const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.dealer_name+'</option>')
            elm.append(list)
        })
    })

    $('select[name="dealer_id"]').on('change', function(){
        var id = $(this).val()
        if(id != ''){
            $.get('/ajax/dealer/'+id, function(data){
                $('input[name=cp_name]').val(data.cp_name)
                $('input[name=cp_email]').val(data.cp_email)
                $('input[name=cp_phone]').val(data.cp_phone)
                $('textarea[name=dealer_desc]').val(data.dealer_desc)
            })
        }else{
            $('.inpdealer').each(function(){$(this).val('')})
        }
    })

    $('form#fm-equipment-upd').on('submit', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var data = new FormData(this)
        $.ajax({
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            method: 'POST',
            data: data,
            dataType: 'json',
            url: '/master/equipment/'+id+'/update',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(data){
                console.log(data);
                if(data.success){
                    swal("Okey,,,!", data.message, "success")
                    initDeafult()
                }else{
                    swal("Opps,,,!", data.message, "warning")
                }
            },
            error: function(err){
                console.log(err);
                const { message } = err.responseJSON
                swal("Error 404!", message, "error")
            }
        })
    })

    $('button#bt-delete-data').on('click', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $.ajax({
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            method: 'POST',
            data: {id: id},
            dataType: 'json',
            url: '/master/equipment/'+id+'/delete',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(data){
                console.log(data);
                if(data.success){
                    swal("Okey,,,!", data.message, "success")
                    window.location.reload()
                }else{
                    swal("Opps,,,!", data.message, "warning")
                }
            },
            error: function(err){
                console.log(err);
                const { message } = err.responseJSON
                swal("Error 404!", message, "error")
            }
        })
    })

    function initDeafult(){
        $('div.content-module').each(function(){ $(this).hide() })
        $('div#list-content').show()
    }
    
})