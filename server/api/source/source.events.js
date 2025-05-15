/**
 * Source model events
 */

'use strict';

import {EventEmitter} from 'events';
var Source = require('../../sqldb').Source;
var SourceEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
SourceEvents.setMaxListeners(0);

// Model events
var events = {
  'afterCreate': 'save',
  'afterUpdate': 'save',
  'afterDestroy': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Source.hook(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc, options, done) {
    SourceEvents.emit(event + ':' + doc._id, doc);
    SourceEvents.emit(event, doc);
    done(null);
  }
}

export default SourceEvents;
