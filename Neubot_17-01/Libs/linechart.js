
var margin = 80;
    w = 900 - (2*margin),
    h = 700 - (2*margin);
    
var lOffset=20;    
    
var date=new Date(),
    curMonth = date.getMonth()
    curYear =  date.getFullYear()
    lastDay= new Date(curYear,curMonth + 1, 0).getDate();

    var xScale=d3.scale.linear()
                .domain([1,lastDay])
                .range([0,w]);
               
    var yScale=d3.scale.linear()
                   .range([h,0]);
               
var svg=d3.select("#grapharea")
          .append("svg")
          .attr("width", 900)
          .attr("height",700)
          .append("g")
          .attr("transform", "translate(" + margin+ "," + margin + ")");
    
    monthNames_it = [ "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
    "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre" ];
    curName=(monthNames_it[curMonth]);

    var rollup=[];  
    var lineD=d3.svg.line()
                   .x(function (d){return (xScale(d.day)+lOffset)})
                   .y(function(d){return yScale(d.avg_download_speed/1000)});
                   
    var lineU=d3.svg.line()
                   .x(function (d){return (xScale(d.day)+lOffset)})
                   .y(function(d){ return yScale(d.avg_upload_speed/1000)});               
                               
                   
    var drawCircles=function(array,color,toggle){
    	     
		var circles = svg
		        .selectAll("circle."+toggle)
			 	.data(array)
			 	.enter()
			 	.append("circle")
			 	.attr("cx",function(d){return (xScale(d.day)+lOffset)})
			 	.attr("r",5)
			 	.attr("fill", color)
			 	.attr("stroke", color.lighter)
			 	.attr("stroke-width",2)
			 	.attr("class",toggle);
			 	
			 	if(toggle=="download")
			      circles.attr("cy",function(d){return yScale(d.avg_download_speed/1000)});
			    else
			      circles.attr("cy",function(d){return yScale(d.avg_upload_speed/1000)});			      
}               
    //processamento json
    var callback= function(array){
                  
                    array.forEach(function(d){
                   	var date= new Date(d.timestamp*1000);
                   	var day=(date.getDate());
                   	var month=monthNames_it[date.getMonth()];                   
                   	date=day+"-"+month+"-"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes();
                   	d.date=date;
		       		d.day=day;
		       		d.stringDate=date;
		       		});
		       		
		       		//d3.nest aggrega un array secondo una chiave specifica
		       		//tipo GROUP BY key
                    var nest=d3.nest().key(function(d){return d.day})   
                             .sortKeys(d3.ascending)
                             .entries(array);         
                 
                   for(i=0;i<nest.length;i++){
                   	var sumD=0;
                   	var sumU=0;
                   	
                   	    for(j=0;j<nest[i].values.length;j++){
                   	    	
                   	  sumD=+nest[i].values[j].download_speed;
                   	  sumU=+nest[i].values[j].upload_speed;
                   	    };
                   	var avgD=sumD/(nest[i].values.length);
                   	var avgU=sumU/(nest[i].values.length);
                   	    
                   	var point=new Object();
                   	point.day=nest[i].key;
                   	point.avg_download_speed=avgD;
                   	point.avg_upload_speed=avgU;
                   	rollup.push(point);
                   }
                   
           var scaleEnds = [d3.max(rollup,function(d){return d.avg_download_speed;}),
                            d3.max(rollup,function(d){return d.avg_upload_speed})];
               
           var end  =  (d3.max(scaleEnds))/1000;
                   yScale.domain([0, end]);
                 
                                        
					var xAxis = d3.svg.axis()
								  .scale(xScale)
								  .orient("bottom")
								  .ticks(lastDay);

					var yAxis = d3.svg.axis()
								  .scale(yScale)							  
								  .orient("left");

 if (rollup.length==1){
 	yScale.domain([0, end*2])
 }   
else {svg.append("svg:path").attr("d", lineU(rollup)).classed("upload", true);
      svg.append("svg:path").attr("d", lineD(rollup)).classed("download", true)}
      
  
   drawCircles(rollup,"orange","upload");
   drawCircles(rollup,"blue", "download"); 

svg.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(20," +h+ ")")
  .call(xAxis);

svg.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(20,0)")
    .call(yAxis);  
}

    var wintorrent=d3.json("data/data_bittorrent.json",callback)
    
   


