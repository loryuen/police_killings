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

// csv file
// fe_data = `assets/data/data_fe_cleaned.csv`

///////////////////////////////////////////////
// function to render graph of national view //
///////////////////////////////////////////////
// function nationalButtonSelected() {
//     d3.json(fe_data).then(function(nationalData) {
//         nationalView();
//     })
// };

// function init() {
//     nationalView();
// };
// init();
//////////////////////////////////////////////////////
//function for line plot of covid cases nationally //
//////////////////////////////////////////////////////
// function nationalView() {
    // Load data from api covid cases national view
    d3.csv('assets/data/data_fe_cleaned.csv').then(function(nationalData) {

        // Print the data
        console.log(nationalData);
        var tot_deaths = nationalData.length

        console.log(tot_deaths)

        // Format the date and cast the total cases value to a number
        nationalData.forEach(function(data) {
            data.year = parseTime(data.year);
            // console.log(data.year)
        });

        // Configure a time scale with a range between 0 and the chartWidth
        var xTimeScale = d3.scaleTime()
            .range([0, chartWidth])
            .domain([d3.min(nationalData, data => data.year),d3.max(nationalData, data => data.year)]);
            // .domain(d3.extent(nationalData, data => data.year));
        console.log(d3.max(nationalData, data => data.year))
        // Configure a linear scale with a range between the chartHeight and 0
        var yLinearScale = d3.scaleLinear()
            .range([chartHeight, 0])
            .domain([0, d3.max(nationalData, data => data.tot_deaths)]);

        // Create two new functions passing the scales in as arguments
        var bottomAxis = d3.axisBottom(xTimeScale).tickFormat(d3.timeFormat("%Y"));
        var leftAxis = d3.axisLeft(yLinearScale);

        // Configure a drawLine function which will use our scales to plot the line's points
        var drawLine = d3
            .line()
            .x(data => xTimeScale(data.year))
            .y(data => yLinearScale(data.tot_deaths));

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
            .style("fill", "rgb(255, 153, 0)")
            .text("Number of Cases - National level")

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
            .attr("d", drawLine(nationalData))
            .classed("line", true)
            .attr("stroke", "rgb(255, 153, 0)")
            .attr("stroke-width", 2);

        // append circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(nationalData)
            .enter()
            .append("circle")
            .attr("cx", data => xTimeScale(data.year))
            .attr("cy", data => yLinearScale(data.tot_deaths))
            .attr("r", "2")
            .attr("fill", "darkgrey")
            .attr("stroke-width", "1")
            .attr("stroke", "black");

    //////////////
    // tool tip //
    //////////////

    // Date formatter to display dates nicely
    // var dateFormatter = d3.timeFormat("%d %B %Y");

    // // number formatter for commas
    // var numberFormat = function(d) {
    //     return d3.format(",")(d);
    // }

    // // Step 1: Initialize Tooltip
    // var toolTip = d3.tip()
    // .attr("class", "tooltip")
    // .offset([80, -60])
    // .html(function(data) {
    //     return (`<h7><strong>USA</strong></h7> | <h7><strong>${dateFormatter(data.date_injury)}</strong></h7><br>
    //     <h7><strong># deaths:</strong> ${numberFormat(data.tot_deaths)}</h7><br>`);
    // });

    // // Step 2: Create the tooltip in chartGroup.
    // chartGroup.call(toolTip);

    // // Step 3: Create "mouseover" event listener to display tooltip
    // circlesGroup.on("mouseover", function(data) {
    // toolTip.show(data, this);
    // })
    // // Step 4: Create "mouseout" event listener to hide tooltip
    // .on("mouseout", function(data) {
    //     toolTip.hide(data);
    // });
    }).catch(function(error) {
        console.log(error);
        });
// };

//////////////////////////////////
//////////////////////////////////

