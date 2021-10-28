$(function(){
    initDeafult()
    function initDeafult(lim, url){
        $('div.content-module').css('display', 'none')
        var limit = lim || 25
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

    $('body').on('click', 'button.btn-warning', function(e){
        e.preventDefault()
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

    $('body').on('submit', 'form#fm-upload-ritase-ob', function(e){
        e.preventDefault()
        var data = new FormData(this)
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
})