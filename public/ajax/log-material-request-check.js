$(function(){
    console.log('log-material-request-check.js');
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

    $('body').on('click', 'button.bt-view-data', function(e){
        var id = $(this).data('id')
        $.ajax({
            async: true,
            url: 'material-request-check/'+id+'/view',
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

    $('body').on('keydown', 'input[name="scan-kode"]', function(e){
        var values = $(this).val()
        var id = $(this).data('id')
        var gudang_id = $('body').find('select[name="gudang_id"]').val()
        

        if(e.which == 13) {
            if(!values){
                alert('Kode item masih kosong...')
                return
            }
    
            if(!gudang_id){
                alert('Gudang persediaan item belum ditentukan...')
                return
            }

            $.ajax({
                async: true,
                url: 'material-request-check/check-items',
                method: 'GET',
                data: {
                    id: id,
                    kode: values
                },
                dataType: 'json',
                success: function(res){
                    console.log(res);
                    if(res.success){
                        $('body').find('div#input-qty').css('display', 'inline')
                        $('body').find('input[name="qty-check"]').val('1')
                        $('body').find('input[name="qty-check"]').focus().select()
                        $('body').find('input[name="qty-check"]').attr('data-barang', res.barang.kode)
                        $('body').find('button#satuan').html(res.barang.uom)
                    }else{
                        swal("Error!", "Item dengan kode \n[ "+values+" ]\ntidak ditemukan...", "error")
                    }
                },
                error: function(err){
                    swal("Error!", "Request error...", "error")
                }
            })
        }
        
    })

    $('body').on('keydown', 'input[name="qty-check"]', function(e){
        var addValues = $(this).val()
        var kode = $('input[name="scan-kode"]').val()
        if(e.which == 13) {
            var data = $('body').find('td[id="TAB1-'+kode+'"]').parents('tr').data()
            var oldValue = $('body').find('td[id="TAB1-'+kode+'"]').html()
            $('body').find('td[id="TAB1-'+kode+'"]').html(parseInt(addValues) + parseInt(oldValue))
            $('body').find('input[name="scan-kode"]').focus().select()

            $('body').find('tbody#checked-items').append(
                '<tr class="result-scan '+data.barangid+'">'+
                    '<td>#</td>'+
                    '<td>'+
                    data.barangnm+
                    '<input type="hidden" class="barang-keluar" name="barang_id" value="'+data.barangid+'"/>'+
                    '<input type="hidden" class="barang-keluar" name="equipment_id" value="'+data.equipment+'"/>'+
                    '<input type="hidden" class="barang-keluar" name="qty" value="'+addValues+'"/>'+
                    '<input type="hidden" class="barang-keluar" name="meterial_req_id" value="'+data.req+'"/>'+
                    '</td>'+
                    '<td>'+data.uom+'</td>'+
                    '<td class="">'+addValues+
                    '   <i class="icon-basket-loaded" style="font-weight: bold;"></i>'+
                    '</td>'+
                    '<td>'+data.kode+'</td>'+
                    '<td>'+(data.partnumber || "-")+'</td>'+
                    '<td>'+data.equiptype+'</td>'+
                    '<td>'+
                    '   <a class="bt-remove text-danger" href="#" data-kode="'+data.kode+'">'+
                    '       <i class="icon-close"></i>'+
                    '   </a>'+
                    '</td>'+
                '</tr>'
            )

            $('body').find('tr.result-scan').each(function(i){
                var no = i + 1
                $('body').find('span.badge-count').css('display', 'inline').html(no)
            })
        }

        $('body').find('tr.result-scan').each(function(i){
            $(this).find('td:first').html(i+1)
        })
        $('body').find('div.tab-pane').each(function(){
            $(this).removeClass('active')
        })
        $('body').find('div#home').addClass('active')
        
        $('body').find('[role="presentation"]').each(function(){
            if($(this).hasClass('active')){
                $(this).removeClass('active')
            }
        })
        $('body').find('li#home-link').addClass('active')
    })

    $('body').on('click', 'a.bt-remove', function(e){
        e.preventDefault()
        var elm = $(this)
        var kode = elm.data('kode')
        var elmTarget = elm.parents('div.tab-content').find('td[id="TAB1-'+kode+'"]')
        var valueTarget = elmTarget.html()
        elmTarget.html(parseInt(valueTarget) - 1)
        elm.parents('tr').remove()
        $('body').find('tr.result-scan').each(function(i){
            $(this).find('td:first').html(i+1)
        })

        /** RECOUNT BADGE **/
        var len = $('body').find('tbody > tr.result-scan').length
        if(len >= 1){
            $('body').find('span.badge-count').html(len)
        }else{
            $('body').find('span.badge-count').css('display', 'none')
        }
    })

    $('body').on('click', 'button.bt-buat-purchasing', function(e){
        e.preventDefault()
        var mr = $(this).parents('tr').data('req')
        var idbarang = $(this).parents('tr').data('barangid')
        var nmbarang = $(this).parents('tr').data('barangnm')
        var kdbarang = $(this).parents('tr').data('kode')
        var uom = $(this).parents('tr').data('uom')
        var partnumber = $(this).parents('tr').data('partnumber')
        var equiptype = $(this).parents('tr').data('equiptype')
        var equipment = $(this).parents('tr').data('equipment')
        swal({
            title: "Apakah anda yakin akan purchasing request item ini ?",
            text: nmbarang +"\n"+ "[ "+kdbarang+" ]",
            type: "input",
            showCancelButton: true,
            closeOnConfirm: false,
            inputPlaceholder: "Input Jumlah Items"
          }, function (inputValue) {
            if (inputValue === false) return false;
            if (inputValue === "") {
              swal.showInputError("Jumlah tidak boleh kosong...");
              return false
            }
            $('body').find('tbody#purchasing-request').append(
                '<tr class="result-purchasing '+kdbarang+'">'+
                    '<td>#</td>'+
                    '<td>'+
                    nmbarang+
                    '<input type="hidden" class="purchasing-request" name="barang_id" value="'+idbarang+'"/>'+
                    '<input type="hidden" class="purchasing-request" name="equipment_id" value="'+(equipment || "")+'"/>'+
                    '<input type="hidden" class="purchasing-request" name="qty" value="'+inputValue+'"/>'+
                    '</td>'+
                    '<td>'+uom+'</td>'+
                    '<td class="">'+inputValue+'</td>'+
                    '<td>'+kdbarang+'</td>'+
                    '<td>'+(partnumber || "-")+'</td>'+
                    '<td>'+equiptype+'</td>'+
                    '<td>'+
                    '   <a class="text-danger bt-remove-purchasing-items" href="#" data-kode="'+kdbarang+'">'+
                    '       <i class="icon-close"></i>'+
                    '   </a>'+
                    '</td>'+
                '</tr>'
            )
            $('body').find('tr.result-purchasing').each(function(i){
                $(this).find('td:first').html(i+1)
            })
            swal("Okey!", "Berhasil dimasukkan kedalam item Purchasing Request : \n" + nmbarang + "\nQty : " + inputValue, "success");
          });
    })

    $('body').on('click', 'a.bt-remove-purchasing-items', function(e){
        e.preventDefault()
        var elm = $(this)
        elm.parents('tr').remove()
        $('body').find('tr.result-purchasing').each(function(i){
            $(this).find('td:first').html(i+1)
        })
    })
    
    $('body').on('click', 'button.bt-select-items', function(e){
        e.preventDefault()
        var elm = $(this)
        var kode = elm.data('kode')
        $('body').find('div#searchItems').modal('hide')
        $('body').find('input[name="scan-kode"]').val(kode)
    })

    $('body').on('hidden.bs.modal', '#searchItems', function (e) {
        $('body').find('input[name="scan-kode"]').focus().select()
    })
    
    $('body').on('submit', 'form#form-barang-out', function(e){
        e.preventDefault()
        var data = new FormData()
        var id = $(this).data('id')
        var items = formDataValue('result-scan', 'barang-keluar')
        data.append('items', JSON.stringify(items))
        data.append('request_id', $('body').find('input[name="request_id"]').val())
        data.append('gudang_id', $('body').find('select[name="gudang_id"]').val())
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: 'material-request-check/'+id+'/barang-out',
            method: 'POST',
            data: data, 
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
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

    $('body').on('submit', 'form#form-purchasing-request', function(e){
        e.preventDefault()
        var data = new FormData()
        var id = $(this).data('id')
        var items = formDataValue('result-purchasing', 'purchasing-request')
        data.append('items', JSON.stringify(items))
        data.append('gudang_id', $('body').find('select[name="gudang_id"]').val())
        console.log(items);
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: 'material-request-check/'+id+'/purchasing-request',
            method: 'POST',
            data: data, 
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
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
        $.get('material-request-check/list?page='+page+'&keyword='+keyword, function(data){
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
        $.get('material-request-check/list?page='+page+'&keyword='+keyword, function(data){
            $('div#list-content').children().remove()
            $('div#list-content').html(data)
        })
    })

    $('body').on('click', 'button#btGoToPage', function(e){
        e.preventDefault()
        var page = $('body').find('input[name="inp-page"]').val()
        var keyword = $('body').find('input[name="keyword"]').val()
        $.get('material-request-check/list?page='+page+'&keyword='+keyword, function(data){
            $('div#list-content').children().remove()
            $('div#list-content').html(data)
        })
    })

    function initDeafult(){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: 'material-request-check/list',
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
            url: 'material-request-check/create',
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
            url: 'material-request-check/create/items',
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

    function formDataValue(trClass, elmClass){
        let items = []
        $('tr.'+trClass).each(function(){
            var elm = $(this)

            var props = []
            var vals = []
            elm.find('input.'+elmClass).each(function(){
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

        // result-scan
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