/*
 * Created by mkh on 4/29/14.
 */
//$(document).ready(function(){

// ----------------------------------------------------------------
// Basic Margin/vis area setup
// ----------------------------------------------------------------

var margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
};

var marginMap = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
};

var marginChart = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var width = $(".row1").width() - margin.left - margin.right;
var height = $(".row1").height() - margin.bottom - margin.top;

var widthMap = $(".visLeft").width() - marginMap.left - marginMap.right;
var heightMap = $(".visLeft").height() - marginMap.bottom - marginMap.top;

var widthChart = $("#chartVis").width() - marginChart.left - marginChart.right;
var heightChart = $("#chartVis").height() - marginChart.bottom - marginChart.top;

var prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);

var bbVisMap = {
    x: marginMap.left,
    y: marginMap.top,
    w: widthMap,
    h: heightMap
};

var bbVisTree = {
    x: margin.left,
    y: margin.top,
    w: width,
    h: height
};

var bbVisChart = {
    x: marginChart.left,
    y: marginChart.top,
    w: widthChart,
    h: heightChart
};


var mapVisL = d3.selectAll("#mapVisL").append("div").attr({
    width: bbVisMap.w + marginMap.left + marginMap.right,
    height: bbVisMap.h + marginMap.top + marginMap.bottom
})

var mapVisR = d3.selectAll("#mapVisR").append("div").attr({
    width: bbVisMap.w + marginMap.left + marginMap.right,
    height: bbVisMap.h + marginMap.top + marginMap.bottom
})

var chartVis = d3.selectAll("#chartVis").append("svg").attr({
    width: bbVisChart.w + marginChart.left + marginChart.right,
    height: bbVisChart.h + marginChart.top + marginChart.bottom
})

var chartVis2 = d3.selectAll("#chartVis2").append("svg").attr({
    width: bbVisChart.w + marginChart.left + marginChart.right,
    height: bbVisChart.h + marginChart.top + marginChart.bottom
})

var chartVis3 = d3.selectAll("#chartVis3").append("svg").attr({
    width: bbVisChart.w + marginChart.left + marginChart.right,
    height: bbVisChart.h + marginChart.top + marginChart.bottom
})



// ----------------------------------------------------------------
// Global Variables
// ----------------------------------------------------------------

var data = {};

var totalFoodBos  = 0,
    totalSchoolBos = 0,
    totalCompanyBos = 0,
    totalFoodNyc = 0,
    totalSchoolNyc = 0,
    totalCompanyNyc = 0,
    totalFoodSfo = 0,
    totalSchoolSfo = 0,
    totalCompanySfo = 0;


var foodArrBos = [],
    schoolArrBos = [],
    companyArrBos = [],
    foodArrNyc = [],
    schoolArrNyc = [],
    companyArrNyc = [],
    foodArrSfo = [],
    schoolArrSfo = [],
    companyArrSfo = [];

var verticesL = [];
var verticesR = [];

var long_lat_L = {};
var long_lat_R = {};

//var shapeList = {};
var verticiesList = {};
var foodList = {};
var schoolList = {};
var companyList = {};

var citiesList = ["bos", "nyc", "sfo"];
var cityIdLeftWindow = 1;
var cityIdRightWindow = 0;

var dataCategoryList = [];
var dataCategory = "Food";
var dataCategoryId = 0;
var currentCatg = ""

var dataTypeList = ["patent", "creativeOccupationTotal", "creativeOccupationPercentage"];
var yearlyData = [];

var allowPlot = false;
var allowTransPlot = false;

// ----------------------------------------------------------------
// Basic Definitions
// ----------------------------------------------------------------

prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);

var color = d3.scale.linear()
    .domain([0, 1])
    //.range(["#fff", "#7e5"]);
    .range(["#fff", "#000"]);

var colorLegend = d3.scale.quantize()
    .range(["#fff", "#000"]);

var colorCatg = d3.scale.category10();

var tile = d3.geo.tile()
    .size([bbVisMap.w, bbVisMap.h]);

var projectionL = d3.geo.mercator()
    .scale((1 << 21) / 2 / Math.PI)
    .translate([bbVisMap.w / 2, bbVisMap.h / 2]); // just temporary

var projectionR = d3.geo.mercator()
    .scale((1 << 21) / 2 / Math.PI)
    .translate([-bbVisMap.w / 2, -bbVisMap.h / 2]); // just temporary

var tileProjection = d3.geo.mercator();

var tilePath = d3.geo.path()
    .projection(tileProjection);



var zoomL = d3.behavior.zoom()
    .scale(projectionL.scale() * 2 * Math.PI)
    .scaleExtent([1 << 20, 1 << 23])
    //.translate(projectionL([-71.059773, 42.358431]).map(function(x) { return -x; }))
    .on("zoom", zoomedL);

var zoomR = d3.behavior.zoom()
    .scale(projectionR.scale() * 2 * Math.PI)
    .scaleExtent([1 << 20, 1 << 23])
    //.translate(projectionR([-71.059773, 42.358431]).map(function(x) { return -x; }))
    .on("zoom", zoomedR);



var  mapL = mapVisL
    .attr("class", "mapL")
    .style("width", bbVisMap.w + "px")
    .style("height", bbVisMap.h + "px")
    .call(zoomL)
    .on("mousemove", mousemovedL);

var mapR = mapVisR
    .attr("class", "mapR")
    .style("width", bbVisMap.w + "px")
    .style("height", bbVisMap.h + "px")
    .call(zoomR)
    .on("mousemove", mousemovedR);



var layerL = mapL.append("g")
    .attr("class", "layerL");

var layerR = mapR.append("g")
    .attr("class", "layerR");



var infoL = mapL.append("g")
    .attr("class", "infoL");

var infoR = mapR.append("g")
    .attr("class", "infoR");


//var vismatL = d3.selectAll("#mapVisL").insert("svg",":first-child")
var vismatL = d3.selectAll(".mapL").append("svg")
    .attr("class","mapMatL");

var vismatR = d3.selectAll(".mapR").append("svg")
    .attr("class","mapMatR");



