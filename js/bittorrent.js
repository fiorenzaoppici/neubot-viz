/*-
 * Copyright (c) 2013
 *     Nexa Center for Internet & Society, Politecnico di Torino (DAUIN)
 *     and Fiorenza Oppici fiorenza.oppici[at]studenti.polito.it
 *
 * This file is part of Neubot <http://www.neubot.org/>.
 *
 * Neubot is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Neubot is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Neubot.  If not, see <http://www.gnu.org/licenses/>.
 */

var bittorrent= ( function() {

    var self = {};
    var margin = 80;
    var beginning = "";
    var ending = "";

    var w = 700 - (2 * margin);
    var h = 500 - (2 * margin);
    var format1 = d3.time.format("%Y-%m-%d %H").parse;
    var format2 = d3.time.format("%Y-%m-%d").parse;

    var xScale = d3.time.scale()
                .domain([format1(beginning), format1(ending)])
                .range([0, w]);
    var yScale = d3.scale.linear().range([h, 0]);

    var svg = d3.select(".refresh-bittorrent");

   /*  index represents the current aggregation level
    *   it's updated via the select element in the html.
    *   2: dd-mm-YYYY
    *   3: mm-YYYY
    *   1: dd-mm-YYYY HH
    */
    var index = "d";

    var quotient = 1000;

    var nest = [];

    var lineD = d3.svg.line().x(function(d) {
        return (xScale(d.values.date));
    }).y(function(d) {
        return yScale(d.values.avgD * 8 / quotient);
    });

    var lineU = d3.svg.line().x(function(d) {
        return (xScale(d.values.date))
    }).y(function(d) {
        return yScale(d.values.avgU * 8 / quotient);
    });

    // adds svg circle elements for every point.
    // depending on "toggle" parameter it can represent
    // upload or download data.
    var drawCircles = function(toggle) {
        var circles = svg.selectAll("circle." + toggle).data(nest);
        circles.enter()
                .append("circle")
                .attr("r", 5)
                .attr("class", toggle)
                .attr("cx", function(d) {
            return (xScale(d.values.date));
        })
        if (toggle === "download")
            circles.attr("cy", function(d) {
                return yScale((d.values.avgD * 8 ) / quotient);
            });
        else
            circles.attr("cy", function(d) {
                return yScale((d.values.avgU * 8) / quotient);
            });
        circles.exit().remove();
    };

    // adds axes according to the current range of values
    // and time
    var addAxes = function() {
        var scaleEnds = [d3.max(nest, function(d) {
            return d.values.avgD;
        }), d3.max(nest, function(d) {
            return d.values.avgU;
        })];

        var end = ((d3.max(scaleEnds)) * 8) / 1000;
        var measureScale = "Kbps";

        //this means that I've 10^6 instead of 10^3 so from K-->M
        if(end > 10000){

            quotient = 1000 * 1000;
            end = end / 1000;
            measureScale = "Mbps";
        }

        svg.append("svg:text")
           .attr("class", "label")
           .attr("x", "-250")
           .attr("y", "-50")
           .attr("anchor", "middle")
           .attr("transform", "rotate(-90)")
           .text("Goodput ("+measureScale+")");

        yScale.domain([0, end]);
        xScale.domain([format1(beginning), format1(ending)]);


        var xAxis = d3.svg.axis()
                            .scale(xScale)
                            .ticks(10)
                            .tickFormat(d3.time.format("%b %d"))
                            .orient("bottom");


        var yAxis = d3.svg.axis().scale(yScale).orient("left");
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);

        if (nest.length === 1) {
            yScale.domain([0, end * 2]);
            yAxis.scale(yScale)
        }

        svg.append("g").attr("class", "axis")
                        .call(yAxis);

    }

   // adds reference lines according to the aggregation level.
   var addLines = function() {
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

    self.processJson = function(error, json) {
            if (error !== null){
                var errorMessage = [];
                errorMessage.push(error.toString);
            }else {
                if (beginning !== "" && ending !== "") {
                    var s = format1(beginning);
                    var e = format1(ending);

                    //filters all records that fit the interval
                    function checkSpan(element, index, array) {
                        return (new Date(element.timestamp * 1000) >= s &&
                        new Date(element.timestamp * 1000) <= e)
                    }
                    json = json.filter(checkSpan);
                }

                json.forEach(function(d) {
                    var date = new Date(d.timestamp * 1000);
                    var d1 = date.getFullYear() + "-" + (date.getMonth() + 1) +
                             "-" + date.getDate() + " " + date.getHours();

                    var d2 = date.getFullYear() + "-" + (date.getMonth() + 1) +
                    "-" + date.getDate();

                    var d3 = date.getFullYear() + "-" + (date.getMonth() + 1);

                    //binds the date formatted in three different styles.
                    d.date = format1(d1);
                    d.d1 = d1;
                    d.d2 = d2;
                    d.d3 = d3;

                });

                if (beginning === "" && ending === "") {

                    s = d3.min(json, function(d) {
                        return d.date;
                    });

                    beginning = s.getFullYear() + "-" + (s.getMonth() + 1) +
                                "-" + s.getDate() + " " + s.getHours();

                    e = d3.max(json, function(d) {
                        return d.date;
                    })
                    ending = e.getFullYear() + "-" + (e.getMonth() + 1) + "-"
                             + e.getDate() + " " + e.getHours();
                }

                nest = [];

                if (index === "h") {
                    nest = d3.nest().key(function(d) {
                        return d.d1;
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

                } else if (index === "d") {
                    nest = d3.nest().key(function(d) {
                        return d.d2;
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
                        return d.d3;
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
                    if (nest.length === 0) {
                        var errorMsg = "No data available from Bittorrent "+
                        "test for this timespan";
                    errorUtilities.showErrors([errorMsg]);
                }else{
                        nest.sort(function(a, b) {
                        return a.values.date - b.values.date;
                });
                refresh();
                drawElements();
            }
        }
    };

    // removes all variable graphic elements and
    // calls again for data.
    var refresh = function() {
        svg.selectAll(".upload").remove();
        svg.selectAll(".download").remove();
        svg.selectAll(".axis").remove();
        svg.selectAll("path").remove();
        svg.selectAll(".x").remove();
        svg.selectAll(".y").remove();
    };

    var drawElements = function() {
        addAxes();
        addLines();
        if (nest.length !== 1) {
            svg.append("svg:path").attr("d", lineU(nest))
                .classed("upload", true);
            svg.append("svg:path").attr("d", lineD(nest))
                .classed("download", true);
        }
        drawCircles("upload");
        drawCircles("download");
    };

    self.setBeginning = function(string) {
        beginning = string;
    };

    self.setEnding = function(string) {
        ending = string;
    };

    // updates the index value and the view accordingly
    self.setAggregationLevel = function(object) {
        index = object.value;
        d3.json("data/data_bittorrent_2.json", function(error,json) {
                                    bittorrent.processJson(error,json);
                                    });
    };
    return self;
})();


