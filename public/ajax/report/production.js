$(function(){

    console.log('ajax/report/production.js');

    var body = $('body')

    initFilter()
    $('body').on('click', 'button#bt-back', function(){
        window.location = window.location
    })

    $('body').on('change', 'select[name="site_id"]', function(){
        var values = $(this).val()
        body.find('div#box-chart').css('display', 'none')
        if(values){
            body.find('select[name="production_type"]').val('')
            body.find('select[name="range_type"]').val('')
            body.find('div.select-duration-type').css('display', 'none')
            body.find('div#select-pit').css('display', 'none')
            body.find('div#select-production-type').css('display', 'inline')
            body.find('div#select-range-type').css('display', 'none')
            body.find('div#select-duration-type').css('display', 'none')
            body.find('div.container-type').css('display', 'none')
        }else{
            body.find('div#select-pit').html('')
            body.find('select#production_type').val('')
            body.find('select#range_type').val('')
            body.find('select#filterType').val('')
            body.find('input#date').val('')
            body.find('input#month_begin').val('')
            body.find('input#month_end').val('')
            body.find('input#week_begin').val('')
            body.find('input#week_end').val('')
            body.find('input#start_date').val('')
            body.find('input#end_date').val('')
            body.find('div#select-duration-type').css('display', 'none')
            body.find('div#select-production-type').css('display', 'none')
            body.find('div#select-range-type').css('display', 'none')
            body.find('div.container-type').css('display', 'none')
        }
    })

    $('body').on('change', 'select[name="production_type"]', function(){
        var values = $(this).val()
        if(values){
            body.find('div#select-range-type').css('display', 'inline')
        }else{
            body.find('div#select-range-type').css('display', 'none')
        }
    })

    $('body').on('change', 'select[name="range_type"]', function(){
        var site_id = body.find('select[name="site_id"]').val()
        var values = $(this).val()
        if(values === 'MW'){
            body.find('div#select-pit').css('display', 'inline')
            $.ajax({
                async: true,
                url: '/ajax/pit-by-site?site_id='+site_id,
                method: 'GET',
                success: function(result){
                    console.log(result);
                    body.find('div#select-pit').html(result)
                    body.find('div.container-type').css('display', 'none')
                    body.find('select[name="filterType"]').val('DATE')
                    body.find('select#filterType option[value!="DATE"]').attr('disabled', 'true')
                    body.find('div#box-date').css('display', 'inline')
                },
                error: function(err){
                    console.log(err);
                },
                complete: function(){
                    console.log('finish...');
                    body.find('div#select-duration-type').css('display', 'inline')
                    // body.find('select#filterType option[value!="DATE"]').removeAttr('disabled')
                    body.find('div#box-apply-chart').css('display', 'inline')
                    body.find('div#box-type-chart').css('display', 'inline')
                }
            })
        }
        if(values === 'PW'){
            body.find('select[name="filterType"]').val('')
            body.find('select#filterType option[value!="DATE"]').removeAttr('disabled')
            body.find('div#select-pit').css('display', 'none')
            body.find('div#box-date').css('display', 'none')
            body.find('div#select-duration-type').css('display', 'inline')
            body.find('select[name="pit_id"]').val('')
            body.find('div#box-apply-chart').css('display', 'none')
        }
        if(!values){
            body.find('select[name="filterType"]').val('')
            body.find('select#filterType option[!value="DATE"]').removeAttr('disabled')
            body.find('div#select-pit').css('display', 'none')
            body.find('div#select-duration-type').css('display', 'none')
            body.find('div#box-date').css('display', 'none')
            body.find('select[name="pit_id"]').val('')
            body.find('div#box-apply-chart').css('display', 'none')
        }
    })

    $('body').on('change', 'select[name="filterType"]', function(){
        var values = $(this).val()
        body.find('div.container-type').css('display', 'none')
        body.find('div#box-chart').css('display', 'none')
        // body.find('div.container-type').children('select, input').val()
        switch (values) {
            case 'MONTHLY':
                body.find('div#box-daily').css('display', 'none')
                body.find('div#box-monthly').css('display', 'inline')
                body.find('div#box-site').css('display', 'inline')
                body.find('div#box-pit').css('display', 'inline')
                body.find('div#box-type-chart').css('display', 'inline')
                body.find('div#box-apply-chart').css('display', 'inline')
                break;
            case 'WEEKLY':
                body.find('div#box-daily').css('display', 'none')
                body.find('div#box-weekly').css('display', 'inline')
                body.find('div#box-site').css('display', 'inline')
                body.find('div#box-pit').css('display', 'inline')
                body.find('div#box-type-chart').css('display', 'inline')
                body.find('div#box-apply-chart').css('display', 'inline')
                break;
            case 'DATE':
                body.find('div#box-daily').css('display', 'none')
                body.find('div#box-date').css('display', 'inline')
                body.find('div#box-site').css('display', 'inline')
                body.find('div#box-pit').css('display', 'inline')
                body.find('div#box-type-chart').css('display', 'inline')
                body.find('div#box-apply-chart').css('display', 'inline')
                break;
            case 'SHIFT':
                body.find('div#box-daily').css('display', 'none')
                body.find('div#box-shift').css('display', 'inline')
                body.find('div#box-date').css('display', 'inline')
                body.find('div#box-site').css('display', 'inline')
                body.find('div#box-pit').css('display', 'inline')
                body.find('div#box-type-chart').css('display', 'inline')
                body.find('div#box-apply-chart').css('display', 'inline')
                break;
            case 'HOURLY':
                body.find('div#box-daily').css('display', 'inline')
                body.find('div#box-site').css('display', 'inline')
                body.find('div#box-pit').css('display', 'inline')
                body.find('div#box-shift').css('display', 'none')
                body.find('div#box-type-chart').css('display', 'inline')
                body.find('div#box-apply-chart').css('display', 'inline')
                break;
            case '':
                body.find('div.container-type').css('display', 'none')
                break;
            default:
                body.find('div#box-date').css('display', 'inline')
                body.find('div#box-site').css('display', 'inline')
                body.find('div#box-pit').css('display', 'inline')
                body.find('div#box-date').css('display', 'inline')
                break;
        }
    })

    $('body').on('submit', 'form#filter-data', function(e){
        e.preventDefault()
        var data = new FormData(this)
        data.append('filter', 'true')
        $.ajax({
            async: true,
            url: '/report/production/apply-filter',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result)
                if(result.group === 'MW'){
                    showChart_MW(result)
                }else{
                    showChart_PW(result)
                }
                body.find('div#box-chart').css('display', 'inline')
            },
            error: function(err){
                console.log(err)
                body.find('div#box-chart').css('display', 'none')
            }
        })
        console.log('...');
    })

    $('body').on('click', 'button#bt-generate-pdf', function(e){
        e.preventDefault()
        let data = {
            site_id: $('select[name="site_id"]').val(),
            pit_id: $('select[name="pit_id"]').val(),
            production_type: $('select[name="production_type"]').val(),
            range_type: $('select[name="range_type"]').val(),
            filterType: $('select[name="filterType"]').val(),
            start_date: $('input[name="start_date"]').val(),
            end_date: $('input[name="end_date"]').val(),
            month_begin: $('input[name="month_begin"]').val(),
            month_end: $('input[name="month_end"]').val(),
            week_begin: $('input[name="week_begin"]').val(),
            week_end: $('input[name="week_end"]').val(),
            date: $('input[name="date"]').val(),
            shift_id: $('select[name="shift_id"]').val()
        }

        domtoimage.toBlob(document.getElementById('container'))
        .then(function (blob) {
            console.log(blob);
            blob.fileName = 'chart.png'
            blob.extname = 'png'
            blob.extname = 'png'
            var fd = new FormData()
            fd.append('fname', 'chart.png');
            fd.append('chartImg', blob);
            fd.append('site_id', data.site_id);
            fd.append('pit_id', data.pit_id);
            fd.append('production_type', data.production_type);
            fd.append('range_type', data.range_type);
            fd.append('filterType', data.filterType);
            fd.append('start_date', data.start_date);
            fd.append('end_date', data.end_date);
            fd.append('month_begin', data.month_begin);
            fd.append('month_end', data.month_end);
            fd.append('week_begin', data.week_begin);
            fd.append('week_end', data.week_end);
            fd.append('date', data.date);
            fd.append('shift_id', data.shift_id);
            $.ajax({
                async: true,
                url: '/report/production/gen-data-pdf',
                method: 'POST',
                data: fd,
                dataType: 'json',
                processData: false,
                mimeType: "multipart/form-data",
                contentType: false,
                success: function(result){
                    console.log(result)
                    GEN_PDF(result)
                },
                error: function(err){
                    console.log(err)
                }
            })
        });
    })

    // function base64ToBlob(base64, mime) {
    //     mime = mime || '';
    //     var sliceSize = 1024;
    //     var byteChars = window.atob(base64);
    //     var byteArrays = [];

    //     for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
    //         var slice = byteChars.slice(offset, offset + sliceSize);

    //         var byteNumbers = new Array(slice.length);
    //         for (var i = 0; i < slice.length; i++) {
    //             byteNumbers[i] = slice.charCodeAt(i);
    //         }

    //         var byteArray = new Uint8Array(byteNumbers);

    //         byteArrays.push(byteArray);
    //     }

    //     return new Blob(byteArrays, {type: mime});
    // }

    $('body').on('click', 'button#bt-generate-xls', function(e){
        e.preventDefault()

        var fd = new FormData()
            fd.append('site_id', $('select[name="site_id"]').val());
            fd.append('pit_id', $('select[name="pit_id"]').val());
            fd.append('production_type', $('select[name="production_type"]').val());
            fd.append('range_type', $('select[name="range_type"]').val());
            fd.append('filterType', $('select[name="filterType"]').val());
            fd.append('start_date', $('input[name="start_date"]').val());
            fd.append('end_date', $('input[name="end_date"]').val());
            fd.append('month_begin', $('input[name="month_begin"]').val());
            fd.append('month_end', $('input[name="month_end"]').val());
            fd.append('week_begin', $('input[name="week_begin"]').val());
            fd.append('week_end', $('input[name="week_end"]').val());
            fd.append('date', $('input[name="date"]').val());
            fd.append('shift_id', $('select[name="shift_id"]').val());
            $.ajax({
                async: true,
                url: '/report/production/gen-data-xls',
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

    function GEN_PDF(content){
        pdfMake.createPdf(content).open();
    }

    function initFilter(){
        $.ajax({
            async: true,
            url: '/report/production/filter',
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

    function showChart_MW(result){

        let xAxis = result.x_Axis
        let series = result.data.map( el => {
            return {
                name: el.nm_pit || el.name,
                type: el.type,
                color: el.color || '',
                stack: el.stack || el.nm_pit,
                data: el.items?.map( val => val.volume)
            }
        })
        console.log(series);
        BAR_CHART_MW(xAxis, series)
    }

    function showChart_PW(result){
        console.log(result);
        let site = result.site
        let xAxis = result.x_Axis
        let series = result.data.map( el => {
            return {
                name: el.nm_pit || el.name,
                type: el.type || 'column',
                color: el.color || null,
                stack: el.nm_pit || el.stack,
                data: el.items?.map( val => val.actual) || el.data
            }
        })

        BAR_CHART_PW(xAxis, series, site)
    }

    function BAR_CHART_MW (arrDate, series) {

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
                categories: arrDate,
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
                { // Primary yAxis
                    // gridLineColor: '#ddd',
                    // gridLineWidth: 0.2,
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
                        text: 'Total Volume',
                        style: {
                            fontSize: '15px',
                            fontFamily: 'Verdana, sans-serif',
                            color: '#FF5A79'
                        }
                    },
                    // tickAmount: 5,
                    tickInterval: 2000,
                }
            ],
            tooltip: {
                formatter: function () {
                    return '<b>' + this.x + '</b><br/>' +
                        '<b>' + this.series.name + ': </b>' + this.y
                }
            },
            // tooltip: {
            //     shared: true
            // },
            // legend: {
            //     layout: 'vertical',
            //     align: 'left',
            //     x: 120,
            //     verticalAlign: 'top',
            //     y: 50,
            //     floating: true,
            //     backgroundColor:
            //         Highcharts.defaultOptions.legend.backgroundColor || // theme
            //         'rgba(255,255,255,0.25)'
            // },
            plotOptions: {
                column: {
                    stacking: 'normal'
                }
            },
            series: series
        });
    }

    function BAR_CHART_PW (xAxis, series, site) {
        console.log(series);
        Highcharts.chart('container', {
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: 'Production By Truck Count'
            },
            subtitle: {
                text: 'Project '+ site
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

            yAxis: {
                lineColor: '#c4c4c4',
                lineWidth: 1,
                gridLineColor: '#ddd',
                gridLineWidth: 0.2,
                labels: {
                    format: '{value}',
                    style: {
                        fontSize: '11px',
                        fontFamily: 'Verdana, sans-serif',
                        color: '#000'
                    }
                },
                title: {
                    text: 'total volume',
                    style: {
                        fontSize: '11px',
                        fontFamily: 'Verdana, sans-serif',
                        color: '#014584'
                    }
                }
            },
            // yAxis: [
            //     { // Primary yAxis
            //         gridLineColor: '#ddd',
            //         gridLineWidth: 0.2,
            //         labels: {
            //             format: '{value}',
            //             style: {
            //                 fontSize: '11px',
            //                 fontFamily: 'Verdana, sans-serif',
            //                 color: '#000'
            //             }
            //         },
            //         title: {
            //             text: 'Total Volume',
            //             style: {
            //                 fontSize: '15px',
            //                 fontFamily: 'Verdana, sans-serif',
            //                 color: '#FF5A79'
            //             }
            //         }
            //     }
            // ],
            tooltip: {
                formatter: function () {
                    return '<b>' + this.x + '</b><br/>' +
                        this.series.name + ': ' + this.y + '<br/>'+
                        'PIT: ' + this.series.userOptions.stack;
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