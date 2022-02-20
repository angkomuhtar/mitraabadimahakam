$(function(){
    initDeafult()
    HightChart()
    function initDeafult(lim, url){
        $('div.content-module').css('display', 'none')
        var limit = lim || 25
        $('div#list-content').html('<h4 style="text-align: center;">Please wait,,, System still loading data</h4>').show()
        $.ajax({
            async: true,
            url: url || '/operation/daily-ritase-ob/list?limit='+limit,
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

    $('body').on('click', '#apply-filter', function(){
        var limit = $('input[name="limit"]').val()
        var jarak = $('input[name="distance"]').val() && '&distance=' + $('input[name="distance"]').val()
        var begin_date = $('input[name="mulai_tanggal"]').val() && '&begin_date=' + $('input[name="mulai_tanggal"]').val()
        var end_date = $('input[name="hingga_tanggal"]').val() && '&end_date=' + $('input[name="hingga_tanggal"]').val()
        var fleet_id = $('select[name="fleet_id"]').val() && '&fleet_id=' + $('select[name="fleet_id').val()
        var shift_id = $('select[name="shift_id"]').val()  && '&shift_id=' + $('select[name="shift_id"]').val()
        var material = $('select[name="material"]').val()  && '&material=' + $('select[name="material"]').val()
        var exca_id = $('select[name="exca_id"]').val()  && '&exca_id=' + $('select[name="exca_id"]').val()
        var url = `/operation/daily-ritase-ob/list?keyword=true&limit=${limit}${jarak}${begin_date}${end_date}${fleet_id}${shift_id}${material}${exca_id}`
        console.log(url);
        initDeafult(limit, url)
    })

    $('body').on('click', '#reset-filter', function(){
        var limit = $('input[name="limit"]').val()
        initDeafult(limit)
    })

    $('body').on('click', 'button#create-form', function (e) {
        e.preventDefault()
        $.ajax({
            async: true,
            url: '/operation/daily-ritase-ob/create',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#form-create').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body').on('click', 'button#show-graph', function (e) {
        e.preventDefault()
        $.ajax({
            async: true,
            url: '/operation/daily-ritase-ob/graph',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#form-create').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body').on('click', 'input[name="metodeInput"]', function(e){
        var value = $(this).is(':checked')
        if(value){
            console.log('show input list');
            $('div#manual-input').show()
            $('div#upload-file').hide()
            $('input[type="file"]').removeAttr('required').val(null)
            addHauler()
        }else{
            console.log('show upload file');
            $('body').find('tbody#item-details').children().remove()
            $('div#manual-input').hide()
            $('div#upload-file').show()
            $('input[type="file"]').prop('required', 'true')
        }
    })

    $('body').on('click', 'button.bt-add-items', function(e){
        e.preventDefault()
        addHauler()
    })

    $('body').on('change', 'select.form-control', function(){
        console.log($(this));
        var value = $(this).val()
        $(this).attr('data-check', value)
    })

    $('body').on('click', 'button.bt-delete-items', function(e){
        e.preventDefault()
        $(this).parents('tr').remove()
    })

    $('body').on('click', 'button#bt-back', function(){
        window.location.reload()
    })

    $('body').on('click', '#bt-search-keyword', function(e){
        e.preventDefault()
        var limit = $('#limit').val()
        console.log(limit);
        initDeafult(limit)
    })

    /* show ritase */
    $('body').on('click', 'button.bt-edit-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $.ajax({
            async: true,
            url: '/operation/daily-ritase-ob/'+id+'/show',
            method: 'GET',
            success: function(result){
                setRitaseUnit(id)
                $('div#list-content').children().remove()
                $('div#list-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body').on('click', '#bt-download', function(e){
        e.preventDefault();
        var host = document.location.host
        window.location.href = 'http://' + host + '/template-xls/daily-ritase-details-template.xlsx';
    })

    $('body').on('click', 'button#bt-cancel-create', function(){
        $("body form#fm-upload-ritase-ob").trigger("reset");
        $('input[type="date"].initDate').each(function(){
            $(this).val(moment().format('YYYY-MM-DD'))
        })
    })


    $('body').on('submit', 'form#fm-upload-ritase-ob', function(e){
        e.preventDefault()
        $('body').find('button[type="submit"]').attr('disabled', 'disabled')
        var data = new FormData(this)
        var isUploadFile = $('body input[name="metodeInput"]').is(':checked')
        if(isUploadFile){
            console.log('input manual....');
            $.ajax({
                async: true,
                headers: {'x-csrf-token': $('[name=_csrf]').val()},
                url: '/operation/daily-ritase-ob',
                method: 'POST',
                data: data,
                dataType: 'json',
                processData: false,
                mimeType: "multipart/form-data",
                contentType: false,
                success: function(result){
                    console.log(result)
                    if(result.success){
                        $("body").find('tr.advance-table-row').each(function(){
                            $(this).find('select').val(null).trigger('change')
                            $(this).find('input[name="qty"]').val('')
                        })
                        swal("Okey!", result.message, "success");
                        $('body').find('button[type="submit"]').removeAttr('disabled', 'disabled')
                    }else{
                        alert(result.message)
                    }
                },
                error: function(err){
                    console.log(err)
                    const { message } = err.responseJSON
                    swal("Opps,,,!", message, "warning")
                    $('body').find('button[type="submit"]').removeAttr('disabled', 'disabled')
                }
            })
        }else{
            swal({
                title: "Apakah anda yakin?",
                text: "Pastikan format data excel anda sudah sesuai!",
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn-warning",
                confirmButtonText: "Okey!",
                closeOnConfirm: false
              },
              function(isConfirm){
                swal("Please wait.....")
                  if(isConfirm){
                      $.ajax({
                          async: true,
                          headers: {'x-csrf-token': $('[name=_csrf]').val()},
                          url: '/operation/daily-ritase-ob',
                          method: 'POST',
                          data: data,
                          dataType: 'json',
                          processData: false,
                          mimeType: "multipart/form-data",
                          contentType: false,
                          success: function(result){
                              console.log(result)
                              if(result.success){
                                  swal("Okey!", result.message, "success");
                                  $("body form#fm-upload-ritase-ob").trigger("reset");
                                  window.location.reload()
                              }else{
                                  alert(result.message)
                              }
                          },
                          error: function(err){
                              console.log(err)
                              const { message } = err.responseJSON
                              swal("Opps,,,!", message, "warning")
                          }
                      })
                  }else{
                    swal("Okey!", 'you cancel upload data...', "success");
                  }
            });
        }
    })

    $('body').on('click', 'button.bt-delete-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        swal({
            title: "Are you sure?",
            text: "Your will not be able to recover this imaginary file!",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
          },
          function(){
            $.ajax({
                async: true,
                headers: {'x-csrf-token': $('[name=_csrf]').val()},
                url: '/operation/daily-ritase-ob/ritase-detail/'+id+'/destroy',
                method: 'DELETE',
                dataType: 'json',
                processData: false,
                mimeType: "multipart/form-data",
                contentType: false,
                success: function(result){
                    console.log(result)
                    if(result.success){
                        swal("Deleted!", result.message, "success");
                        window.location.reload()
                    }else{
                        alert(result.message)
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

    $('body').on('click', 'button#bt-update-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var data = {
            date: $('input[name="date"]').val(),
            material: $('select[name="material"]').val(),
            distance: $('input[name="distance"]').val()
        }
        swal({
            title: "Are you sure update it?",
            text: "Your will not be able to rollback data after update!",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, update it!",
            closeOnConfirm: false
          },
          function(){
              $.ajax({
                  async: true,
                  headers: {'x-csrf-token': $('[name=_csrf]').val()},
                  url: '/operation/daily-ritase-ob/'+id+'/update',
                  method: 'POST',
                  data: JSON.stringify(data),
                  dataType: 'json',
                  processData: false,
                  mimeType: "multipart/form-data",
                  contentType: false,
                  success: function(result){
                      console.log(result)
                      if(result.success){
                          swal("Okey,,,!", result.message, "success")
                          window.location.reload()
                      }else{
                          alert(result.message)
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

    $('body').on('click', 'button.bt-ritase-detail-upd', function(e) {
        e.preventDefault()
        var id = $(this).data('id')
        var formElement = document.querySelector("form#frm-upd"+id)
        const data = new FormData(formElement)
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/operation/daily-ritase-ob/ritase-detail/'+id+'/update',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result)
                if(result.success){
                    swal("Okey,,,!", result.message, "success")
                    window.location.reload()
                }else{
                    alert(result.message)
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
        var limit = $('#limit').val()
        var jarak = $('input[name="distance"]').val() && '&distance=' + $('input[name="distance"]').val()
        var begin_date = $('input[name="mulai_tanggal"]').val() && '&begin_date=' + $('input[name="mulai_tanggal"]').val()
        var end_date = $('input[name="hingga_tanggal"]').val() && '&end_date=' + $('input[name="hingga_tanggal"]').val()
        var fleet_id = $('select[name="fleet_id"]').val() && '&fleet_id=' + $('select[name="fleet_id').val()
        var shift_id = $('select[name="shift_id"]').val()  && '&shift_id=' + $('select[name="shift_id"]').val()
        var material = $('select[name="material"]').val()  && '&material=' + $('select[name="material"]').val()
        var exca_id = $('select[name="exca_id"]').val()  && '&exca_id=' + $('select[name="exca_id"]').val()
        var url = `${window.location.pathname}/list?keyword=true&page=${page}&limit=${limit}${jarak}${begin_date}${end_date}${fleet_id}${shift_id}${material}${exca_id}`
        initDeafult(limit, url)
    })

    /* show list ritase equipment details */
    function setRitaseUnit(id){
        $.ajax({
            async: true,
            url: '/operation/daily-ritase-ob/ritase/show/equipment?id='+id,
            method: 'GET',
            success: function(result){
                $('div#list-ritase-unit').children().remove()
                $('div#list-ritase-unit').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    function addHauler(){
        $.ajax({
            async: true,
            url: '/operation/daily-ritase-ob/create/addItems',
            method: 'GET',
            success: function(result){
                $('tbody#item-details').append(result)
                $('body').find('tbody > tr.advance-table-row').each(function(i, e){
                    console.log($(this));
                    $(this).find('td.urut').html(i + 1)
                })
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    function HightChart(){
        Highcharts.theme = {
            colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572',
                    '#FF9655', '#FFF263', '#6AF9C4'],
            chart: {
                backgroundColor: {
                    linearGradient: [0, 0, 500, 500],
                    stops: [
                        [0, 'rgb(255, 255, 255)'],
                        [1, 'rgb(240, 240, 255)']
                    ]
                },
            },
            title: {
                style: {
                    color: '#ddd',
                    font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
                }
            },
            subtitle: {
                style: {
                    color: '#ddd',
                    font: 'bold 12px "Trebuchet MS", Verdana, sans-serif'
                }
            },
            legend: {
                itemStyle: {
                    font: '9pt Trebuchet MS, Verdana, sans-serif',
                    color: 'black'
                },
                itemHoverStyle:{
                    color: 'gray'
                }
            }
        };
        // Apply the theme
        Highcharts.setOptions(Highcharts.theme);
    }
})