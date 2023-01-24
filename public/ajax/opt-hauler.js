$(function(){
    console.log('ajax/opt-hauler');

    $('select.select2Hauler').select2()

    $('tr select.select2Hauler').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/equipment/hauler?selected='+selected,
            method: 'GET',
            success: function(data){
                if(data.length > 0){
                    const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.kode+' --|-- '+nod.unit_model+'</option>')
                    elm.html(list)
                    var selectDefault = data.filter(item => item.selected)
                    if(selectDefault.length === 0){
                        elm.prepend('<option value="" selected>Pilih</option>')
                    }
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