/**
 * Globalize v1.0.0-alpha.16
 *
 * http://github.com/jquery/globalize
 *
 * Copyright 2010, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-02-19T12:45Z
 */
/*!
 * Globalize v1.0.0-alpha.16 2015-02-19T12:45Z Released under the MIT license
 * http://git.io/TrdQbw
 */
(function( root, factory ) {

	// UMD returnExports
	if ( typeof define === "function" && define.amd ) {

		// AMD
		define([
			"cldr",
			"../globalize",
			"./number",
			"./plural",
			"cldr/event",
			"cldr/supplemental"
		], factory );
	} else if ( typeof exports === "object" ) {

		// Node, CommonJS
		module.exports = factory( require( "cldrjs" ), require( "globalize" ) );
	} else {

		// Extend global
		factory( root.Cldr, root.Globalize );
	}
}(this, function( Cldr, Globalize ) {

var formatMessage = Globalize._formatMessage,
	validateCldr = Globalize._validateCldr,
	validateParameterPresence = Globalize._validateParameterPresence,
	validateParameterTypeString = Globalize._validateParameterTypeString,
	validateParameterTypeNumber = Globalize._validateParameterTypeNumber;


/**
 * format( formattedNumber, pluralForm, properties )
 *
 * @formattedNumber [String]
 *
 * @pluralForm [String]
 *
 * @properties [Object] containing relative time plural message.
 *
 * Format relative time.
 */
var relativeTimeFormat = function( value, numberFormatter, pluralGenerator, properties ) {

	var relativeTime, message = properties[ "relative-type-" + value ];

	if (message) {
		return message;
	}

	relativeTime = value < 0 ? properties[ "relativeTime-type-past" ]
							 : properties[ "relativeTime-type-future" ];

	value = Math.abs(value);

	message = relativeTime[ "relativeTimePattern-count-" + pluralGenerator(value) ];
	return formatMessage( message, [ numberFormatter(value) ] );
};




/**
 * properties( unit, cldr, options )
 *
 * @unit [String] eg. "day", "week", "month", etc.
 *
 * @cldr [Cldr instance].
 *
 * @options [Object]
 * - form: [String] eg. "short" or "narrow". Or falsy for default long form
 * - minWordOffset [Optional Number] The maximum offset when special offset words like
 *  yesterday and tomorrow will be looked for. Some languages provide several of these.
 *  default null -> use all available
 *  Set to 0 to not use any except today, now etc.
 *
 * Return relative time properties.
 */
var relativeTimeProperties = function( unit, cldr, options ) {

	options = options || {};

	var maxWordOffset = options.maxWordOffset,
		form = options.form,
		raw, rv, k, m;

	if ( form ) {
		unit = unit + "-" + form;
	}

	raw = cldr.main( [ "dates", "fields", unit ] );
	rv = {
		"relativeTime-type-future": raw[ "relativeTime-type-future" ],
		"relativeTime-type-past": raw[ "relativeTime-type-past" ]
	};
	for (k in raw) {
		if (raw.hasOwnProperty(k)) {
			m = /relative-type-(-?[0-9]+)/.exec(k);
			if (m && (
				maxWordOffset == null || // (null or undefined)
				maxWordOffset >= Math.abs(parseInt(m[1], 10))
				)) {
				rv[k] = raw[k];
			}
		}
	}

	return rv;
};




/**
 * .formatRelativeTime( value, unit[, options] )
 *
 * @value [Number] The number of unit to format.
 *
 * @unit [String] eg. "day", "week", "month", etc.
 *
 * @options [Object]
 * - form: [String] eg. "short" or "narrow". Or falsy for default long form
 * - minWordOffset [Optional Number] The maximum offset when special offset words like
 *  yesterday and tomorrow will be looked for. Some languages provide several of these.
 *  default null -> use all available
 *  Set to 0 to not use any except today, now etc.
 *
 * Formats a relative time according to the given unit, options, and the default/instance locale.
 */
Globalize.formatRelativeTime =
Globalize.prototype.formatRelativeTime = function( value, unit, options ) {

	return this.relativeTimeFormatter( unit, options )( value );
};

/**
 * .relativeTimeFormatter( unit[, options ])
 *
 * @unit [String] eg. "day", "week", "month", etc.
 *
 * @options [Object]
 * - form: [String] eg. "short" or "narrow".
 * - maxWordOffset [Optional Number] The maximum offset for which special offset words like
 *  yesterday and tomorrow will be looked for. Some languages provide several of these.
 *  default 2
 *
 * Returns a function that formats a relative time according to the given unit, options, and the
 * default/instance locale.
 */
Globalize.relativeTimeFormatter =
Globalize.prototype.relativeTimeFormatter = function( unit, options ) {
	var cldr, numberFormatter, plural, properties;

	validateParameterPresence(unit, "unit");
	validateParameterTypeString(unit, "unit");

	cldr = this.cldr;
	options = options || {};

	cldr.on( "get", validateCldr );
	properties = relativeTimeProperties( unit, cldr, options );
	cldr.off( "get", validateCldr );

	numberFormatter = this.numberFormatter( options );
	plural = this.pluralGenerator();

	return function( value ) {
		// This validation is repeated in the numberFormatter, but the numberFormatter
		// isn't always called so we need to do it here as well
		validateParameterPresence( value, "value" );
		validateParameterTypeNumber( value, "value" );

		return relativeTimeFormat( value, numberFormatter, plural, properties );
	};
};

return Globalize;




}));
