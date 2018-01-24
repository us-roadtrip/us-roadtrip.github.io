var map = d3.select('#main');
var mapWidth = +map.attr('width');
var mapHeight = +map.attr('height');

var centerLatLng = new L.LatLng(41.127050, -96.920826);
var myMap = L.map('map').setView(centerLatLng, 4);


L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 10,
    minZoom: 3,
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1IjoiamFnb2R3aW4iLCJhIjoiY2lnOGQxaDhiMDZzMXZkbHYzZmN4ZzdsYiJ9.Uwh_L37P-qUoeC-MBSDteA'
}).addTo(myMap);


var svgLayer = L.svg();
svgLayer.addTo(myMap);

var svg = d3.select('#main').select('svg');
var nodeLinkG = svg.select('g')
    .attr('class', 'leaflet-zoom-hide');

timeSpentScale = d3.scaleLinear()
    .domain([0.1,86])
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

        myMap.setView([d.lat,d.lng + 10], 4);

        var html = "<div id=\"photoCarousel\" class=\"carousel slide\" data-ride=\"carousel\">"
            + "<div class=\"carousel-inner\" role=\"listbox\">"

        var images = getImages(d.album);

        for (var i=0; i < images.length; i++) {

            if (i ==0) {
                html += "<div class=\"carousel-item active\" align = \"center\" style=\"height: 300px;\">";
            } else {
                html += "<div class=\"carousel-item\" align = \"center\" style=\"height: 300px;\">";
            }

            html += ("<div class=\"wraptocenter\"><span></span><img class=\"d-block img-fluid\" src=\"" + images[i].link + "\">"
            + "</div></div>");
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
