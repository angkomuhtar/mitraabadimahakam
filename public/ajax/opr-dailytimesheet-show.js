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

    function GET_INPUT_DATA_TIMESHEET(){
        var keys = []
        var values = []
        $('.inp-timesheet').each(function(){
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

    function itemEventHTML(no){
        return '<tr class="item-event" id="TR'+no+'" data-id="'+no+'">'+
        '   <td class="text-center"><h3>'+no+'<h3></td>'+
        '   <td>'+
        '       <input type="datetime-local" class="form-control init-datetime" data-id="'+no+'" id="start_at'+no+'" name="start_at">'+
        '   </td>'+
        '   <td>'+
        '       <input type="datetime-local" class="form-control init-datetime" data-id="'+no+'" id="end_at'+no+'" name="end_at">'+
        '   </td>'+
        '   <td>'+
        '       <input type="number" class="form-control text-right" data-id="'+no+'" name="smu_event" id="smu_event1">'+
        '   </td>'+
        '   <td>'+
        '       <select class="form-control select2event" data-check="" name="event_id" id="event_id'+no+'"></select>'+
        '       <input type="text" class="form-control m-t-10" data-id="'+no+'" id="description'+no+'" name="description" placeholder="Deskipsi Tambahan...">'+
        '   </td>'+
        '   <td>'+
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
        var SUM_DATA = {...DATA_TIMESHEET, p2h: DATA_P2H}
        // console.log(JSON.stringify(SUM_DATA))
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
                // const { message } = result
                // if(result.success){
                //     alert(result.message)
                //     window.location.reload()
                // }else{
                //     alert(result.message)
                // }
            },
            error: function(err){
                console.log(err)
                // const { message } = err.responseJSON
                // alert(result.message)
            }
        })
    })
})