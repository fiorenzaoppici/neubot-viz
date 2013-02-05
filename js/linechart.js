

/*  
 * 
 *  NEUBOT  0.0.1
 *  code by F.Oppici
 *  this script relies on the d3 framework for representing Neubot data
 *  
 * 
 * TODO: Fix the bug for months 
 * 
 *       fix Chrome issue when mouse hovers upload/download elements
 * 
 *       scale dots accordingly to the desired timespan
 *       
 *       don't cram the graph with reference lines (hours visualization)'
 * 
 *        
 * 
 * 
 */
var svg = d3.select("svg");
var margin = 80;
w = 700 - (2 * margin), h = 500 - (2 * margin);
var lOffset = 20;



/*   index represents the current aggregation level
 *   it's updated via the select element in the html.
 *   0: dd-mm-YYYY
 *   -1: mm-YYYY
 *   1: dd-mm-YYYY HH
 */
var index = 0;

var rollup = [];

// timespan placeholder
var beginning1="1-1-2013 00";
var ending1="31-1-2013 23";


var select=d3.select("select");


var date = new Date(), 
curMonth = date.getMonth()
curYear = date.getFullYear()
lastDay = new Date(curYear, curMonth + 1, 0).getDate();

// D3 formatters for different aggregation levels:
format1 = d3.time.format("%d-%m-%Y %H").parse;
format2 = d3.time.format("%d-%m-%Y").parse;
format3 = d3.time.format("%m-%Y").parse;

var xScaleTime=d3.time.scale()
                 .range([0,w]);

var yScale = d3.scale.linear()
                     .range([h, 0]);

