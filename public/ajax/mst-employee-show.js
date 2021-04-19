'use strict'
$(function(){
    setDateString()
    $('select.select2').each(function(){
        var group = $(this).data('title')
        var selected = $(this).data('check')
        var id = $(this).attr('id')
        var elm = $(this)
        console.log('SET DATA OPTION FROM INDEX PUBLIC')
        if(group != undefined){
            $.get('/ajax/sys-options?group='+group+'&selected='+selected, function(data){
                elm.children().remove()
                const list = data.map(nod => '<option value="'+nod.nilai+'" '+nod.selected+'>'+nod.teks+'</option>')
                elm.html(list)
            })
        }
    })

    $("form#fm-update-employee").on('submit', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        const data = new FormData(this)
        console.log($(this).data('id'));
        $.ajax({
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            method: 'POST',
            url: "/master/employee/"+id+"/update",
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(res){
                console.log(res)
                if(res.success){
                    swal("Okey!", "Update data success", "success")
                    window.location.reload()
                }else{
                    swal("Oops!", "Update data failed", "error")
                }
            },
            error: function(err){
                console.log(err.responseJSON)
                swal("Oops", "Update data failed", "error")
            }
        })
    })
    

    $("button#bt-remove-data").on('click', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        swal({
            title: "Warning!",
            text: "Are'u sure remove this item ?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-warning",
            confirmButtonText: "Yes",
            closeOnConfirm: false
        },
        function(){
            $.ajax({
                headers: {'x-csrf-token': $('[name=_csrf]').val()},
                method: 'POST',
                url: "/master/employee/"+id+"/delete",
                dataType: 'json',
                processData: false,
                mimeType: "multipart/form-data",
                contentType: false,
                success: function(res){
                    console.log(res)
                    if(res.success){
                        swal("Okey", "Delete data success", "success")
                        window.location.reload()
                    }else{
                        swal("Oops", "Insert data failed", "error")
                    }
                },
                error: function(err){
                    console.log(err.responseJSON)
                    swal("Oops", "Insert data failed", "error")
                }
            })
        });
    })


    function setDateString() {
        $('.myDateFormat').each(function(){
            var date = $(this).data(date)
            var dateString = moment(date.date).format('YYYY-MM-DD')
            $(this).val(dateString)
        })
    }
})