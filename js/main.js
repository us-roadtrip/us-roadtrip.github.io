var map = d3.select('#main');
var mapWidth = +map.attr('width');
var mapHeight = +map.attr('height');

var centerLatLng = new L.LatLng(41.127050, -96.920826);
var myMap = L.map('map').setView(centerLatLng, 4);


L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 10,
    minZoom: 1,
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1IjoiamFnb2R3aW4iLCJhIjoiY2lnOGQxaDhiMDZzMXZkbHYzZmN4ZzdsYiJ9.Uwh_L37P-qUoeC-MBSDteA'
}).addTo(myMap);


var svgLayer = L.svg();
svgLayer.addTo(myMap);

var svg = d3.select('#main').select('svg');
var nodeLinkG = svg.select('g')
    .attr('class', 'leaflet-zoom-hide');

timeSpentScale = d3.scaleLinear()
    .domain([0.1,72])
    .range([10, 50]);

//location data
d3.csv('https://docs.google.com/spreadsheets/d/e/2PACX-1vTEgHmkVfYGNyB8cu1ncF3eZmawhthRlro1T7zxSGybQ5OYwWTkZvkO2yEYQcPHW1MoFjIRzUpL2LOA/pub?output=csv',
    function(d) {
        return {
            id: +d['id'],
            lat: +d['Lat'],
            lng: +d['Long'],
            time_length: +d['Time Length'],
            name: d['Name'],
            desc: d['Desc'],
            pitstop: +d['Pit Stop'],
            day: +d['Day'],
            album: d['Imgur Album']
        };
    }, function(error, dataset) {
        if (error) {
            console.error(error);
            return;
        }
        data = dataset;

        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var size = parseInt(timeSpentScale(d.time_length));

            var myIcon = L.icon({
                iconUrl: d.pitstop == 1 ? "/img/blue.png" : "/img/pink.png",
                iconSize: [size, size]
            });

            L.marker([d.lat, d.lng], {icon: myIcon}).addTo(myMap)
                .bindPopup(d.name)
                .on('click', function() {
                    var latlng = this.getLatLng();
                    d_case = data.filter(function(d) { return d.lat == latlng.lat && d.lng == latlng.lng })[0];
                    onMarkerClick(d_case);
                })
                .on('popupclose', function() {
                    d3.select("#map_div").attr('class', 'col-12');

                    d3.select('#blog_post').remove();
                    d3.select('#carousel').remove();
                    d3.select("#blog_div").classed('col-6', function() {return false;});
                    
                    myMap.setView(this.getLatLng(), 4);
                });
        }

        //myMap.on('zoomend', updateLayers);

    });

function onMarkerClick(d) {
    //d = data.
    if (d.pitstop != 1 && d.album != "") {
        d3.select("#map_div").attr('class', 'col-6');

        var blog_div = d3.select("#blog_div").attr('class', 'col-6').style('padding-right','50px')

        blog_div.append('foreignObject')
        .attr('id', 'blog_post')
        .html('<h3 align=\"center\">'+ d.name +'</h3>'
            + '<div align=\"center\"><p>' + 'Jan ' + (d.day + 14) + ', 2018'
            + '<br>Time Spent: ' + d.time_length + ' hours </p></div>'
            + '<div align=\"center\"><p>' + d.desc + '</p></div>');

        myMap.setView([d.lat,d.lng], 4);

        var html = "<div id=\"photoCarousel\" class=\"carousel slide\" data-ride=\"carousel\">"
            + "<div class=\"carousel-inner\" role=\"listbox\">"

        var images = getImages(d.album);

        for (var i=0; i < images.length; i++) {

            if (i ==0) {
                html += "<div class=\"carousel-item active\" align = \"center\">";
            } else {
                html += "<div class=\"carousel-item\" align = \"center\">";
            }

            html += ("<img  class=\"d-block img-fluid\" src=\"" + images[i].link + "\""
            + "style=\"height:300px;\">"
            + "</div>");
        }

        html += ("</div>"
            + "<a class=\"carousel-control-prev\" href=\"#photoCarousel\" role=\"button\" data-slide=\"prev\">"
            + "   <span class=\"carousel-control-prev-icon\" aria-hidden=\"true\"></span>"
            + "   <span class=\"sr-only\">Previous</span>"
            + "</a>"
            + "<a class=\"carousel-control-next\" href=\"#photoCarousel\" role=\"button\" data-slide=\"next\">"
            + "   <span class=\"carousel-control-next-icon\" aria-hidden=\"true\"></span>"
            + "   <span class=\"sr-only\">Next</span>"
            + "</a>")
        

        carousel = blog_div.append('foreignObject')
        .attr('id', 'carousel')
        .html(html);
    }
}



function getImages(albumID) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "https://api.imgur.com/3/album/" + albumID, false ); // false for synchronous request
    xmlHttp.setRequestHeader('Authorization', 'Client-ID f169d99a8d8da14');
    xmlHttp.send( null );
    var result = JSON.parse(xmlHttp.responseText);
    return result.data.images;
}



// var colors = ['#4C6085', '#50C5B7', '#736CED', '#9CEC5B', '#39A0ED', '#9D96B8','#DD6E42','#0D1F2D'];
// var activities = ['Sleeping', 'Eating', 'Driving', 'Walking', 'Being Social', 'Downtime', 'Shopping', 'Nightlife'];

// var bars_svg = d3.select('#bars svg');
// var barsWidth = +parseInt(bars_svg.style('width'));
// var barsHeight = +parseInt(bars_svg.style('height'));

