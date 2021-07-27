$(function(){
    initDeafult()

    function initDeafult(){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/master/subcont/list',
            method: 'GET',
            success: function(result){
                $('content-module').css('display', 'none')
                $('div#list-content').html(result).show()
                
            },
            error: function(err){
                console.log(err);
            }
        })
        
    }
})