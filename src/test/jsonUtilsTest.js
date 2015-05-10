var assert = require("assert")
var JsonUtils = require('../main/jsonUtils');
var jsonUtils = new JsonUtils();
var mainObject = {
  a: 1,
  b: {
    b1: 'x'
  },
  c: [2]
};

function clone(val) {
  return JSON.parse(JSON.stringify(val));
}

describe('Test the JSON formatting', function () {
  var obj;
  beforeEach(function () {
    obj = clone(mainObject);
  });

  it('should add b2 to mainObject', function () {
    var expected = clone(mainObject);
    expected.b.b2 = 3;

    jsonUtils.set(obj, 'b.b2', 3);
    assert.deepEqual(obj, expected);
  });

  it('should ensure b.b3.b31 exists', function () {
    var expected = clone(mainObject);
    expected.b.b3 = {
      b31: {}
    };

    jsonUtils.ensure(obj, 'b.b3.b31');
    assert.deepEqual(obj, expected);
  });

  it('should ensure b.b1 == "x"', function () {
    var initialObj = clone(mainObject);

    var value = jsonUtils.get(obj, 'b.b1');
    assert.deepEqual(obj, initialObj);
    assert.equal(value, 'x');
  });

  it('should traverse successfully', function () {
    var initialObj = clone(mainObject);
    var result = [['a', 'a', 0], ['b', 'b', 0], ['b1', 'b.b1', 1], ['c', 'c', 0], ['0', 'c.0', 1]];
    var i = 0;
    jsonUtils.traverse(initialObj, function (obj, key, fullKey, depth) {
      assert.equal(key, result[i][0]);
      assert.equal(fullKey, result[i][1]);
      assert.equal(depth, result[i][2]);
      i++;
    })
  });

  it('should create a mock', function () {
    var initialObj = clone(mainObject);
    var TestClass = function () {
    };
    TestClass.prototype.fn1 = function () {
    };
    TestClass.prototype.fn2 = function () {
    };
    TestClass.prototype.obj1 = 123;
    TestClass.prototype.obj2 = 'abc';
    TestClass.prototype.obj3 = null;
    TestClass.prototype.obj4 = {
      foo: 'bar'
    };
    var mock = jsonUtils.createMock(TestClass);
    assert.equal(typeof mock.fn1, 'function');
    assert.equal(typeof mock.fn2, 'function');
    assert.notEqual(mock.fn1, TestClass.prototype.fn1);
    assert.notEqual(mock.fn2, TestClass.prototype.fn2);
    assert.equal(mock.obj1, 0);
    assert.equal(mock.obj2, '');
    assert.equal(mock.obj3, null);
    assert.deepEqual(mock.obj4, {foo: ''});
  });
});
