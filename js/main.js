
// Will be used to the save the loaded JSON data
var allData = [];
var household_income_dataset = [];
var household_income_dataset_dc = [];
var average_wealth_dataset = [];
var average_real_wealth_per_family_dataset = [];
var top_income_dataset = [];

// Date parser to convert strings to date objects
var parseDate = d3.time.format("%Y").parse;
var parseYear = d3.time.format("%Y").parse;

// Set ordinal color scale
var colorScale = d3.scale.category10();

// Variables for the visualization instances
var choropleth, timeline, areaChart, lineChart, smallMultiples, householdIncome, barChart;

var formatYear = d3.format("Y");
var formatCurrency = d3.format("$s");
var formatTooltipCurrency = d3.format("$,");
var formatInteger = d3.format("d");
var format2DP = d3.format(".2f");

// Start application by loading the data
queue()
	.defer(d3.csv,  "data/wid_world_income_distribution.csv")
	.defer(d3.json, "data/us-states.json")
	.defer(d3.csv,  "data/average_wealth.csv")
    .defer(d3.csv,  "data/census_median_household_income.csv")
    .defer(d3.csv,  "data/census_median_household_income_dc.csv")
    .defer(d3.csv,  "data/berkeley-zuckman-average-real-wealth-per-family-data.csv")
    .defer(d3.csv,  "data/top-incomes-since-1917_vs2012.csv")
    .defer(d3.json, "data/ny-times-household-income.json")
	.await(loadData);


function loadData(error, dataCSV, statesJson, average_wealth_data, household_income_data, household_income_data_dc, average_real_wealth_per_family_data, top_incomes, ny_times_data){
	if(!error){
        allData.data = crossfilter(dataCSV);
        allData.top_incomes = crossfilter(top_incomes);
        allData.ny_times_data = crossfilter(ny_times_data);
        allData.statesJson = statesJson;
        
        // ***********************************************************************
        // Average Wealth
        // ***********************************************************************
        average_wealth_data.forEach(function (d) {
            //d.Year = parseYear(d.Year);
            d["Year"] = +d["Year"];
        });

        // Filter out data before 1980
        //data = data.filter(function(d){
        //	return d.Year >= 1980;
        //});

        // Hand CSV data off to global var
        average_wealth_dataset = average_wealth_data;

        // ***********************************************************************
        // Median Household Income
        // ***********************************************************************
        household_income_data.forEach(function (d) {
            d.Year = parseYear(d.Year);
        });

        // Hand CSV data off to global var
        household_income_dataset = household_income_data;

        household_income_data_dc.forEach(function (d) {
            d["Year"] = +d["Year"];
            d["Median Household Income"] = +d["Median Household Income"];
        });

        // Hand CSV data off to global var
        household_income_dataset_dc = household_income_data_dc;
        // ***********************************************************************
        // Average real wealth per family
        // ***********************************************************************
        var all = []
        average_real_wealth_per_family_data.forEach(function (d) {
            d["Bottom 90%"] = +d["Bottom 90%"];
            d["Top 10%"] = +d["Top 10%"];
            d["Top 5%"] = +d["Top 5%"];
            d["Top 1%"] = +d["Top 1%"];
            d["Top .5%"] = +d["Top .5%"];
            d["Top .1%"] = +d["Top .1%"];
            d["Top .01%"] = +d["Top .01%"];
        });

        // Hand CSV data off to global var
        average_real_wealth_per_family_dataset = average_real_wealth_per_family_data;


        // ***********************************************************************
        // Create visualization
        // ***********************************************************************
        createVis();
    } else {
        throw error;
    }
}


function createVis() {

	// TO-DO: Instantiate visualization objects here
	//areachart = new StackedAreaChart("stacked-area-chart", allData.layers)
    //	timeline = new Timeline("timeline", allData);
	areaChart = new AreaChart("area-chart", "wealth-circle-chart", average_wealth_dataset);
    householdIncome = new HouseholdIncome("income-bar-chart", household_income_dataset_dc);
    smallMultiples = new SmallMultiples("small-multiples", household_income_dataset);
    barChart = new BarChart("bar-chart", average_real_wealth_per_family_dataset);
    //choropleth = new Choropleth("choropleth", allData);
}


function brushed() {
	// Set new domain if brush (user selection) is not empty
	areachart.x.domain(
		timeline.brush.empty() ? timeline.x.domain() : timeline.brush.extent()
	);

	//console.log(areachart);
	//console.log(timeline);

	// Update focus chart (detailed information)
	areachart.wrangleData();

}

/*http://www.bootply.com/103783*/
//var jumboHeight = $('.jumbotron').outerHeight();
//function parallax(){
//    var scrolled = $(window).scrollTop();
//    $('.bg').css('height', (jumboHeight-scrolled) + 'px');
//}
//
//$(window).scroll(function(e){
//    parallax();
//});