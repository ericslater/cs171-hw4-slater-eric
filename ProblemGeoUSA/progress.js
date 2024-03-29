<!DOCTYPE html>
<html>
<head>
    <title></title>
</head>
<body>
<script src="http://d3js.org/d3.v3.min.js"></script>
<script src="http://d3js.org/queue.v1.min.js"></script>
<script src="http://d3js.org/topojson.v1.min.js"></script>
<script type="text/javascript" src="../jquery-1.11.0.min.js"></script>
<script src="../libs/FileSaver.js"></script>

<div id="vis"></div>


<script>


    d3.json("../data/allData2003_2004.json",function(error,data){
        console.log(data);

        var allDates = [];
        var timeParser = d3.time.format("%b %-d, %Y %X %p");
        var months = {}

        for (var keyme in data) {
            var obj = data[keyme]
            //console.log(obj)

            //var keyme = "690150"

            for (var key2 in obj) {
                //var month
                var date = timeParser.parse(obj[key2].date)
                var dates = new Date(date)

                var month = dates.getMonth()
                //console.log(month)
                var monthList = months[month] // get the value for key "firstLetter"
                    if (monthList==undefined) {// if there is no entry yet...
                        monthList = []
                        }
                        //monthList.push(keyme)
                monthList[keyme] = {sum:0,hourly: {}}; //  .. then create one !!
                months[month]= monthList


                monthList[keyme].sum = 
                        //}
                        //months[month]= monthList



/*
                    var locationList = monthList[keyme]
                    if (locationList==undefined) {// if there is no entry yet...
                    //locationList = []; //  .. then create one !! 
                    //locationList[keyme] = {sum: 0, hourly: {}}
                    specificList = {sum:0,hourly: {}}
                    //specificList[keyme] = {sum:0,hourly: {}}
                    //locationList.push(specificList)
                    monthList.push(keyme)
                    }
                    //months[month]= monthList
*/

                    }

                    //monthList.push("6901") // add name to monthList
                                //if allDates
            }
            console.log(months)
        //}
		// add your source code

        saveToFile(reducedDataSet,"reducedMonthStationHour2003_2004.json")



    })

    var saveToFile = function(object, filename){
        var blob, blobText;
        blobText = [JSON.stringify(object)];
        blob = new Blob(blobText, {
            type: "text/plain;charset=utf-8"
        });
        saveAs(blob, filename);
    }



        //var coords = {x: [], y: []}
        var mapme
        coords2 = []
        //var y = []
        
        for (var info in data) {

        var locats = data[info]

        mapme = projection([locats["NSRDB_LON(dd)"], locats["NSRDB_LAT (dd)"]])
        //console.log(projection([locats["NSRDB_LON(dd)"], locats["NSRDB_LAT (dd)"]]))
        
        if (mapme !== null) {
        coords.x.push(mapme[0])
        coords.y.push(mapme[1])
        //coords2.push(coords)
        }
    }

</script>


</body>
</html>