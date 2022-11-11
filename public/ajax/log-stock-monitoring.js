$(function(){
    console.log('log-stock-monitoring.js');
    initDeafult()

    $('body').on('click', 'button#bt-back', function(){
        initDeafult()
    })

    $('body').on('click', 'button#create-form', function(){
        initCreate()
    })

    $('body').on('click', 'button#bt-cancel-update', function(e){
        e.preventDefault()
        initDeafult()
    })

    $('body').on('click', 'button.bt-history-in', function(e){
        var id = $(this).data('id')
        var gudang_id = $(this).data('gudang')
        $.ajax({
            async: true,
            url: 'monitoring-stok/history/'+id+'/in/'+gudang_id,
            method: 'GET',
            success: function(result){
                $('div#list-content').html('').hide()
                $('div#form-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body').on('click', 'button.bt-history-out', function(e){
        var id = $(this).data('id')
        var gudang_id = $(this).data('gudang')
        $.ajax({
            async: true,
            url: 'monitoring-stok/history/'+id+'/out/'+gudang_id,
            method: 'GET',
            success: function(result){
                $('div#list-content').html('').hide()
                $('div#form-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    

    $('body').on('click', 'a#btPreviousPage', function(e){
        e.preventDefault()
        var page = $(this).data('page')
        var keyword = $('body').find('input[name="keyword"]').val()
        page = page <= 1 ? 1 : page - 1
        console.log(page);
        $.get('monitoring-stok/list?page='+page+'&keyword='+keyword, function(data){
            $('div#list-content').children().remove()
            $('div#list-content').html(data)
        })
    })

    $('body').on('click', 'a#btNextPage', function(e){
        e.preventDefault()
        var page = $(this).data('page')
        var last = $(this).data('last')
        var keyword = $('body').find('input[name="keyword"]').val()
        page = page >= last ? last : page + 1
        console.log(page);
        $.get('monitoring-stok/list?page='+page+'&keyword='+keyword, function(data){
            $('div#list-content').children().remove()
            $('div#list-content').html(data)
        })
    })

    $('body').on('click', 'button#btGoToPage', function(e){
        e.preventDefault()
        var page = $('body').find('input[name="inp-page"]').val()
        var keyword = $('body').find('input[name="keyword"]').val()
        $.get('monitoring-stok/list?page='+page+'&keyword='+keyword, function(data){
            $('div#list-content').children().remove()
            $('div#list-content').html(data)
        })
    })

    function initDeafult(){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: 'monitoring-stok/list',
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

    function addItems(){
        var site_id = $('body').find('select[name="site_id"]').val()
        var len = $('body').find('tbody#list-items > tr').length
        $.ajax({
            async: true,
            url: 'monitoring-stok/create/items',
            method: 'GET',
            data: {
                length: len,
                site_id: site_id
            },
            success: function(result){
                $('body').find('tbody#list-items').append(result)
            },
            error: function(err){
                console.log(err);
            },
            complete: function(){
                $('body').find('tr.item-details > td:first-child').each(function(i){
                    $(this).html(i+1)
                })
                $('select').select2()
            }
        })
    }

    function formDataItems(){
        let items = []
        $('tr.item-details').each(function(){
            var elm = $(this)

            var props = []
            var vals = []
            elm.find('select.form-control, input.form-control').each(function(){
                props.push($(this).attr('name'))
                vals.push($(this).val())
            })

            const obj = props.reduce((acc, element, i) => {
                return {...acc, [element]: vals[i]};
            }, {});
            
            items.push(obj)
        })
        console.log(items);
        return items
    }
})