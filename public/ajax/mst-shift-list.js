$(function(){
    $('button.bt-edit-data').on('click', function(e){
        var id = $(this).data('id')
        $.ajax({
            async: true,
            url: '/master/shift/'+id+'/show',
            method: 'GET',
            success: function(result){
                initShow()
                $('div#form-show').html(result)
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body').on('click', 'a.btn-pagging', function(e){
        e.preventDefault()
        var page = $(this).data('page')
        $.get('/master/shift/list?page='+page+'&keyword=', function(data){
            console.log(data);
            $('div#list-content').children().remove()
            $('div#list-content').html(data)
        })
    })

    function initShow(){
        $('div.content-module').css('display', 'none')
        $('div#form-show').show()
    }
})