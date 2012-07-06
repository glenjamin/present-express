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
  function render(data, template, callback) {
    callback(null, template.render(data));
  }
  function renderLayout(data, template, layout, callback) {
    if (Array.isArray(layout)) {
      var head = layout.shift();
      if (!layout.length) {
        return getTemplate(head, function(err, layout) {
          if (err) return callback(err);
          callback(null, layout.render(data, {content: template}));
        })
      }
      return renderLayout(data, template, layout, function(err, rendered) {
        if (err) return callback(err);
        getTemplate(head, function(err, head_layout) {
          if (err) return callback(err);
          callback(null, head_layout.render(data, {content: rendered}));
        })
      })
    }
    return renderLayout(data, template, [layout], callback);
  }

  return function(present, options, callback) {
    var Present = getPresent(present);
    Present(options, function(err, context) {
      if (err) return callback(err);
      getTemplate(context.template, function(err, template) {
        if (err) return callback(err);
        if (!context.layout) {
          render(context.data, template, callback);
        } else {
          renderLayout(context.data, template, context.layout, callback);
        }
      })
    });
  }
}

exports.create = function(populate) {
  return function(options, callback) {
    var context = {
      layout: false,
      template: '',
      data: {}
    };
    execute_populate(context, options, populate, callback);
  }
}

exports.extend = function(base, populate) {
  return function(options, callback) {
    // TODO: avoid repetition preferrably without looping over arguments
    base(options, function(err, context) {
      if (err) return callback(err);
      context = Object.create(context);
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
      callback(err, context);
    })
  } catch (ex) {
    callback(ex);
  }
}
