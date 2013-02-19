
var speedtest=(function() {
	
	var same={};
	var margin = 80;
	var beginning = "";
	var ending = "";
	
	w = 700 - (2 * margin), h = 500 - (2 * margin);
	var toDateHour = d3.time.format("%Y-%m-%d %H").parse;
	var toDateDay = d3.time.format("%Y-%m-%d").parse;
	
	var xScale = d3.time.scale()
				.domain([toDateHour(beginning), toDateHour(ending)])
				.range([0, w]);
	var yScale = d3.scale.linear().range([h, 0]);

	var svg = d3.select(".refresh-1");

/*   index represents the current aggregation level
 *   it's updated via the select element in the html.
 *   2: dd-mm-YYYY
 *   3: mm-YYYY
 *   1: dd-mm-YYYY HH
  */
	var aggregationLevel = 2;

	var nest = [];

	var drawLineDownload = d3.svg.line().x(function(d) {
		return (xScale(d.values.date))
	}).y(function(d) {
		return yScale(d.values.avgD * 8 / 1000)
	});
	
	var drawLineUpload = d3.svg.line().x(function(d) {
		return (xScale(d.values.date))
	}).y(function(d) {
		return yScale(d.values.avgU * 8 / 1000)
	});


	var drawCircles = function(trafficType) {

		var circles = svg.selectAll("circle." + trafficType).data(nest);
		circles.enter()
				.append("circle")
				.attr("r", 5)
				.attr("class", trafficType)
				.attr("cx", function(d) {
			return (xScale(d.values.date));
		})
		if (trafficType == "download")
			circles.attr("cy", function(d) {
				return yScale((d.values.avgD * 8 ) / 1000)
			});
		else
			circles.attr("cy", function(d) {
				return yScale((d.values.avgU * 8) / 1000)
			});
		circles.exit().remove();
		//nn funziona, da riparare ma da mantenere nello script centrale.
	    var up = svg.selectAll(".upload");
	    var down = svg.selectAll(".download");
	
	    //chrome detection
	    //mouseleave is not properly captured in chrome
	
	    if (!window.chrome) {
	        up.on("mouseover", function() {
	            down.attr("opacity", 0)
	        });
	        up.on("mouseleave", function() {
	            down.attr("opacity", 1)
	        });
	
	        down.on("mouseover", function() {
	            up.attr("opacity", 0)
	        });
	        down.on("mouseleave", function() {
	            up.attr("opacity", 1)
	        });
	    }
    
}

var drawAxes = function() {
	
	var eligibleYEnds = [d3.max(nest, function(d) {
		return d.values.avgD
	}), d3.max(nest, function(d) {
		return d.values.avgU
	})];

	var endOfYScale = ((d3.max(eligibleYEnds)) * 8 ) / 1000;

	yScale.domain([0, endOfYScale]);
	xScale.domain([toDateHour(beginning), toDateHour(ending)])

	var xAxis = d3.svg.axis()
						.scale(xScale)
						.orient("bottom");

	var yAxis = d3.svg.axis().scale(yScale).orient("left");
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + h + ")")
		.call(xAxis);

	if (nest.length == 1) {
		yScale.domain([0, endOfYScale * 2]);
		yAxis.scale(yScale)
	}

	svg.append("g").attr("class", "axis")
	//		.attr("transform", "translate(20,0)")
	.call(yAxis);

}
//adds reference lines according to the aggregation level.

var drawLines = function() {
	var xlines = svg.selectAll("line.y")
						.data(yScale.ticks(10));
	xlines.enter()
			.append("line")
			.attr("class", "y")
			.attr("y1", yScale)
			.attr("y2", yScale)
			.attr("x1", 0)
			.attr("x2", w)
			.style("stroke", "#ccc");

	xlines.exit().remove();

	var ylines = svg.selectAll("line.x")
						.data(xScale.ticks(d3.time.days, 1));
	ylines.enter().append("line")
					.attr("class", "x")
					.attr("x1", xScale)
					.attr("x2", xScale)
					.attr("y1", 0)
					.attr("y2", h)
					.style("stroke", "#ccc");

	ylines.exit().remove();

}


same.processJson = function(json) {
	if (beginning != "" && ending != "") {
		var s = toDateHour(beginning);
		var e = toDateHour(ending);

		//filters all records that fit the interval
		function checkSpan(element, index, array) {
			return (new Date(element.timestamp * 1000) >= s && 
			new Date(element.timestamp * 1000) <= e)
		}

		json = json.filter(checkSpan);
	}

	json.forEach(function(d) {

		var date = new Date(d.timestamp * 1000);
		var d1 = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + 
				date.getDate() + " " + date.getHours();

		var d2 = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + 
				date.getDate();
		var d3 = date.getFullYear() + "-" + (date.getMonth() + 1);

		d.date = toDateHour(d1);
		d.d1 = d1;
		d.d2 = d2;
		d.d3 = d3;

	});

	if (beginning == "" && ending == "") {

		s = d3.min(json, function(d) {
			return d.date
		});

		beginning = s.getFullYear() + "-" + (s.getMonth() + 1) + "-" + 
					s.getDate() + " " + s.getHours();

		e = d3.max(json, function(d) {
			return d.date
		})
		ending = e.getFullYear() + "-" + (e.getMonth() + 1) + "-" + 
				e.getDate() + " " + e.getHours();
	}

	nest = [];

	if (aggregationLevel == 1) {
		nest = d3.nest().key(function(d) {
			return d.d1
		}).rollup(function(leaves) {
			return {

				"avgD" : d3.sum(leaves, function(d) {
					return (parseFloat(d.download_speed))
				}) / leaves.length,

				"avgU" : d3.sum(leaves, function(d) {
					return (parseFloat(d.upload_speed))
				}) / leaves.length,

				"date" : d3.min(leaves, function(d) {
					return d.date;
				})
			}
		}).entries(json);

	} else if (aggregationLevel == 2) {
		nest = d3.nest().key(function(d) {
			return d.d2
		}).rollup(function(leaves) {
			return {

				"avgD" : d3.sum(leaves, function(d) {
					return (parseFloat(d.download_speed))
				}) / leaves.length,

				"avgU" : d3.sum(leaves, function(d) {
					return (parseFloat(d.upload_speed))
				}) / leaves.length,

				"date" : d3.min(leaves, function(d) {
					return d.date;
				})
			}
		}).entries(json);

	} else {
		nest = d3.nest().key(function(d) {
			return d.d3
		}).rollup(function(leaves) {
			return {
				"avgD" : d3.sum(leaves, function(d) {
					return (parseFloat(d.download_speed))
				}) / leaves.length,

				"avgU" : d3.sum(leaves, function(d) {
					return (parseFloat(d.upload_speed))
				}) / leaves.length,

				"date" : d3.min(leaves, function(d) {
					return d.date;
				})
			}
		}).entries(json);

	}
	//alert("nest"+nest);
	if (nest.length == 0) {
		alert("No data available from Speedtest test for this timespan");
	}else{
			nest.sort(function(a, b) {
			return a.values.date - b.values.date;
	});
	removeElements();
	drawElements();
	}
	}


var drawElements=function(){
	drawAxes();
	drawLines();
	if (nest.length != 1) {
		svg.append("svg:path").attr("d", drawLineUpload(nest))
			.classed("upload", true);
			
		svg.append("svg:path").attr("d", drawLineDownload(nest))
			.classed("download", true);
	}
	drawCircles("upload");
	drawCircles("download");
}

var removeElements=function(){
	svg.selectAll(".upload").remove();
	svg.selectAll(".download").remove();
	svg.selectAll(".axis").remove();
	svg.selectAll("path").remove();
	svg.selectAll(".x").remove();
	svg.selectAll(".y").remove();
}

same.setBeginning=function(stringDate){
	beginning = stringDate;
}

same.setEnding=function(stringDate){
	ending = stringDate;
}


//updates the index value and the view accordingly
same.setAggregationLevel = function(object) {
	aggregationLevel = object.value;
	d3.json("data/data_speedtest_2.json", function(json){
		speedtest.processJson(json)});
};
return same;
})();

var sp=d3.json("data/data_speedtest_2.json", function(json){
	speedtest.processJson(json)});
