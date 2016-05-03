/*
 * AreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */
AreaChart = function(_parentElement, _secondaryElement, _data){
	this.parentElement = _parentElement;
	this.secondaryElement = _secondaryElement;
	this.areaData = _data;
	this.displayData = []; // see data wrangling

	// DEBUG RAW DATA
	//console.log(this.areaData);

	this.initVis();
}

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */
AreaChart.prototype.initVis = function(){

	var vis = this;

	// Determine the years
	vis.yearList = [];
	vis.areaData.forEach(function (d) {
		vis.yearList.push(d["Year"]);
	});
	vis.yearList = $.unique(vis.yearList); // Obtain unique values
	vis.yearList.sort(function(a, b) { return a - b; }); // Sort in ascending order by Year
	//console.log("yearList", vis.yearList);

	// Determine the maximum wealth
	// vis.maxWealth = [];
	// vis.areaData.forEach(function (d) {
	// 	vis.maxWealth.push(d["Top 1%"]);
	// 	vis.maxWealth.push(d["Top 5%"]);
	// 	vis.maxWealth.push(d["Top 10%"]);
	// 	vis.maxWealth.push(d["All"]);
	// 	vis.maxWealth.push(d["Bottom 90%"]);
	// });
	// vis.maxWealth = d3.max(vis.maxWealth); // Obtain max income
	// //console.log("maxWealth", vis.maxWealth);

	/*==========================================================================*/
	/* Main area chart
	/*==========================================================================*/
	// SVG Size
	vis.margin = { top: 40, right: 0, bottom: 60, left: 100 };
	vis.width = 800 - vis.margin.left - vis.margin.right;
	vis.height = 700 - vis.margin.top - vis.margin.bottom;

	// SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
		.attr("width", vis.width + vis.margin.left + vis.margin.right)
		.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
		.append("g")
		.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

	// Scales and axes
	vis.xScale = d3.time.scale()
		.range([0, vis.width])
		.domain(d3.extent(vis.areaData, function(d) { return d.Year; }));

	// vis.yScale = d3.scale.linear()
	// 	.range([vis.height, 0]);

	vis.xAxis = d3.svg.axis()
		.scale(vis.xScale)
		.tickFormat(formatYear)
		.orient("bottom");

	// vis.yAxis = d3.svg.axis()
	// 	.scale(vis.yScale)
	// 	.tickFormat(formatCurrency)
	// 	.orient("left");

	vis.svg.append("g")
		.attr("class", "x-axis axis")
		.attr("transform", "translate(0," + vis.height + ")");

	vis.svg.append("g")
		.attr("id", "y-axis-wealth")
		.attr("class", "y-axis axis");

	// vis.svg.select("#y-axis-wealth")
	// 	.on("click", function() {
	// 		if (vis.selectedScale == "Linear") {
	// 			vis.selectedScale = "Log";
	// 		} else {
	// 			vis.selectedScale = "Linear";
	// 		}
	// 		vis.updateVis();
	// 	});

	vis.svg.append("g")
		.append("text")
		.attr("class", "label-y-axis")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "-3.5em")
		.style("text-anchor", "end")
		.text("Average Wealth ($)");

	// Set ordinal color scale
	vis.colorScale = d3.scale.ordinal()
            .range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"]);

	// Update color scale (all column headers except "Year")
	// Color scale will be used later for the stacked area chart
	vis.colorScale.domain(d3.keys(vis.areaData[0]).filter(function (key) {
		return key != "Year";
	}));
	//console.log(vis.colorScale.domain());

	// Get all categories
	vis.dataCategories = vis.colorScale.domain();

	// Transpose the data by rearranging data into layers
	vis.transposedData = vis.dataCategories.map(function(name) {
		return {
			name: name,
			values: vis.areaData.map(function(d) {
				return {Year: d.Year, average_wealth: +d[name]};
			})
		};
	});
	//console.log(vis.transposedData);

	// Area chart's layout
	vis.area = d3.svg.area()
		.interpolate("cardinal")
		.x(function(d) { return vis.xScale(d.Year); })
		.y0(vis.height)
		.y1(function(d) { return vis.yScale(d.average_wealth); });

	// Tooltip placeholder
	var tooltip_x_pos = 35;
	var tooltip_y_pos = 15;

	vis.svg.append("g")
		.append("text")
		.attr("class", "tooltip-placeholder")
		.attr("x", tooltip_x_pos)
		.attr("y", tooltip_y_pos);

	/*==========================================================================*/
	/* Secondary circle chart
	/*==========================================================================*/
	vis.width2 = 400;
	vis.height2 = 400;

	// SVG drawing area
	vis.svg2 = d3.select("#" + vis.secondaryElement).append("svg")
		.attr("width", vis.width2)
		.attr("height", vis.height2)
		.attr("id", "test_svg")
		.append("g");

	// Scale
	vis.rScale = d3.scale.log()
		.range([0, vis.width2]);

	/*==========================================================================*/
	/* Button
	/*==========================================================================*/
	// Detect button click
	d3.select("#btnChangeScale").on("click", function() {

		vis.selectedScale = d3.select("#btnChangeScale").property("value");
		// vis.selectedScale = document.getElementById("btnChangeScale").value;

		if (vis.selectedScale == "Linear Scale") {
			document.getElementById("btnChangeScale").value = "Log Scale";
			vis.selectedScale = "Log Scale";
		} else {
			document.getElementById("btnChangeScale").value = "Linear Scale";
			vis.selectedScale = "Linear Scale";
		}

		vis.updateVis();
	});

	// Initialize scale selection to "Linear"
	vis.selectedScale = "Linear Scale";

	// Initialize to no filtering
	vis.filterCategory = "";

	// Init slider
	vis.createSlider();

	// Filter, aggregate, modify data
	vis.wrangleData();
}

