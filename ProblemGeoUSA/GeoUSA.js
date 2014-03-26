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

var visHeight = 300
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

console.log(dailyHours)
// vis scale
var xVis = d3.scale.ordinal()
    .domain(dailyHours)
    .rangeRoundBands([0, visWidth], 0.05);

var yVis = d3.scale.linear()
    .range([200, 0]);
    
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


var projection = d3.geo.albersUsa().translate([width / 2, height / 2]);//.precision(.1);
var path = d3.geo.path().projection(projection);


var dataSet = {};

var scaleMe

// going to use these to find min and max values
var min = Infinity
var max = -Infinity

function loadStations() {
    d3.csv("../data/NSRDB_StationsMeta.csv",function(error,data){
        d3.json("../data/reducedMonthStationHour2003_2004.json", function(error,data2){

            // because the directions were somewhat misleading, I have all of my data
            // grouped monthly as shown in the homework diagram, but now we will make
            // it aggregate, no biggie!
            var totalSum = {sum: {}, hourly: {}}
            for (var months in data2) {
                for (var locats in data2[months]) {
                    //console.log(totalSum.sum)
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


            hrArray = []

            for (var hour in totalSum.hourly["726575"]) {
                hrArray.push(totalSum.hourly["726575"][hour])
            }

            //xVis.domain([0,11]);
            yVis.domain([0, d3.max(hrArray)]);

            console.log(totalSum)
            console.log(data)

            detailVis.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + 200 + ")")
                .call(xAxis)
              .selectAll("text")
                .attr("y", 5)
                .attr("x", -10)
                .attr("dy", ".35em")
                .attr("transform", "rotate(-60)")
                .style("text-anchor", "end");

            detailVis.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate("+ 300 +",0)")
                .call(yAxis)
              .selectAll("text")
                //.attr("y", 5)
                .attr("x", 3)
                .attr("dy", ".35em")
                .style("text-anchor", "start");

                console.log(totalSum.hourly["726575"])

            detailVis.selectAll(".bar")
                .data(hrArray)
              .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d, i) { 
                    console.log(d); return xVis(dailyHours[i]);
                    })
                .attr("width", xVis.rangeBand())
                .attr("y", function(d) { return yVis(d); })
                .attr("height", function(d) { 

                    return 200 - yVis(d); }); 

                console.log(detailVis.width)

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
                    return "grey";
                else
                    return "blue";
            })
            .attr("id", function(locats) {
                return locats["USAF"]
            })
            //.on("click", updateDetailVis);

            d3.selectAll("circle").on("mouseover", function(d) {

            var xPosition = width + 120;
            var yPosition = 60;

            // Update the tooltip position and value
            d3.select("#tooltip")
              .style("left", xPosition + "px")
              //.style("top", "100px")
              .select("#value")
              .html('<div>' + 'Station: ' + d["STATION"] + '</div>' 
                    + '<div>' + 'Total lux: ' + totalSum.sum[d["USAF"]].toLocaleString() + '</div>'
                );

              // Show the tooltip
              d3.select("#tooltip").classed("hidden", false);
              console.log("something happened")
            })

            .on("mouseout", function() {
              // Hide the tooltip
              d3.select("#tooltip").classed("hidden", true);
            })
                })
            })
        };



function loadStats() {

    d3.json("../data/reducedMonthStationHour2003_2004.json", function(error,data){
        completeDataSet= data;

		//....
		
        loadStations();
    })

}


d3.json("../data/us-named.json", function(error, data) {

    var usMap = topojson.feature(data,data.objects.states).features
    console.log(usMap);

    svg.selectAll(".country").data(usMap).enter().append("path")
        .attr("d", path)
        .on("click", clicked);
    // see also: http://bl.ocks.org/mbostock/4122298

    loadStats();
});



// ALL THESE FUNCTIONS are just a RECOMMENDATION !!!!
var createDetailVis = function(){

}


var updateDetailVis = function(data){
    console.log(data)


}


function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  svg.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  svg.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}



// ZOOMING
function zoomToBB() {


}

function resetZoom() {
    
}


