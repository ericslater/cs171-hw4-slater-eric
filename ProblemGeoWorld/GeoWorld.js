/**
 * Eric Slater
 *
 * I got really far! But had difficulties and time problems when trying to implement
 * the final leg of the extra credit which was color. If you look I have all of the calls
 * and data there ready to be taken in by my function quantize and then given a class
 * but unfortunately I ran out of time!
 */

var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var width = 960 - margin.left - margin.right;
var height = 700 - margin.bottom - margin.top;



var bbVis = {
    x: 100,
    y: 10,
    w: width - 100,
    h: 300
};

var dataSet = {};

var svg = d3.select("#vis").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
}).append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });

// --- this is just for fun.. play arround with it iof you like :)
var projectionMethods = [
    {
        name:"mercator",
        method: d3.geo.mercator().translate([width / 2, height / 2])//.precision(.1);
    },{
        name:"equiRect",
        method: d3.geo.equirectangular().translate([width / 2, height / 2])//.precision(.1);
    },{
        name:"stereo",
        method: d3.geo.stereographic().translate([width / 2, height / 2])//.precision(.1);
    }
];
// --- this is just for fun.. play arround with it iof you like :)

var initIndicator = "allsi.bi_q1"
var initYear = "2000"

var actualProjectionMethod = 0;
var colorMin = colorbrewer.Greens[3][0];
var colorMax = colorbrewer.Greens[3][2];

var quantize = d3.scale.quantize()
    .domain([0, .15])
    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));


var path = d3.geo.path().projection(projectionMethods[0].method);

function modifyMap() {
    console.log("made")

    d3.select("#country")
    .attr("fill", function(){
        console.log("here")
        console.log(d)
    })
}

function runAQueryOn() {
    $.ajax({
        url: "http://api.worldbank.org/countries/all/indicators/" + initIndicator + 
        "?format=jsonP&prefix=Getdata&per_page=500&date=" + initYear, //do something here
        jsonpCallback:'getdata',
        dataType:'jsonp',
        success: function (data, status){

            console.log(status)

            console.log(data)
           
        for (var i = 0; i<data[1].length; i++) {
        var include = document.contains(document.getElementById(data[1][i].country.value))
        console.log(include)

        if (include == true) {
            var country = data[1][i].country.value
            console.log(country)
       // if (document.contains(document.getElementById(data[1][i].country.value)) === true) {
          var selection = document.getElementById(country)
                selection.style.color = "red"
        }
        }

    }
});
}


var initVis = function(error, indicators, world){
    console.log(indicators);
    console.log(world.features);

    var worldMap = world.features

    // give our states and have id's so we can highlight
    svg.append("g")
      .attr("id", "countries")
    .selectAll("path")
        .data(worldMap).enter().append("path")
        .attr("d", path)
        .attr("id", function(d){ 
           return d.properties.name
        })
        .attr("class", "q5-9")

        var indicatorMenu = d3.select("body").append("select")
                            .attr("id", "indicatorMe")
                            .on("change", function() {
                                initIndicator = this.options[this.selectedIndex].value
                                runAQueryOn()
                            })
                            .selectAll("option").data(indicators).enter().append("option")
                                .attr("value", function(d){ return d.IndicatorCode; }) /* Optional */
                                .text(function(d){ return d.IndicatorName; })


        var yearArray = []
        for (var i = 0; i<14; i++){
            yearArray.push(2000 + i)
        }

        d3.select("body").append("select")
            .on("change", function() {
                                initYear = this.options[this.selectedIndex].value
                                runAQueryOn()
                            })
            .attr("id", "yearMe")
        .selectAll("option").data(yearArray).enter().append("option")
            .attr("value", function(d){ return d; }) /* Optional */
            .text(function(d){ return d; })

}


// very cool queue function to make multiple calls.. 
// see 
queue()
    .defer(d3.csv,"../data/worldBank_indicators.csv")
    .defer(d3.json,"../data/world_data.json")
    // .defer(d3.json,"../data/WorldBankCountries.json")
    .await(initVis);




// just for fun 
var textLabel = svg.append("text").text(projectionMethods[actualProjectionMethod].name).attr({
    "transform":"translate(-40,-30)"
})

var changePro = function(){
    actualProjectionMethod = (actualProjectionMethod+1) % (projectionMethods.length);

    textLabel.text(projectionMethods[actualProjectionMethod].name);
    path= d3.geo.path().projection(projectionMethods[actualProjectionMethod].method);
    //svg.selectAll(".country").transition().duration(750).attr("d",path);
};


runAQueryOn()










