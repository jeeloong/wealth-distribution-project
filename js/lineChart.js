/*
 * LineChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the  
 */
LineChart = function(_parentElement, _data){
	this.parentElement = _parentElement;
	this.lineData = _data;
	this.displayData = []; // see data wrangling

	// DEBUG RAW DATA
	console.log(this.lineData);

	this.initVis();
}

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */
LineChart.prototype.initVis = function(){

	var vis = this;

	vis.margin = { top: 40, right: 0, bottom: 60, left: 100 };
	vis.width = 800 - vis.margin.left - vis.margin.right;
	vis.height = 800 - vis.margin.top - vis.margin.bottom;

	// SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
	    .attr("width", vis.width + vis.margin.left + vis.margin.right)
	    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
	  	.append("g")
	    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

	// Scales and axes
	vis.xScale = d3.time.scale()
  		.range([0, vis.width])
  		.domain(d3.extent(vis.lineData, function(d) { return d.Year; }));

	vis.yScale = d3.scale.linear()
		.range([vis.height, 0]);

	vis.xAxis = d3.svg.axis()
		  .scale(vis.xScale)
		  .orient("bottom");

	vis.yAxis = d3.svg.axis()
	    .scale(vis.yScale)
	    .orient("left");

	vis.svg.append("g")
	    .attr("class", "x-axis axis")
	    .attr("transform", "translate(0," + vis.height + ")");

	vis.svg.append("g")
			.attr("class", "y-axis axis");

	vis.svg.append("g")
		.append("text")
		.attr("class", "label-y-axis")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Average Wealth ($)");

	// Set ordinal color scale
	//vis.colorScale = d3.scale.category10();
	vis.colorScale = function(n) {
      var colores_g = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
      return colores_g[n % colores_g.length];
    }

	// Update color scale (all column headers except "Year")
	// Color scale will be used later for the line chart
	vis.colorScale.domain(d3.keys(vis.lineData[0]).filter(function (key) {
		return key != "Year";
	}));
	console.log(vis.colorScale.domain());

	// Get all categories
	var dataCategories = vis.colorScale.domain();

	// Transpose the data by rearranging data into layers
	vis.transposedData = dataCategories.map(function(name) {
		return {
			name: name,
			values: vis.lineData.map(function(d) {
				return {Year: d.Year, average_wealth: +d[name]};
			})
		};
	});
	console.log(vis.transposedData);

	// Line chart's layout
	vis.line = d3.svg.line()
		.interpolate("basis")
		.x(function(d) { return vis.xScale(d.Year); })
		.y(function(d) { return vis.yScale(d.average_wealth); });

	// Filter, aggregate, modify data
	vis.wrangleData();
}

/*
 * Data wrangling
 */
LineChart.prototype.wrangleData = function(){
	var vis = this;

	vis.displayData = vis.transposedData;
	//console.log(vis.displayData);

	// Update the visualization
	vis.updateVis();
}

/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */
LineChart.prototype.updateVis = function(){
	var vis = this;

	// Update domain
	//vis.yScale.domain(d3.extent(vis.displayData, function(d) { return d3.max(d.values, function(v) { return v.average_wealth; }); }));
	vis.yScale.domain([
		0,
		d3.max(vis.displayData, function(d) { return d3.max(d.values, function(v) { return v.average_wealth; }); })
	]);

	// Draw the lines
	var categories = vis.svg.selectAll(".line")
		.data(vis.displayData);

	categories.enter().append("path")
		.attr("class", "line");

	categories
  		.style("stroke", function(d) {
  			return vis.colorScale(d.name);
  		})
		.attr("d", function(d) {
			return vis.line(d.values); })
		.attr("fill", "none");

	categories.exit().remove();

	// Call axis functions with the new domain 
	vis.svg.select(".x-axis").call(vis.xAxis);
  	vis.svg.select(".y-axis").call(vis.yAxis);
}