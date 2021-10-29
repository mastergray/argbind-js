const Argbind = require("../src/main.js");

let test = (x) => Argbind.init()
    .case("STRING", x => "hello " + x)
    .case("NUMBER", x => x + 1)
    .case("UNDEFINED", x => {
      throw new Error("NOT ACCEPTABLE")
    })
    //.inspect()
    .applyTo(x);

test2 = (x,y) => Argbind.init()
  //.case(["NUMBER", "NUMBER"], (x,y) => x - y)
  .case(["STRING", "STRING"], (x,y) => x+y)
  .case(["STRING", x => {
    console.log(x > 5);
    return x > 5;
  }], (x,y) => {
    let z = {};
    z[x] = y;
    return z;
  })
  .applyTo(x,y)

try {
  //console.log(test("world"), Argbind.of("world"));
  //console.log(test([4]), Argbind.of(4));
  //test()
  //console.log(test("4"), Argbind.of("4"));
  console.log(test2("5", 20));
} catch (err) {
  console.log(err);
}
