$(function(){
    var body = $('body')


    initDefault()

    showBarChart()
    showTable()

    $('body').on('change', 'select[name="filter-type"]', function(){
        var values = $(this).val()
        body.find('div.container-type').css('display', 'none')
        // body.find('div.container-type').children('select, input').val()
        switch (values) {
            case 'MONTHLY':
                body.find('div#box-monthly').css('display', 'inline')
                body.find('div#box-site').css('display', 'inline')
                break;
            case 'WEEKLY':
                body.find('div#box-weekly').css('display', 'inline')
                body.find('div#box-site').css('display', 'inline')
                break;
            case 'DAILY':
                body.find('div#box-daily').css('display', 'inline')
                body.find('div#box-site').css('display', 'inline')
                break;
            case 'SHIFT':
                body.find('div#box-daily').css('display', 'inline')
                body.find('div#box-site').css('display', 'inline')
                body.find('div#box-shift').css('display', 'inline')
                break;
            case 'HOURLY':
                body.find('div#box-daily').css('display', 'inline')
                body.find('div#box-site').css('display', 'inline')
                body.find('div#box-shift').css('display', 'inline')
                break;
            default:
                body.find('div#box-date').css('display', 'inline')
                body.find('div#box-site').css('display', 'inline')
                body.find('div#box-date').css('display', 'inline')
                break;
        }
    })

    $('body').on('change', 'select[name="graph-type"]', function(){
        var values = $(this).val()
        console.log(values);
        showBarChart()
        // switch (values) {
        //     case 'BAR':
        //         showBarChart()
        //         break;
        //     case 'LINEAREA':
        //         showBarChart()
        //         break;
        
        //     default:
        //         break;
        // }
    })

    

    $('body').on('click', 'button#apply-filter', function(){
        var elm = $('body')
        var graphtype = elm.find('select[name="graph-type"]').val() && '&graphtype=' + elm.find('select[name="graph-type"]').val()
        var filtertype = elm.find('select[name="filter-type"]').val() && '&filtertype=' + elm.find('select[name="filter-type"]').val()
        var bydate = elm.find('input[name="date"]').val() && '&date=' + elm.find('input[name="date"]').val()
        var month_begin = elm.find('input[name="month_begin"]').val() && '&month_begin=' + elm.find('input[name="month_begin"]').val()
        var month_end = elm.find('input[name="month_end"]').val() && '&month_end=' + elm.find('input[name="month_end"]').val()
        var week_begin = elm.find('input[name="week_begin"]').val() && '&week_begin=' + elm.find('input[name="week_begin"]').val()
        var week_end = elm.find('input[name="week_end"]').val() && '&week_end=' + elm.find('input[name="week_end"]').val()
        var start_date = elm.find('input[name="start_date"]').val() && '&start_date=' + elm.find('input[name="start_date"]').val()
        var end_date = elm.find('input[name="end_date"]').val() && '&end_date=' + elm.find('input[name="end_date"]').val()
        var shift_id = elm.find('select[name="shift_id"]').val() && '&shift_id=' + elm.find('select[name="shift_id"]').val()
        var site_id = elm.find('select[name="site_id"]').val() && '&site_id=' + elm.find('select[name="site_id"]').val()
        var pit_id = elm.find('select[name="pit_id"]').val() && '&pit_id=' + elm.find('select[name="pit_id"]').val()

        
        var uri = '/report/over-borden/data-graph-ob?filter=true'+ graphtype + filtertype + bydate + month_begin + month_end + week_begin + week_end + site_id + start_date + end_date + shift_id + pit_id
        var uriTable = '/report/over-borden/view-table-ob?filter=true'+ graphtype + filtertype + bydate + month_begin + month_end + week_begin + week_end + site_id + start_date + end_date + shift_id + pit_id
        console.log(uri);
        showBarChart(uri)
        showTable(uriTable)
    })

    $('body').on('click', 'button#reset-filter', function(){
        showBarChart()
        showTable()
    })

    function showTable(uri){
        $.ajax({
            async: true,
            url: uri || '/report/over-borden/view-table-ob',
            method: 'GET',
            dataType: 'html',
            success: function(result){
                $('body').find('div#data-table').html(result)
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    // Create the chart
    function showBarChart(uri){
        $.ajax({
            async: true,
            url: uri || '/report/over-borden/data-graph-ob',
            method: 'GET',
            dataType: 'json',
            success: function(result){
                let arrDate = result.data.map(elm => moment(elm.date).format('DD MMM YYYY'))
                let arrTarget = result.data.map(elm => parseFloat((elm.avg_target).toFixed(2)))
                let arrVolume = result.data.map(elm => elm.sum_volume)
                let arrRit = result.data.map(elm => (elm.sum_rit))
                $('b#pit-area').html(result.pit)
                $('b#begin-date').html(result.periode.start)
                $('b#end-date').html(result.periode.end)
                $('b#shift-schedule').html(result.shift)
                // console.log(arrTarget);
                var chartType = $('select[name="graph-type"]').val()
                switch (chartType) {
                    case "BAR":
                        BAR_CHART(arrDate, arrVolume, arrTarget, arrRit)
                        break;
                    case "LINEAREA":
                        LINEAREA_CHART(arrDate, arrVolume, arrTarget, arrRit)
                        break;
                    case "LINE":
                        LINE_CHART(arrDate, arrVolume, arrTarget, arrRit)
                        break;
                
                    default:
                        break;
                }
                
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    function initDefault(){
        $.ajax({
            async: true,
            url: '/report/over-borden/view-graph-ob',
            method: 'GET',
            success: function(result){
                // console.log(result);
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

    function BAR_CHART (arrDate, arrVolume, arrTarget, arrRit) {
        Highcharts.chart('container', {
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: 'Over Borden Production By Truck Count'
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
                        color: '#ddd'
                    }
                },
                crosshair: true
            }],
            yAxis: [
                { // Primary yAxis
                    gridLineColor: '#ddd',
                    gridLineWidth: 0.2,
                    labels: {
                        format: '{value} BCM',
                        style: {
                            fontSize: '11px',
                            fontFamily: 'Verdana, sans-serif',
                            color: '#ddd'
                        }
                    },
                    title: {
                        text: 'Total Volume BCM',
                        style: {
                            fontSize: '15px',
                            fontFamily: 'Verdana, sans-serif',
                            color: '#ddd'
                        }
                    }
                }
            ],
            tooltip: {
                shared: true
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                x: 120,
                verticalAlign: 'top',
                y: 50,
                floating: true,
                backgroundColor:
                    Highcharts.defaultOptions.legend.backgroundColor || // theme
                    'rgba(255,255,255,0.25)'
            },
            series: [
                {
                    name: 'Volume',
                    type: 'column',
                    yAxis: 0,
                    data: arrVolume,
                    tooltip: {
                        valueSuffix: ' bcm'
                    }
    
                },
                {
                    name: 'Target',
                    type: 'column',
                    color: '#2f323e',
                    data: arrTarget,
                    tooltip: {
                        valueSuffix: ' bcm'
                    }
                },
                {
                    name: 'Ritase',
                    type: 'spline',
                    color: '#FF0000',
                    data: arrRit,
                    tooltip: {
                        valueSuffix: ' rit'
                    }
                }
            ]
        });
    }

    function LINEAREA_CHART(arrDate, arrVolume, arrTarget, arrRit){
        Highcharts.chart('container', {
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: 'Over Borden Production By Truck Count'
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
                        color: '#ddd'
                    }
                },
                crosshair: true
            }],
            yAxis: [
                { // Primary yAxis
                    gridLineColor: '#ddd',
                    gridLineWidth: 0.2,
                    labels: {
                        format: '{value} BCM',
                        style: {
                            fontSize: '11px',
                            fontFamily: 'Verdana, sans-serif',
                            color: '#ddd'
                        }
                    },
                    title: {
                        text: 'Total Volume BCM',
                        style: {
                            fontSize: '15px',
                            fontFamily: 'Verdana, sans-serif',
                            color: '#ddd'
                        }
                    }
                }
            ],
            tooltip: {
                shared: true
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                x: 120,
                verticalAlign: 'top',
                y: 50,
                floating: true,
                backgroundColor:
                    Highcharts.defaultOptions.legend.backgroundColor || // theme
                    'rgba(255,255,255,0.25)'
            },
            series: [
                {
                    name: 'Volume',
                    type: 'area',
                    yAxis: 0,
                    data: arrVolume,
                    tooltip: {
                        valueSuffix: ' bcm'
                    }
    
                },
                {
                    name: 'Target',
                    type: 'area',
                    color: '#2f323e',
                    data: arrTarget,
                    tooltip: {
                        valueSuffix: ' bcm'
                    }
                },
                {
                    name: 'Ritase',
                    type: 'spline',
                    color: '#FF0000',
                    data: arrRit,
                    tooltip: {
                        valueSuffix: ' rit'
                    }
                }
            ]
        });
    }

    function LINE_CHART(arrDate, arrVolume, arrTarget, arrRit){
        Highcharts.chart('container', {
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: 'Over Borden Production By Truck Count'
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
                        color: '#ddd'
                    }
                },
                crosshair: true
            }],
            yAxis: [
                { // Primary yAxis
                    gridLineColor: '#ddd',
                    gridLineWidth: 0.2,
                    labels: {
                        format: '{value} BCM',
                        style: {
                            fontSize: '11px',
                            fontFamily: 'Verdana, sans-serif',
                            color: '#ddd'
                        }
                    },
                    title: {
                        text: 'Total Volume BCM',
                        style: {
                            fontSize: '15px',
                            fontFamily: 'Verdana, sans-serif',
                            color: '#ddd'
                        }
                    }
                }
            ],
            tooltip: {
                shared: true
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                x: 120,
                verticalAlign: 'top',
                y: 50,
                floating: true,
                backgroundColor:
                    Highcharts.defaultOptions.legend.backgroundColor || // theme
                    'rgba(255,255,255,0.25)'
            },
            series: [
                {
                    name: 'Volume',
                    type: 'spline',
                    yAxis: 0,
                    data: arrVolume,
                    tooltip: {
                        valueSuffix: ' bcm'
                    }
    
                },
                {
                    name: 'Target',
                    type: 'spline',
                    color: '#2f323e',
                    data: arrTarget,
                    tooltip: {
                        valueSuffix: ' bcm'
                    }
                },
                {
                    name: 'Ritase',
                    type: 'spline',
                    color: '#FF0000',
                    data: arrRit,
                    tooltip: {
                        valueSuffix: ' rit'
                    }
                }
            ]
        });
    }
})