//var visvorL = d3.selectAll(".mapL").append("svg")
//    .attr("class","mapVorL");
//
//var visvorR = d3.selectAll(".mapR").append("svg")
//    .attr("class","mapVorR");

// Line Chart Components
var dFormat = d3.time.format("%Y");

var x = d3.time.scale()
    .range([0, bbVisChart.w]);

var y = d3.scale.linear()
    .range([bbVisChart.h, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line();

line.interpolate("linear")
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.value); });



// Bar chart Components
var xBar = d3.scale.ordinal()
    .rangeRoundBands([0, bbVisChart.w], .1);


loadData();


// ----------------------------------------------------------------
// Functions
// ----------------------------------------------------------------

function loadData() {
    d3.json("./data/citiesData.json",function(error,jsono){

        data = jsono;
//        console.log(data);

        // '0' is Boston (bos)
        // '1' is New Yor (nyc)
        // '2' is San Francisco (sfo)

        $.each(data["children"][0]["children"],function(id,array){

             verticesR.push([array["location"]["lng"],array["location"]["lat"]])

             $.each(array["children"],function(id2,array2){
                if(array2["name"] == "Food"){
                    totalFoodBos += array2["size"]
                    foodArrBos.push(array2["size"])
                }
                if(array2["name"] == "School"){
                    totalSchoolBos += array2["size"]
                    schoolArrBos.push(array2["size"])
                }
                if(array2["name"] == "Company"){
                    totalCompanyBos += array2["size"]
                    companyArrBos.push(array2["size"])
                }
            });

        });


        $.each(data["children"][1]["children"],function(id,array){
            verticesL.push([array["location"]["lng"],array["location"]["lat"]])

            $.each(array["children"],function(id2,array2){
                if(array2["name"] == "Food"){
                    if(array2["size"]){
                        totalFoodNyc += array2["size"]
                        foodArrNyc.push(array2["size"])
                    }else{
                        totalFoodNyc += 0
                        foodArrNyc.push(0)
                    }
                }
                if(array2["name"] == "School"){
                    totalSchoolNyc += array2["size"]
                    schoolArrNyc.push(array2["size"])
                }
                if(array2["name"] == "Company"){
                    totalCompanyNyc += array2["size"]
                    companyArrNyc.push(array2["size"])
                }
            });
        });


        $.each(data["children"][2]["children"],function(id,array){
            verticesL.push([array["location"]["lng"],array["location"]["lat"]])

            $.each(array["children"],function(id2,array2){
                if(array2["name"] == "Food"){
                    if(array2["size"]){
                        totalFoodSfo += array2["size"]
                        foodArrSfo.push(array2["size"])
                    }else{
                        totalFoodSfo += 0
                        foodArrSfo.push(0)
                    }
                }
                if(array2["name"] == "School"){
                    totalSchoolSfo += array2["size"]
                    schoolArrSfo.push(array2["size"])
                }
                if(array2["name"] == "Company"){
                    totalCompanySfo += array2["size"]
                    companyArrSfo.push(array2["size"])
                }
            });
        });

        // Set data color based on number of categories
        $.each(data["children"][0]["children"][0]["children"],function(id, array){
            dataCategoryList.push(array["name"]);
        });
        $.each(data["children"][0]["other"],function(id, array){
            dataCategoryList.push(array["name"]);
//            console.log(array)
        });
//        console.log(dataCategoryList)
        colorCatg.domain(dataCategoryList);
        color.range(["#ffffff",colorCatg(dataCategoryList[dataCategoryId])]);

        // Adding interactive Legend
        $.each(dataCategoryList,function(i, d){
            addSelectorToHTML(d, i, colorCatg(dataCategoryList[i]))
        });


        foodList["bos"] = { "total":data["children"][0]["totalFood"], "val":foodArrBos }
        schoolList["bos"] = { "total":data["children"][0]["totalSchool"], "val":schoolArrBos }
        companyList["bos"] = { "total":data["children"][0]["totalCompany"], "val":companyArrBos }

        foodList["nyc"] = { "total":data["children"][1]["totalFood"], "val":foodArrNyc }
        schoolList["nyc"] = { "total":data["children"][1]["totalSchool"], "val":schoolArrNyc }
        companyList["nyc"] = { "total":data["children"][1]["totalCompany"], "val":companyArrNyc }

        foodList["sfo"] = { "total":data["children"][2]["totalFood"], "val":foodArrSfo }
        schoolList["sfo"] = { "total":data["children"][2]["totalSchool"], "val":schoolArrSfo }
        companyList["sfo"] = { "total":data["children"][2]["totalCompany"], "val":companyArrSfo }

        // Set map location and projection
        projectionL.translate([-bbVisMap.w / 2, -bbVisMap.h / 2]);
        projectionR.translate([-bbVisMap.w / 2, -bbVisMap.h / 2]);

        // Initial Map Views
        setMapProjection("L",cityIdLeftWindow)
        setMapProjection("R",cityIdRightWindow)

        setMapTitle("L", cityIdLeftWindow)
        setMapTitle("R", cityIdRightWindow)

        zoomedL();
        zoomedR();



//        var vertices1 =[];
//
//        $.each(data["children"][cityIdLeftWindow]["children"],function(id,array){
//            var scp = projectionL([array["location"]["lng"],array["location"]["lat"]]);
//            vertices1.push([scp[0],scp[1]])
////        console.log(array["location"]["lng"]+" , "+array["location"]["lat"]);
//        });
//
//        var voronoi = d3.geom.voronoi(vertices1);
//
//        var cells = d3.selectAll("#mapVisL").insert("svg:svg",":first-child").attr("width", bbVisMap.w)
//            .attr("height", bbVisMap.h).append("svg:g")
//            .attr("id", "cells");
//
//        var g = cells.selectAll("g")
//            .data(data["children"][cityIdLeftWindow]["children"])
//            .enter().append("svg:g");
//
//
//        g.append("svg:path")
//            .attr("class", "cell")
//            .attr("d", function(d, i) { return "M" + voronoi[i].join("L") + "Z"; })
//            .attr("clip-path", "url(#shapeGroupL)")
//            .on("mouseover", function(d, i) {
//                console.log("hi");
//            });
//
//        g.append("svg:circle")
//            .attr("cx", function(d, i) { return vertices1[i][0]; })
//            .attr("cy", function(d, i) { return vertices1[i][1]; })
//            .attr("r", 1.5);





//        plotCityTransportationOnMap("L", cityIdLeftWindow)
//        plotCityTransportationOnMap("R", cityIdRightWindow)
        //plotBarChart();
        plotLineChart("patent",0);
        plotLineChart("creativeOccupationTotal",1);

    });
}

