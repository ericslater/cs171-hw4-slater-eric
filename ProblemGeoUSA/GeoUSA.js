/**
 * Created by hen on 3/8/14.
 */

var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};


var width = 1060 - margin.left - margin.right;
var height = 800 - margin.bottom - margin.top;
var centered;

var visHeight = 200
var visWidth = 300

var bbVis = {
    x: 100,
    y: 10,
    w: width - 100,
    h: 300
};

var detailVis = d3.select("#detailVis").append("svg").attr({
    width:400,
    height:325
})
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

dailyHours = ["12:00 AM", "1:00 AM", "2:00 AM", "3:00 AM", "4:00 AM", "5:00 AM", "6:00 AM", "7:00 AM", 
                "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM",
                "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", 
                "11:00 PM"]

// vis scale
var xVis = d3.scale.ordinal()
    .domain(dailyHours)
    .rangeRoundBands([0, visWidth], 0.05);

var yVis = d3.scale.linear()
    .range([visHeight, 0]);
    
// vis axes
var xAxis = d3.svg.axis()
    .scale(xVis)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(yVis)
    .orient("left")
    .ticks(10);

var canvas = d3.select("#vis").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
    })

var svg = canvas.append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });

var g = svg.append("g");

var projection = d3.geo.albersUsa().translate([width / 2, height / 2]);//.precision(.1);
var path = d3.geo.path().projection(projection);

var dataSet = {};

var toolMe = true
var scaleMe

// going to use these to find min and max values
var min = Infinity
var max = -Infinity

