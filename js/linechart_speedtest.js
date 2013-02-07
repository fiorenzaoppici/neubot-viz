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
var margin = 80;
w = 700 - (2 * margin), h = 500 - (2 * margin);
//var lOffset = 20;

/*   index represents the current aggregation level
 *   it's updated via the select element in the html.
 *   0: dd-mm-YYYY
 *   -1: mm-YYYY
 *   1: dd-mm-YYYY HH
 */
var index = 2;

var nest = [];

// timespan placeholder
var beginningSp = "";
var endingSp = "";

var select = d3.select("select");
var defaultab = d3.select("#tab-1");


// D3 formatters for different aggregation levels:
format1 = d3.time.format("%Y-%m-%d %H").parse;
format2 = d3.time.format("%Y-%m-%d").parse;

var xScaleSp = d3.time.scale()
				.domain([format1(beginningSp), format1(endingSp)])
				.range([0, w]);

var yScaleSp = d3.scale.linear().range([h, 0]);

var svg2 = d3.select(".refresh-1");

//plots a line graph given an array of objects(points)
//x is the aggregator (a time value)
//y is the corresponding average download speed

var lineDSp = d3.svg.line().x(function(d) {
	return (xScaleSp(d.values.date))
}).y(function(d) {
	return yScaleSp(d.values.avgD * 8 / 1000)
});

//plots function given an array of objects(points)
//x is the aggregator (a time value)
//y is the corresponding average upload speed

var lineUSp = d3.svg.line().x(function(d) {
	return (xScaleSp(d.values.date))
}).y(function(d) {
	return yScaleSp(d.values.avgU * 8 / 1000)
});

//adds svg circle elements for every point
// depending on the parameter toggle, it can represent
// upload or download data.

var drawCirclesSp = function(toggle) {
	var circles = svg2.selectAll("circle." + toggle).data(nest);
	circles.enter()
			.append("circle")
			.attr("r", 5)
			.attr("class", toggle)
			.attr("cx", function(d) {
		return (xScaleSp(d.values.date));
	})
	if (toggle == "download")
		circles.attr("cy", function(d) {
			return yScaleSp((d.values.avgD * 8 ) / 1000)
		});
	else
		circles.attr("cy", function(d) {
			return yScaleSp((d.values.avgU * 8) / 1000)
		});
	circles.exit().remove();
}
//add axes according to the current range of values
// and time
var addAxesSp = function() {
	var scaleEnds = [d3.max(nest, function(d) {
		return d.values.avgD
	}), d3.max(nest, function(d) {
		return d.values.avgU
	})];

	var end = ((d3.max(scaleEnds)) * 8 ) / 1000;

	yScaleSp.domain([0, end]);
	xScaleSp.domain([format1(beginningSp), format1(endingSp)])

	var xAxis = d3.svg.axis()
						.scale(xScaleSp)
						.orient("bottom");

	var yAxis = d3.svg.axis().scale(yScaleSp).orient("left");
	svg2.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + h + ")")
		.call(xAxis);

	if (nest.length == 1) {
		yScaleSp.domain([0, end * 2]);
		yAxis.scale(yScaleSp)
	}

	svg2.append("g").attr("class", "axis")
	//		.attr("transform", "translate(20,0)")
	.call(yAxis);

}
//adds reference lines according to the aggregation level.

var addLinesSp = function() {
	var xlines = svg2.selectAll("line.y")
						.data(yScaleSp.ticks(10));
	xlines.enter()
			.append("line")
			.attr("class", "y")
			.attr("y1", yScaleSp)
			.attr("y2", yScaleSp)
			.attr("x1", 0)
			.attr("x2", w)
			.style("stroke", "#ccc");

	xlines.exit().remove();

	var ylines = svg2.selectAll("line.x")
						.data(xScaleSp.ticks(d3.time.days, 1));
	ylines.enter().append("line")
					.attr("class", "x")
					.attr("x1", xScaleSp)
					.attr("x2", xScaleSp)
					.attr("y1", 0)
					.attr("y2", h)
					.style("stroke", "#ccc");

	ylines.exit().remove();

}
//json processing
var callbackSp = function(array) {
	alert("ciaooSP");
	if (beginningSp != "" && endingSp != "") {
		var s = format1(beginningSp);
		var e = format1(endingSp);

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

	if (beginningSp == "" && endingSp == "") {

		s = d3.min(array, function(d) {
			return d.date
		});

		beginningSp = s.getFullYear() + "-" + (s.getMonth() + 1) + "-" + 
					s.getDate() + " " + s.getHours();

		e = d3.max(array, function(d) {
			return d.date
		})
		endingSp = e.getFullYear() + "-" + (e.getMonth() + 1) + "-" + 
				e.getDate() + " " + e.getHours();
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
	addAxesSp();
	addLinesSp();

	if (nest.length != 1) {
		svg2.append("svg:path").attr("d", lineUSp(nest)).classed("upload", true);
		svg2.append("svg:path").attr("d", lineDSp(nest)).classed("download", true);
	}

	drawCirclesSp("upload");
	drawCirclesSp("download");

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
var refreshSp = function() {
	svg2.selectAll(".upload").remove();
	svg2.selectAll(".download").remove();
	svg2.selectAll(".axis").remove();
	svg2.selectAll(".x").remove();
	svg2.selectAll(".y").remove();
	d3.json("data/data_speedtest_2.json", callbackSp);
}
var setBeginningSp=function(string){
	beginningSp = string;
}

var setEndingSp=function(string){
	endingSp = string;
}

var sp=d3.json("data/data_speedtest_2.json", callbackSp);

//updates the index value and the view accordingly
var selectIndexSp = function(object) {
	index = object.value;
	refreshSp();
};

var brush = d3.svg.brush()
				.x(d3.scale.identity().domain([0, w]))
				.y(d3.scale.identity().domain([0, h]))
				.on("brush", function(d) {})
				.extent([[100, 100], [200, 200]]);

svg2.append("g").attr("class", "brush").call(brush);
