$(function(){
    initDeafult()
    function initDeafult(){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/monthly-plan/list?keyword=',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#list-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    function findDaily(id){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/monthly-plan/list-daily?monthlyplans_id='+id,
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#list-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    $('body').on('click', 'button#bt-back', function(){
        window.location.reload()
    })

    $('body').on('click', 'button.bt-view-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        findDaily(id)
    })
})