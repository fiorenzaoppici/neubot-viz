var width = 500,
    height = 500, 
    margin = 50;

var svg=d3.select("body").append("svg").attr("width",width).attr("height",height);
var x=d3.scale.linear().domain([0,5]).range([margin,width-margin]);
var y=d3.scale.linear().domain([-10,10]).range([height-margin,margin]);
var r=d3.scale.linear().domain([0,500]).range([0,20]);
var o=d3.scale.linear().domain([10000,100000]).range([.5,1]);
var c=d3.scale.category10().domain(["Africa","America","Asia","Europe","Oceania"]);

var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left");


svg.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(0," + (height - margin) + ")")
  .call(xAxis);

svg.append("g")
  .attr("class", "axis")
   .attr("transform", "translate(" + margin + ",0)")
  .call(yAxis);


svg.selectAll(".h").data(d3.range(-8,10,2)).enter()
  .append("line").classed("h",1)
  .attr("x1",margin).attr("x2",height-margin)
  .attr("y1",y).attr("y2",y)
  
svg.selectAll(".v").data(d3.range(1,5)).enter()
  .append("line").classed("v",1)
  .attr("y1",margin).attr("y2",width-margin)
  .attr("x1",x).attr("x2",x)
  
