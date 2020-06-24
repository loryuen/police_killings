// Define SVG area dimensions
var svgWidth = 530;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 20,
  right: 80,
  bottom: 60,
  left: 80
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3.select("#plot")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append a group area, then set its margins (for national plot)
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Configure a parseTime function which will return a new Date object from a string
var parseTime = d3.timeParse("%Y");
// var parseTime = d3.timeParse("%Y-%m-%d");




///////////////////////////////
// init view (national data) //
///////////////////////////////

function init() {
    nationalView();
};
init();


//////////////////////////////////
//////////////////////////////////


///////////////////////////////////////
// function for drop down of states //
//////////////////////////////////////
function buildDropdown() {
    d3.csv('assets/data/data_fe_state.csv').then(function(stateData) {
        
        // map only unique state abbreviations
        var stateAbbr = d3.map(stateData, function(d) {
            return (d.state_death)
        }).keys()
        // print state abbreviations
        console.log(stateAbbr)

        // add options to the button
        d3.select("#selState")
            .selectAll('myOptions')
                .data(stateAbbr)
            .enter()
                .append('option')
            .text(function(d) {
                return (d)
            })
            .attr("value", function(d) {
                return d;
            })
    });
};
buildDropdown();

//////////////////////////////////////////////////////////////
//function for line plot of covid cases by state (diff api) //
//////////////////////////////////////////////////////////////
function statePlots() {
    d3.csv('assets/data/data_fe_state.csv').then(function(stateData) {

        var chartGroup2 = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Format the date and cast the total cases value to a number
        stateData.forEach(function(data) {
            data.year = parseTime(data.year);
            data.total_killed = +data.total_killed;
        });

        // configure x scale
        var xTimeScale = d3.scaleTime()
        .range([0, chartWidth])
        .domain(d3.extent(stateData, data => data.year));

        // Configure a linear scale with a range between the chartHeight and 0
        // Set the domain for the xLinearScale function
        var yLinearScale = d3.scaleLinear()
            .range([chartHeight, 0])
            .domain([0, d3.max(stateData, data => data.total_killed)]);

        // Create two new functions passing the scales in as arguments
        var rightAxis = d3.axisRight(yLinearScale);

        // Configure a drawLine function which will use our scales to plot the line's points
        var drawLine = d3
            .line()
            .x(data => xTimeScale(data.year))
            .y(data => yLinearScale(data.total_killed));

        // Append an SVG group element to the SVG area, create the left axis inside of it
        chartGroup2.append("g")
            .classed("axis-blue", true)
            .attr("transform", "translate(370,0)")
            .call(rightAxis);

        // label y right axis
        chartGroup2.append("text")
            .attr("class", "y-label")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 + svgWidth - 110)
            .attr("x", 0 - (chartHeight/2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", "steelblue")
            .text("Number Killed by State")

        // Append an SVG path and plot its points using the line function
        var line = chartGroup2.append("path")
            .attr("d", drawLine (stateData[0]) )
            .classed("line", true)
            .style("stroke", "steelblue")
            .attr("stroke-width", 2)
            .style("fill","none");

        ///////////////////////////////
        // function to update chart //
        ///////////////////////////////
        function update(selectedGroup) {
            var dataFilter = stateData.filter(function(d) {
                return d.state_death == selectedGroup
            })

            // give new data to update line
            line.datum(dataFilter)
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .x(data => xTimeScale(data.year))
                    .y(data => yLinearScale(data.total_killed))
                )
            updateCircles(selectedGroup)
        }
            
        function updateCircles(selectedGroup) {
            var dataFilter = stateData.filter(function(d) {
                return d.state_death == selectedGroup
            })
            //test
            var chartGroup2 = svg.append("g")
             .attr("transform", `translate(${margin.left}, ${margin.top})`);

            var circlesGroup2 = chartGroup2.selectAll("circle")
                .data(dataFilter)
                .enter()
                .append("circle")
                .attr("cx", data => xTimeScale(data.year))
                .attr("cy", data => yLinearScale(data.total_killed))
                .attr("r", "2")
                .attr("fill", "darkgrey")
                .attr("stroke-width", "1")
                .attr("stroke", "black");

            //////////////
            // tool tip //
            //////////////

            // Date formatter to display dates nicely
            var dateFormatter = d3.timeFormat("%Y");

            // number formatter for commas
            var numberFormat = function(d) {
                return d3.format(",")(d);
            }

            // Step 1: Initialize Tooltip
            var toolTip = d3.tip()
                .attr("class", "tooltip")
                .offset([80, -60])
                .html(function(data) {
                    return (`<h7><strong>${data.state_death}</strong></h7> | <h7><strong>${dateFormatter(data.year)}</strong></h7><br>
                    <h7>Total Killed: ${numberFormat(data.total_killed)}</h7><br>
                    <h7>Black: ${numberFormat(data.killed_black)}, (${data.perc_killed_black}%)</h7><br>
                    <h7>Caucasian: ${numberFormat(data.killed_caucasian)} (${data.perc_killed_caucasian}%)</h7>`);
                });

            // Step 2: Create the tooltip in chartGroup.
            chartGroup2.call(toolTip);

            // Step 3: Create "mouseover" event listener to display tooltip
            circlesGroup2.on("mouseover", function(data) {
            toolTip.show(data, this);
            })
            // Step 4: Create "mouseout" event listener to hide tooltip
            .on("mouseout", function(data) {
                toolTip.hide(data);
            });
        }
            
        ///////////////////////////////////////////////////////////////////////
        // Event Listener - when button is changed, run updateChart function //
        ///////////////////////////////////////////////////////////////////////

        d3.select("#selState").on("change", function(d) {

            var selectedOption = d3.select(this).property("value")
            update(selectedOption);

        });
    });
};

