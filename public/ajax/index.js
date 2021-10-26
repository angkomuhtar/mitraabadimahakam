$(function(){
    $('document.body').on('click', 'i.close-msg', function(){
        $('div#panel-message').toggleClass('in')
    })

    $('.maxText').each(function(){
        var max = $(this).data('max')
        var values = $(this).html()
        var len = values.substr(0, parseInt(max))
        $(this).html(len + '...')
    })

    $('input[type="date"].range_begin').each(function(){
        var dateString = moment().startOf('month').format("YYYY-MM-DD")
        $(this).val(dateString)
    })

    $('input[type="date"].range_end').each(function(){
        var dateString = moment().endOf('month').format("YYYY-MM-DD")
        $(this).val(dateString)
    })

    $('input[type="date"]').each(function(){
        var isNow = $(this).data('date')
        if(isNow){
            $(this).val(moment().format('YYYY-MM-DD'))
        }
    })

    $('input[type="date"].initDate').each(function(){
        $(this).val(moment().format('YYYY-MM-DD'))
    })

    $('input[type="date"].setDate').each(function(){
        var isNow = $(this).data('date')
        if(isNow){
            $(this).val(moment(isNow).format('YYYY-MM-DD'))
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
        console.log('DATA ::', data != 'undefined' || data != 'null');
        if(data != 'undefined' || data){
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
            $(this).val(now.toISOString().slice(0,16))
        }else{
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
            $(this).val(now.toISOString().slice(0,16))
        }
    })

    $('.myDateFormat').each(function(){
        var date = $(this).data(date)
        var elm = $(this).data('elm')
        var dateString = moment(date.date).format('DD-MM-YYYY')
        // console.log(date.date);
        if(elm != undefined){
            $(this).find(elm).html(dateString)
        }else{
            $(this).html(dateString)
        }
    })

    $('.myTimeFormat').each(function(){
        var date = $(this).data(date)
        if(date.date != null){
            var elm = $(this).data('elm')
            var dateString = moment(date.date).format('HH:mm')
            if(elm != undefined){
                $(this).find(elm).html(dateString)
            }else{
                $(this).html(dateString)
            }
        }else{
            if(elm != undefined){
                $(this).find(elm).html('unset')
            }else{
                $(this).html('unset')
            }
        }
    })

    $('.myDateTimeFormat').each(function(){
        var date = $(this).data(date)
        var elm = $(this).data('elm')
        var dateString = moment(date.date).format('DD-MM-YYYY HH:mm')
        console.log(date.date);
        if(elm != undefined){
            $(this).find(elm).html(dateString)
        }else{
            $(this).html(dateString)
        }
    })

    $('.myDateFormatLong').each(function(){
        moment.locale("id")
        var date = $(this).data(date)
        var elm = $(this).data('elm')
        var dateString = moment(date.date).format('dddd, Do MMMM YYYY')
        var weekly = moment(date.date).week()
        if(elm != undefined){
            $(this).find(elm).html(dateString)
        }else{
            $(this).html(dateString)
        }
    })

    $('.myDateTimeFormatLong').each(function(){
        var date = $(this).data(date)
        var elm = $(this).data('elm')
        var dateString = moment(date.date).format('MMMM Do YYYY, hh:mm:ss a')
        var weekly = moment(date.date).week()
        console.log(weekly);
        if(elm != undefined){
            $(this).find(elm).html(dateString)
        }else{
            $(this).html(dateString)
        }
    })

    $('.myMonthlyFormat').each(function(){
        var date = $(this).data(date)
        var elm = $(this).data('elm')
        var dateString = moment(date.date).format('MMMM YYYY')
        var weekly = moment(date.date).week()
        console.log(weekly);
        if(elm != undefined){
            $(this).find(elm).html(dateString)
        }else{
            $(this).html(dateString)
        }
    })

    $('body select.select2, select.custom-option').each(function(){
        var group = $(this).data('title')
        var selected = $(this).data('check')
        var id = $(this).attr('id')
        var elm = $(this)
        if(group != undefined){
            $.ajax({
                async: true,
                url: '/ajax/sys-options?group='+group+'&selected='+selected,
                method: 'GET',
                success: function(data){
                    if(data.length > 0){
                        elm.children().remove()
                        const list = data.map(nod => '<option value="'+nod.nilai+'" '+nod.selected+'>'+nod.teks+'</option>')
                        elm.html(list)
                    }else{
                        elm.prepend('<option value="">Belum ada data pilihan...</option>')
                    }
                },
                error: function(err){
                    console.log(err);
                }
            })
        }
    })

    $('body select.select2user').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.get('/ajax/usr?selected='+selected, function(data){
            console.log('is Selected::::', data.find(s => s.selected === 'selecetd'));
            if(data.length > 0){
                const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.nm_lengkap+'</option>')
                if(!selected){
                    elm.prepend('<option value="" selected>Pilih</option>')
                    elm.html(list)
                    // elm.find('option[value="'+selected+'"]').prop('selected')
                }else{
                    elm.html(list)
                    // elm.find('option[value="'+selected+'"]').prop('selected')
                }
            }else{
                elm.prepend('<option value="">Belum ada data pilihan...</option>')
            }
        })
    })

    $('body select.select2userChecker').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.get('/ajax/checker?selected='+selected, function(data){
            if(data.length > 0){
                const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.nm_lengkap+'</option>')
                elm.html(list)
                var selectDefault = data.filter(item => item.selected)
                if(selectDefault.length === 0){
                    elm.prepend('<option value="" selected>Pilih</option>')
                }
            }else{
                elm.prepend('<option value="">Belum ada data pilihan...</option>')
            }
        })
    })

    $('body select.select2userForeman').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.get('/ajax/spv?selected='+selected, function(data){
            if(data.length > 0){
                const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.nm_lengkap+'</option>')
                elm.html(list)
                var selectDefault = data.filter(item => item.selected)
                if(selectDefault.length === 0){
                    elm.prepend('<option value="" selected>Pilih</option>')
                }
            }else{
                elm.prepend('<option value="">Belum ada data pilihan...</option>')
            }
        })
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
                elm.html(list)
                var selectDefault = data.filter(item => item.selected)
                if(selectDefault.length === 0){
                    elm.prepend('<option value="" selected>Pilih</option>')
                }
            }else{
                elm.html('<option value="">Belum ada data pilihan...</option>')
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
                const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.name+'</option>')
                elm.html(list)
                var selectDefault = data.filter(item => item.selected)
                if(selectDefault.length === 0){
                    elm.prepend('<option value="" selected>Pilih</option>')
                }
            }else{
                elm.prepend('<option value="">Belum ada data pilihan...</option>')
            }
        })
    })

    $('body select.select2fleetByPit').each(function(){
        var pit_id = $('input#pit_id').val() || null
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.get('/ajax/fleet-by-pit?pit_id='+pit_id+'&selected='+selected, function(data){
            if(data.length > 0){
                const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.name+'</option>')
                elm.html(list)
                var selectDefault = data.filter(item => item.selected)
                if(selectDefault.length === 0){
                    elm.prepend('<option value="" selected>Pilih</option>')
                }
            }else{
                elm.prepend('<option value="">Belum ada data pilihan...</option>')
            }
        })
    })

    $('body select.select2fleetByTipe').each(function(){
        var selected = $(this).data('check')
        var tipe = $(this).data('tipe')
        var elm = $(this)
        elm.children().remove()
        $.get('/ajax/fleet-by-tipe?selected='+selected+'&tipe='+tipe, function(data){
            if(data.length > 0){
                const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.name+'</option>')
                elm.html(list)
                var selectDefault = data.filter(item => item.selected)
                if(selectDefault.length === 0){
                    elm.prepend('<option value="" selected>Pilih</option>')
                }
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

    $('body select.select2Excavator').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/equipment/excavator?selected='+selected,
            method: 'GET',
            success: function(data){
                if(data.length > 0){
                    const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.kode+' --|-- '+nod.unit_model+'</option>')
                    elm.html(list)
                    var selectDefault = data.filter(item => item.selected)
                    if(selectDefault.length === 0){
                        elm.prepend('<option value="" selected>Pilih</option>')
                    }
                }else{
                    elm.prepend('<option value="">Belum ada data pilihan...</option>')
                }
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body select.select2fuelTruck').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/equipment/fuel-truck?selected='+selected,
            method: 'GET',
            success: function(data){
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
                // console.log(data);
                if(data.length > 0){
                    const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.fullname+'</option>')
                    elm.append('<option value="" selected>Pilih</option>')
                    elm.html(list)
                }else{
                    elm.prepend('<option value="">Belum ada data pilihan...</option>')
                }
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body select.select2fuelman').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/fuelman?selected='+selected,
            method: 'GET',
            success: function(data){
                console.log('fuelman ::', data);
                if(data.length > 0){
                    const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.nm_lengkap+'</option>')
                    elm.append('<option value="" selected>Pilih</option>')
                    elm.html(list)
                }else{
                    elm.prepend('<option value="">Belum ada data pilihan...</option>')
                }
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body select.select2event').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/event?selected='+selected,
            method: 'GET',
            success: function(data){
                if(data.length > 0){
                    const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.engine+' | '+nod.narasi+'</option>')
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

    /* Option Material */
    $('body select.select2material').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/material?selected='+selected,
            method: 'GET',
            success: function(data){
                if(data.length > 0){
                    const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.tipe+' | '+nod.name+'</option>')
                    elm.html(list)
                    elm.prepend('<option value="" selected>Pilih</option>')
                }else{
                    elm.html('<option value="">Belum ada data pilihan...</option>')
                }
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    /* Option Fuel Agen */
    $('body select.select2fuel-agen').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/fuel-agen?selected='+selected,
            method: 'GET',
            success: function(data){
                console.log('Option Agen:::', data);
                if(data.length > 0){
                    const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.name+'</option>')
                    elm.html(list)
                }else{
                    elm.prepend('<option value="">Belum ada data pilihan...</option>')
                }
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    /* Option Fuel Type */
    $('body select.select2fuel-type').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/fuel-type?selected='+selected,
            method: 'GET',
            success: function(data){
                console.log('Option Fuel:::', data);
                if(data.length > 0){
                    const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.name+'</option>')
                    elm.html(list)
                    // elm.append('<option value="" selected>Pilih</option>')
                }else{
                    elm.prepend('<option value="">Belum ada data pilihan...</option>')
                }
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    /* Option Sub Contractor  */
    $('body select.select2subcon').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/subcon?selected='+selected,
            method: 'GET',
            success: function(data){
                if(data.length > 0){
                    const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.name+'</option>')
                    elm.html(list)
                    // elm.append('<option value="" selected>Pilih</option>')
                }else{
                    elm.prepend('<option value="">Belum ada data pilihan...</option>')
                }
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    /* Option Platform  */
    $('body select.select2fitur').each(function(){
        var selected = $(this).data('check')
        var platform = $(this).data('platform')
        var elm = $(this)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/doc/fitur?platform='+platform+'&selected='+selected,
            method: 'GET',
            success: function(data){
                console.log('FITUR ::', data);
                if(data.length > 0){
                    const list = data.map(nod => '<option value="'+nod.id+'" data-desc="'+nod.desc+'" '+nod.selected+'>'+nod.fitur+'</option>')
                    elm.html(list)
                }else{
                    elm.prepend('<option value="">Belum ada data pilihan...</option>')
                }
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body select.select2platform').each(function(){
        var selected = $(this).data('check')
        var elm = $(this)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/doc/platform?selected='+selected,
            method: 'GET',
            success: function(data){
                console.log('FITUR ::', data);
                if(data.length > 0){
                    const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.name+'</option>')
                    elm.html(list)
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

