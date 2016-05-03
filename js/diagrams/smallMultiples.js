// References:
// http://bl.ocks.org/mbostock/1157787
// http://vallandingham.me/small_multiples_with_details.html
// http://blog.webkid.io/multiple-maps-d3/
// http://jonathansoma.com/tutorials//d3/small-multiples/
// http://bl.ocks.org/officeofjane/7315455
// https://d3fc.io/components/chart/small-multiples.html
// http://www.delimited.io/blog/2014/3/3/creating-multi-series-charts-in-d3-lines-bars-area-and-streamgraphs

/*
 * SmallMultiples - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */
SmallMultiples = function(_parentElement, _data){
	this.parentElement = _parentElement;
	this.multiplesData = _data;
	this.displayData = []; // see data wrangling

	// DEBUG RAW DATA
	//console.log("multiplesData", this.multiplesData);

	this.initVis();
}

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */
SmallMultiples.prototype.initVis = function(){

	var vis = this;

	/*==========================================================================*/
	/* Small Multiples
	/*==========================================================================*/
	// Size of the svgs that hold the small multiples
	vis.margin = {top: 40, right: 40, bottom: 60, left: 60};
	vis.width = 300 - vis.margin.left - vis.margin.right;
	vis.height = 300 - vis.margin.top - vis.margin.bottom;

	// Scales
	vis.xScale = d3.time.scale()
		.range([0, vis.width])
		.domain(d3.extent(vis.multiplesData, function(d) {
			return d.Year; }));

	vis.yScale = d3.scale.linear()
		.range([vis.height, 0]);

	// Axes
	vis.xAxis = d3.svg.axis()
		.scale(vis.xScale)
		.orient("bottom");

	vis.yAxis = d3.svg.axis()
		.scale(vis.yScale)
		.tickFormat(formatCurrency)
		.orient("left");

	// Set ordinal color scale
	vis.colorScale = d3.scale.category20();

	// Update color scale (all column headers except "Year")
	// Color scale will be used later for the line chart
	vis.colorScale.domain(d3.keys(vis.multiplesData[0]).filter(function (key) {
		return key != "Year";
	}));
	//console.log(vis.colorScale.domain());

	// Get all categories
	var dataCategories = vis.colorScale.domain();
	//console.log("dataCategories", dataCategories);

	// Rearrange data into series
	vis.seriesData = dataCategories.map(function (name) {

		var tmpState = us_states.filter(function (d) {
			return d["name"] == name;
		});
		//console.log("tmpState", tmpState);

		return {
			name: name,
			abbreviation: tmpState[0]["abbreviation"],
			values: vis.multiplesData.map(function (d) {
				return {Year: d["Year"], Median_Household_Income: d[name]};
			})
		};
	});
	//console.log("seriesData", vis.seriesData);

	// Line chart's function
	vis.line = d3.svg.line()
		.interpolate("basis")
		.x(function(d) { return vis.xScale(d.Year); })
		.y(function(d) { return vis.yScale(d["Median_Household_Income"]); });

	/*==========================================================================*/
	/* Detail Panel
	/*==========================================================================*/
	// Size of the svg that hold the detail chart
	vis.detail_width = 600 - vis.margin.left - vis.margin.right;
	vis.detail_height = 600 - vis.margin.top - vis.margin.bottom;

	// Create svg to hold detail line chart
	var detailSvg = d3.select("#detail")
						.append('svg')
						.attr("id", "svg-detail")
						.attr("class", "svg-detail")
						.attr("width", vis.detail_width + vis.margin.left + vis.margin.right)
						.attr("height", vis.detail_height + vis.margin.top + vis.margin.bottom)
						.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
						.on("click",
							function(d) {
								// Hide the detail view and show the previews view when clicked
								toggleHidden(false);
							});

	// Scales
	vis.detail_xScale = d3.time.scale()
		.range([0, vis.detail_width])
		.domain(d3.extent(vis.multiplesData, function(d) { return d.Year; }));

	vis.detail_yScale = d3.scale.linear()
		.range([vis.detail_height, 0]);

	// Axes
	vis.detail_xAxis = d3.svg.axis()
		.scale(vis.detail_xScale)
		.orient("bottom");
	vis.detail_xAxisGroup = detailSvg.append("g")
		.attr("class", "x-axis axis")
		.attr("transform", "translate(0," + vis.detail_width + ")");

	vis.detail_yAxis = d3.svg.axis()
		.scale(vis.detail_yScale)
		.tickFormat(formatCurrency)
		.orient("left");
	vis.detail_yAxisGroup = detailSvg.append("g")
		.attr("class", "y-axis axis");

	// Line chart's function
	vis.detail_line = d3.svg.line()
		.interpolate("basis")
		.x(function(d) { return vis.detail_xScale(d.Year); })
		.y(function(d) { return vis.detail_yScale(d["Median_Household_Income"]); });

	// Title
	detailSvg.append("text")
		.attr("id", "detail-label")
		.attr('class','detail-label')
		.attr('x', vis.detail_width/ 2)
		.attr('y', 20)
		.attr('text-anchor', 'middle');

	// Filter, aggregate, modify data
	vis.wrangleData();
}

/*
 * Data wrangling
 */
SmallMultiples.prototype.wrangleData = function(){
	var vis = this;

	// Filter for "United States"
	vis.usData = vis.seriesData.filter(function(d){ return d.name == "United States"; });
	//console.log("usData", vis.usData);

	// Filter out "United States"
	vis.seriesData = vis.seriesData.filter(function(d){ return d.name != "United States"; });
	//console.log("seriesData", vis.seriesData);

	// Update the visualization
	vis.updateVis();
}

