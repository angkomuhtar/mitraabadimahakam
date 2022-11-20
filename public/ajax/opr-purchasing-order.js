

$(function(){
    initDefault()

    $('body').on('click', 'button#bt-back', function(){
        initDefault()
    })

    $('body').on('click', 'button#create-form', function(){
        initCreate()
    })

    $('body').on('click', 'button.btn-add-rows', function(e){
        e.preventDefault()
        var len = $('body').find('input[name="add-rows"]').val()
        for (let index = 0; index < len; index++) {
            addRowItems()
        }
    })

    $('body').on('click', 'button.btn-edit-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $.ajax({
            async: true,
            url: '/operation/purchasing-order/'+id+'/view',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#form-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body').on('click', 'button.btn-deliver-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $.ajax({
            async: true,
            url: '/operation/purchasing-order/'+id+'/delivering',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#form-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body').on('click', 'button.btn-receive-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $.ajax({
            async: true,
            url: '/operation/purchasing-order/'+id+'/receive',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#form-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body').on('click', 'button.btn-delete-items', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        console.log(id);
        swal({
            title: "Are you sure?",
            text: "Your will not be able to recover this imaginary file!",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
          }, function(){
              $.ajax({
                    async: true,
                    url: 'purchasing-order/item/'+id+'/destroy-items',
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
                            initDefault()
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
          });
    })

    $('body').on('submit', 'form#form-update', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        const json = formJSON()
        const data = new FormData()
        data.append('data', JSON.stringify(json))
        $.ajax({
            async: true,
            url: 'purchasing-order/'+id+'/update',
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
                    initDefault()
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

    $('body').on('submit', 'form#form-receive', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        const json = formJSON()
        const data = new FormData()
        data.append('data', JSON.stringify(json))
        console.log(json);
        $.ajax({
            async: true,
            url: 'purchasing-order/'+id+'/received',
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
                    initDefault()
                }else{
                    swal("Opps,,,!", message, "warning")
                }
            },
            error: function(err){
                console.log(err)
                // const { message } = err.responseJSON
                // swal("Opps,,,!", message, "warning")
            }
        })
    })

    $('body').on('submit', 'form#form-deliver', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        const json = formJSON()
        const data = new FormData()
        data.append('data', JSON.stringify(json))
        console.log(json);
        $.ajax({
            async: true,
            url: 'purchasing-order/'+id+'/delivered',
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
                    initDefault()
                }else{
                    swal("Opps,,,!", message, "warning")
                }
            },
            error: function(err){
                console.log(err)
                // const { message } = err.responseJSON
                // swal("Opps,,,!", message, "warning")
            }
        })
    })

    $('body').on('submit', 'form#fm-purchasing-order', function(e){
        e.preventDefault()
        const data = formJSON()
        const dataForm = new FormData()
        console.log(formJSON());
        dataForm.append('data', JSON.stringify(data))
        $.ajax({
            async: true,
            url: '/operation/purchasing-order',
            method: 'POST',
            data: dataForm,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result)
                const { message } = result
                if(result.success){
                    swal("Okey,,,!", message, "success")
                    initDefault()
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

    $('body').on('click', 'a.btn-pagging', function(e){
        e.preventDefault()
        var page = $(this).data('page')
        var keyword = $('input#inpKeyworddoc').val()
        var url = window.location.pathname+'/list?page='+page+'&keyword='+keyword
        $.ajax({
            async: true,
            url: url,
            method: 'GET',
            success: function(result){
                $('div#form-content-details').children().remove()
                $('div#list-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    function initDefault(){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/purchasing-order/list?limit=',
            method: 'GET',
            success: function(result){
                $('content-module').css('display', 'none')
                $('div#list-content').html(result).show()
                $('div#form-content').html('')
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    function initCreate(){
        $.ajax({
            async: true,
            url: '/operation/purchasing-order/create',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#form-content').html(result).show()
                addRowItems()
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    function initShow(id){
        $.ajax({
            async: true,
            url: '/operation/purchasing-order/'+id+'/show',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#form-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    function addRowItems(){
        $.ajax({
            async: true,
            url: '/operation/purchasing-order/items-create',
            method: 'GET',
            success: function(result){
                var elm = $('body').find('tbody#item-details')
                elm.append(result)
                elm.find('.tr-items').each(function(i){
                    var urut = i + 1
                    $(this).attr('data-id', urut)
                    $(this).find('strong#teks-urut').html(urut)
                    $(this).find('div.modal').attr('id', 'modals'+urut)
                    $(this).find('table.dataTable').attr('id', 'myTable'+urut)
                    $(this).find('button.modal-trigger').attr('data-target', '#'+'modals'+urut)
                    $(this).find('table.dataTable').DataTable();
                })
            },
            error: function(err){
                console.log(err);
            }
        })
    }
    
    function deleteRowItems(elm){
        elm.remove()
    }

    function formJSON(){
        let keys = []
        let values = []
        $('select.req-items, input.req-items, textarea.req-items').each(function(){
            var property = $(this).attr('name')
            var val = $(this).val()
            keys.push(property)
            values.push(val)
        })

        function itemData(){
            let items = []
            $('tr.tr-items').each(function(){
                var elm = $(this)
                var props = []
                var vals = []
                elm.find('select.req-item-details, input.req-item-details').each(function(){
                    props.push($(this).attr('name'))
                    vals.push($(this).val())
                })

                items.push(_.object(props, vals))
            })
            return items
        }

        var data = _.object(keys, values)

        return {
            ...data,
            items: itemData()
        }
    }
})