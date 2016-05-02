
/*
 * Timeline - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

Choropleth = function(_parentElement, _data){
	this.parentElement = _parentElement;
	this.data = _data;

	// No data wrangling, no update sequence
	this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */
Choropleth.prototype.initVis = function(){
    var vis = this;

    vis.numberFormat    = d3.format(".2f");
    vis.rateById        = d3.map();
    vis.color           = d3.scale.ordinal()
                            .domain([0,1,2,3,4,5,6,7,8,9])
                            .range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"]);
    vis.chosenState     = "US";
    vis.chosenIncome    = 100000;
    vis.chosenStateID   = 0;

    vis.data.ratesData.forEach(function(d) {
        var foo = 0;
        // This is for the colors in the choropleth map to them working correctly
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
        vis.rateById.set(d.id, vis.color(+foo));
    });

    // Gets the percentage of income the user is in
    // This is a bit hacky but it gets the job done
    vis.getPercentage = function(){
        var data = [];
        data = vis.data.ratesData.filter(function(v){ return +v.id == vis.chosenStateID; })[0];
        var sortArray = data.cuts.push(Number(vis.chosenIncome));
        sortArray = data.cuts.sort(function(a, b){return a-b})
        var indexOfIncome = data.cuts.indexOf(Number(vis.chosenIncome));
        delete data.cuts[indexOfIncome];
        return indexOfIncome;
    }

    vis.updateIncomes = function(){
        var data = vis.data.ratesData.filter(function(v){ return +v.id == vis.chosenStateID; })[0];
        var p                                                       = data;
        var incomePercent                                           = vis.getPercentage();
        document.getElementById('income-line-chart').innerHTML      = p.state;
        document.getElementById('chosen-income').innerHTML          = "$" + d3.format(",g")(vis.chosenIncome);
        if(incomePercent < 50){
            document.getElementById('chosen-income-percent').innerHTML  = "Bottom " + (100 - incomePercent)  + "%";
        }else if(incomePercent == 50){
            document.getElementById('chosen-income-percent').innerHTML  = "Top Half " + (100 - incomePercent);
        }else if(incomePercent >= 100){
            document.getElementById('chosen-income-percent').innerHTML  = "Top 1%";
        }else{
            document.getElementById('chosen-income-percent').innerHTML  = "Top " + (100 - incomePercent) + "%";
        }
    }

    vis.updatePercentages = function(){
        var p = vis.data.ratesData.filter(function(v){ return +v.id == vis.chosenStateID; })[0];
        document.getElementById('per-99').innerHTML             = "$" + d3.format(",g")(p.cuts[99]);
        document.getElementById('per-95').innerHTML             = "$" + d3.format(",g")(p.cuts[95]);
        document.getElementById('per-75').innerHTML             = "$" + d3.format(",g")(p.cuts[75]);
        document.getElementById('per-50').innerHTML             = "$" + d3.format(",g")(p.cuts[50]);
        document.getElementById('per-25').innerHTML             = "$" + d3.format(",g")(p.cuts[25]);
        document.getElementById('per-10').innerHTML             = "$" + d3.format(",g")(p.cuts[10]);
    }

    vis.data.usStatesData.objects.states.geometries.forEach(function(d){
        d.properties = vis.data.ratesData.filter(function(v){ return +v.id == +d.id; })[0];
    });

    vis.updatePercentages();

    vis.width = 900;
    vis.height = 450;
    vis.projection = d3.geo.albersUsa().scale(1000).translate([vis.width / 2, vis.height / 2]);
    vis.path = d3.geo.path().projection(vis.projection);
    vis.margin = {top: 0, left: 10, right: 10, bottom: 10};

    vis.svg = d3.select("#choropleth").append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)

    vis.svg.append("rect")
        .attr("class", "background")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .on("click", function(d){
            vis.chosenState = "US";
            vis.updateIncomes();
            vis.updatePercentages();
        });

    vis.g = vis.svg.append("g").attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    /* Initialize tooltip */
    vis.tip = d3.tip().html(function(d) { return d; });

    /* Invoke the tip in the context of your visualization */
    vis.g.call(vis.tip);

    vis.keypressSlider = document.getElementById('keypress');
    vis.input = document.getElementById('input-with-keypress');

    noUiSlider.create(vis.keypressSlider, {
        start: [ 100000 ],
        step: 10,
        range: {
            'min': [  1000 ],
            'max': [ 400000 ]
        },
        pips: {
            mode: 'values',
            values: [1000, 100000, 200000, 300000, 400000],
            density: 4
        }
    });

    this.wrangleData();
}

Choropleth.prototype.wrangleData = function(){
    var vis = this;



    this.updateVis();
}


Choropleth.prototype.updateVis = function(){
    var vis = this;

    vis.tip.attr("class","d3-tip");

    vis.g.append("g")
        .attr("id", "states")
        .selectAll("path")
        .data(topojson.feature(vis.data.usStatesData, vis.data.usStatesData.objects.states).features)
        .enter()
        .append("path")
        .attr("class","state-area")
        .attr("fill", function(d) {
            return vis.rateById.get(d.id);
        })
        .attr("d", vis.path)
        .attr("stroke","black")
        .attr("stroke-width","2px")
        .attr("stroke-opacity",0.2)
        .on('mouseover', function(d){
            var p = d.properties;
            return vis.tip.show( '<span>' + p.state + '</span><p>' + "Median Household Income: <br>" + d3.format(",g")(p.cuts[50]))
        })
        .on('mouseout', function(d){
            vis.tip.hide()
        })
        .on('click', function(d){
            var p = d.properties;
            vis.chosenState = p.state_abv
            vis.chosenStateID = p.id;
            vis.updateIncomes();
            vis.updatePercentages();
        });

    vis.g.append("path")
        .datum(topojson.mesh(vis.data.usStatesData, vis.data.usStatesData.objects.states, function(a, b) { return a !== b; }))
        .attr("id", "state-borders")
        .attr("d", vis.path);

    vis.keypressSlider.noUiSlider.on('update', function( values, handle ) {
    	vis.input.value = values[handle];
    	vis.chosenIncome = vis.input.value;
    	vis.updateIncomes()
    });

    vis.input.addEventListener('change', function(){
    	if ( this.value < 1000 ) {
            vis.keypressSlider.noUiSlider.set([null, 1000]);
        } else if ( this.value > 400000 ) {
            vis.keypressSlider.noUiSlider.set([null, 400000]);
        }else{
            vis.keypressSlider.noUiSlider.set([null, this.value]);
        }
    });

    // Listen to keydown events on the input field.
    vis.input.addEventListener('keydown', function( e ) {
    	// Convert the string to a number.
    	vis.value = Number( vis.keypressSlider.noUiSlider.get() )
    	vis.sliderStep = vis.keypressSlider.noUiSlider.steps()

    	// Select the stepping for the first handle.
    	vis.sliderStep = vis.sliderStep[0];

    	switch ( e.which ) {
    		case 13:
    			vis.keypressSlider.noUiSlider.set(this.value);
    			break;
    		case 38:
    			vis.keypressSlider.noUiSlider.set( value + sliderStep[1] );
    			break;
    		case 40:
    			vis.keypressSlider.noUiSlider.set( value - sliderStep[0] );
    			break;
    	}
    });


}




function arraySearch(arr,val) {
    for (var i=0; i<arr.length; i++)
        if (arr[i] === val)
            return i;
    return false;
}







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