/*
 * Data wrangling
 */
AreaChart.prototype.wrangleData = function(){
	var vis = this;

	//vis.displayData = vis.transposedData;
	//console.log(vis.displayData);

	if (vis.filterCategory == "") {
		// In the first step no data wrangling/filtering needed
		vis.displayData = vis.transposedData;
	} else {
		// Filter
		vis.displayData = vis.transposedData.filter(function(d){
			return d.name == vis.filterCategory;
		});
	}

	// Update the visualization
	vis.updateVis();
}

/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */
AreaChart.prototype.updateVis = function(){

	var vis = this;

	// Filter data based on selected year
	vis.displayWealthData = vis.areaData.filter(function(row) {
		return row["Year"] == vis.selectedYear;
	});

	// Update text info
	vis.displayWealthData.map(function (d) {
		document.getElementById("info_wealth_top1").innerHTML = formatTooltipCurrency(d["Top 1%"]);
		document.getElementById("info_wealth_top5").innerHTML = formatTooltipCurrency(d["Top 5%"]);
		document.getElementById("info_wealth_top10").innerHTML = formatTooltipCurrency(d["Top 10%"]);
		document.getElementById("info_wealth_all").innerHTML = formatTooltipCurrency(d["All"]);
		document.getElementById("info_wealth_bottom90").innerHTML = formatTooltipCurrency(d["Bottom 90%"]);
	});

	// Rearranging data into layers
	vis.displayWealthData = vis.dataCategories.map(function(name) {
		return {
			name: name,
			values: vis.displayWealthData.map(function(d) {
				return {average_wealth: +d[name]};
			})
		};
	});
	//console.log("displayWealthData", vis.displayWealthData);

	// Update axis scale & domain
	if (vis.selectedScale == "Linear Scale") {
		vis.yScale = d3.scale.linear()
			.range([vis.height, 0])
			.domain([
				0,
				d3.max(vis.displayData, function(d) { return d3.max(d.values, function(v) { return v.average_wealth; }); })
		]);

		vis.yAxis = d3.svg.axis()
			.scale(vis.yScale)
			.tickFormat(formatCurrency)
			.orient("left");

		vis.rScale = d3.scale.linear()
			.range([0, vis.width2])
			.domain([
				0,
				d3.max(vis.displayWealthData, function(d) { return d3.max(d.values, function(v) { return v.average_wealth; }); })
		]);
	} else {
		vis.yScale = d3.scale.log()
			.range([vis.height, 0])
			.domain([
				Math.exp(0),
				d3.max(vis.displayData, function(d) { return d3.max(d.values, function(v) { return v.average_wealth; }); })
		]);

		// http://stackoverflow.com/questions/16211095/how-can-i-get-numeric-values-instead-of-logarthmic-values-in-d3-axis-scale
		vis.yAxis = d3.svg.axis()
			.scale(vis.yScale)
			.tickFormat(function (d) {
				return vis.yScale.tickFormat(8, formatCurrency)(d)
			})
			.orient("left");

		vis.rScale = d3.scale.log()
			.range([0, vis.width2])
			.domain([
				Math.exp(0),
				d3.max(vis.displayWealthData, function(d) { return d3.max(d.values, function(v) { return v.average_wealth; }); })
		]);
	}

	/*==========================================================================*/
	/* Data-join
	/*==========================================================================*/
	// Draw the areas
	var categories = vis.svg.selectAll(".area")
		.data(vis.displayData);

	var circle = vis.svg2.selectAll(".wealth-circles")
		.data(vis.displayWealthData);
	/*==========================================================================*/
	/* Enter (initialize the newly added elements)
	/*==========================================================================*/
	categories.enter().append("path")
		.attr("class", "area");

	circle.enter().append("circle")
		.attr("class", "wealth-circles");
	/*==========================================================================*/
	/* Update (set the dynamic properties of the elements)
	/*==========================================================================*/
	categories
		.style("fill", function(d) {
			return vis.colorScale(d.name);
		})
		.attr("d", function(d) {
			return vis.area(d.values); });

	circle
		.attr('r', function(d){
			return d.values.map(function (v) {
				return vis.rScale(v["average_wealth"]);
			})
		})
		.attr("cx", 0)
		.attr("cy", vis.height2)
		.style("fill", function(d) {
			return vis.colorScale(d.name);
		});

	// Update tooltip text
	categories
		.on("mouseover", function(d) {
			vis.svg.selectAll(".tooltip-placeholder")
				.text(d.name)
				.style("fill", vis.colorScale(d.name));
		})
		.on("mouseout", function(d) {
			vis.svg.selectAll(".tooltip-placeholder")
				.text("");
		})
		.on("click", function(d) {
			vis.filterCategory = (vis.filterCategory == d.name) ? "" : d.name;
			//console.log("vis.filterCategory", vis.filterCategory);
			vis.wrangleData();
		});

	// Update axes
	vis.svg.select(".x-axis").call(vis.xAxis);
	vis.svg.select(".y-axis").call(vis.yAxis);

	/*==========================================================================*/
	/* Exit
	/*==========================================================================*/
	categories.exit().remove();
	circle.exit().remove();
}

