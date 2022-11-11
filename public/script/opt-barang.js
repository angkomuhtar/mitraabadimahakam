$(function(){
    console.log('script/opt-barang');

    $('select').select2()

    $('tr.item-details').each(function(){
        var elm = $(this).find('select[name="barang_id"]')
        var values = $(this).find('select[name="barang_id"]').data('check')
        var elm = $(this)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/barang?selected='+values,
            method: 'GET',
            success: function(result){
                console.log(result);
                if(result.length > 0){
                    elm.html(result.map( v => '<option value="'+v.id+'" '+v.selected+'>' +v.kode+ ' | '+v.descriptions+'</option>'))
                    elm.trigger('change');
                }else{
                    elm.html('<option value="" selected>Blum ada data...</option>')
                }
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    // $('select[name="barang_id"]').each(function(){
    //     var values = $(this).data('check')
    //     var elm = $(this)
    //     elm.children().remove()
    //     $.ajax({
    //         async: true,
    //         url: '/ajax/barang?selected='+values,
    //         method: 'GET',
    //         success: function(result){
    //             console.log(result);
    //             if(result.length > 0){
    //                 elm.html(result.map( v => '<option value="'+v.id+'" '+v.selected+'>' +v.kode+ ' | '+v.descriptions+'</option>'))
    //                 elm.trigger('change');
    //             }else{
    //                 elm.html('<option value="" selected>Blum ada data...</option>')
    //             }
    //         },
    //         error: function(err){
    //             console.log(err);
    //         }
    //     })
    // })
})