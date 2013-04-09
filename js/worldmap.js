
var worldmap = ( function() {

    var self = {};
    var mercator = d3.geo.mercator()
                      .scale("700")
                      .translate([350, 350]);

    // adds a superimposed div with map
    self.addPanel = function(date) {
        var g = d3.select("body");
        var div = g.append("svg");
        div.attr("id", "geobase");
        self.addDate(div, date);
        self.addMap();
        // adds a closing button
        var close = div.append("circle")
                        .attr("r", 20)
                        .attr("cx", 670)
                        .attr("cy", 30)
                        .attr("fill", "#316E00");
                    div.append("svg:line")
                        .style("stroke", "white")
                        .style("stroke-width", 5)
                        .attr("x1", 660)
                        .attr("y1", 20)
                        .attr("x2", 680)
                        .attr("y2", 40);
                    div.append("svg:line")
                        .style("stroke", "white")
                        .style("stroke-width", 5)
                        .attr("x1", 660)
                        .attr("y1", 40)
                        .attr("x2", 680)
                        .attr("y2", 20);

        close.on("click", function() {
            div.remove();
        })
    };
    self.addDate = function (divid, date) {
        divid.append("svg:text")
              .attr("x", 30)
              .attr("y", 35)
              .attr("stroke", "#316E00")
              .attr("fill", "#316E00")
              .text(date)
    };
    self.addMap = function ()  {
        d3.json("data/world.geo.json", function(collection) {
            mapgroup = d3.select("#geobase")
                          .append("g")
                          .attr("id", "mapgroup");
        mapgroup.selectAll("path")
                 .data(collection.features)
                 .enter()
                 .append("path")
                 .attr("d", d3.geo.path().projection(mercator))
                 .attr("class", "countryPath")
                 .attr("id", function (d){ return d.id})
                 .append("svg:title")
                 .text(function(d){return d.properties.name});

        d3.select("#ATA").remove();
        var svg = d3.select("#geobase");
        svg.call(zoom);
      })
    };
    var move = function () {
        mercator.translate(d3.event.translate).scale(d3.event.scale);
        d3.selectAll(".countryPath")
           .attr("d", d3.geo.path().projection(mercator))
    };
    var zoom = d3.behavior.zoom()
                  .translate(mercator.translate())
                  .scale(mercator.scale())
                  .scaleExtent([500, 20 * 500])
                  .on("zoom", move);
    return self;
})();