// http://refreshless.com/nouislider/
AreaChart.prototype.createSlider = function(){

	var vis = this;

	var rangeSlider = document.getElementById('rangeSlider_WealthDistribution');

	// Generate key-value pair for rangeSlider
	vis.yearData_Key = {};
	vis.yearData_Key["min"] = vis.yearList[0];

	var percentStep = 100 / (vis.yearList.length - 1);
	for (var i = 1; i < vis.yearList.length - 1; i+=1) {
		var key = format2DP(i * percentStep) + "%";
		vis.yearData_Key[key] = vis.yearList[i];
	}
	vis.yearData_Key["max"] = vis.yearList[vis.yearList.length - 1];
	//console.log("yearData_Key", vis.yearData_Key);

	vis.selectedYear = vis.yearData_Key["max"];
	//console.log("selectedYear", vis.selectedYear);
	document.getElementById("info_wealth_year").innerHTML = vis.selectedYear;

	noUiSlider.create(rangeSlider, {
		start: vis.yearData_Key["max"],
		snap: true,
		range: vis.yearData_Key,
		pips: {
			mode: 'count',
			values: 17,
			density: 3,
			stepped: true
		}
	});

	// Initialize labels to the min and max year
	document.getElementById("slider_year_WealthDistribution").innerHTML = vis.selectedYear;

	// http://refreshless.com/nouislider/events-callbacks/
	rangeSlider.noUiSlider.on('change', function(values, handle, unencoded, tap, positions){
		//console.log(values);
		vis.selectedYear = formatInteger(values);
		document.getElementById("slider_year_WealthDistribution").innerHTML = vis.selectedYear;
		document.getElementById("info_wealth_year").innerHTML = vis.selectedYear;
		vis.updateVis();
	});
};

// Create a new date from a string, return as a timestamp.
function timestamp(str){
	return new Date(str).getFullYear();
}