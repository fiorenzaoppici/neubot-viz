/*
 *
 *  NEUBOT  0.0.1
 *  code by F.Oppici
 *  this script relies on the d3 framework for representing Neubot data
 *
 *
 * TODO:
 *
 *
 *
 *       scale dots accordingly to the desired timespan
 *
 *       don't cram the graph with reference lines (hours visualization)
 *
 *
 *
 *
 */
var svg = d3.select("svg");
var margin = 80;
w = 700 - (2 * margin), h = 500 - (2 * margin);
//var lOffset = 20;

var startDate = document.getElementById('startDate');
var endDate = document.getElementById('endDate');
var selector = document.getElementById('timebasis');

/*   index represents the current aggregation level
 *   it's updated via the select element in the html.
 *   0: dd-mm-YYYY
 *   -1: mm-YYYY
 *   1: dd-mm-YYYY HH
 */
var index = 2;

var nest = [];

// timespan placeholder
var beginning = "";
var ending = "";

var select = d3.select("select");
var defaultab = d3.select("#tab-1");

//reset all values
startDate.value = beginning;
endDate.value = ending;
selector.value = 0;
startDate.setAttribute("class", "");
endDate.setAttribute("class", "");
defaultab.attr("class", "selected");

// D3 formatters for different aggregation levels:
format1 = d3.time.format("%Y-%m-%d %H").parse;
format2 = d3.time.format("%Y-%m-%d").parse;

var xScale = d3.time.scale()
				.domain([format1(beginning), format1(ending)])
				.range([0, w]);

var yScale = d3.scale.linear().range([h, 0]);

var svg2 = d3.select(".refresh-1");

//plots a line graph given an array of objects(points)
//x is the aggregator (a time value)
//y is the corresponding average download speed

var lineD = d3.svg.line().x(function(d) {
	return (xScale(d.values.date))
}).y(function(d) {
	return yScale(d.values.avgD * 8 / 1000)
});

//plots function given an array of objects(points)
//x is the aggregator (a time value)
//y is the corresponding average upload speed

var lineU = d3.svg.line().x(function(d) {
	return (xScale(d.values.date))
}).y(function(d) {
	return yScale(d.values.avgU * 8 / 1000)
});

//adds svg circle elements for every point
// depending on the parameter toggle, it can represent
// upload or download data.

var drawCircles = function(toggle) {

	var circles = svg2.selectAll("circle." + toggle).data(nest);
	circles.enter()
			.append("circle")
			.attr("r", 5)
			.attr("class", toggle)
			.attr("cx", function(d) {
		return (xScale(d.values.date));
	})
	if (toggle == "download")
		circles.attr("cy", function(d) {
			return yScale((d.values.avgD * 8 ) / 1000)
		});
	else
		circles.attr("cy", function(d) {
			return yScale((d.values.avgU * 8) / 1000)
		});
	circles.exit().remove();
}
//add axes according to the current range of values
// and time
var addAxes = function() {
	var scaleEnds = [d3.max(nest, function(d) {
		return d.values.avgD
	}), d3.max(nest, function(d) {
		return d.values.avgU
	})];

	var end = ((d3.max(scaleEnds)) * 8 ) / 1000;

	yScale.domain([0, end]);
	xScale.domain([format1(beginning), format1(ending)])

	var xAxis = d3.svg.axis()
						.scale(xScale)
						.orient("bottom");

	var yAxis = d3.svg.axis().scale(yScale).orient("left");
	svg2.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + h + ")")
		.call(xAxis);

	if (nest.length == 1) {
		yScale.domain([0, end * 2]);
		yAxis.scale(yScale)
	}

	svg2.append("g").attr("class", "axis")
	//		.attr("transform", "translate(20,0)")
	.call(yAxis);

}
//adds reference lines according to the aggregation level.

