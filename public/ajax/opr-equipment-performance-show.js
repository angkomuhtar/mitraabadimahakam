$(function(){
    setNoBerkas()
    getListP2H($('form#fm-timesheeet-upd').data('id'))

    $('#editable-datatable').DataTable({
        "columns": [
            { "width": "8%" },
            null,
            null
          ]
    })

    function getListP2H(id){
        console.log('GET DATA P2H');
        $.ajax({
            async: true,
            url: '/operation/daily-timesheet/list-p2h?id='+id,
            method: 'GET',
            success: function(result){
                $('tbody#list-p2h').children().remove()
                $('tbody#list-p2h').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    function setNoBerkas(){
        var no = $('h1#noberkas').data('berkas')
        var str = '0'.repeat(5 - (no.toString()).length) + no
        $('h1#noberkas').html(str)
    }

    function setOptionEvent(no){
        var selected = $('select#event_id'+no).data('check')
        var elm = $('select#event_id'+no)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/event?selected='+selected,
            method: 'GET',
            success: function(data){
                console.log(data);
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
    }

    function setOptionUser(no){
        var selected = $('select#event_id'+no).data('check')
        var elm = $('select#user_id'+no)
        elm.children().remove()
        $.ajax({
            async: true,
            url: '/ajax/usr?selected='+selected,
            method: 'GET',
            success: function(data){
                console.log(data);
                if(data.length > 0){
                    const list = data.map(nod => '<option value="'+nod.id+'" '+nod.selected+'>'+nod.nm_lengkap+'</option>')
                    if(!selected){
                        elm.prepend('<option value="" selected>Pilih</option>')
                    }
                    elm.append(list)
                }else{
                    elm.prepend('<option value="">Belum ada data pilihan...</option>')
                }
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    function GET_INPUT_DATA_TIMESHEET(){
        var keys = []
        var values = []
        $('.inp-timesheet').each(function(){
            keys.push($(this).attr('name'))
            values.push($(this).val())
        })
        return _.object(keys, values)
    }

    function GET_INPUT_DATA_REFUEL(){
        var keys = []
        var values = []
        keys.push('timesheet_id')
        values.push($('form#fm-timesheeet-upd').data('id'))
        
        keys.push('equip_id')
        values.push($('select#unit_id').val())

        $('.inp-dailyrefuel').each(function(){
            keys.push($(this).attr('name'))
            values.push($(this).val())
        })
        return _.object(keys, values)
    }

    function GET_INPUT_DATA_P2H(){
        var arr = []
        $('tr.item-p2h').each(function(){
            var id = $(this).data('id')
            var names = []
            var values = []
            $('.inp-p2h').each(function(){
                if($(this).attr('name')){
                    var attribute = $(this).attr('name')
                    names.push(attribute)
                    values.push($('#'+attribute+'p2h'+id).val() != '' ? $('#'+attribute+'p2h'+id).val() : null)
                }
            })
            arr.push(_.object(names, values))
        })
        console.log(arr);
        return arr
    }

    function GET_INPUT_DATA_EVENT(){
        var arr = []
        $('tr.item-event').each(function(){
            var id = $(this).data('id')
            var names = []
            var values = []
            $('.inp-dailyevent').each(function(){
                if($(this).attr('name')){
                    var attribute = $(this).attr('name')
                    names.push(attribute)
                    values.push($('#'+attribute+id).val() != '' ? $('#'+attribute+id).val() : null)
                }
            })
            arr.push(_.object(names, values))
        })
        console.log(arr);
        return arr
    }

    function itemEventHTML(no){
        return '<tr class="item-event" id="TR'+no+'" data-id="'+no+'">'+
        '   <td class="text-center">'+
        '   <h1>'+no+'<h1>'+
        '   <input type="hidden" class="form-control inp-dailyevent" id="id'+no+'" name="id">'+
        '   </td>'+
        '   <td>'+
        '       <label for="tgl">Waktu Mulai</label>'+
        '       <div class="form-group m-b-5">'+
        '           <input type="datetime-local" class="form-control init-datetime inp-dailyevent" data-id="'+no+'" id="start_at'+no+'" name="start_at" data-id="'+no+'">'+
        '       </div>'+
        '       <label for="tgl">Waktu Akhir</label>'+
        '       <div class="form-group m-b-5">'+
        '           <input type="datetime-local" class="form-control init-datetime inp-dailyevent" data-id="'+no+'" id="end_at'+no+'" name="end_at" data-id="'+no+'">'+
        '       </div>'+
        '   </td>'+
        '   <td>'+
        '       <label for="tgl">Used</label>'+
        '       <div class="form-group m-b-5">'+
        '           <input type="text" class="form-control text-right inp-dailyevent" data-id="'+no+'" name="smu_event" id="smu_event'+no+'" data-id="'+no+'" disabled>'+
        '       </div>'+
        '       <label for="tgl">CreatedBy</label>'+
        '       <div class="form-group m-b-5">'+
        '           <select class="form-control select2user inp-dailyevent" data-id="'+no+'" data-check="" name="user_id" id="user_id'+no+'" data-id="'+no+'" required></select>'+
        '       </div>'+
        '   </td>'+
        '   <td>'+
        '       <label for="tgl">Pilih Event</label>'+
        '       <div class="form-group m-b-5">'+
        '           <select class="form-control select2event inp-dailyevent" data-check="" name="event_id" id="event_id'+no+'" data-id="'+no+'" required></select>'+
        '       </div>'+
        '       <label for="tgl">Penjelasan</label>'+
        '       <div class="form-group m-b-5">'+
        '           <input type="text" class="form-control inp-dailyevent" data-id="'+no+'" id="description'+no+'" name="description" placeholder="xDeskipsi Tambahan...">'+
        '       </div>'+
        '   </td>'+
        '   <td style="vertical-align: middle;">'+
        '       <button class="btn btn-danger btn-sm bt-remove-event" data-id="'+no+'">'+
        '           <i class="ti-close"></i>'+
        '       </button>'+
        '   </td>'+
        '</tr>'
    }

    $('button#bt-add-event').on('click', function(e){
        e.preventDefault()
        const last = $('body').find('tbody.item-event tr.item-event').last().data('id') || 0
        $('body').find('tbody.item-event').append(itemEventHTML(last + 1))
        setOptionEvent(last + 1)
        setOptionUser(last + 1)
    })

    $('body').on('change', 'input[name="start_at"]', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var begin_with = $(this).val()
        var end_with = $('input#end_at'+id).val()
        var x = new moment(begin_with)
        var y = new moment(end_with)
        var duration = moment.duration(y.diff(x)).as('minutes')
        var parseSmu = parseFloat(duration) / 60
        $('input#smu_event'+id).val(parseSmu.toFixed(2))
    })

    $('body').on('change', 'input[name="end_at"]', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var begin_with = $('input#start_at'+id).val()
        var end_with = $(this).val()
        var x = new moment(begin_with)
        var y = new moment(end_with)
        var duration = moment.duration(y.diff(x)).as('minutes')
        var parseSmu = parseFloat(duration) / 60
        $('input#smu_event'+id).val(parseSmu.toFixed(2))
    })

    $('body').on('change', 'select[name="event_id"]', function(){
        var id = $(this).data('id')
        var values = $(this).val()
        var isRequired = values != ''
        $('input#start_at'+id).prop('required', isRequired)
    })

    $('body').on('click', 'button.bt-remove-event', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $('body').find('tbody.item-event tr#TR'+id).remove()
    })

    $('body').on('change', 'select.check-status-p2h', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var isValues = $(this).val()
        if(isValues != 'Y'){
            $('textarea#descriptionp2h'+id).prop('required', true)
        }else{
            $('textarea#descriptionp2h'+id).prop('required', false)
        }
    })

    $('form#fm-timesheeet-upd').submit(function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var DATA_TIMESHEET = GET_INPUT_DATA_TIMESHEET()
        var DATA_P2H = GET_INPUT_DATA_P2H()
        var DATA_EVENT = GET_INPUT_DATA_EVENT()
        var DATA_REFUELING = GET_INPUT_DATA_REFUEL()
        var SUM_DATA = {
            ...DATA_TIMESHEET, 
            p2h: DATA_P2H,
            event: DATA_EVENT,
            // refueling: DATA_REFUELING
        }
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/operation/daily-timesheet/'+id+'/update',
            method: 'POST',
            data: JSON.stringify(SUM_DATA),
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result)
                if(result.success){
                    swal("Okey,,,!", result.message, "success")
                    window.location.reload()
                }else{
                    alert(result.message)
                }
            },
            error: function(err){
                console.log(err)
                const { message } = err.responseJSON
                swal("Opps,,,!", message, "warning")
            }
        })
    })
})