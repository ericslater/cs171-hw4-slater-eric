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

var bbVis = {
    x: 100,
    y: 10,
    w: width - 100,
    h: 300
};

var detailVis = d3.select("#detailVis").append("svg").attr({
    width:350,
    height:200
})

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

var min = Infinity
var max = -Infinity

function loadStations() {
    d3.csv("../data/NSRDB_StationsMeta.csv",function(error,data){
        d3.json("../data/reducedMonthStationHour2003_2004.json", function(error,data2){

            var totalSum = {}
            for (var months in data2) {
                for (var locats in data2[months]) {
                    //console.log(data2["0"]["700197"])
                    if (totalSum[locats] == undefined)
                        totalSum[locats] = data2[months][locats]["sum"]
                    else
                        totalSum[locats] += data2[months][locats]["sum"]
                }
            }
            console.log(totalSum)

            for( x in totalSum) {
                if( totalSum[x] < min && totalSum[x] !== 0) min = totalSum[x];
                if( totalSum[x] > max) max = totalSum[x];
            }

            scaleMe = d3.scale.linear().domain([min,max]).range([2,6])

            console.log(data2)
            function notNull(e) {
                if (projection([e["NSRDB_LON(dd)"], e["NSRDB_LAT (dd)"]]) !== null)
                    return e;
            }


            var filteredData = data.filter(notNull)
            console.log(filteredData)
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
                var sumMe = totalSum[locats["USAF"]]
                if (sumMe == undefined || sumMe == 0)
                    return 1.5;
                else
                    return scaleMe(totalSum[locats["USAF"]])
            })
            .style("fill", function(locats) {
                var sumMe = totalSum[locats["USAF"]]
                if (sumMe == undefined || sumMe == 0)
                    return "grey";
                else
                    return "blue";
            });
        })
    });
}


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


var updateDetailVis = function(data, name){
  
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


