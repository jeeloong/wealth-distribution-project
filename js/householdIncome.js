// Reference
// http://stackoverflow.com/questions/34302958/d3-accessing-nested-data-in-grouped-bar-chart

/*
 * HouseholdIncome - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */
HouseholdIncome = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.incomeData = _data;
    this.displayData = []; // see data wrangling

    // DEBUG RAW DATA
    //console.log("incomeData", this.incomeData);

    this.initVis();
};

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */
HouseholdIncome.prototype.initVis = function(){

    var vis = this;

    // Add new column for States' Abbreviation
    vis.incomeData = vis.incomeData.map(function(d) {

        var tmpState = us_states.filter(function (v) {
            return v["name"] == d["State"];
        });

        return {
            State: d["State"],
            Abbreviation: tmpState[0]["abbreviation"],
            Year: d["Year"],
            "Median Household Income": d["Median Household Income"]
            }
    });
    //console.log("incomeData", vis.incomeData);

    // Determine the years
    vis.yearList = [];
    vis.incomeData.forEach(function (d) {
        vis.yearList.push(d["Year"]);
    });
    vis.yearList = $.unique(vis.yearList); // Obtain unique values
    vis.yearList.sort(function(a, b) { return a - b; }); // Sort in ascending order by Year
    //console.log("yearList", vis.yearList);

    // Determine the states
    vis.statesList = [];
    vis.incomeData.forEach(function (d) {
        vis.statesList.push(d["State"]);
    });
    vis.statesList = $.unique(vis.statesList); // Obtain unique values
    vis.statesList = vis.statesList.filter(function (d) {
        return d != "United States"; // Filter out "United States"
    });
    //console.log("statesList", vis.statesList);

    // Determine the states' abbreviation
    vis.statesAbbreviationList = vis.statesList.map(function (name) {

        var tmpState = us_states.filter(function (d) {
            return d["name"] == name;
        });
        //console.log("tmpState", tmpState);

        return tmpState[0]["abbreviation"];
    });
    //console.log("statesAbbreviationList", vis.statesAbbreviationList);

    // Determine the maximum income
    vis.maxIncome = [];
    vis.incomeData.forEach(function (d) {
        vis.maxIncome.push(d["Median Household Income"]);
    });
    vis.maxIncome = d3.max(vis.maxIncome); // Obtain max income
    //console.log("maxIncome", vis.maxIncome);

    // SVG Size
    vis.margin = {top: 40, right: 100, bottom: 60, left: 60};
    vis.width = 1200 - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;
    vis.barPadding = 0.1;
    vis.labelOffset = 5;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales
    // Reference: https://bost.ocks.org/mike/bar/3/
    vis.xScale = d3.scale.ordinal()
        .domain(vis.statesAbbreviationList)
        //.domain(vis.statesList)
        .rangeBands([0, vis.width], vis.barPadding);

    vis.yScale = d3.scale.linear()
        .domain([0, vis.maxIncome])
        .range([vis.height, 0]);

    // Axes
    vis.xAxis = d3.svg.axis()
        .scale(vis.xScale)
        .orient("bottom");
    vis.xAxisGroup = vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.yAxis = d3.svg.axis()
        .scale(vis.yScale)
        .tickFormat(formatCurrency)
        .orient("left");
    vis.yAxisGroup = vis.svg.append("g")
        .attr("class", "y-axis axis");

    // Tooltip placeholder
    var tooltip_x_pos = 35;
    var tooltip_y_pos = 15;

    vis.svg.append("g")
        .append("text")
        .attr("class", "tooltip-placeholder-HI")
        .attr("x", tooltip_x_pos)
        .attr("y", tooltip_y_pos);

    // Timing for transition
    vis.time_transition = 1000;
    vis.time_transition_axis = 1000;

    // Init slider
    vis.createSlider();

    // Filter, aggregate, modify data
    vis.wrangleData();
};

/*
 * Data wrangling
 */
HouseholdIncome.prototype.wrangleData = function(){

    var vis = this;

    vis.usIncome = vis.incomeData.filter(function(row) {
        return row['State'] == 'United States';
    });
    //console.log("usIncome", vis.usIncome);

    vis.statesIncome = vis.incomeData.filter(function(row) {
        return row['State'] != 'United States';
    });
    //console.log("statesIncome", vis.statesIncome);

    // Update the visualization
    vis.updateVis();
};

