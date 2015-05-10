/**
 * Class used to manipulate json data.
 */
var JsonUtils = function () {
};

function isBuffer(value) {
  if (typeof Buffer === 'undefined') return false
  return Buffer.isBuffer(value)
}

/**
 * Sets the value in the JSON object or create the path.
 *
 * @method setValue
 * @private
 */
var setValue = function (jsonObject, path, force, value) {
  if (!path) {
    return;
  }
  var newValue, obj;
  obj = jsonObject || {};
  path.trim().split('.').some(function (key, index, array) {
    if (!key && key !== 0) {
      return false;
    }
    newValue = obj[key];
    if (index == array.length - 1) {
      if (value === undefined) {
        value = {};
      }
      obj[key] = value;
      return true;
    }
    if (!newValue && newValue != 0 && index <= (array.length - 1)) {
      if (force) {
        obj[key] = {};
      } else {
        return true;
      }
    }
    obj = obj[key];
  });

  return jsonObject;
};

/**
 * Given a class or object, create a mock of it.
 *
 * @method createMock
 * @param value {Object} Object to be mocked.
 * @returns {Object} Return the generated mock.
 */
JsonUtils.prototype.createMock = function (value) {
  var self = this;
  var result = {};
  this.traverse(value.prototype || value, function (object, key, fullKey) {
    var val = object[key];
    var type = Object.prototype.toString.call(val);
    switch (type) {
      case '[object Object]':
        self.set(result, fullKey, {}, true);
        break;
      case '[object Function]':
        self.set(result, fullKey, function () {
        }, true);
        break;
      case '[object Array]':
        self.set(result, fullKey, [], true);
        break;
      case '[object Number]':
        self.set(result, fullKey, 0, true);
        break;
      case '[object String]':
        self.set(result, fullKey, '', true);
        break;
      default:
        self.set(result, fullKey, object[key], true);
        break;
    }
  });
  return result;
};

/**
 * Traverse an object recursively, calling a callback function for each attribute.
 *
 * @method traverse
 * @param value {Object}
 * @param [depth] {int} Max depth to traverse.
 * @param callback {Function} Function to be called
 * at each attribute in the object. Parameters:
 * - object {Object} Current object being iterated.
 * - key {String} Current key being iterated.
 * - fullKey {String} Path to the current key counting from the base object.
 * - currentDepth {int} Depth of current attribute.
 */
JsonUtils.prototype.traverse = function (value, depth, callback) {
  if (!callback) {
    callback = depth;
    depth = 0;
  }
  depth = depth || 0;
  function step(object, prev, curDepth) {
    curDepth = (curDepth || 0);
    Object.keys(object).forEach(function (key) {
      var value = object[key];
      var type = Object.prototype.toString.call(value);
      var isbuffer = isBuffer(value);
      var isobject = (type === "[object Object]" || type === "[object Array]");

      var fullKey = prev ? (prev + '.' + key) : key;

      if (depth != 0 && curDepth > depth) {
        return;
      }

      callback(object, key, fullKey, curDepth);
      if (!isbuffer && isobject && Object.keys(value).length) {
        // Get the number of dependencies
        step(value, fullKey, curDepth + 1);
      }
    });
    return object;
  }

  var type = Object.prototype.toString.call(value);
  if (type === "[object Object]" || type === "[object Array]") {
    return step(value);
  }
};

/**
 * Get a value from the JSON object at the given path.
 *
 * @method get
 *
 * @param jsonObject {Object} Object to get the value from.
 * @param path {String} Path to the value to be retrieved.
 * @returns {Object} Returns the value at the given path. Returns undefined if not found.
 */
JsonUtils.prototype.get = function (jsonObject, path) {
  var key;
  if (!jsonObject || !path) {
    console.log("Invalid path.");
    return undefined;
  }
  obj = jsonObject || {};
  path.split('.').some(function (key, index, array) {
    if (!key && key !== 0) {
      return false;
    }
    obj = obj[key];
    return (!obj && obj !== 0);
  });
  return obj;
};

/**
 * Set a value in a JSON object, given a path.
 *
 * @method set
 *
 * @param jsonObject {Object} Object to be manipulated.
 * @param path {String} Path where to set the value.
 * @param value {*} Value to be set.
 * @param force {Boolean} If true, if the path does not exists create it.
 *          If false, and the path does not exists, then fail silently.
 * @returns {Object} Returns the main object, with the new value added.
 *
 * @example
 *        Given the json object:
 *        <code>
 *        {
 *      	a: {
 *      		b1: 2
 *      	}
 *      }
 *      </code>
 *
 *        Calling the method:
 *        <code>jsonUtils.set("a.b2", 3, true);</code>
 *
 *    Results in:
 *      {
 *      	a: {
 *      		b1: 2
 *      		b2: 3
 *      	}
 *      }
 */
JsonUtils.prototype.set = function (jsonObject, path, value, force) {
  if (force === undefined) {
    force = true;
  }
  return setValue(jsonObject, path, force, value);
};

/**
 * Ensure the path exists in the JSON object.
 *
 * @method ensure
 *
 * @param jsonObject {Object} Object to be manipulated.
 * @param path {String} Path to create in the JSON object.
 * @returns {Object} Returns the main JSON object.
 */
JsonUtils.prototype.ensure = function (jsonObject, path) {
  return setValue(jsonObject, path, true);
};

module.exports = JsonUtils;