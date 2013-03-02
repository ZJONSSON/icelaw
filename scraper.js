/*jshint node:true*/
"use strict";

var request = require("request"),
    iconv = require("iconv-lite"),
    fs = require("fs");

// Set maxSocets to Infinity to rudely open up all requests at same time
// require("http").globalAgent.maxSockets = Infinity;

var rePages = /a href=\"http:\/\/www.althingi.is\/lagas\/141a\/(.*)?\.html\"/g,
    reLinks = /a href=\"([^\/]*)\.html?\">/g,
    reTitle = /<title>.*\/(.*)?<\/title>/;

var pages = {};

request("http://www.althingi.is/lagas/nuna/lagas.nr.html",function(error,response,body) {
  var page;
  while (page = rePages.exec(body)) pages[page[1]]={links:{}};
  openPages();
});

function openPages() {
  var keys = Object.keys(pages),
      i = keys.length;

  keys.forEach(function(page) {
    request({url:"http://www.althingi.is/lagas/141a/"+page+".html",encoding:null},function(error,response,body) {
      var link,title;
      body = iconv.decode(body,'iso-8859-1');
      title = reTitle.exec(body);
      if (title) pages[page].title = title[1];
      pages[page].size = body.length;
      while (link = reLinks.exec(body)) pages[page].links[link[1]]=1;
      console.log(i);
      if (!(--i)) done();
    });
  });
}

function done() {
  fs.writeFileSync("log.json",JSON.stringify(pages));
  console.log("done");
}
