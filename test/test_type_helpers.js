var assert = require('chai').assert;

// Define functions to assist with handling various C data types.
var type_helpers = require('../lib/type_helpers');
var ljTypeMap = type_helpers.ljTypeMap;
var ljTypeOps = type_helpers.ljTypeOps;
var convertToFFIType = type_helpers.convertToFFIType;

var driver_const = require('ljswitchboard-ljm_driver_constants');
var ARCH_CHAR_NUM_BYTES = 1;
var ARCH_INT_NUM_BYTES = driver_const.ARCH_INT_NUM_BYTES;
var ARCH_DOUBLE_NUM_BYTES = driver_const.ARCH_DOUBLE_NUM_BYTES;
var ARCH_POINTER_SIZE = driver_const.ARCH_POINTER_SIZE;


function testValues(assert, userVal, expVal, type, size, expErr) {
	var throwsError = false;
	try {
		var buf;
		var finalVal;
		if(Array.isArray(userVal)) {
			buf = ljTypeOps[type].allocate(userVal);
			assert.equal(
				buf.length,
				size * userVal.length,
				'Array size should be size * array.length'
			);

			buf = ljTypeOps[type].fill(buf, userVal);
			finalVal = ljTypeOps[type].parse(buf);
			assert.deepEqual(expVal, finalVal, 'type: '+type+' should be equal');
		} else if ( type.indexOf('*') >= 0 ) {
			buf = ljTypeOps[type].allocate(userVal);
			assert.equal(buf.length, size, 'type: '+type+' buffer should be 1 byte long');

			buf = ljTypeOps[type].fill(buf, userVal);
			finalVal = ljTypeOps[type].parse(buf);
			assert.equal(expVal, finalVal, 'type: '+type+' should be equal');
		}
	} catch(err) {
		throwsError = true;
		if(throwsError !== expErr) {
			console.log('Error', err, err.stack);
		}
	}
	assert.equal(throwsError, expErr, 'Un-Expected error/non-error');
}
function performTestType(assert, type) {
	var testData = type_tests[type];
	testData.test_vals.forEach(function(testVal) {
		testValues(
			assert,
			testVal.start,
			testVal.end,
			testData.type,
			testData.size,
			testVal.err
		);
	});
}

var type_tests = {};
type_tests.char = {
	'test_vals': [
		{'start': 8, 	'end': 8, 	'err': false},
		{'start': 255, 	'end': 255, 'err': false},
		// {'start': 256, 	'end': 0, 	'err': true},
	],
	'type': 'char',
	'size': ARCH_CHAR_NUM_BYTES,
};
type_tests.uint = {
	'test_vals': [
		{'start': 8, 	'end': 8, 		'err': false},
		{'start': 255, 	'end': 255, 	'err': false},
		{'start': 256, 	'end': 256, 	'err': false},
		// {'start': -1, 	'end': 256, 	'err': true},
	],
	'type': 'uint',
	'size': ARCH_INT_NUM_BYTES,
};
type_tests.int = {
	'test_vals': [
		{'start': 8, 	'end': 8, 		'err': false},
		{'start': 255, 	'end': 255, 	'err': false},
		{'start': 256, 	'end': 256, 	'err': false},
		{'start': -1, 	'end': -1, 		'err': false},
	],
	'type': 'int',
	'size': ARCH_INT_NUM_BYTES,
};
type_tests.double = {
	'test_vals': [
		{'start': 8, 	'end': 8, 		'err': false},
		{'start': 255, 	'end': 255, 	'err': false},
		{'start': 256.2,'end': 256.2, 	'err': false},
		{'start': -1, 	'end': -1, 		'err': false},
		{'start': -1.1, 'end': -1.1,	'err': false},
	],
	'type': 'double',
	'size': ARCH_DOUBLE_NUM_BYTES,
};
type_tests['char*'] = {
	'test_vals': [
		{'start': 'testA', 	'end': 'testA', 'err': false},
		{'start': 'testB', 	'end': 'testB', 'err': false},
	],
	'type': 'char*',
	'size': driver_const.LJM_MAX_STRING_SIZE,
};
type_tests['uint*'] = type_tests.uint;
type_tests['int*'] = type_tests.int;
type_tests['double*'] = type_tests.double;

