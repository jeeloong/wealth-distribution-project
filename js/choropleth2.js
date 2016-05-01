var rateById = d3.map();

// var color = d3.scale.ordinal().domain([1,2,3,4,5]).range(["#009ed8","#80e28e","#e9ec32","#f6a023","#f37124"])

var color = d3.scale.ordinal().domain([0,1,2,3,4,5,6,7,8,9]).range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"])

rates.forEach(function(d) {
    var foo = 0;
    if(d.cuts !== "undefined"){
        if(d.cuts[50] >= 30000 && d.cuts[50] < 35000){
            foo = 1;
        }else if(d.cuts[50] >= 35000 && d.cuts[50] < 40000){
            foo = 2;
        }else if(d.cuts[50] >= 40000 && d.cuts[50] < 45000){
            foo = 3;
        }else if(d.cuts[50] >= 45000 && d.cuts[50] < 50000){
            foo = 4;
        }else if(d.cuts[50] >= 50000 && d.cuts[50] < 55000){
            foo = 5;
        }else if(d.cuts[50] >= 55000 && d.cuts[50] < 60000){
            foo = 6;
        }else if(d.cuts[50] >= 60000 && d.cuts[50] < 65000){
            foo = 7;
        }else if(d.cuts[50] >= 65000 && d.cuts[50] <= 70000){
            foo = 8;
        }else if(d.cuts[50] >= 70000 && d.cuts[50] <= 75000){
            foo = 9;
        }
    }
    //console.log(d.state +" : " +d.cuts[50] + ":" + foo);
    rateById.set(d.id, color(+foo));
});

us.objects.states.geometries.forEach(function(d){
    d.properties = rates.filter(function(v){ return +v.id == +d.id; })[0];
});

var usData = rates.filter(function(v){ return +v.id == 0; })[0]
//console.log(usData);

$("#income-line-chart").html("<strong>United States</strong>");
$("#per-99").html("<span><strong>$"+d3.format(",g")(usData.cuts[99])+"<strong></span>");
$("#per-95").html("<span><strong>$"+d3.format(",g")(usData.cuts[95])+"<strong></span>");
$("#per-75").html("<span><strong>$"+d3.format(",g")(usData.cuts[75])+"<strong></span>");
$("#per-50").html("<span><strong>$"+d3.format(",g")(usData.cuts[50])+"<strong></span>");
$("#per-25").html("<span><strong>$"+d3.format(",g")(usData.cuts[25])+"<strong></span>");
$("#per-10").html("<span><strong>$"+d3.format(",g")(usData.cuts[10])+"<strong></span>");

$("#per-user").html("<span><strong>TOP " + (100 - arraySearch(getPercentage(usData), 100000))  + "%</strong></span>");

var width = 800, height = 450;
var projection = d3.geo.albersUsa().scale(750).translate([width / 2, height / 2 -45]);
var path = d3.geo.path().projection(projection);
var margin = {top: 0, left: 10, right: 10, bottom: 10};

var svg = d3.select("#map").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

svg.append("rect")
    .attr("class", "background")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .on("click", function(d){
    console.log(d);
    var p = {
      abbr: "US",
      rate: ".025"
    }
    pieAdjust(p);
  })
var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/* Initialize tooltip */
var tip = d3.tip().html(function(d) { return d; });

/* Invoke the tip in the context of your visualization */
g.call(tip);

tip.attr("class","d3-tip");

g.append("g")
    .attr("id", "states")
  .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
  .enter().append("path")
    .attr("class","state-area")
    .attr("fill", function(d) {
        return rateById.get(d.id);
    })
    .attr("d", path)
    .attr("stroke","black")
    .attr("stroke-width","2px")
    .attr("stroke-opacity",0.2)
    .on('mouseover', function(d){
          var p = d.properties;
          //pieAdjust(p);
          return tip.show( '<span>' + p.state + '</span><p>' + "Median Household Income: <br>" + d3.format(",g")(p.cuts[50]))
    })
    .on('mouseout', function(d){
          tip.hide()
    })
    .on('click', function(d){
        var p = d.properties;
        $("#income-line-chart").html(p.state);
        $("#per-user").html("<span><strong>TOP " + (100 - arraySearch(getPercentage(p), 100000))  + "%</strong></span>");
        $("#per-99").html("<span><strong>$"+d3.format(",g")(p.cuts[99])+"<strong></span>");
        $("#per-95").html("<span><strong>$"+d3.format(",g")(p.cuts[95])+"<strong></span>");
        $("#per-75").html("<span><strong>$"+d3.format(",g")(p.cuts[75])+"<strong></span>");
        $("#per-50").html("<span><strong>$"+d3.format(",g")(p.cuts[50])+"<strong></span>");
        $("#per-25").html("<span><strong>$"+d3.format(",g")(p.cuts[25])+"<strong></span>");
        $("#per-10").html("<span><strong>$"+d3.format(",g")(p.cuts[10])+"<strong></span>");
    })

g.append("path")
    .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
    .attr("id", "state-borders")
    .attr("d", path);


//var legend = g.append("g")
//.attr("transform","translate(" + [width, height] + ")")
//
//legend.append("text")
//.attr("class","legendTitle")
//.text("Median Household Income By State")
//.attr("y", -230)
//.attr("x",-1)
//.style("text-anchor","end")
//
//
//
//var lSquares = legend.selectAll(".legend")
//    .data(['$30,000-$35,000','$35,000-$40,000','$40,000-$45,000','$45,000-$50,000','$50,000-$55,000','$55,000-$60,000','$60,000-$65,000','$65,000-$70,000','$70,000-$75,000'].reverse())
//    .enter()
//    .append("g")
//    .attr("class", "legend")
//    .attr("transform", function(d, i) {  return "translate(0," + (- 40 - i * 23) + ")"; });
//
//lSquares.append("rect")
//    .attr("x",  "-18px")
//    .attr("width", 18)
//    .attr("height", 18)
//    .attr("stroke", "#444")
//    .style("fill", function(d,i){ console.log(i); return color(5-i);});
//
//lSquares.append("text")
//    .attr("x", "-24px")
//    .attr("y", 9)
//    .attr("dy", ".35em")
//    .style("text-anchor", "end")
//    .text(function(d) { return d; });


function getPercentage(data){
    var blah = data.cuts.push(100000)
    blah = data.cuts.sort(function(a, b){return a-b})
    return blah
}

function arraySearch(arr,val) {
    for (var i=0; i<arr.length; i++)
        if (arr[i] === val)
            return i;
    return false;
}