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

    function itemEventHTML(no){
        return '<tr class="item-event" id="TR'+no+'" data-id="'+no+'">'+
        '   <td class="text-center"><h3>'+no+'<h3></td>'+
        '   <td>'+
        '       <input type="datetime-local" class="form-control init-datetime">'+
        '   </td>'+
        '   <td>'+
        '       <input type="datetime-local" class="form-control init-datetime">'+
        '   </td>'+
        '   <td>'+
        '       <input type="number" class="form-control text-right">'+
        '   </td>'+
        '   <td>'+
        '       <input type="text" class="form-control" placeholder="Keterangan">'+
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
        
    })

    // $('input[name="approved_at"]').on('change', function(e){
    //     e.preventDefault()
    //     var begin_with = $(this).val()
    //     var end_with = $('input[name="finish_at"]').val()
    //     var x = new moment(begin_with)
    //     var y = new moment(end_with)
    //     var duration = moment.duration(y.diff(x)).as('minutes')
    //     console.log(duration);
    // })

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
        alert('...')
    })
})