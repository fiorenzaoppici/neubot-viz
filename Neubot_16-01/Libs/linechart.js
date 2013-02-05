
var margin = 30;
    w = 700 - (2*margin),
    h = 500 - (2*margin);
    
var date=new Date(),
    curMonth = date.getMonth()
    curYear =  date.getFullYear()
    lastDay= new Date(curYear,curMonth + 1, 0).getDate();

    var xScale=d3.scale.linear()
               //.domain([1,lastDay])
               .range([0,w]);
               
    var yScale=d3.scale.linear()
                   .range([h,0]);
               
var svg=d3.select("#grapharea")
          .append("svg")
          .attr("width", 700)
          .attr("height",500)
          .append("g")
          .attr("transform", "translate(" + margin+ "," + margin + ")");
    
    monthNames_it = [ "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
    "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre" ];
    curName=(monthNames_it[curMonth]);
    
    
    var dataprova = [3, 6, 2, 7, 5, 2, 0, 3, 8, 9, 2, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7];
    
    var line=d3.svg.line()
                   .x(function (d){return xScale(d.day)})
                   .y(function(d){return yScale(d.avg_download)});
    
    var callback= function(array){
    
                  // array.sort(function(d){return a.timestamp-b.timestamp});
                   
                   array.forEach(function(d){
                   	var date= new Date(d.timestamp*1000);
                   	var day=(date.getDate());
                   	var month=monthNames_it[date.getMonth()];                   
                   	date=day+"-"+month+"-"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes();
                   	
		       		d.day=day;
		       		d.stringDate=date;
		       		});
		       		
                    var nest=d3.nest().key(function(d){return d.day})   
                             .sortKeys(d3.ascending)
                             .entries(array);
                    
                    nest.forEach(function(d){alert(d.avg)})
                    

					var maxY=array[array.length-1].timestamp;
					var xAxis = d3.svg.axis()
								  .scale(xScale)
								  .orient("bottom")
								  .ticks(lastDay);

					var yAxis = d3.svg.axis()
					  .scale(yScale)
					  .orient("left");


svg.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(0," +h+ ")")
  .call(xAxis);

svg.append("g")
	.attr("class", "axis")
    .call(yAxis);
    
 svg.append("svg:path").attr("d", line(array));

}

    var wintorrent=d3.json("data/data_bittorrent_win.json",callback)
    
    
   


