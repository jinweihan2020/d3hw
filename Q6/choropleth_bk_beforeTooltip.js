//Width and height
// Use the margin convention practice 
var margin = {top: 35, right: 100, bottom: 35, left: 100},
    w = 1200 - margin.left - margin.right, 
    h = 600 - margin.top - margin.bottom;

var legend_w = 20,
    legend_h = 20,  // legend size	  
    legend_x = w - 30, // legend position
    legend_y = margin.top * 2;

var parseTime = d3.timeParse("%Y");  //For converting strings to Dates
var formatTime = d3.timeFormat("%Y");  //For converting Dates to strings

var svg_slider = d3.select("body")  // define on global, append to body
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", 100)

var svg = d3.select("body")
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var projection = d3.geoAlbersUsa()
                    .translate([w/2, h/2])
                    // .scale([800]);
var path = d3.geoPath().projection(projection);

// -------------- Slider ----------------------------------
// 2010 to 2015
var dataTime = d3.range(0, 6).map(function(d) {
                    return new Date(2010 + d, 1, 1);
                });
draw_us(formatTime(dataTime[0])); // default show 2010

var slider = d3.sliderBottom()
                .min(d3.min(dataTime))
                .max(d3.max(dataTime))
                .step(1000 * 60 * 60 * 24 * 365)
                .width(300)
                .tickFormat(formatTime)
                .tickValues(dataTime)
                .default(new Date(2010, 1, 1))  // default to 2010
                .on('onchange', function(d) {
                    year = formatTime(d);
                    svg.selectAll(".legend_labels").remove() // clear legend_labels
                    draw_us(year);
                });

svg_slider.append("g")
            .attr("transform", "translate(" + margin.left * 2+ "," + margin.top + ")")
            .attr("class", "slider")
            .call(slider);

svg_slider.append("text")
            .text("Year")
            .attr("class", "caption")
            .attr("x", margin.left * 1.5)
            .attr("y", margin.top + 5)
            .attr("text-anchor", "end");
        
// -------------------- Choropleth -------------------------------
// var year = "2010";
function draw_us(year) {
    // use promises to load multiple files
    var eqs = d3.map();
    var state_region = d3.map();
    var promises = [
        d3.json("states-10m.json"),
        d3.csv("state-earthquakes.csv", function(d) {
            eqs.set(d.States, parseInt(d[year]));
            state_region.set(d.States, d.Region);
        })
    ]

    var lb = 1, ub = 10;
    var logScale = d3.scaleLog().range([lb, ub]);
    var colors = d3.scaleThreshold()
                    .domain(d3.range(lb+1, ub))  // array from lb+1 to ub-1
                    .range(d3.schemeReds[9]);

    var tip = d3.tip()
                .attr("class", "d3-tip")
                .offset([-5, 0])
                .html(function(d) {
                    var state = d.properties.name;
                    var region = state_region.get(state);
                    var eq = eqs.get(state);
                    return "State: " + state + "\n" + "Region: " + region + "\n" + "Year: " + year + "\n" + "Earthquakes: " + eq; 
                })

    svg.call(tip);

    Promise.all(promises).then(ready)

    function ready([us]) {
        // console.log(us);
        console.log(state_region);
        logScale.domain([0.9, d3.max(eqs.values())])
        // ------------------- legend -------------------
        svg.selectAll("legend_rect")
            .data(colors.range())
            .enter()
            .append("rect")
                .attr("x", legend_x)
                .attr("y", function(d, i){ return legend_y + i*(legend_h+5)}) // 100 is where the first dot appears. 25 is the distance between dots
                .attr("width", legend_w)
                .attr("height", legend_h)
                .style("fill", function(d) { return d; })
        
        svg.selectAll(".legend_labels")
            .data(colors.range().map(function(d) {
                d = colors.invertExtent(d);
                if (d[0] == null) d[0] = d[1] - 1;
                if (d[1] == null) d[1] = ub;
                d = logScale.invert(d[0]);
                d = Math.round(d)
                p = Math.floor(Math.log10(d));
                i = Math.round(d / Math.pow(10, p))
                d = i * Math.pow(10, p)
                return d;
            }))
            .enter()
            .append("text")
            .classed("legend_labels", true)  // assign class
                .attr("x", legend_x + legend_w*1.4)
                .attr("y", function(d,i){ return legend_y + 14 + i*(legend_h+5)}) 
                .text(function(d){ return d})
                .attr("text-anchor", "left")

        svg.append("text")
            .attr("class", "caption")
            .attr("x", legend_x + legend_w + 2)
            .attr("y", legend_y - 15)
            .attr("text-anchor", "middle")
            .text("Earthquake Frequency")

        svg.append("g")
            .attr("class", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("fill", function(d) { 
                // console.log(d)
                return colors(logScale(Math.max(eqs.get(d.properties.name), 0.9))); // carefully set domain to handle 0 in data    
            })
            .transition(100)
            .attr("d", path)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            
    } // end of ready

    svg.append("text")
        .text("hli403")
        .attr("class", "username")
        .attr("x", w + margin.left / 2)
        .attr("y", h + margin.top - 2)
        .attr("text-anchor", "end");

} // end of draw_us