type_tests['a-char*'] = {
	'test_vals': [
		{'start': [1,2], 	'end': [1,2], 	'err': false},
		{'start': [256,2], 	'end': [256,2], 'err': true},
		{'start': [-1,2], 	'end': [-1,2], 	'err': true},
	],
	'type': 'a-char*',
	'size': ARCH_CHAR_NUM_BYTES,
};
type_tests['a-uint*'] = {
	'test_vals': [
		{'start': [1,2], 	'end': [1,2], 	'err': false},
		{'start': [256,2], 	'end': [256,2], 'err': false},
		{'start': [-1,2], 	'end': [-1,2], 	'err': true},
	],
	'type': 'a-uint*',
	'size': ARCH_INT_NUM_BYTES,
};
type_tests['a-int*'] = {
	'test_vals': [
		{'start': [1,2], 	'end': [1,2], 	'err': false},
		{'start': [256,2], 	'end': [256,2], 'err': false},
		{'start': [-1,2], 	'end': [-1,2], 	'err': false},
	],
	'type': 'a-int*',
	'size': ARCH_INT_NUM_BYTES,
};
type_tests['a-double*'] = {
	'test_vals': [
		{'start': [1,2], 		'end': [1,2], 		'err': false},
		{'start': [256,2], 		'end': [256,2], 	'err': false},
		{'start': [-1,2], 		'end': [-1,2], 		'err': false},
		{'start': [1.1,2], 		'end': [1.1,2], 	'err': false},
		{'start': [256.2,2], 	'end': [256.2,2], 	'err': false},
		{'start': [-1.1,2], 	'end': [-1.1,2], 	'err': false},
	],
	'type': 'a-double*',
	'size': ARCH_DOUBLE_NUM_BYTES,
};
type_tests['char**'] = {
	'test_vals': [
		{'start': 'testA', 'end': 'testA', 'err': false},
	],
	'type': 'char**',
	'size': ARCH_POINTER_SIZE,
};
type_tests['a-char**'] = {
	'test_vals': [
		{'start': ['testA', 'testB'], 'end': ['testA', 'testB'], 'err': false},
	],
	'type': 'a-char**',
	'size': ARCH_POINTER_SIZE,
};

/* Define Test Cases */


describe('test_type_helpers', function() {
	it('hello world', function (done) {
		done();
	});
	it('verify defined types', function (done) {
		var mapKeys = Object.keys(ljTypeMap);
		var opsKeys = Object.keys(ljTypeOps);

		assert.equal(
			mapKeys.length,
			opsKeys.length,
			'ljType Lengths do not match.'
		);

		for(var i = 0; i < mapKeys.length; i++) {
		    // console.log(mapKeys[i], opsKeys[i]);
			assert.strictEqual(
		    	mapKeys[i],
		    	opsKeys[i],
		    	'ljType Indices do not match'
		    );
		}
		done();
	});
	it('verify string type', function (done) {
		var userStr = 'abcdef';
		var strBuff = ljTypeOps.string.allocate(userStr);
		assert.equal(
			strBuff.length,
			userStr.length,
			'String length & buffer length should be correlated'
		);

		strBuff = ljTypeOps.string.fill(strBuff, userStr);
		// assert.strictEqual(strBuff, userStr, 'String should be full');

		var finalStr = ljTypeOps.string.parse(strBuff);
		assert.strictEqual(finalStr, userStr, 'String should be the userStr');
		assert.equal(
			finalStr.length,
			userStr.length,
			'String lengths should be the same'
		);
		done();
	});
	it('verify char type', function (done) {
		performTestType(assert, 'char');
		done();
	});
	it('verify uint type', function (done) {
		performTestType(assert, 'uint');
		done();
	});
	it('verify int type', function (done) {
		performTestType(assert, 'int');
		done();
	});
	it('verify double type', function (done) {
		performTestType(assert, 'double');
		done();
	});
	it('verify char* type', function (done) {
		/**
		 * This data type indicates a string that LJM fills.  It is used
		 * in the functions:
		 * LJM_eReadNameString
		 * LJM_eReadAddressString
		 * LJM_eWriteNameString
		 * LJM_eWriteAddressString
		 * LJM_ReadLibraryConfigStringS
		**/
		performTestType(assert, 'char*');
		done();
	});
	it('verify uint* type', function (done) {
		performTestType(assert, 'uint*');
		done();
	});
	it('verify int* type', function (done) {
		performTestType(assert, 'int*');
		done();
	});
	it('verify double* type', function (done) {
		performTestType(assert, 'double*');
		done();
	});
	it('verify a-char* type', function (done) {
		performTestType(assert, 'a-char*');
		done();
	});
	it('verify a-uint* type', function (done) {
		performTestType(assert, 'a-uint*');
		done();
	});
	it('verify a-int* type', function (done) {
		performTestType(assert, 'a-int*');
		done();
	});
	it('verify a-double* type', function (done) {
		performTestType(assert, 'a-double*');
		done();
	});
	it('verify char** type', function (done) {
		performTestType(assert, 'char**');
		done();
	});
	it('verify a-char** type', function (done) {
		performTestType(assert, 'a-char**');
		done();
	});

});
