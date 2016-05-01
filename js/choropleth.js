/*
Year,
State,
Income distribution (bottom 90, top 10, top 5, top 1, top 0.01)
Income
// http://bl.ocks.org/lewis500/raw/9312983/
*/


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
    var numberFormat = d3.format(".2f");

    $( "#slider-range-max" ).slider({
        range: "max",
        min: 1,
        max: 1200000,
        value: 36000,
        slide: function( event, ui ) {
            console.log(ui.value);
          $( "#amount" ).val( ui.value );
        }
    });
    $( "#amount" ).val( $( "#slider-range-max" ).slider( "value" ) );

    vis.usChart = dc.geoChoroplethChart("#us-chart");
    vis.incomeLineChart = dc.lineChart("#income-line-chart");

    //http://www.epi.org/publication/income-inequality-by-state-1917-to-2012/
    this.wrangleData();
}


Choropleth.prototype.wrangleData = function(){
    var vis = this;
    vis.data.nyStatesDim = vis.data.ny_times_data.dimension(function (d) { return d["state_abv"]});
    vis.data.stateCutsGroup = vis.data.ny_times_data.dimension(function (d) {
        return d["cuts"]
    });

    vis.data.stateGroup = vis.data.nyStatesDim.group().reduceSum(function(d) {
        return d["cuts"][50];
    });

    vis.data.statesGroup = vis.data.nyStatesDim.group().reduce(
        function reduceAdd(p, v) {
            console.log(v["cuts"].length);

            p.per_0 = v["cuts"][0]++;
            p.per_1 = v["cuts"][1]++;
            p.per_2 = v["cuts"][2]++;
            p.per_3 = v["cuts"][3]++;
            p.per_4 = v["cuts"][4]++;
            p.per_5 = v["cuts"][5]++;
            p.per_6 = v["cuts"][6]++;
            p.per_50 = v["cuts"][50]++;
            return p;
        },
        function reduceRemove(p, v) {
            p.per_0 = v["cuts"][0]++;
            p.per_1 = v["cuts"][1]--;
            p.per_2 = v["cuts"][2]--;
            p.per_3 = v["cuts"][3]--;
            p.per_4 = v["cuts"][4]--;
            p.per_5 = v["cuts"][5]--;
            p.per_6 = v["cuts"][6]--;
            p.per_50 = v["cuts"][50]--;
            return p;
        },
        function reduceInitial() {
            return {
                per_0: 0,
                per_1: 0,
                per_2: 0,
                per_3: 0,
                per_4: 0,
                per_5: 0,
                per_6: 0,
                per_50: 0
            }
        }
    );

   //console.log(vis.data.nyStatesDim.top(Infinity))

   //console.log(vis.data.yearGroup.all(Infinity));


//    console.log(vis.data.nyCutsDim.top(Infinity))
//    vis.data.yearDim = vis.data.top_incomes.dimension(function (d) { return d["Year"]});
//    vis.data.statesDim = vis.data.top_incomes.dimension(function (d) { return d["State Abv"]});
//    vis.data.yearFilter = vis.data.yearDim.filterExact(2012).top(Infinity)


//    var ymtotal = yearDim.group().reduceSum(function(d) {return d.value;});
//    var minYear = yearDim.bottom(1)[0].year;
//    var maxYear = yearDim.top(1)[0].year;
//    console.log(vis.data.yearFilter);

    // allData.statesFilter = allData.statesDim.filterExact("AZ").top(Infinity)
    // console.log(allData.statesFilter);
    // var yearFilterData = yearDim.filterExact(2012).top(Infinity)

    // (d["top_0.01%_income_share_including_capital_gains"] / 5.81) * 1000;
//    vis.data.stateRaisedSum = vis.data.statesDim.group().reduceSum(function (d) {
//        return d["0-90th percentiles"]
//    });

    // var ymtotal = yearDim.group().reduceSum(function(d) {return d.value;});
    // var stateDim = vis.dimension(function (d) { return parseDate(d["state_abv"])});
    // var stateFilter = stateDim.filterExact("US").top(Infinity)
    // var parseDate = d3.time.format("%Y").parse;

//    vis.data.yearGroup = vis.data.yearDim.group().reduce(
//        function reduceAdd(p, v) {
//            p.top001 = v["0-90th percentiles"]++;
//            return p;
//        },
//        function reduceRemove(p, v) {
//            p.top001 = v["0-90th percentiles"]--;
//            return p;
//        },
//        function reduceInitial() {
//            return {
//                top001: 0
//            }
//
//        }
//    );
    //this.createSlider();
    this.updateVis();
}

