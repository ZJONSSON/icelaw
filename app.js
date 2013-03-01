/*global d3,container,window*/
var m = 15,   // Margin
    links = [];

d3.json("log.json",function(err,data) {

  // Change nodes to an array
  var nodes = Object.keys(data).map(function(key) {
    data[key].key = key;
    return data[key];
  });

  nodes.forEach(function(node) {
    Object.keys(node.links).forEach(function(link) {
      var source = node,
          target = data[link];
      if (!target) return;
      links.push({type:"suit",source:source,target:target || l});
      source.connections = source.connections || {};
      target.connections = target.connections || {};
      source.connections[link] = 1;
      target.connections[link] = 1;
      source.connections[node.key] = 1;
      target.connections[node.key] = 1; 
    });
  });

  // Remove nodes with no connections
  nodes = nodes.filter(function(d) { return d.connections; });

  var force = d3.layout.force()
      .nodes(nodes)
      .links(links)
      .linkDistance(60)
      .friction(0.5)
      .charge(-150)
      .on("tick", tick)
      .size([container.offsetWidth, container.offsetHeight]);
    
  var svg = d3.select("svg")
      .on("click",function() {
        selected(null);
      });

  var path = svg.append("g").selectAll("path")
      .data(force.links())
    .enter().append("path")
      .attr("class", function(d) { return "link " + d.type+" _"+d.target.key.replace(".","-")+" _"+d.source.key.replace(".",","); });

  var circle = svg.append("g").selectAll("circle")
      .data(force.nodes())
    .enter().append("circle")
      .attr("r", 6)
      .call(force.drag)
      .attr("id",function(d) { return "_"+d.key.replace(".","-"); })
      .attr("class",function(d) { return Object.keys(d.connections).map(function(e) { return "_"+e.replace(".","-"); }).join(" "); })
      .on("click",function(d) {
        selected("._"+d.key.replace(".","-"));
        if (d3.event) d3.event.stopPropagation();
      })
      .on("dblclick",function(d) {
        window.open("http://www.althingi.is/lagas/141a/"+d.key+".html","_blank");
      })
      .call(function(g) {
        g.append("title")
        .text(function(d) { return d.title; });
      });
      
  function selected(d) {
    svg.selectAll("path,circle")
      .style("opacity",function() {return (d) ? 0.6 : 1; })
      .style("stroke",null)
      .style("fill",null);
    d3.selectAll("circle"+d).style("fill","red").style("opacity",1);
    d3.selectAll("path"+d).style("stroke","red").style("opacity",1);
  }
      
  // Use elliptical arc path segments to doubly-encode directionality.
  function tick() {
    force.nodes().forEach(function(node) {
      node.x = Math.max(m,Math.min(container.offsetWidth-m,node.x));
      node.y = Math.max(m,Math.min(container.offsetHeight-m,node.y));
    });
    path.attr("d", function(d) {
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
      return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
    });

    circle.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

  function resize() {
      force.size([container.offsetWidth, container.offsetHeight]).start();
  }
  d3.select(window).on("resize",resize);
  resize();

});