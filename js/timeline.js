
/*
 * Timeline - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the  
 */

Timeline = function(_parentElement, _data){
	this.parentElement = _parentElement;
	this.data = _data;
	// No data wrangling, no update sequence
	this.wrangleData();
}


Timeline.prototype.wrangleData = function(){
    var vis = this.data.data; // read about the this

    var parseDate = d3.time.format("%Y").parse;

//    var yearDim = vis.dimension(function (d) { return 'year='+d["year"]+';state=US; tax_unit='+d["average_income_per_tax_unit"]});
//    var yearCount = yearDim.group().reduceSum(function(d) { return +d["average_income_per_tax_unit"]; });

    //var stateDim = vis.dimension(function (d) { return d["state"]});

    var parseDate = d3.time.format("%Y").parse;
    var stateDim = vis.dimension(function (d) { return parseDate(d["state_abv"])});
    var stateFilter = stateDim.filterExact("US").top(Infinity)

    console.log(stateFilter)




    //stateDim.filterExact("AZ").top(Infinity)
    //f2 = yearDim.filterRange([minYear, maxYear]).top(Infinity)
//    cf.top_10 = cf.dimension(function (d) { return d["top_10%_income_share_including_capital_gains"]});
//
//    var ymtotal = yearDim.group().reduceSum(function(d) {return d.value;});
//    var minYear = yearDim.bottom(1)[0].year;
//    var maxYear = yearDim.top(1)[0].year;
//    var yearsArray = [];
//    ymtotal.top(Infinity).forEach(function(d){
//        yearsArray.push(+d.key)
//    });
//    var yearRange = yearsArray.sort(function(a,b){return a - b; })

//    console.log(vis.cf)

};

/*
 * Initialize area chart with brushing component
 */

Timeline.prototype.initVis = function(){
	//var vis = this; // read about the this

	vis.margin = {top: 0, right: 0, bottom: 30, left: 60};

	vis.width = 800 - vis.margin.left - vis.margin.right,
	vis.height = 100 - vis.margin.top - vis.margin.bottom;

	// SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
				.attr("width", vis.width + vis.margin.left + vis.margin.right)
				.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
				.append("g")
				.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

	// Scales and axes
	vis.x = d3.time.scale()
				.range([0, vis.width])
				.domain(d3.extent(vis.displayData, function(d) { return d.Year; }));

	vis.y = d3.scale.linear()
				.range([vis.height, 0])
				.domain([0, d3.max(vis.displayData, function(d) { return d.Expenditures; })]);

	vis.xAxis = d3.svg.axis().scale(vis.x).orient("bottom");

	// SVG area path generator
	vis.area = d3.svg.area()
				.x(function(d) { return vis.x(d.Year); })
				.y0(vis.height)
				.y1(function(d) { return vis.y(d.Expenditures); });

	vis.svg.append("path")
			  .datum(vis.displayData)
			  .attr("fill", "#ccc")
			  .attr("d", vis.area);

	// TO-DO: Append brush component here
	// Append brush component
	// Initialize brush component
	vis.brush = d3.svg.brush().x(vis.x).on("brush", brushed)


	// Initialize time scale (x-axis)
	vis.svg.append("g")
		.attr("class", "x brush")
		.call(vis.brush)
		.selectAll("rect")
		.attr("y", -6)
		.attr("height", vis.height + 7);

	vis.svg.append("g")
		.attr("class", "x-axis axis")
		.attr("transform", "translate(0," + vis.height + ")")
		.call(vis.xAxis);

}
