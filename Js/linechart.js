var svg = d3.select("svg");
var margin = 80;
w = 700 - (2 * margin), h = 500 - (2 * margin);
var lOffset = 20;

var index = 0;
var limit = 0;

var rollup = [];

var date = new Date(), 
curMonth = date.getMonth()
curYear = date.getFullYear()
lastDay = new Date(curYear, curMonth + 1, 0).getDate();

var xScale = d3.scale.linear()
               .domain([1, lastDay])
               .range([0, w]);

var yScale = d3.scale.linear()
                     .range([h, 0]);

var svg2=d3.select(".refresh");

monthNames_it = ["January", "February", "March", "April", "May", "June", 
                 "July", "August", "September", "October", "November", "December"];
                 




			var lineD = d3.svg.line().x(function(d) {
				return (xScale(d.aggregator) + lOffset)
			}).y(function(d) {
				return yScale(d.avg_download_speed * 8 / 1000)
			});
			
			var lineU = d3.svg.line().x(function(d) {
				return (xScale(d.aggregator) + lOffset)
			}).y(function(d) {
				return yScale(d.avg_upload_speed * 8 / 1000)
			});

var drawCircles = function(toggle) {

	var circles = svg2.selectAll("circle." + toggle)
	                  .data(rollup);
	           circles.enter()
	                  .append("circle")
	                  .attr("cx", function(d) {return (xScale(d.aggregator) + lOffset)})
	                  .attr("r", 5)
	                  .attr("class", toggle);
               

						if (toggle == "download")
							circles.attr("cy", function(d) {
								return yScale(d.avg_download_speed * 8 / 1000)
							});
						else
							circles.attr("cy", function(d) {
								return yScale(d.avg_upload_speed * 8 / 1000)
							});
				       circles.exit().remove();
}


			var addAxes=function(){
						var scaleEnds = [d3.max(rollup, function(d) {
							return d.avg_download_speed;
						}), d3.max(rollup, function(d) {
							return d.avg_upload_speed
						})];
					
						var end = (d3.max(scaleEnds)) * 8 / 1000;
						          yScale.domain([0, end]);
					
						var xAxis = d3.svg.axis()
						                  .scale(xScale)
						                  .orient("bottom")
						                  .ticks(limit);
					
						var yAxis = d3.svg.axis()
						                  .scale(yScale)
						                  .orient("left");
					    alert (limit);
						svg2.append("g")
						    .attr("class", "axis")
						    .attr("transform", "translate(20," + h + ")")
						    .call(xAxis);
					

				if (rollup.length == 1) {yScale.domain([0, end * 2]);
					yAxis.scale(yScale)} 
				else {
		svg2.append("svg:path").attr("d", lineU(rollup)).classed("upload", true);
		svg2.append("svg:path").attr("d", lineD(rollup)).classed("download", true);
		}
				    svg2.append("g")
						.attr("class", "axis")
						.attr("transform", "translate(20,0)")
						.call(yAxis);
	
			}

			var addLines=function(limit){
				var xlines=svg2.selectAll("line.y")
						    .data(yScale.ticks(10));
					  xlines.enter().append("line")
						    .attr("class", "y")
						    .attr("y1", yScale)
						    .attr("y2", yScale)
						    .attr("x1", lOffset)
						    .attr("x2", w + lOffset)
						    .style("stroke", "#ccc");
						    
					xlines.exit().remove();
					
			   var ylines=svg2.selectAll("line.x")
						    .data(xScale.ticks(limit));
					  ylines.enter()
						    .append("line")
						    .attr("class", "x")
						    .attr("x1", xScale)
						    .attr("x2", xScale)
						    .attr("y1", 0)
						    .attr("y2", h)
						    .style("stroke", "#ccc");
						    
					ylines.exit().remove();
						    
						svg2.selectAll(".x").attr("transform", "translate(20,0)");
			}
//json processing
var callback = function(array) {

	if (index == 0) {
		limit = lastDay
	} else if (index == -1) {
		limit = 12
	} else {
		limit = 23
	}

	array.forEach(function(d) {
		var date = new Date(d.timestamp * 1000);
		d.date = date;
	});

	var nest=[];
	rollup=[];

	if (index == 0) {
		nest = d3.nest().key(function(d) {return parseInt(d.date.getDate());})
		                .sortKeys(function(a, b) {return parseInt(a) - parseInt(b);})
		                .entries(array);
	xScale.domain([0, limit]);
       
	} else if (index == 1) {
		nest = d3.nest().key(function(d) {return (d.date.getHours());})
						.sortKeys(function(a, b) {return parseInt(a) - parseInt(b);})
						.entries(array);
	xScale.domain([0, limit]);

	} else {
		nest = d3.nest().key(function(d) {return (d.date.getMonth()+1)})
						.sortKeys(function(a, b) {return parseInt(a) - parseInt(b);})
						.entries(array);
        xScale.domain([1, limit]);
	}

	//d3.nest aggrega un array secondo una chiave specifica
	//tipo GROUP BY key
	for ( i = 0; i < nest.length; i++) {
		var sumD = 0;
		var sumU = 0;

		for ( j = 0; j < nest[i].values.length; j++) {

			sumD = +nest[i].values[j].download_speed;
			sumU = +nest[i].values[j].upload_speed;
		};
		var avgD = sumD / (nest[i].values.length);
		var avgU = sumU / (nest[i].values.length);

		var point = new Object();
		point.aggregator = nest[i].key;
		point.avg_download_speed = avgD;
		point.avg_upload_speed = avgU;
		rollup.push(point);
	}
	
    	addAxes(rollup);
    	addLines(limit);



	drawCircles("upload");
	drawCircles("download");

	var up = d3.selectAll(".upload");
	var down = d3.selectAll(".download");
	
	up.on("mouseover", function() {down.attr("opacity", 0)});
	up.on("mouseleave", function() {down.attr("opacity", 1)});

	down.on("mouseover", function() {up.attr("opacity", 0)});
	down.on("mouseleave", function() {up.attr("opacity", 1)});

}


var wintorrent = d3.json("data/data_speedtest.json", callback);

var select=d3.select("select");

    select.on("change",function(){
    	index=this.value;
    	svg2.selectAll(".upload").remove();
    	svg2.selectAll(".download").remove();
    	svg2.selectAll(".axis").remove();
    	svg2.selectAll("path").remove();
    	svg2.selectAll(".x").remove();
    	svg2.selectAll(".y").remove();
        d3.json("data/data_speedtest.json", callback);
    });