function zoomedL() {

    var tiles = tile
        .scale(zoomL.scale())
        .translate(zoomL.translate())
        ();

    projectionL
        .scale(zoomL.scale() / 2 / Math.PI)
        .translate(zoomL.translate());

    setMapTiles("L", tiles)

   // plotCityZipcodesOnMap("L", cityIdLeftWindow)

    setCityShapeBorder("L", cityIdLeftWindow)

    //updateData()

    //voronoiR();
    if(allowPlot){
        plotVoronoi("L", cityIdLeftWindow, dataCategory)
//    plotVoronoi("L", cityIdLeftWindow, "Food")

    }
    if(allowTransPlot){
        plotCityTransportationOnMap("L", cityIdLeftWindow)
    }



}


function zoomedR() {

    var tiles = tile
        .scale(zoomR.scale())
        .translate(zoomR.translate())
        ();

    projectionR
        .scale(zoomR.scale() / 2 / Math.PI)
        .translate(zoomR.translate());

    setMapTiles("R", tiles)

    //plotCityZipcodesOnMap("R", cityIdRightWindow)

    setCityShapeBorder("R", cityIdRightWindow)

    //updateData()

    //voronoiR();
    if(allowPlot){
        plotVoronoi("R", cityIdRightWindow, dataCategory)
//    plotVoronoi("R", cityIdRightWindow, "Food")

    }

    if(allowTransPlot){
        plotCityTransportationOnMap("R", cityIdRightWindow)
    }


}

function mousemovedL() {
    infoL.text(formatLocation(projectionL.invert(d3.mouse(this)), zoomL.scale()));
}

function mousemovedR() {
    infoR.text(formatLocation(projectionR.invert(d3.mouse(this)), zoomR.scale()));
}

function matrix3d(scale, translate) {
    var k = scale / 256, r = scale % 1 ? Number : Math.round;
    return "matrix3d(" + [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, r(translate[0] * scale), r(translate[1] * scale), 0, 1 ] + ")";
}

function prefixMatch(p) {
    var i = -1, n = p.length, s = document.body.style;
    while (++i < n) if (p[i] + "Transform" in s) return "-" + p[i].toLowerCase() + "-";
    return "";
}

function formatLocation(p, k) {

    var format = d3.format("." + Math.floor(Math.log(k) / 2 - 2) + "f");
    //console.log(k+ " " +format(-p[1]));
    return (p[1] < 0 ? format(-p[1]) + "°S" : format(p[1]) + "°N") + " "
        + (p[0] < 0 ? format(-p[0]) + "°W" : format(p[0]) + "°E");
}

function updateData() {

//    vismatL.selectAll("circle.zipL")
//        .attr('cx', function(d){ var scp = projectionL([d["location"]["lng"], d["location"]["lat"]]); return scp[0]; })
//        .attr('cy', function(d){ var scp = projectionL([d["location"]["lng"], d["location"]["lat"]]); return scp[1]; });
//
//    //console.log(data);
//
//    vismatR.selectAll("circle.zipR")
//        .attr('cx', function(d){ var scp = projectionR([d["location"]["lng"], d["location"]["lat"]]); return scp[0]; })
//        .attr('cy', function(d){ var scp = projectionR([d["location"]["lng"], d["location"]["lat"]]); return scp[1]; });

//    voronoiR();
//    voronoiL();

}

function updateCharts() {

//    plotLineChart("patent",0);
//    var res = chartData("patent");
//    var yearlyData = res[0];
//
//    var xMin = res[1];
//    var xMax = res[2];
//    var yMin = res[3];
//    var yMax = res[4];
//    //x.domain([xMin,xMax]);
//    y.domain([yMin,yMax]);
//    console.log(yearlyData)

    plotLineChart("patent", 0);
    plotLineChart("creativeOccupationTotal", 1);
    plotBarChart(currentCatgName,currentCatgColor);

}

// ----------------------------------------------------------------
// Interface Interaction
// ----------------------------------------------------------------


$( "body" ).on("click", "#roads", function(){

    if($(this).attr("title") == "selected"){
        $(this).attr("title","notSelected");
        $(this).removeClass("active");
        $("g.layerL").toggle();
        $("g.layerR").toggle();
    }else{
        $(this).attr("title","selected");
        $(this).addClass("active");
        $("g.layerL").toggle();
        $("g.layerR").toggle();
    }

});



$( "body" ).on("click", "#mapVisL h2 span.glyphicon-chevron-left", function(){

    var currentCityId = getCurrentCityId("L");

    if(currentCityId-1 < 0){
        currentCityId = data["children"].length-1;
    }else{
        currentCityId--;
    }

    projectionL.translate([-bbVisMap.w / 2, -bbVisMap.h / 2]);
    setMapProjection("L",currentCityId)
    setMapTitle("L", currentCityId)
    cityIdLeftWindow = currentCityId;
    zoomedL()

    updateCharts()

});

$( "body" ).on("click", "#mapVisL h2 span.glyphicon-chevron-right", function(){

    var currentCityId = getCurrentCityId("L");

    if(currentCityId+1 > data["children"].length-1){
        currentCityId = 0;
    }else{
        currentCityId++;
    }

    projectionL.translate([-bbVisMap.w / 2, -bbVisMap.h / 2]);
    setMapProjection("L",currentCityId)
    setMapTitle("L", currentCityId)
    cityIdLeftWindow = currentCityId;
    zoomedL()

    updateCharts()

});

