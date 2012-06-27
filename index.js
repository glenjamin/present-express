/**
 * present-express
 *
 * Mustache powered presenters for ExpressJS
 *
 */

var path = require('path');

// Export these for easy stubbing in test
var deps = exports.deps = {};
deps.require = require;

exports.init = function(settings) {
  if (!settings.templates) {
    throw new Error('templates dir not specified');
  }
  var templates = settings.templates;
  var text = settings['template-ext'] || 'tache';

  function getPresent(name) {
    return deps.require(name);
  }
  function getTemplate(name, callback) {
    var filename = path.join(templates, name) + '.' + text;
    deps.require('fs').readFile(filename, 'utf8', function(err, data) {
      if (err) return callback(err);
      var template = deps.require('hogan').compile(data);
      callback(null, template);
    });
  }

  return function(present, options, callback) {
    var Present = getPresent(present);
    Present(options, function(err, layout, template, data) {
      if (err) return callback(err);
      getTemplate(template, function(err, template) {
        if (err) return callback(err);
        if (!layout) {
          callback(null, template.render(data));
        } else {
          getTemplate(layout, function(err, layout) {
            if (err) return callback(err);
            callback(null, layout.render(data, {content: template}));
          })
        }
      })
    });
  }
}

exports.create = function(populate) {
  return function(options, callback) {
    var context = {};
    context.layout = false;
    context.template = '';
    context.data = {};
    execute_populate(context, options, populate, callback);
  }
}

exports.extend = function(base, populate) {
  return function(options, callback) {
    // TODO: avoid repetition preferrably without looping over arguments
    base(options, function(err, layout, template, data) {
      if (err) return callback(err);
      var context = {layout: layout, template: template, data: data};
      execute_populate(context, options, populate, callback);
    })
  }
}

function execute_populate(context, options, populate, callback) {
  try {
    // no callback: Bit of a hacky/trick to handle both flavours of function
    if (populate.length == 1) {
      populate.call(context, options);
      populate = function(_, fn) {fn()};
    }
    populate.call(context, options, function(err) {
      callback(err, context.layout, context.template, context.data);
    })
  } catch (ex) {
    callback(ex);
  }
}
