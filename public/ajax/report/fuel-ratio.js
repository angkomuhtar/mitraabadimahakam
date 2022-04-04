$(function(){

    console.log('ajax/report/fuel-ratio.js');

    var body = $('body')

    initFilter()
    $('body').on('click', 'button#bt-back', function(){
        window.location = window.location
    })

    $('body').on('change', 'select[name="site_id"]', function(){
        var values = $(this).val()
        $.ajax({
            async: true,
            url: '/ajax/pit-by-site?site_id='+values+'&elm=radiobox',
            method: 'GET',
            dataType: 'html',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                // console.log(result)
                body.find('div#select-range-type').css('display','inline')
                body.find('div#box-select-pit').html(result)
            },
            error: function(err){
                console.log(err)
            }
        })
    })

    $('body').on('change', 'input[name="pit_id"]', function(){
        var values = $(this).val()
        if(values){
            body.find('div#box-select-periode').css('display', 'inline')
            body.find('div#box-duration').css('display', 'inline')
            body.find('input[name="start"], input[name="end"]').attr('type', 'date')
        }
    })

    $('body').on('change', 'select[name="range_type"]', function(){
        var values = $(this).val()
        if(values){
            body.find('div#box-select-pit').css('display', 'inline')
            body.find('div#box-duration').css('display', 'inline')
            if(values != 'pit'){
                body.find('input#month, input#week').removeAttr('disabled', false)
                body.find('div#box-select-pit').css('display', 'none')
                body.find('div#box-select-periode').css('display', 'inline')
                body.find('input[name="start"], input[name="end"]').attr('type', 'date')
            }else{
                body.find('input#month, input#week').attr('disabled', true)
                body.find('input#date').prop('checked')
                body.find('div#box-select-pit').css('display', 'inline')
                body.find('div#box-select-periode').css('display', 'none')
            }
        }else{
            body.find('div#box-select-pit, div#box-select-periode, div#box-duration').css('display', 'none')
        }
    })

    $('body').on('click', 'input[name="inp_ranges"]', function(){
        var values = $(this).val()
        body.find('div#box-duration').css('display', 'inline')
        body.find('input[name="start"], input[name="end"]').attr('type', values)
    })

    $('body').on('blur', 'input[name="start"], input[name="end"]', function(){
        body.find('div#box-apply-chart').css('display', 'inline')
    })

    $('body').on('submit', 'form#filter-data', function(e){
        e.preventDefault()
        var data = new FormData(this)
        data.append('filter', 'true')
        $.ajax({
            async: true,
            url: '/report/fuel-ratio/apply-filter',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result)
                GEN_CHART(result.xAxis, result.series)
                body.find('div#box-chart').css('display', 'inline')
            },
            error: function(err){
                console.log(err)
                body.find('div#box-chart').css('display', 'none')
            }
        })
    })

    $('body').on('click', 'button#bt-generate-pdf', function(e){
        e.preventDefault()

        domtoimage.toBlob(document.getElementById('container'))
        .then(function (blob) {
            console.log(blob);
            blob.fileName = 'chart.png'
            blob.extname = 'png'
            blob.extname = 'png'
            var fd = new FormData(document.querySelector('form'))
            fd.append('fname', 'chart.png');
            fd.append('chartImg', blob);
            $.ajax({
                async: true,
                url: '/report/fuel-ratio/gen-data-pdf',
                method: 'POST',
                data: fd,
                dataType: 'json',
                processData: false,
                mimeType: "multipart/form-data",
                contentType: false,
                success: function(result){
                    console.log(result)
                    pdfMake.createPdf(result).open();
                },
                error: function(err){
                    console.log(err)
                }
            })
        });
    })

    // $('body').on('click', 'button#bt-generate-xls', function(e){
    //     e.preventDefault()

    //     var fd = new FormData()
    //         fd.append('site_id', $('select[name="site_id"]').val());
    //         fd.append('pit_id', $('select[name="pit_id"]').val());
    //         fd.append('production_type', $('select[name="production_type"]').val());
    //         fd.append('range_type', $('select[name="range_type"]').val());
    //         fd.append('filterType', $('select[name="filterType"]').val());
    //         fd.append('start_date', $('input[name="start_date"]').val());
    //         fd.append('end_date', $('input[name="end_date"]').val());
    //         fd.append('month_begin', $('input[name="month_begin"]').val());
    //         fd.append('month_end', $('input[name="month_end"]').val());
    //         fd.append('week_begin', $('input[name="week_begin"]').val());
    //         fd.append('week_end', $('input[name="week_end"]').val());
    //         fd.append('date', $('input[name="date"]').val());
    //         fd.append('shift_id', $('select[name="shift_id"]').val());
    //         $.ajax({
    //             async: true,
    //             url: '/report/production/gen-data-xls',
    //             method: 'POST',
    //             data: fd,
    //             dataType: 'json',
    //             processData: false,
    //             mimeType: "multipart/form-data",
    //             contentType: false,
    //             success: function(result){
    //                 console.log(result)
    //                 window.open('../'+result.uri, '_blank');
    //             },
    //             error: function(err){
    //                 console.log(err)
    //             }
    //         })
        
    // })

    // function GEN_PDF(content){
    //     pdfMake.createPdf(content).open();
    // }

    function initFilter(){
        $.ajax({
            async: true,
            url: '/report/fuel-ratio/filter',
            method: 'GET',
            success: function(result){
                body.find('div#list-content').html(result)
            },
            error: function(err){
                console.log(err);
            },
            complete: function(){
                console.log('finish...');
            }
        })
    }

    function GEN_CHART (xAxis, series) {

        Highcharts.chart('container', {
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: 'Production By Truck Count'
            },
            subtitle: {
                text: 'Project BBE'
            },
            xAxis: [{
                categories: xAxis,
                labels: {
                    rotation: -45,
                    style: {
                        fontSize: '11px',
                        fontFamily: 'Verdana, sans-serif',
                        color: '#000'
                    }
                },
                crosshair: true
            }],
            yAxis: [
                {
                    lineColor: '#FF0000',
                    lineWidth: 1,
                    labels: {
                        format: '{value}',
                        style: {
                            fontSize: '11px',
                            fontFamily: 'Verdana, sans-serif',
                            color: '#000'
                        }
                    },
                    title: {
                        text: 'FUEL RATIO',
                        style: {
                            fontSize: '15px',
                            fontFamily: 'Verdana, sans-serif',
                            color: '#FF5A79'
                        }
                    }
                }
            ],
            tooltip: {
                formatter: function () {
                    return '<b>' + this.x + '</b><br/>' +
                        '<b>' + this.series.name + ': </b>' + this.y
                }
            },
            plotOptions: {
                column: {
                    stacking: 'normal'
                }
            },
            series: series
        });
    }
})



