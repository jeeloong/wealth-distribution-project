// References:
// http://dc-js.github.io/dc.js/
// http://www.codeproject.com/Articles/693841/Making-Dashboards-with-Dc-js-Part-Using-Crossfil
// http://bl.ocks.org/saraquigley/81807cb241cb4bbbaa6b
// https://dc-js.github.io/dc.js/docs/stock.html
// http://statisticalatlas.com/United-States/Household-Income

var usIncome_LineChart = dc.lineChart("#income-line-chart");
var stateIncome_BarChart = dc.barChart("#income-bar-chart");

queue()
    .defer(d3.csv,  "data/census_median_household_income_dc.csv")
    .await(createVisualization);

function createVisualization(error, incomeCSV){

    // Format the data
    incomeCSV.forEach(function (d) {
        d["Year"] = parseYear(d["Year"]);
        d["Median Household Income"] = +d["Median Household Income"];
    });
    //console.log("incomeCSV", incomeCSV);

    // Feed it through crossfilter
    var incomeData = crossfilter(incomeCSV);

    // Define group all for counting
    var all = incomeData.groupAll();

    // Define dimension
    var stateByYearDim = incomeData.dimension(function (d) { return d["State Abbreviation"]; });
    var usByYearDim = incomeData.dimension(function (d) { return d["State"]; });
    // print_filter(usByYearDim); // Before filtering for "United States"
    var incomeByYearDim = incomeData.dimension(function (d) { return d["Year"]; });

    // Filter for "United States"
    var usFilter = usByYearDim.filterExact("United States").top(Infinity);
    // print_filter(usByYear); // After filtering for "United States"

    // Group
    var incomeByYearGroup = incomeByYearDim.group().reduceSum(function (d) { return d["Median Household Income"];});
    // print_filter(incomeByYearGroup);

    var stateIncomeByYearGroup = stateByYearDim.group().reduce(
        function reduceAdd(p, v) {
            p.income= v["Median Household Income"]++;
            return p;
        },
        function reduceRemove(p, v) {
            p.income = v["Median Household Income"]--;
            return p;
        },
        function reduceInitial() {
            return {
                income: 0
            }
        }
    );
    // print_filter(us_incomeByYearGroup);

    // Create series chart
    usIncome_LineChart.width(1000)
        .height(500)
        .margins({top: 10, right: 150, bottom: 30, left: 50})
        .transitionDuration(1000)
        .dimension(usByYearDim)
        .group(incomeByYearGroup)
        .x(d3.time.scale().domain([new Date(1984, 01, 01), new Date(2014, 12, 31)]))
        .yAxisLabel("Median Household Income")
        .yAxis().ticks(6).tickFormat(formatCurrency);

    // Create bar chart
    stateIncome_BarChart.width(1000)
        .height(500)
        .margins({top: 10, right: 150, bottom: 30, left: 50})
        .dimension(stateByYearDim)
        .group(stateIncomeByYearGroup)
        .valueAccessor(function(d) {
            return d.value.income;
        })
        .x(d3.scale.ordinal()) // Need empty val to offset first value
        .xUnits(dc.units.ordinal) // Tell dc.js that we're using an ordinal x-axis
        .elasticY(true)
        .gap(5)
        .yAxisLabel("Median Household Income")
        .yAxis().ticks(6).tickFormat(formatCurrency);

    // Tell dc to render
    dc.renderAll();
}

function print_filter(filter){
    var f=eval(filter);
    if (typeof(f.length) != "undefined") {}else{}
    if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
    if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
    console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
}