$( "body" ).on("click", "#mapVisR h2 span.glyphicon-chevron-left", function(){

    var currentCityId = getCurrentCityId("R");

    if(currentCityId-1 < 0){
        currentCityId = data["children"].length-1;
    }else{
        currentCityId--;
    }

    projectionR.translate([-bbVisMap.w / 2, -bbVisMap.h / 2]);
    setMapProjection("R",currentCityId)
    setMapTitle("R", currentCityId)
    cityIdRightWindow = currentCityId;
    zoomedR()

    updateCharts()

});

$( "body" ).on("click", "#mapVisR h2 span.glyphicon-chevron-right", function(){

    var currentCityId = getCurrentCityId("R");

    if(currentCityId+1 > data["children"].length-1){
        currentCityId = 0;
    }else{
        currentCityId++;
    }

    projectionR.translate([-bbVisMap.w / 2, -bbVisMap.h / 2]);
    setMapProjection("R",currentCityId)
    setMapTitle("R", currentCityId)
    cityIdRightWindow = currentCityId;
    zoomedR()

    updateCharts()

});

function setMapTitle(mapWindow, cityId){    // mapWindow: "L", or "R"
                                            // cityId is a numerical number

    if(mapWindow == "L" || mapWindow == "l"){

        var mapTitleHtml = "<span class='glyphicon glyphicon-chevron-left'></span>City of "+data["children"][cityId]["name"]+"<span class='glyphicon glyphicon-chevron-right'></span>"
        $("#mapVisL h2").html(mapTitleHtml);

    }else if(mapWindow == "R" || mapWindow == "r"){

        var mapTitleHtml = "<span class='glyphicon glyphicon-chevron-left'></span>City of "+data["children"][cityId]["name"]+"<span class='glyphicon glyphicon-chevron-right'></span>"
        $("#mapVisR h2").html(mapTitleHtml);

    }else {
        console.log("please chose between (L/R) for mapWindow. '"+mapWindow+"' is not a valid entry.");
    }

}

function setMapProjection(mapWindow, cityId){   // mapWindow: "L", or "R"
                                                // cityId is a numerical number

    if(mapWindow == "L" || mapWindow == "l"){

        zoomL.translate(projectionL([
            data["children"][cityId]["location"]["lng"],
            data["children"][cityId]["location"]["lat"]
        ]).map(function(x) { return -x; }));

    }else if(mapWindow == "R" || mapWindow == "r"){

        zoomR.translate(projectionR([
            data["children"][cityId]["location"]["lng"],
            data["children"][cityId]["location"]["lat"]
        ]).map(function(x) { return -x; }));

    }else {
        console.log("please chose between (L/R) for mapWindow. '"+mapWindow+"' is not a valid entry.");
    }

}

function plotCityZipcodesOnMap(mapWindow, cityId){  // mapWindow: "L", or "R"
                                                    // cityId is a numerical number

    var groupClassName, circleClassName, selector, mapProjection;

    if(mapWindow == "L" || mapWindow == "l"){

        selector = vismatL;
        mapProjection = projectionL;
        groupClassName = "zipGroupL";
        circleClassName = "zipL zipL";

    }else if(mapWindow == "R" || mapWindow == "r"){

        selector = vismatR;
        mapProjection = projectionR;
        groupClassName = "zipGroupR";
        circleClassName = "zipR zipR";

    }else {
        console.log("please chose between (L/R) for mapWindow. '"+mapWindow+"' is not a valid entry.");
    }

    d3.selectAll("g."+groupClassName).remove();
    selector.append("g").attr("class",groupClassName)
    .selectAll("circle")
    .data(data["children"][cityId]["children"])
    .enter()
    .append("circle").attr("class",function(d,i){return circleClassName+i;})
    .attr('cx', function(d){ var scp = mapProjection([d["location"]["lng"], d["location"]["lat"]]); return scp[0]; })
    .attr('cy', function(d){ var scp = mapProjection([d["location"]["lng"], d["location"]["lat"]]); return scp[1]; })
    .attr('r', 3  )
    .attr("fill","#f39");

}

function plotCityTransportationOnMap(mapWindow, cityId){    // mapWindow: "L", or "R"
                                                            // cityId is a numerical number

    var groupClassName, circleClassName, selector, mapProjection, dataVis, clipId;

    if(mapWindow == "L" || mapWindow == "l"){

        selector = vismatL;
        mapProjection = projectionL;
        groupClassName = "transGroupL";
        circleClassName = "transL transL";
        clipId = "shapeGroupL";

    }else if(mapWindow == "R" || mapWindow == "r"){

        selector = vismatR;
        mapProjection = projectionR;
        groupClassName = "transGroupR";
        circleClassName = "transR transR";
        clipId = "shapeGroupR";

    }else {
        console.log("please chose between (L/R) for mapWindow. '"+mapWindow+"' is not a valid entry.");
    }

    var tempArray = [];
    $.each(citiesList, function(i,d){
        $.each(data["children"][i]["other"][0]["children"], function(ii,dd){
            tempArray.push(dd.size);
        });
    })
    //console.log(d3.extent(tempArray))

    var stationScale = d3.scale.pow()
        .domain([0,1])
        .range([1,10]);

    //console.log(tempArray);

//    dataVis = function(d){ return foodList[citiesList[cityId]]["val"][d]/d3.max(tempArray); }

    d3.selectAll("g."+groupClassName).remove();
    selector.append("g").attr("class",groupClassName).attr("clip-path", "url(#"+clipId+")")
        .selectAll("circle")
        .data(data["children"][cityId]["other"][0]["children"])
        .enter()
        .append("circle").attr("class",function(d,i){return circleClassName+i;})
        .attr('cx', function(d){ var scp = mapProjection([d["location"]["lng"], d["location"]["lat"]]); return scp[0]; })
        .attr('cy', function(d){ var scp = mapProjection([d["location"]["lng"], d["location"]["lat"]]); return scp[1]; })
        .attr('r', function(d){return stationScale(d.size/d3.max(tempArray));}  )
        .attr("fill",colorCatg("Transportation"))
        .on("mouseover", showToolTip)
        .on("mousemove", moveToolTip)
        .on("mouseout", hideToolTip);


    var tooltip = d3.select("body")
        .append("div")
        .attr("class","tooltip1")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("a simple tooltip")
        .style("color",colorCatg("Transportation"));


    function showToolTip(d){
        d3.select(this)
           // .style("stroke", "#f39")
            .attr("r", 10);

        tooltip.style("visibility", "visible").text(d.name+": "+d.size);
//        console.log(d.size);
    }

    function hideToolTip(d){
        d3.select(this)
            //.style("stroke", "#333")
            .attr("r", function(d){return stationScale(d.size/d3.max(tempArray));});

        tooltip.style("visibility", "hidden");
    }

    function moveToolTip(d){
        tooltip.style("top", (event.pageY-10)+"px")
            .style("left",(event.pageX+15)+"px");
    }



}

