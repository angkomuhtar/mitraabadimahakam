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
                body.find('input#monthly, input#weekly').removeAttr('disabled', false)
                body.find('div#box-select-pit').css('display', 'none')
                body.find('div#box-select-periode').css('display', 'inline')
                body.find('input[name="start"], input[name="end"]').attr('type', 'date')
            }else{
                body.find('input#monthly, input#weekly').attr('disabled', true)
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
        console.log(values);
        body.find('div#box-duration').css('display', 'inline')
        switch (values) {
            case 'MONTHLY':
                body.find('input[name="start"], input[name="end"]').attr('type', 'month')
                break;
            case 'WEEKLY':
                body.find('input[name="start"], input[name="end"]').attr('type', 'week')
                break;
            default:
                body.find('input[name="start"], input[name="end"]').attr('type', 'date')
                break;
        }
    })

    $('body').on('blur', 'input[name="start"], input[name="end"]', function(){
        body.find('div#box-apply-chart').css('display', 'inline')
    })

    $('body').on('hidden.bs.modal', '#myModal', function (e) {
        e.preventDefault()
        const form = document.getElementById('filter-data');
        var data = new FormData(form)
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
                GEN_CHART_ACTUAL(result.xAxis, result.series, result.site, result.pit)
                if (result.cummxAxis) {
                    GEN_CHART_CUM(result.cummxAxis, result.cummSeries, result.site, result.pit)
                }else{
                    body.find('div#cumm-container').html('')
                }
                body.find('div#box-chart').css('display', 'inline')
            },
            error: function(err){
                console.log(err)
                body.find('div#box-chart').css('display', 'none')
            }
        })
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
                GEN_CHART_ACTUAL(result.xAxis, result.series, result.site, result.pit, result.staticRatio)
                if (result.cummxAxis) {
                    GEN_CHART_CUM(result.cummxAxis, result.cummSeries, result.site, result.pit)
                }else{
                    body.find('div#cumm-container').html('')
                }
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

        domtoimage.toBlob(document.getElementById('print-area'))
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

    $('body').on('click', 'button#bt-generate-xls', function(e){
        e.preventDefault()

        var fd = new FormData(document.querySelector('form'))
        $.ajax({
            async: true,
            url: '/report/fuel-ratio/gen-data-xls',
            method: 'POST',
            data: fd,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result)
                window.open('../'+result.uri, '_blank');
            },
            error: function(err){
                console.log(err)
            }
        })
        
    })

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

    function GEN_CHART_ACTUAL (xAxis, series, site, pit, staticRatio) {

        Highcharts.chart('container', {
            chart: {
                zoomType: 'xy',
            },
            title: {
                text: 'Actual Fuel Ratio (' + site.kode + ')'
            },
            subtitle: {
                text: pit ? pit.name : 'ALL PIT On Site'
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
                    },
                    plotLines: [{
                        value: (staticRatio)?.toFixed(2),
                        color: 'red',
                        dashStyle: 'shortdash',
                        // width: 2,
                        // label: {
                        //     text: 'Budget \n'+(staticRatio)?.toFixed(2)+'%',
                        //     x: -40,
                        //     align: 'right',
                        //     position: 'right',
                        //     style: {
                        //         fontWeight: 'bold',
                        //         color: 'red'
                        //     }
                        // }
                    }],
                    tickAmount: 5,
                    tickInterval: 0.2,
                    title: {
                        text: 'ACTUAL FUEL RATIO',
                        x: -15,
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
                series: {
                    cursor: 'pointer',
                    events: {
                        click: function (event) {
                            alert(
                                this.x + ' clicked\n' + 
                                'Alt: ' + event.altKey + '\n' +
                                'Control: ' + event.ctrlKey + '\n' +
                                'Meta: ' + event.metaKey + '\n' +
                                'Shift: ' + event.shiftKey
                            );
                        }
                    }
                }
            },
            series: series
        });

        
    }

    function GEN_CHART_CUM (xAxis, series) {
        Highcharts.chart('cumm-container', {
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: 'Cummulative Fuel Ratio'
            },
            xAxis: [{
                categories: xAxis,
                crosshair: true
            }],
            yAxis: [
                { // Secondary yAxis
                    title: {
                        text: 'Tot.Production',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    labels: {
                        format: '{value} bcm',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    opposite: true
                },
                { // Primary yAxis
                title: {
                    text: 'CUMM RATIO',
                    tickAmount: 5,
                    tickInterval: 0.2,
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                }
            }],
            tooltip: {
                shared: true
            },
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true,
                        format: '{value}',
                    },
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: series
        });
    }
})



