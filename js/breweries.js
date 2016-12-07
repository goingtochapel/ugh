/* instantiate and configure map */
var map = L.map('map');
var breweryMarkers = new L.FeatureGroup();

L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYm9yaHluZSIsImEiOiJjaXZyOWxjM2kwM3RuMnp0ODFmazg5NGhzIn0.-nn9OxmxJ03rHNtZlCNUWw', {
  //maxZoom: 16
} ).addTo(map);

d3.csv('brewerydata.csv', function(error, data) {
//d3.csv('brewerydata.csv', function(error, data) {  
  var beerData = data;

  var fullDateFormat = d3.time.format('%a, %d %b %Y %X %Z');
  var yearFormat = d3.time.format('%Y');
  var monthFormat = d3.time.format('%b');
  var dayOfWeekFormat = d3.time.format('%a');

_.each(beerData, function(d) {
  d.count = +d.count;
  // round to nearest 10
  d.MedianIncome = Math.round(+d.MedianIncome);
  // round to nearest 0.5
  d.YelpRating = Math.round(+d.YelpRating *2) / 2;
  // round to nearest 50
  d.NumReviews = Math.round(+d.NumReviews * 20) / 20;
  d.PopDensity = Math.round(+d.PopDensity);
  });     


  // set crossfilter
  var ndx = crossfilter(beerData);

  // create dimensions (x-axis values)
  var placeholder1Dim  = ndx.dimension(function(d) {return d.YelpRating;}),
      // dc.pluck: short-hand for same kind of anon. function we used for placeholder1Dim
      placeholder2Dim  = ndx.dimension(dc.pluck('YelpRating')),
      YelpReviewDim = ndx.dimension(dc.pluck('YelpRating')),
      YelpBarDim = ndx.dimension(function(d) {return d.YelpRating;}),
      NumReviewsDim = ndx.dimension(function(d) {return d.NumReviews;}),
      miDim = ndx.dimension(function(d) {return d.MedianIncome;}),
      PDDim = ndx.dimension(function(d) {return d.PopDensity;}),
      allDim = ndx.dimension(function(d) {return d;});

  // create groups (y-axis values)
  var all = ndx.groupAll();
  var countPerP1 = placeholder1Dim.group().reduceCount(),
      countPerP2 = placeholder2Dim.group().reduceCount(),
      countPeryelpreview = YelpReviewDim.group().reduceCount(),
      countPerYelpBar = YelpBarDim.group().reduceCount(),
      countPerNumReviews = NumReviewsDim.group().reduceCount(),
      countPerPD = PDDim.group().reduceCount(),
      countPerMI = miDim.group().reduceCount();

  // specify charts
  var placeholder1Chart   = dc.pieChart('#chart-placeholder1'),
      placeholder2Chart   = dc.pieChart('#chart-placeholder2'),
      yelpreviewChart   = dc.pieChart('#chart-yelpreview'),
      ratingCountChart  = dc.barChart('#chart-barYelpReview'),
      numreviewsChart  = dc.barChart('#chart-NumReviews'),
      popdensityChart  = dc.barChart('#chart-PopDensity'),
      medianincomeChart = dc.barChart('#chart-MedianIncome'),
      dataCount = dc.dataCount('#data-count')
      dataTable = dc.dataTable('#data-table');

  placeholder1Chart
      .width(150)
      .height(150)
      .dimension(placeholder1Dim)
      .group(countPerP1)
      .innerRadius(75);

  placeholder2Chart
      .width(150)
      .height(150)
      .dimension(placeholder2Dim)
      .group(countPerP2)
      .innerRadius(75);

  yelpreviewChart
      .width(150)
      .height(150)
      .dimension(YelpReviewDim)
      .group(countPeryelpreview)
      .innerRadius(50);

  ratingCountChart
      .width(300)
      .height(180)
      .dimension(YelpBarDim)
      .group(countPerYelpBar)
      .x(d3.scale.linear().domain([0,5.2]))
      .elasticY(true)
      .centerBar(true)
      .xUnits(function(){return 10;})
      .xAxisLabel('Yelp Rating')
      .yAxisLabel('Count')
      .margins({top: 10, right: 20, bottom: 50, left: 50});
  ratingCountChart.xAxis().tickValues([0, 1, 2, 3, 4, 5]);

  numreviewsChart
      .width(300)
      .height(180)
      .dimension(NumReviewsDim)
      .group(countPerNumReviews)
      .x(d3.scale.linear().domain([-250, d3.max(beerData, function (d) { return d.NumReviews; })*1.1]))
      .elasticY(true)
      .centerBar(true)
      .xUnits(function(){return 10;})
      .barPadding(2)
      .xAxisLabel('Number of Reviews')
      .yAxisLabel('Count')
      .margins({top: 10, right: 20, bottom: 50, left: 50});

  popdensityChart
      .width(300)
      .height(180)
      .dimension(PDDim)
      .group(countPerPD)
      .x(d3.scale.linear().domain([-1, d3.max(beerData, function (d) { return d.PopDensity; })*1.1]))
      .xUnits(function(){return 10;})
      .barPadding(2)
      .elasticY(true)
      .centerBar(true)
      .xAxisLabel('Population Density')
      .yAxisLabel('Count')
      .margins({top: 10, right: 20, bottom: 50, left: 50});

  medianincomeChart
      .width(300)
      .height(180)
      .dimension(miDim)
      .group(countPerMI)
      .x(d3.scale.linear().domain([-5, d3.max(beerData, function (d) { return d.MedianIncome; }) + 5]))
      .elasticY(true)
      .centerBar(true)
      .xUnits(function(){return 10;})
      .barPadding(2)
      .xAxisLabel('Median Income ($1,000s)')
      .yAxisLabel('Count')
      //.xUnits(function (d) { return 5;})
      .margins({top: 10, right: 20, bottom: 50, left: 50});

  dataCount
      .dimension(ndx)
      .group(all);

   dataTable
    .dimension(allDim)
    .group(function (d) { return 'dc.js insists on putting a row here so I remove it using JS'; })
    .columns([
      function (d) { return d.Brewery; },
      function (d) { return d.Address; },
      function (d) { return d.PopDensity; },
      function (d) { return d.MedianIncome*1000; },
      function (d) { return d.YelpRating; },
      function (d) { return d.NumReviews; }
    ])
    .sortBy(function (d) { return d.NumReviews; })
    .order(d3.descending)
    .size(Infinity)
    .on('renderlet', function (table) {
      // each time table is rendered remove nasty extra row dc.js insists on adding
      table.select('tr.dc-table-group').remove();

      // update map with breweries to match filtered data
      breweryMarkers.clearLayers();
      _.each(YelpReviewDim.top(100), function (d) {
        var loc = d.Address;
        var name = d.Brewery;
        var marker = L.marker([d.lat, d.lng]);
        marker.bindPopup("<p>" + name + "</br>" + loc + "</p>");
        breweryMarkers.addLayer(marker);
      });
      map.addLayer(breweryMarkers);
      map.fitBounds(breweryMarkers.getBounds());
    });

  // register handlers
  d3.selectAll('a#all').on('click', function () {
    dc.filterAll();
    dc.renderAll();
  });

  d3.selectAll('a#day').on('click', function () {
    yelpreviewChart.filterAll();
    dc.redrawAll();
  });

  // showtime!
  dc.renderAll();

});