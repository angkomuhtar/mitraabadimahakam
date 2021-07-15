$(function(){
    initDeafult()
    function initDeafult(){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/daily-ritase-ob/list?keyword=',
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

    function findRitasePit(id, group, itemid){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/daily-ritase-ob/list/'+group+'/'+itemid,
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

    $('body').on('click', 'a.find-by', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var itemid = $(this).data('item')
        var group = $(this).data('search')
        findRitasePit(id, group, itemid)
    })

    $('body').on('click', 'button.bt-edit-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        alert('...'+id)
        $.ajax({
            async: true,
            url: '/operation/daily-ritase-ob/'+id+'/show',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#list-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })
})