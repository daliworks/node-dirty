'use strict';
var db = require('..')('db.dirty'),
   fs = require('fs'),
   memwatch = require('memwatch');

var idIdx = 0;
db.on('load', function() {
  db.set('john', {eyes: 'blue'});
  //console.log('Added john, he has %s eyes.', db.get('john').eyes);

  db.set('bob', {eyes: 'brown'}, function() {
    //console.log('User bob is now saved on disk.');
  });

  /*for(idIdx = 0; idIdx < 100; idIdx++) {
    db.set(idIdx, { time: Date.now(), val: idIdx});
  }
  for(idIdx = 0; idIdx < 100; idIdx += 2 ) {
    db.set(idIdx, undefined);
  }*/
  setInterval(function () {
    idIdx++;
    db.set(idIdx, { time: Date.now(), val: idIdx});
  }, 500);
  setInterval(function () {
    db.rm(idIdx);
  }, 1000);
  setInterval(function () {
    var vals = [], keys = [];
    db.forEach(function(k, v) {
      //console.log('remove key: %s, val: %j', k, v);
      keys.push(k);
      vals.push({ key: k, val: v});
      //db.rm(k); //XXX: do not change key list inside forEach
      return true;
    });
    keys.forEach(function (k) {
      db.rm(k);
    });
    fs.writeFileSync('data_' + idIdx + '.log', JSON.stringify(vals));
    db.clean();
    db.forEach(function(k, v) {
      console.log('after clean key: %s, val: %j', k, v);
      return true;
    });
  }, 10000);
});

db.on('drain', function() {
  //console.log('All records are saved on disk now.');
});

memwatch.on('stats', function (stats) {
  //memoryStatus = stats.usage_trend.toString();
  console.log('[memwatch] stats=', stats);
});

memwatch.on('leak', function (info) {
  console.error('[memwatch] leak=', info);
});