function setCityShapeBorder(mapWindow, cityId){ // Creating City Boundaries using geoJSON Shapefile
                                                // mapWindow: "L", or "R"
                                                // cityId is a numerical number

    var defsClassName, clipId, pathClassName,
        selector, mapProjection, groupOutlineClassName;

    if(mapWindow == "L" || mapWindow == "l"){

        selector = vismatL;
        mapProjection = projectionL;
        defsClassName = "defsGroupL";
        clipId = "shapeGroupL";
        pathClassName = "pointsL";
        groupOutlineClassName = "shapeOutlineL";


    }else if(mapWindow == "R" || mapWindow == "r"){

        selector = vismatR;
        mapProjection = projectionR;
        defsClassName = "defsGroupR";
        clipId = "shapeGroupR";
        pathClassName = "pointsR";
        groupOutlineClassName = "shapeOutlineR";

    }else {
        console.log("please chose between (L/R) for mapWindow. '"+mapWindow+"' is not a valid entry.");
    }

    var path = d3.geo.path()
        .projection(mapProjection)
        .pointRadius(2);

    d3.selectAll("defs."+defsClassName).remove();
    selector.append("defs").attr("class",defsClassName).append("clipPath").attr("id",clipId).append("path")
        .datum(data["children"][cityId]["geometry"])
        .attr("class", pathClassName)
        .attr("d", path);

    d3.selectAll("g."+groupOutlineClassName).remove();
    selector.append("g").attr("class",groupOutlineClassName).append("path")
        .datum(data["children"][cityId]["geometry"])
        .attr("d", path);

}

function setMapTiles(mapWindow, tilesVar){  // Setting Map Tiles from OpenStreetMaps
                                            // mapWindow: "L", or "R"
                                            // tilesVar is the tiles function

    var tileClassName, selector;

    if(mapWindow == "L" || mapWindow == "l"){

        selector = layerL;
        tileClassName = "tileL";

    }else if(mapWindow == "R" || mapWindow == "r"){

        selector = layerR;
        tileClassName = "tileR";

    }else {
        console.log("please chose between (L/R) for mapWindow. '"+mapWindow+"' is not a valid entry.");
    }

    var image = selector
        .style(prefix + "transform", matrix3d(tilesVar.scale, tilesVar.translate))
        .selectAll("."+tileClassName)
        .data(tilesVar, function(d) { return d; });

    image.exit()
        .each(function(d) { this._xhr.abort(); })
        .remove();

    image.enter().append("svg")
        .attr("class", tileClassName)
        .style("left", function(d) { return d[0] * 256 + "px"; })
        .style("top", function(d) { return d[1] * 256 + "px"; })
        .each(function(d) {
            var svg = d3.select(this);
            this._xhr = d3.json("http://" + ["a", "b", "c"][(d[0] * 31 + d[1]) % 3] + ".tile.openstreetmap.us/vectiles-highroad/" + d[2] + "/" + d[0] + "/" + d[1] + ".json", function(error, json) {
                var k = Math.pow(2, d[2]) * 256; // size of the world in pixels

                tilePath.projection()
                    .translate([k / 2 - d[0] * 256, k / 2 - d[1] * 256]) // [0°,0°] in pixels
                    .scale(k / 2 / Math.PI);

                svg.selectAll("path")
                    .data(json.features.sort(function(a, b) { return a.properties.sort_key - b.properties.sort_key; }))
                    .enter().append("path")
                    //.attr("clip-path", "url(#chart-area)")
                    .attr("class", function(d) { return d.properties.kind; })
                    .attr("d", tilePath);
            });
        });
}

