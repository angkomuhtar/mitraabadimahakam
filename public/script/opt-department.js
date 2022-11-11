$(function(){
    console.log('script/opt-department');

    $('select').select2()

    $('select[name="department_id"]').each(function(){
        var values = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/opt-department?selected='+values,
            method: 'GET',
            success: function(result){
                // console.log(result);
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
})