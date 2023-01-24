$(function(){
    console.log('script/opt-gudang');

    $('select').select2()

    $('select[name="gudang_id"]').each(function(){
        var values = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/gudang?selected='+values,
            method: 'GET',
            success: function(result){
                console.log(result);
                if(result.length > 0){
                    elm.html(result.map( v => '<option value="'+v.id+'" '+v.selected+'>' +v.kode+ ' | '+v.nama+'</option>'))
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

    $('select[name="gudang_id"]').on('change', function(){
        var value = $(this).val()
        if(value){
            $.ajax({
                async: true,
                url: '/ajax/gudang/'+value,
                method: 'GET',
                success: function(result){
                    console.log(result);
                },
                error: function(err){
                    console.log(err);
                }
            })
        }
    })
})