function plotVoronoi(mapWindow, cityId, dataType){  // drawing Voronoi Diagram
                                                    // mapWindow: "L", or "R"
                                                    // cityId is a numerical number
                                                    // dataType is either ("food", "school", or "company")

    var groupVoronoiClassName, clipId, selector, mapProjection, dataVis;

    if(mapWindow == "L" || mapWindow == "l"){

        selector = vismatL;
        mapProjection = projectionL;
        groupVoronoiClassName = "voronoiGroupL";
        clipId = "shapeGroupL";

        if(dataType == "food" || dataType == "Food"){
            var tempArray =[];
//            console.log("L: Food");
//            console.log(foodList[citiesList[getCurrentCityId("L")]]);
            tempArray.push(d3.max(foodList[citiesList[getCurrentCityId("L")]]["val"]));
            tempArray.push(d3.max(foodList[citiesList[getCurrentCityId("R")]]["val"]));
            //$.each(foodList,function(id,array){ console.log(foodList);tempArray.push(d3.max(array["val"])) })
            dataVis = function(d){ return foodList[citiesList[cityId]]["val"][d]/d3.max(tempArray); }
//            console.log("L "+tempArray)
        }else if(dataType == "school" || dataType == "School"){
            var tempArray =[];
//            console.log("L: School");
            tempArray.push(d3.max(schoolList[citiesList[getCurrentCityId("L")]]["val"]));
            tempArray.push(d3.max(schoolList[citiesList[getCurrentCityId("R")]]["val"]));
            //$.each(schoolList,function(id,array){ tempArray.push(d3.max(array["val"])) })
            dataVis = function(d){ return schoolList[citiesList[cityId]]["val"][d]/d3.max(tempArray); }
        }else if(dataType == "company" || dataType == "Company"){
            var tempArray =[];
//            console.log("L: Company");
            tempArray.push(d3.max(companyList[citiesList[getCurrentCityId("L")]]["val"]));
            tempArray.push(d3.max(companyList[citiesList[getCurrentCityId("R")]]["val"]));
            //$.each(companyList,function(id,array){ tempArray.push(d3.max(array["val"])) })
            dataVis = function(d){ return companyList[citiesList[cityId]]["val"][d]/d3.max(tempArray); }
        }else{
            console.log("please chose between 'food', 'school', and 'company' in small letters. '"+dataType+"' is not a valid entry.");
        }


    }else if(mapWindow == "R" || mapWindow == "r"){

        selector = vismatR;
        mapProjection = projectionR;
        groupVoronoiClassName = "voronoiGroupR";
        clipId = "shapeGroupR";

        if(dataType == "food" || dataType == "Food"){
            var tempArray =[];
//            console.log("R: Food");
            tempArray.push(d3.max(foodList[citiesList[getCurrentCityId("L")]]["val"]));
            tempArray.push(d3.max(foodList[citiesList[getCurrentCityId("R")]]["val"]));
            //$.each(foodList,function(id,array){ tempArray.push(d3.max(array["val"])) })
            dataVis = function(d){ console.log(foodList[citiesList[cityId]]["val"][d]);  return foodList[citiesList[cityId]]["val"][d]/d3.max(tempArray); }
            $(".legendR").text(d3.max(tempArray));
//            console.log("R "+tempArray)
        }else if(dataType == "school" || dataType == "School"){
            var tempArray =[];
//            console.log("R: School");
            tempArray.push(d3.max(schoolList[citiesList[getCurrentCityId("L")]]["val"]));
            tempArray.push(d3.max(schoolList[citiesList[getCurrentCityId("R")]]["val"]));
            //$.each(schoolList,function(id,array){ tempArray.push(d3.max(array["val"])) })
            dataVis = function(d){ return schoolList[citiesList[cityId]]["val"][d]/d3.max(tempArray); }
            $(".legendR").text(d3.max(tempArray));
        }else if(dataType == "company" || dataType == "Company"){
            var tempArray =[];
//            console.log("R: Company");
            tempArray.push(d3.max(companyList[citiesList[getCurrentCityId("L")]]["val"]));
            tempArray.push(d3.max(companyList[citiesList[getCurrentCityId("R")]]["val"]));
            //$.each(companyList,function(id,array){ tempArray.push(d3.max(array["val"])) })
            dataVis = function(d){ return companyList[citiesList[cityId]]["val"][d]/d3.max(tempArray); }
            $(".legendR").text(d3.max(tempArray));
//            console.log(tempArray);
//            console.log(d3.max(tempArray));
        }else{
            console.log("please chose between 'food', 'school', and 'company' in small letters. '"+dataType+"' is not a valid entry.");
        }

    }else {
        console.log("please chose between (L/R) for mapWindow. '"+mapWindow+"' is not a valid entry.");
    }

    d3.selectAll("g."+groupVoronoiClassName).remove();

    var vertices =[];

    $.each(data["children"][cityId]["children"],function(id,array){
        var scp = mapProjection([array["location"]["lng"],array["location"]["lat"]]);
        vertices.push([scp[0],scp[1]])
//        console.log(array["location"]["lng"]+" , "+array["location"]["lat"]);
    });

    var voronoi = d3.geom.voronoi()
        .clipExtent([[bbVisMap.x, bbVisMap.y], [bbVisMap.w, bbVisMap.h]]);

    var voro = selector.insert("g",":first-child")
        .attr("class", groupVoronoiClassName).attr("clip-path", "url(#"+clipId+")")
        .on("mouseover", function(d,i) { });

    var path = voro.append("g").selectAll("path")
        .data(voronoi(vertices), polygon)
        .enter()
        .append("path")
        .attr("fill", function(d, i) { return color(dataVis(i)); })
        .attr("stroke","#f39")
        .attr("d", polygon)
        .on("mouseover",showToolTip)
        .on("mousemove",moveToolTip)
        .on("mouseout",hideToolTip);

    path.order();


    function polygon(d) {
        return "M" + d.join("L") + "Z";
    }

    var tooltip = d3.select("body")
        .append("div")
        .attr("class","tooltip1")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("a simple tooltip")
        .style("color",colorCatg(dataType));


    function showToolTip(d,i){

        d3.select(this)
            .attr("stroke-width","5px");
//        console.log(i);

        tooltip.style("visibility", "visible")
            .text(data["children"][cityId]["children"][i]["name"]+": "+data["children"][cityId]["children"][i]["children"][dataCategoryList.indexOf(dataType)]["size"]+" "+dataType);
    }

    function hideToolTip(d,i){

        d3.select(this)
            .attr("stroke-width","1px");
//        console.log(i);

        tooltip.style("visibility", "hidden");
    }

    function moveToolTip(d,i){
        tooltip.style("top", (event.pageY-10)+"px")
            .style("left",(event.pageX+15)+"px");
    }

}


