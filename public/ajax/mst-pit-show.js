$(function(){
    $('body select.select2site').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.get('/ajax/site?selected='+selected, function(data){
            if(data.length > 0){
                const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.name+'</option>')
                elm.append(list)
                elm.prepend('<option value="">Pilih</option>')
            }else{
                elm.prepend('<option value="">Belum ada data pilihan...</option>')
            }
        })
    })

    $('form#fm-pit-upd').on('reset', function(e){
        e.preventDefault()
        initDeafult()
    })

    $('form#fm-pit-upd').on('submit', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var data = new FormData(this)
        $.ajax({
            async: true,
            url: '/master/pit/'+id+'/update',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result)
                const { message } = result
                if(result.success){
                    swal("Okey,,,!", message, "success")
                    initDeafult()
                }else{
                    swal("Opps,,,!", message, "warning")
                }
            },
            error: function(err){
                console.log(err)
                const { message } = err.responseJSON
                swal("Opps,,,!", message, "warning")
            }
        })
    })

    $('body').on('click', 'button#bt-delete-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/master/pit/'+id+'/delete',
            method: 'POST',
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result)
                const { message } = result
                if(result.success){
                    swal("Okey,,,!", message, "success")
                    initDeafult()
                }else{
                    swal("Opps,,,!", message, "warning")
                }
            },
            error: function(err){
                console.log(err)
                const { message } = err.responseJSON
                swal("Opps,,,!", message, "warning")
            }
        })
    })

    function initDeafult(){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/master/pit/list?keyword=',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#list-content').append(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    }
})