/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */
HouseholdIncome.prototype.updateVis = function(){

    var vis = this;

    // Filter data based on selected year
    vis.displayStatesData = vis.statesIncome.filter(function(row) {
        return row["Year"] == vis.selectedYear;
    });
    //console.log("displayStatesData", vis.displayStatesData);

    vis.displayUSData = vis.usIncome.filter(function(row) {
        return row["Year"] == vis.selectedYear;
    });
    //console.log("displayUSData", vis.displayUSData);

    /*==========================================================================*/
    /* Data-join (barChart now contains the update selection)
    /*==========================================================================*/
    vis.barChart = vis.svg.selectAll("rect")
        .data(vis.displayStatesData);

    // Create the us-line
    vis.usLine = vis.svg.selectAll(".line_US")
            .data(vis.displayUSData);

    // Create label for us-line's median household income
    vis.usLineLabel = vis.svg.selectAll(".group_line_US")
        .data(vis.displayUSData);

    /*==========================================================================*/
    /* Enter (initialize the newly added elements)
    /*==========================================================================*/
    vis.barChart.enter().append("rect")
        .attr("class", "bar");

    vis.usLine.enter().append('g')
        .attr("class", "group_line_US")
        .append("svg:line")
        .attr("class", "line line_US")
        .attr("x1", 0)
        .attr("x2", vis.width)
        .attr("y1", function (d) { return vis.yScale(d["Median Household Income"]); })
        .attr("y2", function (d) { return vis.yScale(d["Median Household Income"]); });

    vis.usLineLabel.enter().append("text")
        .attr("class", "2")
        .attr("id", "label-us-income")
        .attr("dx", 12)
        .attr("dy", ".35em");

    /*==========================================================================*/
    /* Update (set the dynamic properties of the elements)
    /*==========================================================================*/
    // Update bar chart
    vis.barChart.transition() // transition entering + updating
        .duration(vis.time_transition)
        .attr("x", function(d) { return vis.xScale(d["Abbreviation"]); })
        .attr("width", vis.xScale.rangeBand())
        .attr("y", function(d) { return vis.yScale(d["Median Household Income"]); })
        .attr("height", function(d) { return vis.height - vis.yScale(d["Median Household Income"]); });

    // Update us-line
    vis.usLine.transition() // transition entering + updating
        .duration(vis.time_transition)
        .attr("y1", function (d) { return vis.yScale(d["Median Household Income"]); })
        .attr("y2", function (d) { return vis.yScale(d["Median Household Income"]); });
    
    // Update label for us-line
    d3.select("#label-us-income")
        .data(vis.displayUSData)
        .transition() // transition entering + updating
        .duration(vis.time_transition)
        .attr("x", vis.width)
        .attr("y", function (d) { return vis.yScale(d["Median Household Income"]); })
        .text(function(d) {
            return formatTooltipCurrency(d["Median Household Income"]);
        });

    // Update axes
    vis.svg.select(".x-axis")
        .transition()
        .duration(vis.time_transition_axis)
        .call(vis.xAxis);
    vis.svg.select(".y-axis")
        .transition()
        .duration(vis.time_transition_axis)
        .call(vis.yAxis);

    // Update tooltip text
    vis.barChart
        .on("mouseover", function(d) {
            vis.svg.selectAll(".tooltip-placeholder-HI")
                .html(d["State"] + " (" + d["Abbreviation"] + ") " + formatTooltipCurrency(d["Median Household Income"]));
        })
        .on("mouseout", function(d) {
            vis.svg.selectAll(".tooltip-placeholder")
                .text("");
        });

    /*==========================================================================*/
    /* Exit
    /*==========================================================================*/
    vis.barChart.exit()
        .transition() // transition exiting
        .remove();
};

// http://refreshless.com/nouislider/
HouseholdIncome.prototype.createSlider = function(){

    var vis = this;

    var rangeSlider = document.getElementById('rangeSlider');

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

    noUiSlider.create(rangeSlider, {
        start: vis.yearData_Key["max"],
        snap: true,
        range: vis.yearData_Key,
        pips: {
            mode: 'count',
            values: 11,
            density: 4,
            stepped: true
        }
    });

    // Initialize labels to the min and max year
    document.getElementById("slider_year").innerHTML = vis.selectedYear;

    // http://refreshless.com/nouislider/events-callbacks/
    rangeSlider.noUiSlider.on('change', function(values, handle, unencoded, tap, positions){
        //console.log(values);
        vis.selectedYear = formatInteger(values);
        document.getElementById("slider_year").innerHTML = vis.selectedYear;
        vis.updateVis();
    });
};

// Create a new date from a string, return as a timestamp.
function timestamp(str){
    return new Date(str).getFullYear();
}