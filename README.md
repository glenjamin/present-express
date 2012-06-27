# present-express

All aboard the present express!

## Installation

    npm install present-express --save

## Usage

    app.engine('present.js', require('present-express').init({
        'templates': __dirname + '/templates',
        'template-ext': 'tache'
    }));
    app.set('view engine', 'present.js');
    app.set('views', __dirname + '/presents');

## Defining Presenters

    # presents/index.present.js
    var present = require('present-express');
    module.exports = present.create(function(data) {
        this.template = 'index';

        this.data.title = data.title;
        this.data.body = data.sections.join('\n');
    })

## Inheritance and layouts

    # presents/base.js
    var present = require('present-express');
    module.exports = present.create(function(data) {
        this.layout = 'layouts/default';
        this.template = 'default';

        this.data.title = 'My Website';
        this.data.copyright = new Date().getFullYear();
    })

    # presents/index.present.js
    var present = require('present-express');
    var Base = require('./base');
    module.exports = present.extend(Base, function(data) {
        this.template = 'overriden';

        this.data.title = data.title + ' | ' + this.data.title;
        this.data.heading = data.heading;
    })

## API Docs

    module('present-express')

        init: function(options)
            prepare a present express engine

            options.templates: location for template files
            options.template-ext: extension for template files (default: tache)

            returns: engine for use in express

        create: function(populate)
            define a presenter class

            populate: function(data[, callback])
                extract data and assign to this.data
                should also set this.template
                if callback is provided, the presenter will be async

            returns: presenter class

        extend: function(Presenter, populate)
            produce a new presenter re-using the existing behaviour

            Presenter:
                the presenter class to extend
            populate: function(data[, callback])
                Behaves the same as the create function
