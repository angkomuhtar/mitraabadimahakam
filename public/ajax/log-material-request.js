$(function(){
    console.log('log-material-request.js');
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

    $('body').on('click', 'button#add-items', function(){
        var site_id = $('body').find('select[name="site_id"]').val()
        if(site_id){
            $('body').find('code#keterangan-row').remove()
            var inpLen = $('body').find('input[name="add-items"]').val()
            if(parseInt(inpLen) <= 20){
                for (let i = 0; i < parseInt(inpLen); i++) {
                    addItems()
                }
            }else{
                alert('Maximal tambah item hanya 20 rows per klik')
            }
        }else{
            alert('Tentukan project/site terlebih dulu...')
        }
    })

    $('body').on('click', 'button.remove-items', function(){
        $(this).parents('tr').remove()
        $('body').find('tr.item-details > td:first-child').each(function(i){
            $(this).html(i+1)
        })
    })

    $('body').on('click', 'button.bt-edit-data', function(e){
        var id = $(this).data('id')
        $.ajax({
            async: true,
            url: 'material-request/'+id+'/show',
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

    $('body').on('click', 'button.bt-view-data', function(e){
        var id = $(this).data('id')
        $.ajax({
            async: true,
            url: 'material-request/'+id+'/view',
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

    $('body').on('click', 'button.bt-print-data', function(e){
        var id = $(this).data('id')
        console.log('...');
        $.ajax({
            async: true,
            url: 'material-request/'+id+'/print',
            method: 'GET',
            dataType: 'json',
            success: function(result){
                console.log(result);
                pdfMake.createPdf(result).print();
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body').on('submit', 'form#form-create', function(e){
        e.preventDefault()
        var data = new FormData(this)
        var items = formDataItems()
        data.append('items', JSON.stringify(items))
        $.ajax({
            async: true,
            url: 'material-request',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result)
                const { message } = result
                if(result.success){
                    swal("Okey,,,!", message, "success")
                    initDeafult()
                }else{
                    swal("Opps,,,!", message, "warning")
                }
            },
            error: function(err){
                console.log(err)
                const { message } = err.responseJSON
                swal("Opps,,,!", message, "warning")
            }
        })
    })

    $('body').on('submit', 'form#form-update', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var data = new FormData(this)
        var items = formDataItems()
        data.append('items', JSON.stringify(items))
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: 'material-request/'+id+'/update',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result)
                const { message } = result
                if(result.success){
                    swal("Okey,,,!", message, "success")
                    initDeafult()
                }else{
                    swal("Opps,,,!", message, "warning")
                }
            },
            error: function(err){
                console.log(err)
                const { message } = err.responseJSON
                swal("Opps,,,!", message, "warning")
            }
        })
    })

    $('body').on('click', 'button#approved-head', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: 'material-request/'+id+'/check',
            method: 'POST',
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result)
                const { message } = result
                if(result.success){
                    swal("Okey,,,!", message, "success")
                    initDeafult()
                }else{
                    swal("Opps,,,!", message, "warning")
                }
            },
            error: function(err){
                console.log(err)
                const { message } = err.responseJSON
                swal("Opps,,,!", message, "warning")
            }
        })
    })

    $('body').on('click', 'button#bt-delete-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: 'material-request/'+id+'/delete',
            method: 'POST',
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result)
                const { message } = result
                if(result.success){
                    swal("Okey,,,!", message, "success")
                    initDeafult()
                }else{
                    swal("Opps,,,!", message, "warning")
                }
            },
            error: function(err){
                console.log(err)
                const { message } = err.responseJSON
                swal("Opps,,,!", message, "warning")
            }
        })
    })

    $('body').on('click', 'a#btPreviousPage', function(e){
        e.preventDefault()
        var page = $(this).data('page')
        var keyword = $('body').find('input[name="keyword"]').val()
        page = page <= 1 ? 1 : page - 1
        console.log(page);
        $.get('material-request/list?page='+page+'&keyword='+keyword, function(data){
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
        $.get('material-request/list?page='+page+'&keyword='+keyword, function(data){
            $('div#list-content').children().remove()
            $('div#list-content').html(data)
        })
    })

    $('body').on('click', 'button#btGoToPage', function(e){
        e.preventDefault()
        var page = $('body').find('input[name="inp-page"]').val()
        var keyword = $('body').find('input[name="keyword"]').val()
        $.get('material-request/list?page='+page+'&keyword='+keyword, function(data){
            $('div#list-content').children().remove()
            $('div#list-content').html(data)
        })
    })

    function initDeafult(){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: 'material-request/list',
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

    function initCreate(){
        $('div.content-module').css('display', 'none')
        $('div#form-content').show()
        $.ajax({
            async: true,
            url: 'material-request/create',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#form-content').html(result).show()
                $('select').select2()
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
            url: 'material-request/create/items',
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

    // function initShow(){
    //     $('div.content-module').css('display', 'none')
    //     $('div#form-content').show()
    // }

    // function ajaxSearch(value){
    //     $.ajax({
    //         async: true,
    //         url: 'material-request/list?keyword='+value,
    //         method: 'GET',
    //         success: function(result){
    //             $('div#list-content').children().remove()
    //             $('div#list-content').html(result).show()
    //         },
    //         error: function(err){
    //             console.log(err);
    //         }
    //     })
    // }
})