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
                PIT_WISE_CHART(result)
                body.find('div#box-chart').css('display', 'inline')
            },
            error: function(err){
                console.log(err)
                body.find('div#box-chart').css('display', 'none')
            }
        })
        console.log('...');
    })

    // $('body').on('click', 'button#bt-generate-pdf', function(e){
    //     e.preventDefault()
    //     let data = {
    //         site_id: $('select[name="site_id"]').val(),
    //         pit_id: $('select[name="pit_id"]').val(),
    //         production_type: $('select[name="production_type"]').val(),
    //         range_type: $('select[name="range_type"]').val(),
    //         filterType: $('select[name="filterType"]').val(),
    //         start: $('input[name="start"]').val(),
    //         end: $('input[name="end"]').val(),
    //         date: $('input[name="date"]').val()
    //     }

    //     domtoimage.toBlob(document.getElementById('container'))
    //     .then(function (blob) {
    //         console.log(blob);
    //         blob.fileName = 'chart.png'
    //         blob.extname = 'png'
    //         blob.extname = 'png'
    //         var fd = new FormData()
    //         fd.append('fname', 'chart.png');
    //         fd.append('chartImg', blob);
    //         fd.append('site_id', data.site_id);
    //         fd.append('pit_id', data.pit_id);
    //         fd.append('production_type', data.production_type);
    //         fd.append('range_type', data.range_type);
    //         fd.append('filterType', data.filterType);
    //         fd.append('start_date', data.start_date);
    //         fd.append('end_date', data.end_date);
    //         fd.append('month_begin', data.month_begin);
    //         fd.append('month_end', data.month_end);
    //         fd.append('week_begin', data.week_begin);
    //         fd.append('week_end', data.week_end);
    //         fd.append('date', data.date);
    //         fd.append('shift_id', data.shift_id);
    //         $.ajax({
    //             async: true,
    //             url: '/report/production/gen-data-pdf',
    //             method: 'POST',
    //             data: fd,
    //             dataType: 'json',
    //             processData: false,
    //             mimeType: "multipart/form-data",
    //             contentType: false,
    //             success: function(result){
    //                 console.log(result)
    //                 GEN_PDF(result)
    //             },
    //             error: function(err){
    //                 console.log(err)
    //             }
    //         })
    //     });
    // })

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

    function PIT_WISE_CHART (result){

        BAR_CHART_PIT_WISE(result.xAxis, result.series)
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

    function BAR_CHART_PIT_WISE (arrDate, series) {

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





// Highcharts.chart('container', {
//     chart: {
//         zoomType: 'xy'
//     },
//     title: {
//         text: 'Average Monthly Temperature and Rainfall in Tokyo'
//     },
//     subtitle: {
//         text: 'Source: WorldClimate.com'
//     },
//     xAxis: [{
//         categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//         crosshair: true
//     }],
//     yAxis: [{ // Primary yAxis
//         labels: {
//             format: '{value}°C',
//             style: {
//                 color: Highcharts.getOptions().colors[1]
//             }
//         },
//         title: {
//             text: 'Temperature',
//             style: {
//                 color: Highcharts.getOptions().colors[1]
//             }
//         }
//     }, { // Secondary yAxis
//         title: {
//             text: 'Rainfall',
//             style: {
//                 color: Highcharts.getOptions().colors[0]
//             }
//         },
//         labels: {
//             format: '{value} mm',
//             style: {
//                 color: Highcharts.getOptions().colors[0]
//             }
//         },
//         opposite: true
//     }],
//     tooltip: {
//         shared: true
//     },
//     legend: {
//         layout: 'vertical',
//         align: 'left',
//         x: 120,
//         verticalAlign: 'top',
//         y: 100,
//         floating: true,
//         backgroundColor:
//             Highcharts.defaultOptions.legend.backgroundColor || // theme
//             'rgba(255,255,255,0.25)'
//     },
//     series: [{
//         name: 'Rainfall',
//         type: 'column',
//         yAxis: 1,
//         data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
//         tooltip: {
//             valueSuffix: ' mm'
//         }

//     }, {
//         name: 'Temperature',
//         type: 'spline',
//         data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
//         tooltip: {
//             valueSuffix: '°C'
//         }
//     }]
// });