function loadStations() {
    d3.csv("../data/NSRDB_StationsMeta.csv",function(error,data) {
        d3.json("../data/reducedMonthStationHour2003_2004.json", function(error,data2) {


            // because the directions were somewhat misleading, I have all of my data
            // grouped monthly as shown in the homework diagram, but now we will make
            // it aggregate, no biggie!
            var totalSum = {sum: {}, hourly: {}}
            for (var months in data2) {
                for (var locats in data2[months]) {
                    if (totalSum.sum[locats] == undefined)
                        totalSum.sum[locats] = data2[months][locats]["sum"]
                    else
                        totalSum.sum[locats] += data2[months][locats]["sum"]

                    for (var hours in data2[months][locats]["hourly"]) {
                        if (totalSum.hourly[locats] == undefined)
                            totalSum.hourly[locats] = {}

                        if (totalSum.hourly[locats][hours] == undefined)
                            totalSum.hourly[locats][hours] = data2[months][locats]["hourly"][hours]
                        else 
                            totalSum.hourly[locats][hours] += data2[months][locats]["hourly"][hours]
                    }
                }
            }

            // use a Twin Cities data point as my starting 
            // data for bar chart ( I am from MN :) )
            var startPointName = "MINNEAPOLIS/CRYSTAL"
            var startPointID = "726575"

            var hrArray = []
            // put data into an array to be used in graphing
            for (var hour in totalSum.hourly[startPointID]) {
                hrArray.push(totalSum.hourly[startPointID][hour])
            }

            yVis.domain([0, d3.max(hrArray)]);

            // append x axis
            detailVis.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + visHeight + ")")
                .call(xAxis)
              .selectAll("text")
                .attr("y", 5)
                .attr("x", -10)
                .attr("dy", ".35em")
                .attr("transform", "rotate(-60)")
                .style("text-anchor", "end");

            // append y axis
            detailVis.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate("+ visWidth +",0)")
                .call(yAxis)
              .selectAll("text")
                .attr("x", 3)
                .attr("dy", ".35em")
                .style("text-anchor", "start");

            // append bars
            detailVis.selectAll(".bar")
                .data(hrArray)
              .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d, i) { 
                    return xVis(dailyHours[i]);
                })
                .attr("width", xVis.rangeBand())
                .attr("y", function(d) { return yVis(d); })
                .attr("fill", "#82AFCF")
                .attr("height", function(d) { 
                    return visHeight - yVis(d); 
                }); 

            // bar chart title/Location
            var myTitle = detailVis.append("svg:text")
                                    .text(startPointName);

            var myBiggerTitle = svg.append("svg:text")
                                    .text("National Solar Radiation Stations and Data (2003-2004)")
                                    .attr("dx", width/2 - 300 + "px")
                                    .attr("dy", height/10 + "px")
                                    .attr("id", "myLovelyTitle");

            // find the min and max    
            for( x in totalSum.sum) {
                if( totalSum.sum[x] < min && totalSum.sum[x] !== 0) min = totalSum.sum[x];
                if( totalSum.sum[x] > max) max = totalSum.sum[x];
            }

            // define our scale
            scaleMe = d3.scale.linear().domain([min,max]).range([2,6])

            // make sure we don't have any null values
            function notNull(e) {
                if (projection([e["NSRDB_LON(dd)"], e["NSRDB_LAT (dd)"]]) !== null)
                    return e;
            }
            var filteredData = data.filter(notNull)

            // append our circles with correct locations onto the map
            svg.selectAll("circle")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", function(locats) {
                return projection([locats["NSRDB_LON(dd)"], locats["NSRDB_LAT (dd)"]])[0]
                      })
            .attr("cy", function(locats) {
                return projection([locats["NSRDB_LON(dd)"], locats["NSRDB_LAT (dd)"]])[1]
                      })
            .attr("r", function(locats) { 
                var sumMe = totalSum.sum[locats["USAF"]]
                if (sumMe == undefined || sumMe == 0)
                    return 1.5;
                else
                    return scaleMe(totalSum.sum[locats["USAF"]])
            })
            .style("fill", function(locats) {
                var sumMe = totalSum.sum[locats["USAF"]]
                if (sumMe == undefined || sumMe == 0)
                    return "#627D91";
                else
                    return "#380295";
            })
            .attr("id", function(locats) {
                return locats["USAF"]
            })

            // update the graph when new circle is clicked
            d3.selectAll("circle").on("click", function(d) {
                // only show us a graph with data
                if (totalSum.sum[d["USAF"]] !== undefined) {

                    hrArray = []
                    console.log("CS 171 is awesome!");

                    for (var hour in totalSum.hourly[d["USAF"]]) {
                        hrArray.push(totalSum.hourly[d["USAF"]][hour])
                    }

                    // update domain
                    yVis.domain([0, d3.max(hrArray)]);

                    // Update bars
                    detailVis.selectAll(".bar")
                        .data(hrArray)
                        .transition()
                        .duration(1000)
                        .attr("x", function(d, i) { 
                            return xVis(dailyHours[i]);
                            })
                        .attr("y", function(d) { return yVis(d); })
                        .attr("height", function(d) { 

                            return visHeight - yVis(d); }); 

                    // Update Y axis
                    detailVis.select(".y.axis")
                        .transition()
                        .duration(1000)
                        .call(yAxis)
                        .selectAll("text")
                        .attr("x", 3)
                        .attr("dy", ".35em")
                        .style("text-anchor", "start");

                    // Update title
                    detailVis.select(".title")
                        .data(["title"])
                        .selectAll("text")
                        .transition()
                        
                        myTitle.text(d["STATION"])
                }
            })

            d3.selectAll("circle").on("mouseover", function(d) {

            // When zooming in it can be assumed (as talked about in class) 
            // that the viewer wants more surrounding detail, therefore the 
            // tooltip may get in the way of the potential viewing
            if (toolMe == true) {
            var xPosition = d3.select(this)[0][0].cx.animVal.value + 75;
            var yPosition = d3.select(this)[0][0].cy.animVal.value - 20;
            }
            // so if zoomed, we tuck the tooltip right underneath the map
            else {
                xPosition = width/2 - 75
                yPosition = height + 120
            }

            // Update the tooltip position and value
            d3.select("#tooltip")
              .style("left", xPosition + "px")
              .style("top", yPosition + "px")
              .select("#value")
              .html(function(e) {
                if (totalSum.sum[d["USAF"]] == undefined) {
                    return '<div>' + 'Station: ' + d["STATION"] + '</div>' 
                    + '<div>' + 'Unfortunately, no data is available' + '</div>'
                }
                else {
                return '<div>' + 'Station: ' + d["STATION"] + '</div>' 
                    + '<div>' + 'Total lux: ' + totalSum.sum[d["USAF"]].toLocaleString() + '</div>'
                }}
                );

              // Show the tooltip
              d3.select("#tooltip").classed("hidden", false);
            })

            .on("mouseout", function() {
              // Hide the tooltip
              d3.select("#tooltip").classed("hidden", true);
            })
        })
        })

    };


d3.json("../data/us-named.json", function(error, data) {

    var usMap = topojson.feature(data,data.objects.states).features

    // give our states and have id's so we can highlight
    g.append("g")
      .attr("id", "states")
    .selectAll("path")
        .data(usMap).enter().append("path")
        .attr("d", path)
        .attr("id", "states")
        .on("click", clicked)
        .on("mouseover", function(d) {
            d3.select(this).attr("fill", "red")
        });

    loadStations();
});

// zoom us in when clicked
function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    toolMe = false;
    centered = d;
  } else {
    x = width / 2 - margin.right;
    y = height / 2 - margin.top;
    k = 1;
    centered = null;
    toolMe = true;
  }

  svg.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  svg.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}