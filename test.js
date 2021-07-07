const test = {
  prop: 42,
  get func() {
    return this.prop;
  },
  value: this.prop,
};

console.log(test.func);
// expected output: 42, which we are getting. But...

console.log(test.value);
// expected output: 42, here the output is `undefined`.