// var pie_svg = d3.select('#pie svg');
// var pieWidth = +parseInt(pie_svg.style('width'));
// var pieHeight = +parseInt(pie_svg.style('height'));

// var padding = {t:+50, b:+70, l:+70, r:+50};

// var xScale = d3.scaleLinear()
//     .domain([0,24])
//     .range([0, barsWidth-padding.l-padding.r]);

// var xAxis = bars_svg.append('g')
//     .attr('class', 'xAxis')
//     .attr('transform', 'translate('+[padding.l, padding.t + 10]+')')
//     .call(d3.axisTop(xScale)
//         .tickValues([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23])
//         .tickFormat(function(d) {return d + ':00'}))
//     .selectAll("text")
//         .attr("dx", "2em")
//         .attr("dy", "1.5em")
//         .attr("transform", "rotate(-65)");

// var sumXScale = d3.scaleLinear()
//     .domain([0, activities.length - 1])
//     .range([padding.l, pieWidth - padding.r]);

// var sumXAxis = pie_svg.append('g')
//     .attr('class', 'xAxis')
//     .attr('transform', 'translate('+[(pieWidth - padding.l - padding.r)/(activities.length*2), pieHeight - padding.b]+')')
//     .call(d3.axisBottom(sumXScale)
//         .ticks(activities.length)
//         .tickFormat(function(d) {return activities[d]}))
//     .selectAll("text")
//         .attr("dx", "-1em")
//         .attr("dy", "0em")
//         .attr("transform", "rotate(-65)")
//         .attr('text-anchor', 'end');

//hour data
// d3.csv('https://docs.google.com/spreadsheets/d/e/2PACX-1vS0U5fYMmF47RZsUfuW_psDoMnyxo_OjJO3pzHXDnkQ4HPCyn4kZMj_HAZblNFfHZGbHuEvmHWJSZn3/pub?output=csv',
//     function(d) {
//         return {
//             day: +d['Day'],
//             hour: +d['Hour'],
//             activity: +d['Activity']
//         };
//     }, function(error, dataset) {
//         if (error) {
//             console.error(error);
//             return;
//         }
//         hour_data = dataset;

//         var yScale = d3.scaleLinear()
//             .domain([0,d3.max(hour_data, function(d) {return d.day})])
//             .range([0, barsHeight-padding.t-padding.b]);

//         var bars = bars_svg.selectAll('.bar').data(hour_data);

//         bars.enter().append('rect')
//             .attr('width', (barsWidth-padding.l-padding.r)/24 - 4)
//             .attr('height', (barsHeight-padding.t-padding.b)/(d3.max(hour_data, function(d) {return d.day})) - 8)
//             .attr('x', function(d) {return padding.l + xScale(d.hour)})
//             .attr('y', function(d) {return padding.t + yScale(d.day)})
//             .style('fill', function(d) {return d.activity == -1 ? '#fff' : colors[d.activity]});


//         days_nested = d3.nest()
//             .key(function(d) {return d.day;})
//             .rollup(function(v) {return d3.sum(v, function(d) {return d.activity})})
//             .entries(hour_data);

//         dateLabels = bars_svg.selectAll('.dateLabel').data(days_nested);

//         dateLabels.enter().append('text')
//             .text(function(d) {
//                     return d.value > -24 ? "Jan " + (parseInt(d.key) + 14) + ", 2018" : "";
//                 })
//             .attr('text-anchor', 'end')
//             .attr('transform', function(d) {return 'translate(' +[padding.l-10, 10 + padding.t + yScale(+d.key)]+ ')'})
//             .style('font-size', 10);

//         //excludes -1
//         activity_nested = d3.nest()
//             .key(function(d) {return d.activity})
//             .entries(hour_data)
//             .filter(function(d) {return d.key != -1});

//         console.log(d3.max(activity_nested, function(d) {return d.values.length}));

//         var sumYScale = d3.scaleLinear()
//             .domain([0, d3.max(activity_nested, function(d) {return d.values.length})])
//             .range([padding.b, pieHeight - padding.t - padding.b]);

//         yScaleAxis = d3.scaleLinear()
//             .domain([0, d3.max(activity_nested, function(d) {return d.values.length})])
//             .range([pieHeight - padding.t, padding.b]);

//         var sumYAxis = pie_svg.append('g')
//             .attr('class', 'yAxis')
//             .attr('transform', 'translate('+[padding.l,-padding.t + 30]+')')
//             .call(d3.axisLeft(yScaleAxis))
//                 //.tickFormat(function(d) {d + ' hours'}))
//             .selectAll("text")
//                 .attr('text-anchor', 'end');


//         barsSum = pie_svg.selectAll('.sumBar').data(activity_nested);

//         barsSum.enter().append('rect')
//             .attr('width', (pieWidth - padding.l - padding.r)/activities.length)
//             .attr('height', function(d) {console.log(d.values.length);return sumYScale(d.values.length)})
//             .attr('x', function(d) {return sumXScale(d.key)})
//             .attr('y', function(d) {return pieHeight - padding.b - sumYScale(d.values.length)})
//             .attr('fill', function(d) {return colors[parseInt(d.key)]});

//     });

// middle = Math.min(pieWidth, pieHeight) / 2;

// var g = pie_svg.append('g').attr('transform', 'translate(' + [middle,middle+30] + ')');

// var pie = d3.pie()
//     .sort(null)
//     .value(function(d) { return d.key == -1 ? 0 : d.values.length; });

// var radius = Math.min(pieWidth, pieHeight) / 2;

// var path = d3.arc()
//     .outerRadius(radius - 10)
//     .innerRadius(0);

// var label = d3.arc()
//     .outerRadius(radius)
//     .innerRadius(radius);