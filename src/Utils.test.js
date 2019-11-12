
import {
  removeProps
} from './Utils';

test('removeProps', () => {
  [{
      ob: { foo: 'fooValue1', bar: 'barValue1' },
      excludeProps: 'foo',
      expected: { bar: 'barValue1' }
  }, {
      ob: { foo: 'fooValue2', bar: 'barValue2' },
      excludeProps: ['foo'],
      expected: { bar: 'barValue2' }
  }, {
      ob: { foo: 'fooValue3', bar: 'barValue3' },
      excludeProps: ['foo', 'bar'],
      expected: {}
  }, {
      ob: { foo: 'fooValue4', bar: 'barValue4' },
      excludeProps: [],
      expected: { foo: 'fooValue4', bar: 'barValue4' }
  }, {
      ob: { foo: 'fooValue5', bar: 'barValue5' },
      excludeProps: undefined,
      expected: { foo: 'fooValue5', bar: 'barValue5' }
  }].forEach(({ ob, excludeProps, expected }) => {
      expect(removeProps(ob, excludeProps)).toEqual(expected);
  });
});