var addLines = function() {
	var xlines = svg2.selectAll("line.y")
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

	var ylines = svg2.selectAll("line.x")
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
//json processing
var callback = function(array) {

	if (beginning != "" && ending != "") {
		var s = format1(beginning);
		var e = format1(ending);

		//filters all records that fit the interval
		function checkSpan(element, index, array) {
			//alert (new Date(element.timestamp*1000));
			return (new Date(element.timestamp * 1000) >= s && 
			new Date(element.timestamp * 1000) <= e)
		}

		array = array.filter(checkSpan);
	}

	array.forEach(function(d) {

		var date = new Date(d.timestamp * 1000);
		var d1 = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + 
				date.getDate() + " " + date.getHours();

		var d2 = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + 
				date.getDate();
		var d3 = date.getFullYear() + "-" + (date.getMonth() + 1);

		d.date = format1(d1);
		d.d1 = d1;
		d.d2 = d2;
		d.d3 = d3;

	});

	if (beginning == "" && ending == "") {

		s = d3.min(array, function(d) {
			return d.date
		});

		beginning = s.getFullYear() + "-" + (s.getMonth() + 1) + "-" + 
					s.getDate() + " " + s.getHours();

		e = d3.max(array, function(d) {
			return d.date
		})
		ending = e.getFullYear() + "-" + (e.getMonth() + 1) + "-" + 
				e.getDate() + " " + e.getHours();

		startDate.value = beginning;
		endDate.value = ending;
	}

	nest = [];

	if (index == 1) {
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
		}).entries(array);

	} else if (index == 2) {
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
		}).entries(array);

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
		}).entries(array);

	}

	if (nest.length == 0) {
		alert("No data available for this timespan");
		return false;
	}

	nest.sort(function(a, b) {
		return a.values.date - b.values.date;
	})
	addAxes();
	addLines();

	if (nest.length != 1) {
		svg2.append("svg:path").attr("d", lineU(nest)).classed("upload", true);
		svg2.append("svg:path").attr("d", lineD(nest)).classed("download", true);
	}

	drawCircles("upload");
	drawCircles("download");

	var up = d3.selectAll(".upload");
	var down = d3.selectAll(".download");

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
	return true;
}
//removes all variable graphic elements and
//calls again for data.
var refresh = function() {
	svg2.selectAll(".upload").remove();
	svg2.selectAll(".download").remove();
	svg2.selectAll(".axis").remove();
	svg2.selectAll("path").remove();
	svg2.selectAll(".x").remove();
	svg2.selectAll(".y").remove();
	d3.json("data/data_bittorrent_2.json", callback);
}
var startDate = document.getElementById('startDate');
var endDate = document.getElementById('endDate');
var submit = d3.select("button");

var wintorrent = d3.json("data/data_bittorrent_2.json", callback);

//updates the index value and the view accordingly
select.on("change", function() {
	index = this.value;
	refresh();
});

//checks user input for the parameter "start date"
var checkStart = function() {

	var errorMsg = "";

	if (startDate.value == "") {
		errorMsg = "Start date not specified";
	} else if ((format2(startDate.value)) == null) {
		errorMsg = " Invalid date format!";
	} else if (format2(startDate.value) != null) {
		startDate.setAttribute("class", "");
		return true
	}

	if (errorMsg != "") {
		startDate.setAttribute("class", "errorinput");
		alert(errorMsg);
		return false
	}

};

//checks user input for the parameter "end date"
var checkEnd = function() {

	var errorMsg = "";
	if (endDate.value == "") {
		errorMsg = "End date not specified";
	} else if ((format2(endDate.value)) == null) {
		errorMsg = " Invalid date format!";
	} else if (format2(endDate.value) != null) {

		endDate.setAttribute("class", "");
		return true
	}

	if (errorMsg != "") {
		endDate.setAttribute("class", "errorinput");
		alert(errorMsg);
		return false
	}

};

//when one hits submit... call again data and refresh view.
submit.on("click", function() {
	if (checkStart() && checkEnd()) {

		beginning = startDate.value + " 00";
		ending = endDate.value + " 23";

		refresh();
	}
})
var brush = d3.svg.brush()
				.x(d3.scale.identity().domain([0, w]))
				.y(d3.scale.identity().domain([0, h]))
				.on("brush", function(d) {})
				.extent([[100, 100], [200, 200]]);

svg2.append("g").attr("class", "brush").call(brush);