/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */
SmallMultiples.prototype.updateVis = function(){

	var vis = this;

	/*==========================================================================*/
	/* Small Multiples
	/*==========================================================================*/
	// Get the maximum of the multi-dimensional array or in other words, get the highest peak
	vis.yScale.domain([0, d3.max(vis.seriesData, function(d) {
		return d3.max(d.values, function(v) {
			return v["Median_Household_Income"];
		});
	})
	]);

	// Create the svg elements
	// Add 1 svg for every single data point
	var pre = d3.select("#" + vis.parentElement)
		.select("#previews")
		.selectAll(".preview")
		.data(vis.seriesData);

	pre.enter()
		.append("div")
		.attr("class", "preview")
		.attr("width", vis.width)
		.attr("height", vis.height);

	var svgs = pre.append('svg')
		.attr("class", "svg-multiples")
		.attr("id", function (d) {
			return "sm_" + d["abbreviation"];
		})
		.attr("width", vis.width + vis.margin.left + vis.margin.right)
		.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
		.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

	// Inside of each svg, draw the line for median household income of the respective state
	svgs.append("g")
		.attr("class", "group_line_state")
		.append("path")
		.attr("class", "line line_state")
		.style("stroke", function(d) {
			return vis.colorScale(d.name);
		})
		.attr("d", function(d) {
			return vis.line(d.values);
		});

	// Draw the line for median household income of US for every small multiples
	svgs.selectAll(".line_US")
		.data(vis.usData)
		.enter()
		.append('g')
		.attr("class", "group_line_US")
		.append("path")
		.attr("class", "line line_US")
		.attr("d", function(d) {
			return vis.line(d.values);
		});

	// Axes
	svgs.append("g")
		.attr("class", "x-axis axis")
		.attr("transform", "translate(0," + vis.height + ")")
		.call(vis.xAxis);

	svgs.append("g")
		.attr("class", "y-axis axis")
		.call(vis.yAxis);

	// Title
	svgs.append("text")
		.attr('class','label')
		.attr('x', vis.width / 2)
		.attr('y', 20)
		.text( function(d) {
			return d.name;
		})
		.attr('text-anchor', 'middle');

	// Create a rect overlay that will intercept with mouse clicks and
	// show detail view of clicked chart
	svgs.append("rect")
		.attr("width", vis.width)
		.attr("height", vis.height)
		.attr("class", "mouse_preview")
		.on("click", function(d) {

			/*==========================================================================*/
			/* Detail Panel - Update
			/*==========================================================================*/
			toggleHidden(true);

			// Update Scale
			vis.detail_yScale.domain([0, d3.max(vis.seriesData, function(d) {
				return d3.max(d.values, function(v) {
					return v["Median_Household_Income"];
				});
			})
			]);

			// Create a temp variable to point to the detail view
			var detailSvg = d3.select("#svg-detail");

			// Update the line path for median household income of the selected state
			var line_state = detailSvg.selectAll(".line_state")
				.data([d]);

			line_state.enter()
				.append("path")
				.attr("class", "line line_state");

			line_state.style("stroke", function(d) {
				return vis.colorScale(d.name);
			})
				.attr("d", function(d) {
				return vis.detail_line(d.values);
			});

			line_state.exit().remove();

			// Re-draw the line for median household income of US
			var line_US = detailSvg.selectAll(".line_US")
				.data(vis.usData);

			line_US.enter()
				.append("path")
				.attr("class", "line line_US");

			line_US.attr("d", function(d) {
				return vis.detail_line(d.values);
			});

			line_US.exit().remove();

			// Update axes
			detailSvg.select(".x-axis")
				.call(vis.detail_xAxis);
			detailSvg.select(".y-axis")
				.call(vis.detail_yAxis);

			// Update title
			d3.select(".detail-label")
				.text( d.name);
		});

	/*==========================================================================*/
	/* Detail Panel
	/*==========================================================================*/
	// Create a temp variable to point to the detail view
	var detailSvg = d3.select("#svg-detail");

	// Draw the line for median household income of the selected state
	// Using vis.usData as the initial line
	detailSvg.selectAll(".line_state")
		.data(vis.usData)
		.enter()
		.append("g")
		.attr("class", "group_line_state")
		.append("path")
		.attr("class", "line line_state")
		.style("stroke", function(d) {
			return vis.colorScale(d.name);
		})
		.attr("d", function(d) {
			return vis.detail_line(d.values);
		});

	// Draw the line for median household income of US
	detailSvg.selectAll(".line_US")
		.data(vis.usData)
		.enter()
		.append("g")
		.attr("class", "group_line_US")
		.append("path")
		.attr("id", "line_US")
		.attr("class", "line line_US")
		.attr("d", function(d) {
			return vis.detail_line(d.values);
		});
};

function toggleHidden(show) {
	d3.select("#previews").classed("hidden", show).classed("visible", !show);
	return d3.select("#detail").classed("hidden", !show).classed("visible", show);
}

function checkSM(val) {
	var tmpSM = "#sm_" + val.value;
	d3.select(tmpSM).classed("hidden", !(val.checked)).classed("visible", (val.checked));
}

function checkmultipleSM(val) {
	var tmpDivision = "." + val.value;
	d3.selectAll(tmpDivision).property('checked', val.checked); // Set checkboxes
	$(tmpDivision).trigger('change'); // Manual trigger using jQuery
}