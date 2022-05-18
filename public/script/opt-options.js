$(function(){
    console.log('script/opt-equipment');

    $('select').select2()

    $('select.custom-option').each(function(){
        var group = $(this).data('title')
        var selected = $(this).data('check') || $(this).val()
        var elm = $(this)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/sys-options?group='+group+'&selected='+selected,
            method: 'GET',
            success: function(result){
                if(result.length > 0){
                    setSelected(result, selected)
                    elm.html(result.map( v => '<option value="'+v.nilai+'" '+v.selected+'>'+v.teks+'</option>'))
                    initSelected(result, elm)
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

    function setSelected(list, value){
        let data = list.map(elm => elm.id === value ? {...elm, selected: 'selected'} : {...elm, selected: ''})
        return data
    }
    
    function initSelected(data, elm){
        var lenSelected = data.filter( a => a.selected === 'selected')
        if(!lenSelected.length > 0){
            elm.prepend('<option value="" selected>Pilih</option>')
        }
    }
})