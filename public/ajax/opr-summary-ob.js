'use strict'
$(function(){
    initDeafult()

    function LoadingData(){
        var loadingHTML = 
        '<div class="row">'+
        '    <div class="col-md-12">'+
        '        <div class="white-box text-center">'+
        '            <p class="">'+
        '                <h5>'+
        '                    Please wait a moment...'+
        '                </h5>'+
        '            </p>'+
        '            <i class="m-t-10 m-b-20 fa fa-spin fa-spinner fa-3x"></i>'+
        '            <p>'+
        '                <small class="text-warning">'+
        '                    Fetching data from server and preparing view, <br>'+
        '                    The datas will be displayed by page with limit 15 datas each pages'+
        '                </small>'+
        '            </p>'+
        '        </div>'+
        '    </div>'+
        '</div>';
        $('div#list-content').html(loadingHTML)
    }

    $('#create-form').on('click', function(){
        initCreate()
    })
    $('body').on('click', 'button#bt-back', function(){
        initDeafult()
    })

    function initDeafult(){
        $('div.content-module').each(function(){ $(this).hide() })
        $('div#list-content').show()
        $.ajax({
            async: true,
            url: '/operation/daily-activity/list',
            method: 'GET',
            beforeSend: function(){
                LoadingData()
            },
            success: function(result){
                $('div#list-content').html(result)
            },
            error: function(err){
                console.log(err);
                swal("Opps,,,!", err.responseJSON.message, "warning")
            }
        })
    }

    function initShow(){
        $('div.content-module').each(function(){ $(this).hide() })
        $('div#form-show').show()
    }
    
    // Filter Data By Date
    $('body').on('click', 'button#bt-filter-date', function(e){
        e.preventDefault()
        var start = $('input[name="range_begin"]').val()
        var end = $('input[name="range_end"]').val()
        $.ajax({
            async: true,
            url: '/operation/daily-activity/list?filter=date&range_begin='+start+'&range_end='+end,
            method: 'GET',
            beforeSend: function(){
                LoadingData()
            },
            success: function(result){
                $('div#list-content').html(result)
            },
            error: function(err){
                console.log(err);
                swal("Opps,,,!", err.responseJSON.message, "warning")
            }
        })
    })

    // Filter Data By Shift
    $('body').on('click', 'button#bt-filter-shift', function(e){
        e.preventDefault()
        var shift = $('select[name="shift-filter"]').val()
        var start = $('input[name="shift_begin"]').val()
        var end = $('input[name="shift_end"]').val()
        $.ajax({
            async: true,
            url: '/operation/daily-activity/list?filter=shift&shift='+shift+'&range_begin='+start+'&range_end='+end,
            method: 'GET',
            beforeSend: function(){
                LoadingData()
            },
            success: function(result){
                $('div#list-content').html(result)
            },
            error: function(err){
                console.log(err);
                swal("Opps,,,!", err.responseJSON.message, "warning")
            }
        })
    })

    $('body').on('click', 'a#filter-reset', function(e){
        e.preventDefault()
        initDeafult()
    })

    // Filter Data By Equipment Unit
    $('body').on('click', 'button#bt-filter-unit', function(e){
        e.preventDefault()
        var unit = $('select[name="unit-filter"]').val()
        var start = $('input[name="unit_begin"]').val()
        var end = $('input[name="unit_end"]').val()
        $.ajax({
            async: true,
            url: '/operation/daily-activity/list?filter=unit&unit='+unit+'&range_begin='+start+'&range_end='+end,
            method: 'GET',
            beforeSend: function(){
                LoadingData()
            },
            success: function(result){
                $('div#list-content').html(result)
            },
            error: function(err){
                console.log(err);
                swal("Opps,,,!", err.responseJSON.message, "warning")
            }
        })
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
            beforeSend: function(){
                LoadingData()
            },
            success: function(result){
                $('body').find('div#list-content').html(result).show()
                $('body').find('div#row-paginate').css('margin-bottom', '20px')
                listNoBerkas()
            },
            error: function(err){
                console.log(err);
            }
        })
    })
    
    $('button.bt-show-form').on('click', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $.get('/setting/sys-options/'+id+'/show', function(data){
            $("div#form-show").html(data)
            initShow()
        })
    })

    $('body').on('click', 'button.bt-cancel', function(e){
        e.preventDefault()
        initDeafult()
    })

    
})