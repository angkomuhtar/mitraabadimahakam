$(function(){
    console.log('ajax/opt-operator');

    $('select.select2operator').select2()

    $('body select.select2operator').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/employee/operator?selected='+selected,
            method: 'GET',
            success: function(data){
                // console.log(data);
                if(data.length > 0){
                    const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.fullname+'</option>')
                    elm.append('<option value="" selected>Pilih</option>')
                    elm.html(list)
                    elm.val(selected).trigger('change');
                }else{
                    elm.prepend('<option value="">Belum ada data pilihan...</option>')
                }
            },
            error: function(err){
                console.log(err);
            }
        })
    })
})