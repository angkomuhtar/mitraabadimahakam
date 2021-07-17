$(function(){
    initDeafult()
    function initDeafult(){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/daily-ritase-ob/list?keyword=',
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

    function findRitasePit(id, group, itemid){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/daily-ritase-ob/list/'+group+'/'+itemid,
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

    $('body').on('click', 'button.btn-warning', function(e){
        e.preventDefault()
    })

    $('body').on('click', 'button#bt-back', function(){
        window.location.reload()
    })

    $('body').on('click', 'a.find-by', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var itemid = $(this).data('item')
        var group = $(this).data('search')
        findRitasePit(id, group, itemid)
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