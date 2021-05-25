$(function(){
    // filterItemChecked()
    $('button.bt-select-data').on('click', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var kode = $(this).data('kode')
        var brand = $(this).data('brand')
        var tipe = $(this).data('tipe')
        var model = $(this).data('model')
        $('tbody#list-selected-unit').prepend(
            '<tr>'+
                '<td> <button class="btn btn-outline btn-danger btn-xs bt-remove-list" data-id="'+id+'">Delete</button> </td>'+
                '<td class="text-uppercase"> '+kode+'<input type="hidden" name="equip_id" value="'+id+'"> </td>'+
                '<td> <strong class="text-uppercase">'+brand+'</strong> </td>'+
                '<td class="text-uppercase"> '+tipe+' </td>'+
                '<td class="text-uppercase"> '+model+' </td>'+
            '</tr>'
        )
        $(this).parents('tr').hide()
        $('div#tbl-equipment-list').hide()
        $('div#tbl-equipment-select').show()
    })

    $('body').on('click', 'button.bt-remove-list', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $('tbody#list-source-unit').find('tr#tr-'+id).show()
        $(this).parents('tr').remove()
    })

    $('select[name="activity_id"]').on('change', function(){
        var id = $(this).val()
        $.ajax({
            async: true,
            url: '/ajax/activity/'+id,
            method: 'GET',
            success: function(data){
                $('textarea[name="keterangan"]').val(data.keterangan)
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    

    $('form#fm-dailyfleet-upd').on('submit', function(e){
        e.preventDefault()
        var data = new FormData(this)
        var id = $(this).data('id')
        console.log(id);
        $.ajax({
            async: true,
            url: '/operation/daily-fleet/'+id+'/update',
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
                    window.location.reload()
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

    // function filterItemChecked(){
    //     $('tr[name="tr-pilihan"]').each(function(){
    //         var id = $(this).data('id')
    //         $('body').find('tr#tr-'+id).toggleClass('hidden')
    //     })
    // }

})