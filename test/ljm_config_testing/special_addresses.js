var assert = require('chai').assert;

/*
 * This test makes sure that a simple LJM function call can be performed with
 * each exposed method.  Synchronous and Asynchronous versions of all three
 * types.
 * Type 1: Automatically handles converting/parsing of data into and out of
 * 		buffer data structures.
 * Type 2: Adds a try-catch around the function call that makes the
 * 		Linux/Mac/Windows ffi implementations more similar.
 * Type 3: The raw FFI function calls.
 */


var extend = require('extend');
// Define functions to assist with handling various C data types.
var type_helpers = require('../../lib/type_helpers');
var ljTypeMap = type_helpers.ljTypeMap;
var ljTypeOps = type_helpers.ljTypeOps;
var convertToFFIType = type_helpers.convertToFFIType;

var driver_const = require('ljswitchboard-ljm_driver_constants');
var ARCH_CHAR_NUM_BYTES = 1;
var ARCH_INT_NUM_BYTES = driver_const.ARCH_INT_NUM_BYTES;
var ARCH_DOUBLE_NUM_BYTES = driver_const.ARCH_DOUBLE_NUM_BYTES;
var ARCH_POINTER_SIZE = driver_const.ARCH_POINTER_SIZE;

var ENABLE_DEBUG = false;
function debug() {
	if(ENABLE_DEBUG) {
		console.log.apply(console, arguments);
	}
}
var ENABLE_LOG = true;
function log() {
	if(ENABLE_LOG) {
		console.log.apply(console, arguments);
	}
}


/* Define how the tests will be run. */
var ljm;
var liblabjack;
var ffi_liblabjack;

var has_special_addresses = false;
var minLJMVersion = 1.09;

/* Define Test Cases */
describe('special_addresses', function() {
	it('include ljm', function (done) {
		var ljm_ffi = require('../../lib/ljm-ffi');

		ljm = ljm_ffi.load();
		liblabjack = ljm_ffi.loadSafe();
		ffi_liblabjack = ljm_ffi.loadRaw();

		done();
	});
	it('Check LJM Version for Special Address implementation', function (done) {
		var ljmLibraryVersion = ljm.LJM_ReadLibraryConfigS('LJM_LIBRARY_VERSION', 0);
		var expectedData = {
			'ljmError': 0,
			'Parameter': 'LJM_LIBRARY_VERSION',
			'Value': ljmLibraryVersion.Value,
		};
		if(ljmLibraryVersion.Value >= minLJMVersion) {
			has_special_addresses = true;
		}
		assert.deepEqual(ljmLibraryVersion, expectedData);
		done();
	});
	it('Execute LJM_SPECIAL_ADDRESSES_STATUS', function (done) {
		function testData(ljmSpecialAddressesStatus) {
			var isOk = true;
			if(ljmSpecialAddressesStatus.ljmError) {
				isOk = false;
			}
			assert.isOk(isOk, 'Failed to read the LJM_SPECIAL_ADDRESSES_STATUS register');
			console.log('Result', ljmSpecialAddressesStatus);
			console.log('Res Str Len', ljmSpecialAddressesStatus.String.length);
			done();
		}

		if(has_special_addresses) {
			// Execute LJM Function
			ljm.LJM_ReadLibraryConfigStringS.async('LJM_SPECIAL_ADDRESSES_STATUS', '', testData);
		} else {
			console.log(' ! This version of LJM does not have the LJM Special Addresses feature.');
			done();
		}
	});
	it('Execute LJM_SPECIAL_ADDRESSES_FILE', function (done) {
		function testData(ljmSpecialAddressesFileLocation) {
			var isOk = true;
			if(ljmSpecialAddressesFileLocation.ljmError) {
				isOk = false;
			}
			assert.isOk(isOk, 'Failed to read the LJM_SPECIAL_ADDRESSES_FILE register');
			// console.log('Result', ljmSpecialAddressesFileLocation);
			// console.log('Res Str Len', ljmSpecialAddressesFileLocation.String.length);
			done();
		}

		if(has_special_addresses) {
			// Execute LJM Function
			ljm.LJM_ReadLibraryConfigStringS.async('LJM_SPECIAL_ADDRESSES_FILE', '', testData);
		} else {
			console.log(' ! This version of LJM does not have the LJM Special Addresses feature.');
			done();
		}
	});
});
