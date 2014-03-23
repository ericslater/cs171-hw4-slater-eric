var names = ["Kimbra","Elina","Brad","Johnathon","Archie","Elfriede","Melina","Jerrod","Elizabet"]
var aggregateMap = {}

names.forEach(function(d){

    var firstLetter = d[0]; // get first Letter (strings are arrays of characters)
    var secondLetter = d[1]; // just for explanation -- the second letter

    var nameList = aggregateMap[firstLetter] // get the value for key "firstLetter"
    console.log(nameList)
    if (nameList==undefined) // if there is no entry yet...
        nameList = []; //  .. then create one !!

    nameList.push(d) // add name to nameList

    aggregateMap[firstLetter]= nameList

})
console.log(aggregateMap);