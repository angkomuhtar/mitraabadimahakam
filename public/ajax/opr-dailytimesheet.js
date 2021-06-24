$(function(){
    initDeafult()

    $('body').on('click', 'button#bt-back', function(){
        initDeafult()
    })

    $('body').on('click', 'button#bt-cancel-create', function(e){
        e.preventDefault()
        window.location.reload()
    })

    $('body').on('click', 'button#create-form', function(){
        initCreate()
    })

    $('body').on('click', 'button#bt-cancel-update', function(e){
        e.preventDefault()
        initDeafult()
    })

    $('body').on('click', 'button.bt-edit-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        initShow(id)
    })

    $('body').on('keyup', 'input#keywordTimeSheet', function(e){
        if(e.key === 'Enter'){
            searchKeyword()
        }
    })

    $('body').on('click', 'button#bt-search-keyword', function(e){
        searchKeyword()
    })

    $('body').on('click', 'a.btn-pagging', function(e){
        e.preventDefault()
        var page = $(this).data('page')
        var keyword = $('#keywordTimeSheet').val()
        var url = window.location.pathname+'/list?page='+page+'&keyword='+keyword
        $.ajax({
            async: true,
            url: url,
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#list-content').html(result).show()
                listNoBerkas()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    function listNoBerkas(){
        $('small.nomor-berkas').each(function(){
            var no = $(this).data('id')
            var str = '0'.repeat(5 - (no.toString()).length) + no
            $(this).html('No : '+str)
        })
    }

    function searchKeyword(){
        var keyword = $('input#keywordTimeSheet').val()
        var url = window.location.pathname+'/list?keyword='+keyword
        $.ajax({
            async: true,
            url: url,
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#list-content').html(result).show()
                listNoBerkas()
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    function initDeafult(){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/daily-timesheet/list',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#list-content').html(result).show()
                listNoBerkas()
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    function initShow(id){
        console.log(id);
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/daily-timesheet/'+id+'/show',
            method: 'GET',
            success: function(result){
                $('div#form-show').children().remove()
                $('div#form-show').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    }
})