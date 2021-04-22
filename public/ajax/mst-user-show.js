$(function(){
    $('.dropify').dropify();
    $('body select.select2').each(function(){
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

    $('form#fm-update-user').on('submit', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var data = new FormData(this)
        console.log('/master/user/'+id+'/update',);
        $.ajax({
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/master/user/'+id+'/update',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(data){
                // console.log(data);
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

    $('button#bt-delete-user').on('click', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        console.log('/master/user/'+id+'/delete',);
        $.ajax({
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/master/user/'+id+'/delete',
            method: 'POST',
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(data){
                // console.log(data);
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
})