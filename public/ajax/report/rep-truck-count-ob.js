$(function(){
    var body = $('body')


    initDefault()

    // showBarChart()
    // showTable()

    $('body').on('change', 'select[name="site_id"]', function(){
        var values = $(this).val() || ''
        var elm = body.find('select[name="pit_id"]')
        if(values){
            body.find('div#box-pit').css('display', 'inline')
            $.ajax({
                async: true,
                url: '/ajax/pit-by-site?site_id='+values,
                method: 'GET',
                dataType: 'html',
                success: function(data){
                    console.log(data);
                    elm.html(data)
                },
                error: function(err){
                    console.log(err);
                }
            })
        }else{
            body.find('div#box-pit').css('display', 'none')
        }
    })

    $('body').on('change', 'select[name="filterType"]', function(){
        var values = $(this).val()
        body.find('div.container-type').css('display', 'none')
        // body.find('div.container-type').children('select, input').val()
        switch (values) {
            case 'MONTHLY':
                body.find('div#box-monthly').css('display', 'inline')
                body.find('div#box-site').css('display', 'inline')
                body.find('div#box-pit').css('display', 'inline')
                break;
            case 'WEEKLY':
                body.find('div#box-weekly').css('display', 'inline')
                body.find('div#box-site').css('display', 'inline')
                body.find('div#box-pit').css('display', 'inline')
                break;
            case 'SHIFT':
                body.find('div#box-date').css('display', 'inline')
                body.find('div#box-site').css('display', 'inline')
                body.find('div#box-pit').css('display', 'inline')
                body.find('div#box-shift').css('display', 'inline')
                break;
            case 'HOURLY':
                body.find('div#box-date').css('display', 'inline')
                body.find('div#box-site').css('display', 'inline')
                body.find('div#box-pit').css('display', 'inline')
                body.find('div#box-shift').css('display', 'inline')
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
            url: '/report/over-borden/data-graph-ob',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result)
                let arrDate = result.data.map(elm => moment(elm.date).format('DD MMM YYYY'))
                if(result.filterType === "MONTHLY"){
                    arrDate = result.data.map(elm => moment(elm.date).format('MMM YYYY'))
                }
                if(result.filterType === "WEEKLY"){
                    arrDate = result.data.map(elm => elm.date)
                }
                let arrTarget = result.data.map(elm => parseFloat(elm.avg_target))
                let arrVolume = result.data.map(elm => elm.sum_volume)
                let arrRit = result.data.map(elm => (elm.sum_rit))
                $('b#pit-area').html(result.pit)
                $('b#begin-date').html(result.periode.start)
                $('b#end-date').html(result.periode.end)
                $('b#shift-schedule').html(result.shift)
                switch (result.chartType) {
                    case "BAR":
                        if(result.filterType === 'SHIFT'){
                            let seriesData = [
                                {
                                    name: 'NIGHT SHIFT',
                                    color: '#1A1FA7',
                                    data: result.data[0].ns,
                                },
                                {
                                    name: 'DAY SHIFT',
                                    color: '#FFD41B',
                                    data: result.data[0].ds,
                                },
                                {
                                    name: 'DS Trends',
                                    type: 'spline',
                                    color: '#E5C17A',
                                    lineWidth: 1,
                                    data: result.data[0].ds,
                                },
                                {
                                    name: 'TOT.Trends',
                                    type: 'spline',
                                    color: '#82C1FF',
                                    lineWidth: 1,
                                    data: result.data[0].tot,
                                }
                            ]
                            BAR_CHART_SHIFT(arrDate, seriesData)
                        }else{
                            BAR_CHART(arrDate, arrVolume, arrTarget, arrRit)
                        }
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
                // if(result.data > 0){
                // }else{
                //     swal("Opps,,,!", 'error data parsing...', "warning")
                // }
            },
            error: function(err){
                console.log(err)
            }
        })
        console.log('...');
    })

    $('body').on('click', 'button#reset-filter', function(){
        showBarChart()
        showTable()
    })

    function initDefault(){
        $.ajax({
            async: true,
            url: '/report/over-borden/view-graph-ob',
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

    // function showTable(uri){
    //     $.ajax({
    //         async: true,
    //         url: uri || '/report/over-borden/view-table-ob',
    //         method: 'GET',
    //         dataType: 'html',
    //         beforeSend: function(){
    //             $('body').find('div#container').html('<img src="../images/animation_500_kzw42wnp.gif" width="200" height="200" alt="user">')
    //         },
    //         success: function(result){
    //             $('body').find('div#data-table').html(result)
    //         },
    //         error: function(err){
    //             console.log(err);
    //         }
    //     })
    // }

    // Create the chart
    // function showBarChart(uri){
    //     $.ajax({
    //         async: true,
    //         url: uri || '/report/over-borden/data-graph-ob',
    //         method: 'GET',
    //         dataType: 'json',
    //         beforeSend: function(){
    //             $('body').find('div#container').html('<img src="../images/animation_500_kzw42wnp.gif" width="200" height="200" alt="user">')
    //         },
    //         success: function(result){
    //             let arrDate = result.data.map(elm => moment(elm.date).format('DD MMM YYYY'))
    //             let arrTarget = result.data.map(elm => parseFloat(elm.avg_target))
    //             let arrVolume = result.data.map(elm => elm.sum_volume)
    //             let arrRit = result.data.map(elm => (elm.sum_rit))
    //             $('b#pit-area').html(result.pit)
    //             $('b#begin-date').html(result.periode.start)
    //             $('b#end-date').html(result.periode.end)
    //             $('b#shift-schedule').html(result.shift)
    //             // console.log(arrTarget);
    //             var chartType = $('select[name="graph-type"]').val()
    //             switch (chartType) {
    //                 case "BAR":
    //                     BAR_CHART(arrDate, arrVolume, arrTarget, arrRit)
    //                     break;
    //                 case "LINEAREA":
    //                     LINEAREA_CHART(arrDate, arrVolume, arrTarget, arrRit)
    //                     break;
    //                 case "LINE":
    //                     LINE_CHART(arrDate, arrVolume, arrTarget, arrRit)
    //                     break;
                
    //                 default:
    //                     break;
    //             }
                
    //         },
    //         error: function(err){
    //             console.log(err);
    //         }
    //     })
    // }

    

    function BAR_CHART (arrDate, arrVolume, arrTarget, arrRit) {
        Highcharts.chart('container', {
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: 'Over Burden Production By Truck Count'
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
                    color: '#75A5E3',
                    yAxis: 0,
                    data: arrVolume,
                    tooltip: {
                        valueSuffix: ' bcm'
                    }
    
                },
                {
                    name: 'Target',
                    type: 'column',
                    color: '#015CB1',
                    data: arrTarget,
                    tooltip: {
                        valueSuffix: ' bcm'
                    }
                },
                {
                    name: 'Trends',
                    type: 'spline',
                    color: '#41b3f9',
                    lineWidth: 1,
                    data: arrVolume,
                }
            ]
        });
    }

    function BAR_CHART_SHIFT(arrDate, seriesData){
        Highcharts.chart('container', {

            chart: {
                type: 'column'
            },
        
            title: {
                text: 'Over Burden Production By Truck Count'
            },
        
            xAxis: {
                categories: arrDate
            },
        
            yAxis: {
                allowDecimals: false,
                min: 0,
                title: {
                    text: 'Number of fruits'
                }
            },
        
            tooltip: {
                formatter: function () {
                    return '<b>' + this.x + '</b><br/>' +
                        this.series.name + ': ' + this.y + '<br/>' +
                        'Total: ' + this.point.stackTotal;
                }
            },
        
            plotOptions: {
                column: {
                    stacking: 'normal'
                }
            },
        
            series: seriesData
        });
    }

    function LINEAREA_CHART(arrDate, arrVolume, arrTarget, arrRit){
        Highcharts.chart('container', {
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: 'Over Burden Production By Truck Count'
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
                    name: 'Target',
                    type: 'area',
                    color: 'rgba(48, 50, 56, 0.1)',
                    data: arrTarget,
                    tooltip: {
                        valueSuffix: ' bcm'
                    }
                },
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
                text: 'Over Burden Production By Truck Count'
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
                    color: '#79fc14',
                    yAxis: 0,
                    lineWidth: 1,
                    data: arrVolume,
                    tooltip: {
                        valueSuffix: ' bcm'
                    }
    
                },
                {
                    name: 'Target',
                    type: 'spline',
                    color: '#015CB1',
                    lineWidth: 1,
                    data: arrTarget,
                    tooltip: {
                        valueSuffix: ' bcm'
                    }
                },
                // {
                //     name: 'Ritase',
                //     type: 'spline',
                //     color: '#FF0000',
                //     lineWidth: 1,
                //     data: arrRit,
                //     tooltip: {
                //         valueSuffix: ' rit'
                //     }
                // }
            ]
        });
    }
})