var svg2=d3.select(".refresh");
             
             //plots a line graph given an array of objects(points)
             //x is the aggregator (a time value)
             //y is the corresponding average download speed
             

			var lineD = d3.svg.line().x(function(d) {
				if (index==0){
				return (xScaleTime(format2(d.aggregator)) + lOffset)
				}else if (index==1){
					return (xScaleTime(format1(d.aggregator)) + lOffset)
				}else{
					return (xScaleTime(format3(d.aggregator)) + lOffset)
				}
			}).y(function(d) {
				return yScale(d.avg_download_speed * 8 / 1000)
			});
			
			//plots function given an array of objects(points)
             //x is the aggregator (a time value)
             //y is the corresponding average upload speed
			
			var lineU = d3.svg.line().x(function(d) {
				if (index==0){
				return (xScaleTime(format2(d.aggregator)) + lOffset)
				}else if (index==1){
					return (xScaleTime(format1(d.aggregator)) + lOffset)
				}else{
					return (xScaleTime(format3(d.aggregator)) + lOffset)
				}
			}).y(function(d) {
				return yScale(d.avg_upload_speed * 8 / 1000)
			});
        
        //adds svg circle elements for every point 
        // depending on the parameter toggle, it can represent 
        // upload or download data.
        
		var drawCircles = function(toggle) {
		
			var circles = svg2.selectAll("circle." + toggle)
		                  .data(rollup);
		           circles.enter()
		                  .append("circle")
		                  .attr("r", 5)
		                  .attr("class", toggle);
		           
		           if (index==0){
		           	circles.attr("cx", function(d) {return (xScaleTime(format2(d.aggregator))+lOffset)})
		           }
		           else if(index==1){
		           	circles.attr("cx", function(d) {return (xScaleTime(format1(d.aggregator))+lOffset)})
		           }
		           else{
		           	circles.attr("cx", function(d) {return (xScaleTime(format3(d.aggregator))+lOffset)})
		           }
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

            //add axes according to the current range of values
            // and time 
			var addAxes=function(){
						var scaleEnds = [d3.max(rollup, function(d) {
							return d.avg_download_speed;
						}), d3.max(rollup, function(d) {
							return d.avg_upload_speed
						})];
					
						var end = (d3.max(scaleEnds)) * 8 / 1000;
						          yScale.domain([0, end]);
						          
					
						var xAxis = d3.svg.axis()
						                  .scale(xScaleTime)
						                  .orient("bottom");
						                  
						if (index==1){
							xAxis.tickFormat(d3.time.format("%d %H"));
						}   
						else if (index==0){
							xAxis.tickFormat(d3.time.format("%d"));
						}
						else{
							xAxis.tickFormat(d3.time.format("%B"));
						}
						                  
					
						var yAxis = d3.svg.axis()
						                  .scale(yScale)
						                  .orient("left");
						svg2.append("g")
						    .attr("class", "axis")
						    .attr("transform", "translate(20," + h + ")")
						    .call(xAxis);
					

				if (rollup.length == 1) {yScale.domain([0, end * 2]);
					yAxis.scale(yScale)} 
				else {
		
		}
				    svg2.append("g")
						.attr("class", "axis")
						.attr("transform", "translate(20,0)")
						.call(yAxis);
	
			}
			
			//adds reference lines according to the aggregation level.

			var addLines=function(){
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
					
					
					
			   var ylines;
			   if(index==0){
			   	ylines=svg2.selectAll("line.x")
						    .data(xScaleTime.ticks(d3.time.days,1));
			   }else if(index==1){
			   	ylines=svg2.selectAll("line.x")
						    .data(xScaleTime.ticks(d3.time.hours,1));
			   }else {
			   	ylines=svg2.selectAll("line.x")
						    .data(xScaleTime.ticks(d3.time.months,1));
			   }
					  ylines.enter()
						    .append("line")
						    .attr("class", "x")
						    .attr("x1", xScaleTime)
						    .attr("x2", xScaleTime)
						    .attr("y1", 0)
						    .attr("y2", h)
						    .style("stroke", "#ccc");
						    
					ylines.exit().remove();
						    
						svg2.selectAll(".x").attr("transform", "translate(20,0)");
			}
//json processing
var callback = function(array) {


     
	array.forEach(function(d) {
		var date = new Date(d.timestamp * 1000);
		var date1=date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear()+" "+date.getHours();
        var date2=date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear();
		var date3=(date.getMonth()+1)+"-"+date.getFullYear();

		d.date1=date1;   
		d.date2=date2;
		d.date3=date3;
 
	});
    

   
	var nest=[];
	rollup=[];

	if (index == 0) {
		nest = d3.nest().key(function(d) {return (d.date2)})
		                .sortKeys(function(a,b) {
		                	return d3.ascending(format2(a),format2(b));
		                }
		                )
		                .entries(array);      
      xScaleTime.domain([format1(beginning1),format1(ending1)])
                .ticks(d3.time.days, 1);      
                

       
	} else if (index == 1) {
		nest = d3.nest().key(function(d) {return d.date1})
						.sortKeys(function(a,b) {
							 return d3.ascending(format1(a),format1(b));
						})
						.entries(array);
						
       xScaleTime
                 .domain([format1(beginning1),format1(ending1)])
                 .ticks(d3.time.hours, 1);

	} else {
		nest = d3.nest().key(function (d){return d.date3})
						.sortKeys(function(a,b){
							return d3.ascending(format3(a) - format3(b));
						})
						.entries(array);
        xScaleTime
                  .domain([format1(beginning1),format1(ending1)])
                  .ticks(d3.time.months,1);
	}
	

    		
	var s=format1(beginning1);
	var e=format1(ending1);
	

	for ( i = 0; i < nest.length; i++) {
		var sumD = 0;
		var sumU = 0;

		for ( j = 0; j < nest[i].values.length; j++) {

			sumD = +nest[i].values[j].download_speed;
			sumU = +nest[i].values[j].upload_speed;
		};
		
		var avgD = sumD / (nest[i].values.length);
		var avgU = sumU / (nest[i].values.length);

        var corresp;
        if (index==0){
        	
        	    corresp=format2(nest[i].key);
        	}
        	else if(index==1){
        		corresp=format1(nest[i].key);
        	}else{
        		corresp=format3(nest[i].key);
        	}
        	
    	if (corresp<=e&&corresp>=s){
        var point = new Object();
		point.aggregator = nest[i].key;
		point.avg_download_speed = avgD;
		point.avg_upload_speed = avgU;
		rollup.push(point);
    	}
	}
	
	if (rollup.length==0){
		alert("No data available for this timespan");
	}

    	addAxes(rollup);
    	addLines();
    	
    	if(rollup.length!=1){
    	svg2.append("svg:path").attr("d", lineU(rollup)).classed("upload", true);
		svg2.append("svg:path").attr("d", lineD(rollup)).classed("download", true);
}


	drawCircles("upload");
	drawCircles("download");

	var up = d3.selectAll(".upload");
	var down = d3.selectAll(".download");
	
	up.on("mouseover", function() {down.attr("opacity", 0)});
	up.on("mouseleave", function() {down.attr("opacity", 1)});

	down.on("mouseover", function() {up.attr("opacity", 0)});
	down.on("mouseleave", function() {up.attr("opacity", 1)});

}

//removes all variable graphic elements and 
//calls again for data.
var refresh= function(){
	svg2.selectAll(".upload").remove();
    	svg2.selectAll(".download").remove();
    	svg2.selectAll(".axis").remove();
    	svg2.selectAll("path").remove();
    	svg2.selectAll(".x").remove();
    	svg2.selectAll(".y").remove();
        d3.json("data/data_bittorrent_2.json", callback);
}

var startDate=document.getElementById('startDate');	
var endDate=document.getElementById('endDate');
var submit=d3.select("button");

var wintorrent = d3.json("data/data_bittorrent_2.json", callback);


    //updates the index value and the view accordingly
    select.on("change",function(){
    	index=this.value;
        refresh();
    });




  //checks user input for the parameter "start date"
  var checkStart=function(){
    
    var errorMsg = "";  
       
    if(startDate==""){
    	errorMsg="Start date not specified";
    }
    else if((format2(startDate.value))==null){
    	errorMsg=" Invalid date format!";
    }else if (format2(startDate.value)!=null){
    	return true
    }
    
    if (errorMsg!=""){
    	alert(errorMsg);
    	return false
    }

} ;

//checks user input for the parameter "end date"
var checkEnd=function(){
    
    var errorMsg = "";     
    if(endDate==""){
    	errorMsg="Start date not specified";
    }
    else if((format2(endDate.value))==null){
    	errorMsg=" Invalid date format!";
    }else if (format2(endDate.value)!=null){
    	return true
    }
    
    if (errorMsg!=""){
    	alert(errorMsg);
    	return false
    }

};


//when one hits submit... call again data and refresh view.
submit.on("click", function(){
	if(checkStart()&&checkEnd()){
		

		beginning1=startDate.value+" 00";
        ending1=endDate.value+" 23";

		refresh();
		
	}
})