function plotBarChart(dataCategoryName, dataCategoryColor){ // drawing Voronoi Diagram
                                                    // mapWindow: "L", or "R"
                                                    // cityId is a numerical number
                                                    // dataType is either ("food", "school", or "company")

    var yearlyData = [];

    var cityIdL = getCurrentCityId("L");
    var cityIdR = getCurrentCityId("R");
    var cityIdArray = [cityIdL, cityIdR];
    $.each(cityIdArray, function(i,d){

        if(dataCategoryName == "Company"){
            yearlyData.push({"name":data["children"][cityIdArray[i]]["name"], "val":data["children"][cityIdArray[i]]["totalCompany"]});
        }else if(dataCategoryName == "School"){
            yearlyData.push({"name":data["children"][cityIdArray[i]]["name"], "val":data["children"][cityIdArray[i]]["totalSchool"]});
        }else if(dataCategoryName == "Food"){
            yearlyData.push({"name":data["children"][cityIdArray[i]]["name"], "val":data["children"][cityIdArray[i]]["totalFood"]});
        }else if(dataCategoryName == "Transportation"){
            yearlyData.push({"name":data["children"][cityIdArray[i]]["name"], "val":data["children"][cityIdArray[i]]["other"][0]["size"]});
        }else{
            console.log("error!! '"+dataCategoryName+"' is not valid");
        }
        //yearlyData.push(data["children"][cityIdArray[i]]["name"]);
       // yearlyData2.push(data["children"][cityIdArray[i]]["total"]);
        //console.log(yearlyData);
//        $.each(data["children"][cityIdArray[i]]["yearly"], function(ii,dd){
//            if(dd[dataType]){
//                yearlyData[i]["children"].push({"year":dFormat.parse(dd["year"]), "value": dd[dataType]});
//            }
//        });
    })


    var xAxis = d3.svg.axis()
        .scale(xBar)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
//        .ticks(10, "%");

    chartVis3.selectAll("g").remove();

    var g= chartVis3.append("g")
        .attr("transform", "translate(" + bbVisChart.x + "," + bbVisChart.y + ")");

    //d3.tsv("data.tsv", type, function(error, data) {
    xBar.domain(yearlyData.map(function(d){return d.name;}));
        y.domain([0, d3.max(yearlyData.map(function(d){return d.val;}))]);

    g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + bbVisChart.h + ")")
            .call(xAxis);

    g.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("y", -30)
            .attr("x", -50)
            .attr("font-size",18)
            .attr("fill","#999")
            //.attr("dy", ".71em")
            .style("text-anchor", "start")
            .text("Total "+dataCategoryName);

    g.selectAll(".bar")
            .data(yearlyData)
            .enter().append("rect")
        .attr("height", 0)
        .attr("fill",dataCategoryColor)
        .attr("y", function(d) { return bbVisChart.h; })
        .transition()
        .duration(750).delay(50)
            .attr("class", "bar")
            .attr("x", function(d) { return xBar(d.name); })
            .attr("width", xBar.rangeBand())
            .attr("y", function(d) { return y(d.val); })
            .attr("height", function(d) { return bbVisChart.h - y(d.val); })
            .attr("fill",dataCategoryColor);

    //});

    function type(d) {
        d.frequency = +d.frequency;
        return d;
    }


}

function chartData(dataType){
    var yearlyData = [];
    var cityIdL = getCurrentCityId("L");
    var cityIdR = getCurrentCityId("R");
    var cityIdArray = [cityIdL, cityIdR];
//    console.log(cityIdArray)

    var xMin, xMax, yMin, yMax;

    if(dataTypeList.indexOf(dataType) != -1){

        $.each(cityIdArray, function(i,d){

            yearlyData.push({"name":data["children"][cityIdArray[i]]["name"], "children":[]});
            $.each(data["children"][cityIdArray[i]]["yearly"], function(ii,dd){
                if(dd[dataType]){
                    yearlyData[i]["children"].push({"year":dFormat.parse(dd["year"]), "value": dd[dataType]});
                }
            });
        })

    } else {
        console.log("please select a correct data to plot. '"+dataType+"' is not a valid entry.");
    }
//    console.log(yearlyData)
    xMax = d3.max(yearlyData, function(d){
        return d3.max(d["children"], function(dd){
            return dd.year;
        })
    })
    xMin = d3.min(yearlyData, function(d){
        return d3.min(d["children"], function(dd){
            return dd.year;
        })
    })
    yMax = d3.max(yearlyData, function(d){
        return d3.max(d["children"], function(dd){
            return dd.value;
        })
    })
    yMin = 0;
//    yMin = d3.min(yearlyData, function(d){
//        return d3.min(d["children"], function(dd){
//            return dd.value;
//        })
//    })
    return [yearlyData, xMin, xMax, yMin, yMax];
}

function plotLineChart(dataType, chartWindowLocation){ // drawing a line chart
                                            // location is an integer number for where the chart should be placed in the window
                                            // dataType is either ("patent", or "creativeOccupationTotal")

    var res = chartData(dataType);
    var yearlyData = res[0];

    var xMin = res[1];
    var xMax = res[2];
    var yMin = res[3];
    var yMax = res[4];

    x.domain([xMin,xMax]);
    y.domain([yMin,yMax]);


    var chartVisG;

    if(chartWindowLocation == 0){
        chartVis.select("."+dataType).remove();
        chartVisG = chartVis.append("g")
            .attr("transform", "translate(" + bbVisChart.x + "," + bbVisChart.y + ")")
            .attr("class",dataType);
    }else if(chartWindowLocation == 1){
        chartVis2.select("."+dataType).remove();
        chartVisG = chartVis2.append("g")
            .attr("transform", "translate(" + bbVisChart.x + "," + bbVisChart.y + ")")
            .attr("class",dataType);
    }else{
        console.log("Sorry, but we only support two chart windows ('0' and '1'). "+chartWindowLocation+" is not a valid entry.")
    }

    chartVisG.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + bbVisChart.h + ")")
        .call(xAxis);

    chartVisG.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        //.attr("transform", "rotate(-90)")
        .attr("y", -30)
        .attr("x", -50)
        .attr("font-size",18)
        .attr("fill","#999")
        //.attr("dy", ".71em")
        .style("text-anchor", "start")
        .text(dataType);

    var chartVisCities = chartVisG.selectAll(".chartVisCities")
        .data(yearlyData)
        .enter().append("g")
        .attr("class", function(d){ return "chartVisCities "+ d.name;});


    chartVisCities.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d["children"]); })
        .style("stroke", "#f39")
        .style("stroke-width", "1px")
        .style("fill", "none");
