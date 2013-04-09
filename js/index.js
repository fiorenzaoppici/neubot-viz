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

var bt = d3.json("data/data_bittorrent_2.json",
                       function(error, json) {
            bittorrent.processJson(error, json);
        });

var sp = d3.json("data/data_speedtest_2.json",
                        function(error, json) {
            speedtest.processJson(error, json);
        });

var submit = d3.select("button");
var startDate = d3.select("#startDate");
var endDate = d3.select("#endDate");
var selector = d3.select("#timebasis");
var defaultab = d3.select("#tab-speedtest");

format2 = d3.time.format("%Y-%m-%d").parse;

d3.selectAll("input").property("value", "");
d3.selectAll("input").attr("class", "");
selector.property("selected", 2);
defaultab.attr("class", "selected");

var errorUtilities = (function() {
    var self = {};

    self.checkStart = function() {
        var errorMsg = "";
        if (startDate.property("value") === "") {
            errorMsg = "Start date not specified";
        } else if ((format2(startDate.property("value"))) === null) {
            errorMsg = " Invalid date format for start date";
        } else if (format2(startDate.property("value")) !== null) {
            startDate.attr("class", "");
            return null;
        }
        if (errorMsg !== "") {
            startDate.attr("class", "errorinput");
        }
        return errorMsg;
    };

    self.checkEnd = function() {
        var errorMsg = "";
        if (endDate.property("value") === "") {
            errorMsg = "End date not specified";
        } else if ((format2(endDate.property("value"))) === null) {
            errorMsg = "Invalid date format for End date";
        } else if (format2(endDate.property("value")) !== null) {
            endDate.attr("class", "");
            return null;
        }

        if (errorMsg !== "") {
            endDate.attr("class", "errorinput");
        }
        return errorMsg;
    };

    self.showErrors = function(errorList) {
        var errorDiv, unorderedList;

        // if there are some errors
        if (errorList.length > 0) {
            var parametersDiv = d3.select("#parameters");
            var inputsField = d3.select("#fields");
            inputsField.style("margin-bottom", "0px");

            //if there is no ErrorDiv in the page, append one
            if (parametersDiv.select("#errorDiv").empty()) {
                errorDiv = parametersDiv.append("div")
                                        .attr("id", "errorDiv");
                errorDiv.append("p")
                        .text("Input errors:");
                unorderedList = errorDiv.append("ul");
            } else {
                errorDiv = parametersDiv.select("#errorDiv");
                unorderedList = parametersDiv.select("ul");
            }

            //enter and exit: automatically updates error messages
            // based on the d3 update pattern
            var listElements = unorderedList.selectAll("li")
                                              .data(errorList, String);
            listElements.enter().append("li")
                                  .text(String);
            listElements.exit().remove();
        } else {
            errorUtilities.clearErrorPane();
        }
    };

    self.clearErrorPane = function() {
        var parametersDiv = d3.select("#parameters");
        if (parametersDiv.select("#errorDiv")[0][0] !== null) {
            parametersDiv.select("#errorDiv").remove();
            d3.select("#fields").style("margin-bottom", "5%");
            startDate.attr("class", "");
            endDate.attr("class", "");
        }
    };
    return self;
})();

d3.select("#timebasis").on("change", function() {
    speedtest.setAggregationLevel(this);
    bittorrent.setAggregationLevel(this);
    errorUtilities.clearErrorPane();
});

submit.on("click", function() {
    var errorMessages = [];

    // if both dates are correct
    if (errorUtilities.checkStart() === null &&
            errorUtilities.checkEnd() === null) {

        // if start date is smaller than end
        if (format2(startDate.property("value")) <=
             format2(endDate.property("value"))) {

            speedtest.setBeginning(startDate.property("value") + " 00");
            speedtest.setEnding(endDate.property("value") + " 23");
            bittorrent.setBeginning(startDate.property("value") + " 00");
            bittorrent.setEnding(endDate.property("value") + " 23");

            var sp = d3.json("data/data_speedtest_2.json",
                                function(error, json) {
                speedtest.processJson(error, json);
            });

            var bt = d3.json("data/data_bittorrent_2.json",
                                function(error, json) {
                bittorrent.processJson(error, json);
            });

        } else {
            // if the start date is after the end
            errorMessages.push("Start date must be smaller than end date.");
        }
    } else {
        // check which field was wrong and push the related error into
        // error description.
        if (errorUtilities.checkStart() !== null) {
            errorMessages.push(errorUtilities.checkStart());
        }
        if (errorUtilities.checkEnd() !== null) {
            errorMessages.push(errorUtilities.checkEnd());
        }
    }
    errorUtilities.showErrors(errorMessages);
});