///////////////////////////////////////////////
// click handler for filter states dropdown //
///////////////////////////////////////////////
d3.select("#selState").on("click", statePlots)

// function to clear plots
function clearPlots() {
    d3.selectAll(".line").remove();
    d3.selectAll("circle").remove();

}

///////////////////////////////////////////
// click handler for clear plots button //
//////////////////////////////////////////
d3.select("#selClear").on("click", clearPlots)

//////////////////////////////////
// national view button handler //
//////////////////////////////////
function handleButtonSelect() {
    d3.event.preventDefault();

    // // remove tick labels and y-label so it doesn't pile on top of each other making text hard to read
    // d3.selectAll(".tick").remove();
    // d3.selectAll(".y-label").remove();

    var national = d3.select('#selButton').node().value;
    console.log(national);

    nationalButtonSelected();
};

///////////////////////////////////////////////
// function to render graph of national view //
///////////////////////////////////////////////
function nationalButtonSelected() {
    d3.csv('assets/data/data_fe_race.csv').then(function(nationalData) {
        nationalView();
    })
};

//////////////////////////////////////////////////////
// button handler to show national plot upon click //
//////////////////////////////////////////////////////
d3.select("#selButton").on("click", handleButtonSelect)

//////////////////////////////////////////////////////
//function for line plot of covid cases nationally //
//////////////////////////////////////////////////////
function nationalView() {
    // Load data from api covid cases national view
    d3.csv('assets/data/data_fe_race.csv').then(function(raceData) {
        
        // Print the data
        console.log(raceData);

        // Format the date and cast the total cases value to a number
        raceData.forEach(function(data) {
            data.year = parseTime(data.year);
            data.total_killed = +data.total_killed;
            // console.log(data.year)
        });

        // Configure a time scale with a range between 0 and the chartWidth
        var xTimeScale = d3.scaleTime()
            .range([0, chartWidth])
            .domain([d3.min(raceData, data => data.year),d3.max(raceData, data => data.year)]);
            // .domain(d3.extent(nationalData, data => data.year));
        // Configure a linear scale with a range between the chartHeight and 0
        var yLinearScale = d3.scaleLinear()
            .range([chartHeight, 0])
            .domain([0, d3.max(raceData, data => data.total_killed)]);

        // Create two new functions passing the scales in as arguments
        var bottomAxis = d3.axisBottom(xTimeScale).tickFormat(d3.timeFormat("%Y"));
        var leftAxis = d3.axisLeft(yLinearScale);

        // Configure a drawLine function which will use our scales to plot the line's points
        var drawLine = d3
            .line()
            .x(data => xTimeScale(data.year))
            .y(data => yLinearScale(data.total_killed));

        // Append an SVG group element to the SVG area, create the left axis inside of it
        chartGroup.append("g")
            .attr("class", "axis-red")	
            .call(leftAxis)
            .selectAll("text")	
                .style("text-anchor", "end")
                .attr("dx", "-.3em")
                .attr("dy", ".01em")
                .attr("transform", "rotate(-40)")
            .call(leftAxis);
        
        // label y left axis
        chartGroup.append("text")
            .attr("class", "y-label")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (chartHeight/2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", "red")
            .text("Number Killed in US")

        // Append an SVG group element to the SVG area, create the bottom axis inside of it
        // Translate the bottom axis to the bottom of the page
        chartGroup.append("g")
            .classed("axis", true)
            .attr("transform", "translate(0, " + chartHeight + ")")
            .call(bottomAxis)
            .selectAll("text")	
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");

        // Append an SVG path and plot its points using the line function
        chartGroup.append("path")
            // The drawLine function returns the instructions for creating the line for milesData
            .attr("d", drawLine(raceData))
            .classed("line", true)
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .style("fill","none");
;

        // append circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(raceData)
            .enter()
            .append("circle")
            .attr("cx", data => xTimeScale(data.year))
            .attr("cy", data => yLinearScale(data.total_killed))
            .attr("r", "2")
            .attr("fill", "darkgrey")
            .attr("stroke-width", "1")
            .attr("stroke", "black");

    //////////////
    // tool tip //
    //////////////

    //Date formatter to display dates nicely
    var dateFormatter = d3.timeFormat("%Y");

    // number formatter for commas
    var numberFormat = function(d) {
        return d3.format(",")(d);
    }

    // Step 1: Initialize Tooltip
    var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(data) {
        return (`<h7><strong>US</strong></h7> | <h7><strong>${dateFormatter(data.year)}</strong></h7><br>
        <h7><strong>Total Killed:</strong> ${numberFormat(data.total_killed)}</h7><br>
        <h7><strong>Black:</strong> ${numberFormat(data.killed_black)} (${data.perc_killed_black}%)</h7><br><h7><strong>Caucasian:</strong> ${numberFormat(data.killed_caucasian)} (${data.perc_killed_caucasian}%)</h7><br>`);
    });

    // Step 2: Create the tooltip in chartGroup.
    chartGroup.call(toolTip);

    // Step 3: Create "mouseover" event listener to display tooltip
    circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
    })
    // Step 4: Create "mouseout" event listener to hide tooltip
    .on("mouseout", function(data) {
        toolTip.hide(data);
    });
    }).catch(function(error) {
        console.log(error);
        });
};