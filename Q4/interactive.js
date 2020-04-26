//Width and height
// Use the margin convention practice 
var margin = {top: 35, right: 100, bottom: 35, left: 100},
    w = 800 - margin.left - margin.right, 
    h = 350 - margin.top - margin.bottom;

var legend_w = 20,
    legend_h = 10,  // legend size	  
    legend_x = w * 0.8, // legend position
    legend_y = margin.top / 15;

var parseTime = d3.timeParse("%Y");  //For converting strings to Dates
var formatTime = d3.timeFormat("%Y");  //For converting Dates to strings

var colors = d3.schemeCategory10;

d3.csv("state-year-earthquakes.csv", function(d) {
    return {
        year: parseTime(d.year),
        region: d.region,
        state: d.state,
        count: parseInt(d.count)
    };
}).then(function(data) {

// Print data to console as table, for verification
// console.log(data);
// ########################## Line chart ############################
// multi-level nesting
var region_yr_sum = d3.nest()
    .key(function(d) { return d.region; }).sortKeys(d3.ascending)
    .key(function(d) { return d.year; }).sortKeys(function(d) { return d;})
    .rollup(function(v) { return {
        year: d3.min(v, function(d) { return d.year; }),
        eq_sum: d3.sum(v, function(d) { return d.count; })
    }})
    .entries(data);
// console.log(data);

color_map = {}
region_yr_sum.forEach(function(region, i) {
    color_map[region.key] = colors[i];
})
// console.log(color_map);

// Create scale functions
var startDate = d3.min(data, function(d) { return d.year; })
var endDate = d3.max(data, function(d) {return d.year;  })
var xScale = d3.scaleTime()
                .domain([startDate, endDate])
                .range([0, w]);

var yScale_linear = d3.scaleLinear()
                .domain([0, 1.2 * d3.max(region_yr_sum, function(c) { return d3.max(c.values, function(v) { return v.value.eq_sum; }); })])
                .range([h, 0]);

//Define axes
var xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(5)
            .tickFormat(formatTime);

//Define Y axis
var yAxis = d3.axisLeft()
            .scale(yScale_linear)
            .ticks(10);

//Define line generators
var line = d3.line()
            .x(function(d) { return xScale(d.value.year); })
            .y(function(d) { return yScale_linear(d.value.eq_sum); });

var svg = d3.select("body")
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svg_bar = d3.select("body")  // define on global, append to body
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Create lines
var eq = svg.selectAll(".eq")
            .data(region_yr_sum)
            .enter().append("g")
            .attr("class", "eq");

eq.append("path")
    .attr("class", "line")
    .attr("d", function(d) { return line(d.values); })
    .style("stroke", function(d, i) { return colors[i]});

//Create dots
var dots = svg.selectAll(".dot")
                .data(region_yr_sum)
                .enter().append("g")
                .attr("class", "dot")

dots.selectAll("circle")
    .data(function(d) {return d.values; })
    .enter()
    .append("circle")
    .attr("fill", function() {
        // console.log(this.parentNode.__data__);
        return color_map[this.parentNode.__data__.key];
    })
    .attr("cx", function(d) {return xScale(d.value.year)})
    .attr("cy", function(d) {return yScale_linear(d.value.eq_sum)})
    .attr("r", 4)
    .on("mouseover", function(d, i) {
        d3.select(this).attr("r", 8)  // zoom in the dot

        var region = this.parentNode.__data__.key;
        var year = this.parentNode.__data__.values[i].value.year;
        svg_bar = add_bar_chart(svg_bar, region, year);
    })
    .on("mouseout", function() {
        d3.select(this).attr("r", 4);
        svg_bar.selectAll("*").remove(); // clear content of svg_bar
    })

//---------------- Create axes ----------------------
svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis)

svg.append("g")
    .attr("class", "axis")
    .call(yAxis)

// title
svg.append("text")  
    .text("US Earthquakes by Region 2011-2015")
    .attr("class", "title")
    .attr("x", w / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle");

// ------------------- legend -------------------
svg.selectAll("legend_circle")
    .data(region_yr_sum)
    .enter()
    .append("circle")
        .attr("cx", legend_x)
        .attr("cy", function(d,i){ return legend_y + i*(legend_h+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 4)
        .style("fill", function(d, i){ return colors[i]})

svg.selectAll("legend_labels")
    .data(region_yr_sum)
    .enter()
    .append("text")
        .attr("class", "legend_labels")
        .attr("x", legend_x + legend_w / 2)
        .attr("y", function(d,i){ return legend_y + 5 + i*(legend_h+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .text(function(d){ return d.key})
        .attr("text-anchor", "left")

svg.append("text")
    .attr("class", "username")
    .attr("x", w / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "end")
    .text("hli403");

// ############################# Horizontal bar chart ########################
// var region = "West";
// var yr = parseTime("2011");

function add_bar_chart(svg_bar, region, yr) {
    // filter data
    var state_yr_cnt = data.filter(function(d) {
        return (d.region == region) && (d.year.getTime() == yr.getTime())
    });

    // sort data
    state_yr_cnt = state_yr_cnt.sort(compare);  // compare function is defined at the end
    // console.log(state_yr_cnt);

    // Create scale functions
    var xScale_bar = d3.scaleLinear()
                    .domain([0, d3.max(state_yr_cnt, function(d) { return d.count; })])
                    .range([0, w]);

    var yScale_bar = d3.scaleBand()
                    .domain(state_yr_cnt.map(function(d) { return d.state; }))
                    .range([h, 0])
                    .padding(0.1);

    //Define axes
    var xAxis_bar = d3.axisBottom()
                .scale(xScale_bar)
                .ticks(5);

    //Define Y axis
    var yAxis_bar = d3.axisLeft()
                .scale(yScale_bar);

    var x_gridline = d3.axisBottom(xScale_bar)
                        .ticks(5)
                        .tickSize(h)
                        .tickFormat("");

    // var svg_bar = d3.select("body")
    //             .append("svg")
    //             .attr("width", w + margin.left + margin.right)
    //             .attr("height", h + margin.top + margin.bottom)
    //             .append("g")
    //             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // grid lines
    svg_bar.append("g")
            .attr("class", "grid")
            .call(x_gridline);
        
    //Create bars
    svg_bar.selectAll(".bar")
            .data(state_yr_cnt)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("width", function(d) { return xScale_bar(d.count);})
            .attr("y", function(d) { return yScale_bar(d.state)})
            .attr("height", yScale_bar.bandwidth());

    //---------------- Create axes ----------------------
    svg_bar.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis_bar)

    svg_bar.append("g")
        .attr("class", "axis")
        .call(yAxis_bar)

    // title
    svg_bar.append("text")  
        .text(region + "ern Region Earthquakes " + formatTime(yr))
        .attr("class", "title")
        .attr("x", w / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle");

    return svg_bar;
}// end of function add_bar_chart

}); // end of csv processing

function compare(a, b) {
    let comp = 0;
    if (a.count > b.count) {
        comp = 1;  // 1 is put a after
    } else if (a.count < b.count) {
        comp = -1;
    } else {
        if (a.state > b.state) {
            comp = 1;
        } else {
            comp = -1
        }
    }
    return comp
}
