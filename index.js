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
  getTemplate.cache = {};
  function getTemplate(name) {
    if (getTemplate.cache[name]) return getTemplate.cache[name];
    var filename = path.join(templates, name) + '.' + text;
    var data = deps.require('fs').readFileSync(filename, 'utf8');
    return getTemplate.cache[name] = deps.require('hogan').compile(data);
  }
  function renderLayout(data, template, layout) {
    if (Array.isArray(layout)) {
      var head = layout.shift();
      if (!layout.length) {
        var compiled = getTemplate(head);
        return compiled.render(data, {content: template});
      }
      var rendered = renderLayout(data, template, layout);
      var compiled = getTemplate(head);
      return compiled.render(data, {content: rendered});
    }
    return renderLayout(data, template, [layout]);
  }

  exports.render = function(template, data) {
    var compiled = getTemplate(template);
    return compiled.render(data);
  }

  return function(present, options, callback) {
    var Present = getPresent(present);
    Present(options, function(err, context) {
      if (err) return callback(err);
      try {
        var template = getTemplate(context.template);
        if (!context.layout) {
          callback(null, render(context.data, template));
        } else {
          callback(null, renderLayout(context.data, template, context.layout));
        }
      } catch (ex) {
        callback(ex);
      }
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
