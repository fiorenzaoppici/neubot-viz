

//salvo le dimensioni del div area grafica
var w= d3.select("#grapharea").style("width");
var h= d3.select("#grapharea").style("height");
var padding=20;
       
       var grapharea=d3.select("#grapharea");
       var parameters=d3.select("#parameters");
  
       var svg =  grapharea
                   .append("svg")
				   .attr("width", w)
				   .attr("height", h);
 
				   
				   
	   svg.append("text")
	      .text("percentuale di test svolti")
	      .attr("x", 40)
	      .attr("y", function (d,i){return(i*24)+padding+12})
		  .attr("font-family", "sans-serif")
		  .attr("font-size", "15px");
				   
				   var yScale = d3.scale.linear()
								 .domain([0, 100])
								 .range([300,2]);
								 
				   var colorScale=d3.scale.linear()
				                    .domain([0,100])
				                    .range([200,50]);

  var dataset= d3.json("data/italy_glasnost.json", function (json){
             
             var requiredw=(json.length*24)+(2*padding); 
             svg.attr("width",requiredw);
             //grapharea.style("width",requiredw+"px");
             
             var sorted=json.sort(function(a,b){return a.total<b.total })
             svg.selectAll("rect")
	        .data(sorted)
	        .enter()
	        .append("rect")
            .attr("y",function (d){return (400-padding-(yScale(d.percent)))} )
			.attr("x", function (d,i){return(i*24)+padding})
			.attr("height", function (d){return (yScale(d.percent))})
			.attr("width", 20)
			.attr("fill","#80AFBD");			
			});
			
  