//        .on("mouseover", function(d,i){
//            d3.select(this).attr("stroke-width",5);
//            cir.attr("r", 5);
//        })
//        .on("mouseout", function(d,i){
//            d3.select(this).attr("stroke-width",1);
//            cir.attr("r", 2);
//        });

    chartVisCities.append("text")
        .datum(function(d) { return {name: d.name, value: d["children"][d["children"].length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d["value"]["value"]) + ")"; })
        //.attr("x", 3)
        .attr("dx", "-.5em")
        .attr("dy", "-.5em")
        .text(function(d) { return d.name; })
        .style("text-anchor", "middle")
        .style("fill","#333")
        .style("font-size","12px");

    var cir = chartVisCities.append("g")
        .attr("class","circleGroup")
        .selectAll("circle")
        .data(function(d) { return d["children"]; })
        .enter().append("circle")
        .attr("cx", function (d) { return x(d.year); })
        .attr("cy", function (d) { return y(d.value); })
        .attr("fill", "#fff")
        .attr("stroke", "#333")
        .attr("r", 3)
        .on("mouseover", showToolTip)
        .on("mousemove", moveToolTip)
        .on("mouseout", hideToolTip);
//        .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
//        .on("mouseout", function(){d3.select(this).attr("r", 2); return tooltip.style("visibility", "hidden");});
//
//    patent.append("text")
//        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
//        .attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value.population) + ")"; })
//        .attr("x", 3)
//        .attr("dy", ".35em")

    var tooltip = d3.select("body")
        .append("div")
        .attr("class","tooltip1")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("a simple tooltip")
        .style("color","#f39");


    function showToolTip(d){
        d3.select(this)
            .style("stroke", "#f39")
            .attr("r", 7);

        tooltip.style("visibility", "visible").text(d.value);
    }

    function hideToolTip(d){
        d3.select(this)
            .style("stroke", "#333")
            .attr("r", 3);

        tooltip.style("visibility", "hidden");
    }

    function moveToolTip(d){
        tooltip.style("top", (event.pageY-10)+"px")
            .style("left",(event.pageX+15)+"px");
    }


}



function getCurrentCityId(mapWindow){   // return the city ID for a specific window
                                        // mapWindow: "L", or "R"

    var cityName;
    var cityId;

    if(mapWindow == "L" || mapWindow == "l"){

        var windowTitle = $("#mapVisL h2").contents()
            .filter(function(){
                return this.nodeType == 3;
            }).text();

        cityName = windowTitle.substring(8,windowTitle.length);

    }else if(mapWindow == "R" || mapWindow == "r"){

        var windowTitle = $("#mapVisR h2").contents()
            .filter(function(){
                return this.nodeType == 3;
            }).text();

        cityName = windowTitle.substring(8,windowTitle.length);

    }else {
        console.log("please chose between (L/R) for mapWindow. '"+mapWindow+"' is not a valid entry.");
    }

    $.each(data["children"], function(id, array){
        if(array["name"] == cityName){
            cityId = id;
        }

    })

    return cityId;
}


// ----------------------------------------------------------------
// Interface Elements
// ----------------------------------------------------------------
function addSelectorToHTML(dataCategoryName, dataCategoryId, dataCategoryColor){

    $('#mapVisLegend').append('<label title="notSelected" class="legend_'+dataCategoryId+' mapLegendOpts pull-right"><span></span>'+dataCategoryName+'</label>');

    $('.legend_'+dataCategoryId+' span').css("border-color",dataCategoryColor)

    $('.legend_'+dataCategoryId).on("mouseover", function(){
        $('.legend_'+dataCategoryId+' span').css("border-width","3px")
    });
    $('.legend_'+dataCategoryId).on("mouseout", function(){
        $('.legend_'+dataCategoryId+' span').css("border-width","1px")
    });
    $('.legend_'+dataCategoryId).on("click", function(){


        if($(".mapLegendOpts[title='notSelected']").length >= 3){
            chartVis3.selectAll("g").remove();
            $(".legendTemp").css("background","#333");
            $(".legendR").text("")
        }

        if($('.legend_'+dataCategoryId).attr("title") == "selected"){



                $('.legend_'+dataCategoryId).attr("title", "notSelected")
                $('.legend_'+dataCategoryId+' span').css("background-color","transparent")
            if(dataCategoryName != "Transportation"){

                allowPlot= false;

                d3.selectAll("g.voronoiGroupL").remove();
                d3.selectAll("g.voronoiGroupR").remove();
            }else{
                allowTransPlot = false;

                d3.selectAll("g.transGroupL").remove();
                d3.selectAll("g.transGroupR").remove();
            }

        }else{

                plotBarChart(dataCategoryName,dataCategoryColor);
                currentCatgName = dataCategoryName;
                currentCatgColor = dataCategoryColor;

                $('.legend_'+dataCategoryId).attr("title", "selected")
                $('.legend_'+dataCategoryId+' span').css("background-color",dataCategoryColor)
            if(dataCategoryName != "Transportation"){
                dataCategory = dataCategoryName;
                dataCategoryId = dataCategoryId;
                allowPlot= true;

//                background: -webkit-gradient(linear, left top, left bottom, from(#ccc), to(#000));
//                colorLegend.range(["#ffffff",colorCatg(dataCategoryList[dataCategoryId])]);
                $(".legendTemp").css("background","-webkit-gradient(linear, 75% 0%, 0% 0%, from("+colorCatg(dataCategoryList[dataCategoryId])+"), to(#fff))");


                color.range(["#ffffff",colorCatg(dataCategoryList[dataCategoryId])]);

//                console.log(colorCatg(dataCategoryList[dataCategoryId]))
                plotVoronoi("L", cityIdLeftWindow, dataCategoryName)
                plotVoronoi("R", cityIdRightWindow, dataCategoryName)
                zoomedL()
                zoomedR()

                var legend = d3.select('#legend')
                    .append('ul')
                    .attr('class', 'list-inline');

                var keys = legend.selectAll('li.key')
                    .data(colorLegend.range());

                keys.enter().append('li')
                    .attr('class', 'key')
                    .style('border-top-color', String);
//                    .text(function(d) {
//                        var r = colorLegend.invertExtent(d);
//                        return formats.percent(r[0]);
//                    });


            }else{
                allowTransPlot = true;
                plotCityTransportationOnMap("L",cityIdLeftWindow)
                plotCityTransportationOnMap("R",cityIdRightWindow)
            }

        }


    });

}

// ----------------------------------------------------------------
// End of Code
// ----------------------------------------------------------------
//});
