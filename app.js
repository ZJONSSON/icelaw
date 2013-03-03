/*global d3,container,window*/
var m = 15,   // Margin
    links = [],
    target;

d3.json("log.json",function(err,data) {

  // Change nodes to an array
  var nodes = Object.keys(data).map(function(key) {
    data[key].key = key;
    data[key].refs = {};
    return data[key];
  });

  nodes.forEach(function(node) {
    Object.keys(node.links).forEach(function(link) {
      if (target = data[link]) {
        links.push({source:node,target:target});
        target.refs[node.key] = true;
      };
    });
  });

  // Remove nodes with no connections
  nodes = nodes.filter(function(d) {
    return Object.keys(d.refs).length+Object.keys(d.links).length; 
  });

  var force = d3.layout.force()
      .nodes(nodes)
      .links(links)
      .linkDistance(60)
      .friction(0.5)
      .charge(-150)
      .on("tick", tick);
    
  var svg = d3.select("svg")
      .on("click",function() {
        d3.selectAll("circle,path")
        .attr("class","");
      });

  var path = svg.append("g").selectAll("path")
      .data(links)
    .enter().append("path");
      
     
  var circle = svg.append("g").selectAll("circle")
      .data(nodes)
    .enter().append("circle")
      .attr("r", 6.5)
      .call(force.drag)
      .on("click",function(d) {
        var clicked = this;
        svg.selectAll("circle,path")
          .attr("class",function(e) {
            if (!e) return;
            if (this==clicked) return "selected";
            if (e.key in d.links || e.source && e.source.key == d.key) return "link from";
            if (e.key in d.refs || e.target && e.target.key == d.key) return "link to";
            return "notselected";
          });
          
        if (d3.event) d3.event.stopPropagation();
      })
      .on("dblclick",function(d) {
        window.open("http://www.althingi.is/lagas/141a/"+d.key+".html","_blank");
      })
      .call(function(g) {
        g.append("title")
        .text(function(d) { return d.title+" ("+d.key.slice(0,4)+"-"+d.key.slice(4)+")"; });
      });
      
  // Use elliptical arc path segments to doubly-encode directionality.
  // source: https://gist.github.com/mbostock/1153292
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