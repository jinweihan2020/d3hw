//Width and height
// Use the margin convention practice 
var margin = {top: 50, right: 100, bottom: 50, left: 100},
w = 1100 - margin.left - margin.right, 
h = 550 - margin.top - margin.bottom; 

var legend_w = 20,
legend_h = 10;  // legend size	  
legend_x = w + 20, // legend position
legend_y = 80

var parseTime = d3.timeParse("%Y");  //For converting strings to Dates
var formatTime = d3.timeFormat("%Y");  //For converting Dates to strings

var colors = {'5_5.9': '#FFC300', '6_6.9': '#FF5733', '7_7.9': '#C70039', '8.0+': '#900C3F'};
// var symbols = {'5_5.9': "circle", '6_6.9': "triangle", '7_7.9': "diamond", '8.0+': "square"}
var symbols = {'5_5.9': d3.symbolCircle, '6_6.9': d3.symbolTriangle, '7_7.9': d3.symbolDiamond, '8.0+': d3.symbolSquare}
var eqkeys = Object.keys(colors);

var dataset = d3.csv("earthquakes.csv");
dataset.then(function(data) {

// Print data to console as table, for verification
// console.log(dataset);
var eqs = eqkeys.map(function(eq) {
    return {
        eq: eq,
        values: data.map(function(d) {
            return {
                year: parseTime(d.year),
                nums: +d[eq]
            }
        })
    }
});
console.log(eqs)
var deaths = []
data.forEach(function(d) {deaths.push(+d["Estimated Deaths"])})
// console.log(deaths)

//Create scale functions
var xScale = d3.scaleTime()
                .domain(d3.extent(data, function(d){return parseTime(d.year)}))
                .range([0, w]);

var yScale_linear = d3.scaleLinear()
                .domain([0, d3.max(eqs, function(c) { return d3.max(c.values, function(v) { return v.nums; }); })])
                .range([h, 0]);

var sybScale = d3.scaleLinear()  // symbole size scale
                .domain([0, d3.max(deaths)])
                .range([20, 200])

//Define axes
var xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(10)
            .tickFormat(formatTime);

//Define Y axis
var yAxis = d3.axisLeft()
            .scale(yScale_linear)
            .ticks(10);

//Define line generators
var line = d3.line()
            .x(function(d) { return xScale(d.year); })
            .y(function(d) { return yScale_linear(d.nums); })
            .curve(d3.curveMonotoneX); // apply smoothing to the line;

//###################  Figure 1, Create SVG element #############################
var svg = d3.select("#fig1")
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var eq = svg.selectAll(".eq")
            .data(eqs)
            .enter().append("g")
            .attr("class", "eq");

//Create lines
eq.append("path")
    .attr("class", "line")
    .attr("d", function(d) { return line(d.values); })
    .style("stroke", function(d) { return colors[d.eq]; });

//---------------- Create axes ----------------------
svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis)

svg.append("text")  // x text label
    .attr("class", "label")
    .attr("transform", "translate(" + (w / 2) + " ," + (h + margin.top) + ")")
    .style("text-anchor", "middle")
    .text("Year");

svg.append("g")
    .attr("class", "axis")
    .call(yAxis)

svg.append("text")  // y text label
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("x", - h / 2)
    .attr("y", - margin.left / 2)
    .style("text-anchor", "middle")
    .text("Num of Earthquakes");

// title
svg.append("text")  
    .text("Earthquake Statistics for 2000-2015")
    .attr("class", "title")
    .attr("x", w / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle");

// ------------------- legend -------------------
svg.selectAll("legend_rect")
    .data(eqkeys)
    .enter()
    .append("rect")
        .attr("x", legend_x)
        .attr("y", function(d,i){ return legend_y + i*(legend_h+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", legend_w)
        .attr("height", legend_h)
        .style("fill", function(d){ return colors[d]})

svg.selectAll("legend_labels")
    .data(eqkeys)
    .enter()
    .append("text")
        .attr("class", "legend_labels")
        .attr("x", legend_x + legend_w*1.3)
        .attr("y", function(d,i){ return legend_y + 9 + i*(legend_h+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .text(function(d){ return d})
        .attr("text-anchor", "left")

//###################  Figure 2, Create SVG element #############################
var svg = d3.select("#fig2")
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var eq = svg.selectAll(".eq")
            .data(eqs)
            .enter().append("g")
            .attr("class", "eq");

//Create lines
eq.append("path")
    .attr("class", "line")
    .attr("d", function(d) { return line(d.values); })
    .style("stroke", function(d) { return colors[d.eq]; });

//---------------- Create axes ----------------------
svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis)

svg.append("text")  // x text label
    .attr("class", "label")
    .attr("transform", "translate(" + (w / 2) + " ," + (h + margin.top) + ")")
    .style("text-anchor", "middle")
    .text("Year");

svg.append("g")
    .attr("class", "axis")
    .call(yAxis)

svg.append("text")  // y text label
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("x", - h / 2)
    .attr("y", - margin.left / 2)
    .style("text-anchor", "middle")
    .text("Num of Earthquakes");

// title
svg.append("text")  
    .text("Earthquake Statistics for 2000-2015 with Symbols")
    .attr("class", "title")
    .attr("x", w / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle");

// ------------------- legend -------------------
svg.selectAll("legend_rect")
    .data(eqkeys)
    .enter()
    .append("rect")
        .attr("x", legend_x)
        .attr("y", function(d,i){ return legend_y + i*(legend_h+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", legend_w)
        .attr("height", legend_h)
        .style("fill", function(d){ return colors[d]})

svg.selectAll("legend_labels")
    .data(eqkeys)
    .enter()
    .append("text")
        .attr("class", "legend_labels")
        .attr("x", legend_x + legend_w*1.3)
        .attr("y", function(d,i){ return legend_y + 9 + i*(legend_h+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .text(function(d){ return d})
        .attr("text-anchor", "left")

// ----------- add symbols------------------
eqs.forEach(function(eq, i) {
    svg.selectAll("symbols")
        .data(eq.values)
        .enter()
        .append("path")
        .attr("class", "symbols")
        .attr("d", d3.symbol().type(symbols[eq.eq]).size(function(d, ii) {return sybScale(deaths[ii])}))
        .attr("fill", colors[eq.eq])
        .attr("stroke", colors[eq.eq])
        .attr("transform", function(d) {
            return "translate(" + xScale(d.year) + " ," + yScale_linear(d.nums) + ")";
        });
})

//###################  Figure 3, Create SVG element #############################
// update y scales
var yScale_sqrt = d3.scaleSqrt()
                        .domain([0, d3.max(eqs, function(c) { return d3.max(c.values, function(v) { return v.nums; }); })])
                        .range([h, 0]);
//Define line generators
var line = d3.line()
            .x(function(d) { return xScale(d.year); })
            .y(function(d) { return yScale_sqrt(d.nums); })
            .curve(d3.curveMonotoneX); // apply smoothing to the line;
//Define Y axis
var yAxis = d3.axisLeft()
            .scale(yScale_sqrt)
            .ticks(10);

var svg = d3.select("#fig3")
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var eq = svg.selectAll(".eq")
            .data(eqs)
            .enter().append("g")
            .attr("class", "eq");

//Create lines
eq.append("path")
    .attr("class", "line")
    .attr("d", function(d) { return line(d.values); })
    .style("stroke", function(d) { return colors[d.eq]; });

//---------------- Create axes ----------------------
svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis)

svg.append("text")  // x text label
    .attr("class", "label")
    .attr("transform", "translate(" + (w / 2) + " ," + (h + margin.top) + ")")
    .style("text-anchor", "middle")
    .text("Year");

svg.append("g")
    .attr("class", "axis")
    .call(yAxis)

svg.append("text")  // y text label
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("x", - h / 2)
    .attr("y", - margin.left / 2)
    .style("text-anchor", "middle")
    .text("Num of Earthquakes");

// title
svg.append("text")  
    .text("Earthquake Statistics for 2000-2015 (Square root Scale)")
    .attr("class", "title")
    .attr("x", w / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle");

// ------------------- legend -------------------
svg.selectAll("legend_rect")
    .data(eqkeys)
    .enter()
    .append("rect")
        .attr("x", legend_x)
        .attr("y", function(d,i){ return legend_y + i*(legend_h+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", legend_w)
        .attr("height", legend_h)
        .style("fill", function(d){ return colors[d]})

svg.selectAll("legend_labels")
    .data(eqkeys)
    .enter()
    .append("text")
        .attr("class", "legend_labels")
        .attr("x", legend_x + legend_w*1.3)
        .attr("y", function(d,i){ return legend_y + 9 + i*(legend_h+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .text(function(d){ return d})
        .attr("text-anchor", "left")

// ----------- add symbols------------------
eqs.forEach(function(eq, i) {
    svg.selectAll("symbols")
        .data(eq.values)
        .enter()
        .append("path")
        .attr("class", "symbols")
        .attr("d", d3.symbol().type(symbols[eq.eq]).size(function(d, ii) {return sybScale(deaths[ii])}))
        .attr("fill", colors[eq.eq])
        .attr("stroke", colors[eq.eq])
        .attr("transform", function(d) {
            return "translate(" + xScale(d.year) + " ," + yScale_sqrt(d.nums) + ")";
        });
})

//###################  Figure 4, Create SVG element #############################
var yScale_log = d3.scaleLog()
                        .domain([0.9, d3.max(eqs, function(c) { return d3.max(c.values, function(v) { return v.nums; }); })])
                        .range([h, 0]);
                        // carefully set domain to handle 0 in data
//Define line generators
var line = d3.line()
            .x(function(d) { return xScale(d.year); })
            .y(function(d) { return yScale_log(Math.max(d.nums, 0.9)); })
            .curve(d3.curveMonotoneX); // apply smoothing to the line;
//Define Y axis
var yAxis = d3.axisLeft()
            .scale(yScale_log)
            .ticks(10);

var svg = d3.select("#fig4")
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var eq = svg.selectAll(".eq")
            .data(eqs)
            .enter().append("g")
            .attr("class", "eq");

//Create lines
eq.append("path")
    .attr("class", "line")
    .attr("d", function(d) { return line(d.values); })
    .style("stroke", function(d) { return colors[d.eq]; });

//---------------- Create axes ----------------------
svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis)

svg.append("text")  // x text label
    .attr("class", "label")
    .attr("transform", "translate(" + (w / 2) + " ," + (h + margin.top) + ")")
    .style("text-anchor", "middle")
    .text("Year");

svg.append("g")
    .attr("class", "axis")
    .call(yAxis)

svg.append("text")  // y text label
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("x", - h / 2)
    .attr("y", - margin.left / 2)
    .style("text-anchor", "middle")
    .text("Num of Earthquakes");

// title
svg.append("text")  
    .text("Earthquake Statistics for 2000-2015 (Log Scale)")
    .attr("class", "title")
    .attr("x", w / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle");

// ------------------- legend -------------------
svg.selectAll("legend_rect")
    .data(eqkeys)
    .enter()
    .append("rect")
        .attr("x", legend_x)
        .attr("y", function(d,i){ return legend_y + i*(legend_h+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", legend_w)
        .attr("height", legend_h)
        .style("fill", function(d){ return colors[d]})

svg.selectAll("legend_labels")
    .data(eqkeys)
    .enter()
    .append("text")
        .attr("class", "legend_labels")
        .attr("x", legend_x + legend_w*1.3)
        .attr("y", function(d,i){ return legend_y + 9 + i*(legend_h+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .text(function(d){ return d})
        .attr("text-anchor", "left")

// ----------- add symbols------------------
eqs.forEach(function(eq, i) {
    svg.selectAll("symbols")
        .data(eq.values)
        .enter()
        .append("path")
        .attr("class", "symbols")
        .attr("d", d3.symbol().type(symbols[eq.eq]).size(function(d, ii) {return sybScale(deaths[ii])}))
        .attr("fill", colors[eq.eq])
        .attr("stroke", colors[eq.eq])
        .attr("transform", function(d) {
            return "translate(" + xScale(d.year) + " ," + yScale_log(Math.max(d.nums, 0.9)) + ")";
        });
})

svg.append("text")
.text("hli403")
.attr("class", "username")
.attr("x", w + margin.left)
.attr("y", h + margin.top - 2)
.attr("text-anchor", "end")
.attr("font-family", "sans-serif")
.attr("font-size", "13px");

});