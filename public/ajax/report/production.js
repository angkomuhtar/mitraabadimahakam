$(function(){

    console.log('ajax/report/production.js');

    var body = $('body')

    initFilter()

    $('body').on('change', 'select[name="site_id"]', function(){
        var values = $(this).val()
        if(values){
            body.find('div#select-pit').css('display', 'none')
            body.find('div#select-production-type').css('display', 'inline')
            
        }else{
            body.find('div#select-pit').html('')
            body.find('div#select-production-type').css('display', 'none')
            body.find('div#select-range-type').css('display', 'none')
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
                },
                error: function(err){
                    console.log(err);
                },
                complete: function(){
                    console.log('finish...');
                    body.find('div#select-duration-type').css('display', 'inline')
                }
            })
        }
        if(values === 'PW'){
            body.find('div#select-pit').css('display', 'none')
            body.find('div#select-duration-type').css('display', 'inline')
            body.find('select[name="pit_id"]').val('')
        }
        if(!values){
            body.find('div#select-pit').css('display', 'none')
            body.find('div#select-duration-type').css('display', 'none')
            body.find('select[name="pit_id"]').val('')
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
                body.find('div#box-daily').css('display', 'inline')
                body.find('div#box-site').css('display', 'inline')
                body.find('div#box-pit').css('display', 'inline')
                body.find('div#box-shift').css('display', 'none')
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
                // console.log(result)
                if(result.group === 'MW'){
                    showChart_MW(result)
                }else{
                    showChart_PW(result)
                }
            },
            error: function(err){
                console.log(err)
            }
        })
        console.log('...');
    })

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
        let arrDate = result.data.map(elm => moment(elm.date).format('DD MMM YYYY'))
        if(result.filterType === "MONTHLY"){
            arrDate = result.data.map(elm => moment(elm.date).format('MMM YYYY'))
        }
        if(result.filterType === "WEEKLY"){
            arrDate = result.data.map(elm => elm.date)
        }
        if(result.filterType === "HOURLY"){
            arrDate = result.data.map(elm => elm.date)
        }
        let arrTarget = result.data.map(elm => parseFloat(elm.avg_target))
        let arrVolume = result.data.map(elm => elm.sum_volume)
        let arrRit = result.data.map(elm => (elm.sum_rit))
        $('b#pit-area').html(result.pit)
        $('b#begin-date').html(result.periode.start)
        $('b#end-date').html(result.periode.end)
        $('b#shift-schedule').html(result.shift)
        let isStack = result.filterType === "SHIFT" ? true : false
        BAR_CHART_MW(arrDate, arrVolume, arrTarget, arrRit, isStack)
    }

    function showChart_PW(result){
        let xAxis = result.x_Axis
        let series = result.data.map( el => {
            return {
                name: el.nm_pit,
                type: 'column',
                stack: el.nm_pit,
                data: el.items.map( val => val.actual)
            }
        })

        BAR_CHART_PW(xAxis, series)
    }

    function BAR_CHART_MW (arrDate, arrVolume, arrTarget, arrRit, isStack) {
        let series
        if(isStack){
            series = [
                {
                    name: 'Day Shift',
                    type: 'column',
                    color: '#FFD41B',
                    data: arrVolume,
                    stack: 'actual'
                }, {
                    name: 'Night Shift',
                    type: 'column',
                    color: '#1A1FA7',
                    data: arrRit,
                    stack: 'actual'
                }, {
                    name: 'Target',
                    type: 'column',
                    color: '#A8A6A6',
                    data: arrTarget,
                    stack: 'target'
                }
            ]
        }else{
            series = [
                {
                    name: 'Volume',
                    type: 'column',
                    color: '#FF5A79',
                    data: arrVolume,
                    stack: 'actual',
                    tooltip: {
                        valueSuffix: ' bcm'
                    }
    
                }, {
                    name: 'Target',
                    type: 'column',
                    color: '#A8A6A6',
                    data: arrTarget,
                    stack: 'target',
                    tooltip: {
                        valueSuffix: ' bcm'
                    }
                }, {
                    name: 'Trends',
                    type: 'spline',
                    color: '#41b3f9',
                    lineWidth: 1,
                    data: arrVolume,
                }
            ]
        }

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
                        color: '#000'
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
                            color: '#000'
                        }
                    },
                    title: {
                        text: 'Total Volume BCM',
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
                        this.series.name + ': ' + this.y + '<br/>' +
                        'Total: ' + this.point.stackTotal;
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

    function BAR_CHART_PW (xAxis, series) {
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
                { // Primary yAxis
                    gridLineColor: '#ddd',
                    gridLineWidth: 0.2,
                    labels: {
                        format: '{value} BCM',
                        style: {
                            fontSize: '11px',
                            fontFamily: 'Verdana, sans-serif',
                            color: '#000'
                        }
                    },
                    title: {
                        text: 'Total Volume BCM',
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
                        this.series.name + ': ' + this.y + '<br/>' +
                        'Total: ' + this.point.stackTotal;
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