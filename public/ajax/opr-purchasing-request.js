

$(function(){
    initDefault()

    $('body').on('click', 'button#bt-back', function(){
        initDefault()
    })

    $('body').on('click', 'button#create-form', function(){
        initCreate()
    })

    $('body').on('click', 'button#create-form-details', function(){
        initCreateDetails()
    })

    $('body').on('click', 'button#bt-cancel-update', function(e){
        e.preventDefault()
        initDefault()
    })

    $('body').on('click', 'button.bt-edit', function(e){
        var id = $(this).data('id')
        initShow(id)
    })

    $('body').on('click', 'button.bt-edit-data', function(e){
        var id = $(this).data('id')
        initShowDetails(id)
    })

    $('body').on('change', 'select#fitur_id', function(){
        var values = $(this).val()
        var desc = $(this).find('option[value="'+values+'"]').data('desc')
        $('textarea[name="desc"]').val(desc)
    })

    $('body').on('click', 'button.btn-add-rows', function(e){
        e.preventDefault()
        var len = $('body').find('input[name="add-rows"]').val()
        for (let index = 0; index < len; index++) {
            addRowItems()
        }
    })

    $('body').on('click', 'button.btn-delete-row-items', function(e){
        e.preventDefault()
        var elm = $(this).parents('tr')
        deleteRowItems(elm)
    })

    $('body').on('click', 'button.select-item', function(){
        var uom = $(this).data('uom')
        var id = $(this).data('barangid')
        var parttype = $(this).data('parttype')
        var partnumber = $(this).data('partnumber')
        var description = $(this).data('description')
        $(this).parents('tr').find('input[name="uom"]').val(uom)
        $(this).parents('tr').find('input[name="barang_id"]').val(id)
        $(this).parents('tr').find('input[name="nm_barang"]').val(description)
        $(this).parents('tr').find('input[name="partnumber"]').val(partnumber)
        $(this).parents('tr').find('select[name="parttype"]').val(parttype).trigger('change')
        $(this).parents('tr').find('div.modal').modal('hide')
    })

    $('body').on('click', 'button.btn-view-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        console.log('DATA ID :::', id);
        $.ajax({
            async: true,
            url: '/operation/purchasing-request/'+id+'/view',
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

    $('body').on('submit', 'form#fm-purchasing-request', function(e){
        e.preventDefault()
        const data = formJSON()
        const dataForm = new FormData()
        console.log(formJSON());
        dataForm.append('data', JSON.stringify(data))
        $.ajax({
            async: true,
            url: '/operation/purchasing-request',
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

    // $('body').on('submit', 'form#fm-doc-upd', function(e){
    //     e.preventDefault()
    //     var id = $(this).data('id')
    //     var data = new FormData(this)
    //     $.ajax({
    //         async: true,
    //         url: '/operation/purchasing-request/'+id+'/update',
    //         method: 'POST',
    //         data: data,
    //         dataType: 'json',
    //         processData: false,
    //         mimeType: "multipart/form-data",
    //         contentType: false,
    //         success: function(result){
    //             console.log(result)
    //             const { message } = result
    //             if(result.success){
    //                 swal("Okey,,,!", message, "success")
    //                 initDefault()
    //             }else{
    //                 swal("Opps,,,!", message, "warning")
    //             }
    //         },
    //         error: function(err){
    //             console.log(err)
    //             const { message } = err.responseJSON
    //             swal("Opps,,,!", message, "warning")
    //         }
    //     })
    // })

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
            url: '/operation/purchasing-request/list?limit=',
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

    function initCreate(){
        $.ajax({
            async: true,
            url: '/operation/purchasing-request/create',
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
            url: '/operation/purchasing-request/'+id+'/show',
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
            url: '/operation/purchasing-request/items-create',
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