$(function(){
    $('document.body').on('click', 'i.close-msg', function(){
        $('div#panel-message').toggleClass('in')
    })

    $('input[type="date"]').each(function(){
        console.log('input date ::');
        var isNow = $(this).data('date')
        if(isNow){
            $(this).val(moment().format('YYYY-MM-DD'))
        }
    })

    $('input[type="datetime-local"].init-datetime').each(function(){
        var now = new Date()
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
        $(this).val(now.toISOString().slice(0,16))
    })

    $('input[type="datetime-local"].set-datetime').each(function(){
        var data = $(this).data('datetime')
        var now = new Date(data)
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
        $(this).val(now.toISOString().slice(0,16))
        // console.log(now.toISOString());
        // console.log(now.toISOString().slice(0,16));
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

    $('body select.select2 select.custom-option').each(function(){
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
        // elm.append('<option value="">Pilih</option>')
        $.get('/ajax/dealer?selected='+selected, function(data){
            if(data.length > 0){
                const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.dealer_name+'</option>')
                elm.append(list)
                elm.prepend('<option value="">Pilih</option>')
            }else{
                elm.prepend('<option value="">Belum ada data pilihan...</option>')
            }
        })
    })
    
    $('body select.select2shift').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.get('/ajax/shift?selected='+selected, function(data){
            if(data.length > 0){
                const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.name+'</option>')
                elm.append(list)
                elm.prepend('<option value="">Pilih</option>')
            }else{
                elm.prepend('<option value="">Belum ada data pilihan...</option>')
            }
        })
    })
    
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

    $('body select.select2pit').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.get('/ajax/pit?selected='+selected, function(data){
            if(data.length > 0){
                elm.prepend('<option value="">Pilih</option>')
                const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.name+'</option>')
                elm.append(list)
            }else{
                elm.prepend('<option value="">Belum ada data pilihan...</option>')
            }
        })
    })
    
    $('body select.select2fleet').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.get('/ajax/fleet?selected='+selected, function(data){
            if(data.length > 0){
                elm.prepend('<option value="">Pilih</option>')
                const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.name+'</option>')
                elm.append(list)
            }else{
                elm.prepend('<option value="">Belum ada data pilihan...</option>')
            }
        })
    })

    $('body select.select2activities').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.get('/ajax/activity?selected='+selected, function(data){
            if(data.length > 0){
                elm.prepend('<option value="">Pilih</option>')
                const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.name+'</option>')
                elm.append(list)
            }else{
                elm.prepend('<option value="">Belum ada data pilihan...</option>')
            }
        })
    })

    $('body select.select2equipment').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/equipment?selected='+selected,
            method: 'GET',
            success: function(data){
                console.log(data);
                if(data.length > 0){
                    elm.prepend('<option value="">Pilih</option>')
                    const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.kode+' --|-- '+nod.unit_model+'</option>')
                    elm.append(list)
                }else{
                    elm.prepend('<option value="">Belum ada data pilihan...</option>')
                }
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body select.select2operator').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/employee/operator?selected='+selected,
            method: 'GET',
            success: function(data){
                console.log(data);
                if(data.length > 0){
                    const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.fullname+'</option>')
                    elm.append('<option value="" selected>Pilih</option>')
                    elm.append(list)
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