$(function(){
    $('document.body').on('click', 'i.close-msg', function(){
        $('div#panel-message').toggleClass('in')
    })

    $('input[type="date"]').each(function(){
        var isNow = $(this).data('date')
        if(isNow){
            $(this).val(moment().format('YYYY-MM-DD'))
        }
    })

    $('.myDateFormat').each(function(){
        var date = $(this).data(date)
        var elm = $(this).data('elm')
        var dateString = moment(date.date).format('DD-MM-YYYY')
        console.log(date.date);
        if(elm != undefined){
            $(this).find(elm).html(dateString)
        }else{
            $(this).html(dateString)
        }
    })

    $('select.select2').each(function(){
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

    $('body select.select2dealer').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        elm.append('<option value="">Pilih</option>')
        $.get('/ajax/dealer?selected='+selected, function(data){
            const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.dealer_name+'</option>')
            elm.append(list)
        })
    })
})