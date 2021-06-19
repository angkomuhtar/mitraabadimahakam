$(function(){
    setNoBerkas()
    getListP2H()

    // $('#mainTable').editableTableWidget().numericInputExample().find('td:first').focus();
    // $('#editable-datatable').editableTableWidget().numericInputExample().find('td:first').focus();
    // $('#table').editableTableWidget({editor: $('<textarea>')});
    $('#editable-datatable').DataTable({
        "columns": [
            { "width": "8%" },
            null,
            null
          ]
    })

    function getListP2H(){
        $.ajax({
            async: true,
            url: '/operation/daily-timesheet/list-p2h',
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
})