Choropleth.prototype.updateVis = function(){
    var vis = this;
    vis.data.numberFormat = function(num){
        format = d3.format("0,000");
        formattedX = "$" + format(num) + ".00";
        return formattedX;
    }

//    var wyoming = vis.data.yearDim.top(Infinity)[5]
//    console.log(vis.data.yearDim.top(Infinity)[5]);
//    //console.log((wyoming["Total income (1000s)"] * 1000) / wyoming["Number of tax units"]);
    vis.usChart.width(990)
                .height(500)
                .dimension(vis.data.nyStatesDim)
                .group(vis.data.stateGroup)
                .colors(d3.scale.quantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
                .colorDomain([25000, 65000])
                .colorCalculator(function (d) { return d ? vis.usChart.colors()(d) : '#ccc'; })
                .overlayGeoJson(vis.data.statesJson.features, "state", function (d) {
                    return d.properties.name;
                })
                .title(function (d) {
                    return "State: " + d.key + "\nMedian Household Income: " + vis.data.numberFormat(d.value ? d.value : 0);
                });

    //console.log(vis.usChart.filter());

    vis.incomeLineChart
        .width(380)
        .height(200)
        .margins({top: 10, right: 70, bottom: 30, left: 100})
        .dimension(vis.data.stateGroup)
        .group(vis.data.statesGroup)
        .valueAccessor(function(d) {
            return d.value.per_50;
        })
        .x(d3.scale.linear().domain([0, 300000]))
        .renderHorizontalGridLines(true)
        .elasticY(true)
        //.brushOn(true)
        .title(function(d){
            return d.key + "\nIncome Per Hourshold " + Math.round(d.value.per_50);
        })
        .xAxis().ticks(5);
    console.log(dc);

    dc.renderAll();
}

// http://refreshless.com/nouislider/
//Choropleth.prototype.createSlider = function(){
//
//    var vis = this;
//
//
//
////    var rangeSlider = document.getElementById('choropleth-range-slider');
////
////    // Generate key-value pair for rangeSlider
////    vis.yearData_Key = {};
////    vis.yearData_Key["min"] = vis.yearList[0];
////    var percentStep = 100 / (vis.yearList.length - 1);
////    for (var i = 1; i < vis.yearList.length - 1; i+=1) {
////        var key = format2DP(i * percentStep) + "%";
////        vis.yearData_Key[key] = vis.yearList[i];
////    }
////    vis.yearData_Key["max"] = vis.yearList[vis.yearList.length - 1];
////    //console.log("yearData_Key", vis.yearData_Key);
////
////    vis.selectedYear = vis.yearData_Key["max"];
////    //console.log("selectedYear", vis.selectedYear);
////
////    noUiSlider.create(rangeSlider, {
////        start: vis.yearData_Key["max"],
////        snap: true,
////        range: vis.yearData_Key,
////        pips: {
////            mode: 'count',
////            values: 11,
////            density: 4,
////            stepped: true
////        }
////    });
////
////    // Initialize labels to the min and max year
////    document.getElementById("slider-income").innerHTML = vis.selectedYear;
////
////    // http://refreshless.com/nouislider/events-callbacks/
////    rangeSlider.noUiSlider.on('change', function(values, handle, unencoded, tap, positions){
////
////        console.log(values);
////        vis.selectedYear = formatInteger(values);
////        document.getElementById("slider-income").innerHTML = vis.selectedYear;
////        vis.updateVis();
////    });
//};