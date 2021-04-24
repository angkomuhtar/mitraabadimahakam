$(function(){
    initDeafult()

    $('body').on('click', 'button#bt-back', function(){
        initDeafult()
    })

    $('button#create-form').on('click', function(){
        initCreate()
    })

    function initDeafult(){
        $('div.content-module').each(function(){ $(this).hide() })
        $('div#list-content').show()
    }
    function initCreate(){
        $('div.content-module').each(function(){ $(this).hide() })
        $('div#form-create').show()
    }

    function initShow(){
        $('div.content-module').each(function(){ $(this).hide() })
        $('div#form-show').show()
    }
})