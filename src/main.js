module.exports =  class Argbind {

  // CONSTRUCTOR :: (* -> *) -> this
  constructor(fn) {

    this._map = {};                     // Stores which function to apply to a matched "signature"
    this._default = fn === undefined    // Store function that's applied when no signatures are matched
      ? (...args) => args               // Default function returns all arguments as an array
      : fn;

  }

  // :: STRING|[STRING], (* -> *) -> this
  // Applies function to argument if value has an equal signature:
  case(arg, fn) {
    let args = Argbind.of(arg) === "ARRAY" ? arg : [arg];
    args.reduce((result, arg, index) => {
      if (index === args.length - 1) {
        result[Argbind.signature(arg)] = fn;
        return result;
      }
      if (result[Argbind.signature(arg)] === undefined) {
        result[Argbind.signature(arg)] = {};
      }
      return result[Argbind.signature(arg)];
    }, this._map);
    return this;
  }

  // :: (* -> *) -> this
  // Sets function that is applied to value when type is not of any mapped signatures:
  default(fn) {
    this._default = fn;
    return this;
  }

  // :: * -> *
  // Applies arg to signatures, if no signatures are found, then the default function is applied:
  applyTo() {
    let args = Array.from(arguments);
    let fn = this.lookup(args, this._map);
    return fn.apply(null, arguments)
  }

  // :: [*] -> FUNCTION
  // Recursively check if args are mapped to a function, if they aren't - then the default function is returned:
  lookup(args, map) {
    if (args.length > 0) {
      let arg = args.shift();
      let signature = Argbind.signatureOf(arg);
      let val = map[signature];
      switch (Argbind.of(val)) {
        case "FUNCTION":
          return val;
        case "UNDEFINED":
          return this._default;
        default:
          return this.lookup(args, val);
      }
    }
    return this._default;
  }

  // :: VOID -> this
  // Console out map of instance:
  inspect() {
    console.log(this._map);
    return this;
  }

  /**
   *
   *  Static Methods
   *
   */

   // :: (* -> *) -> ARGBIND
   // Static factory method:
   static init(fn) {
     return new Argbind(fn);
   }

  // :: * -> STRING
  // Returns type of given value as STRING:
  static of(val) {
    if (val === undefined) return "UNDEFINED";
    if (val === null) return "NULL";
    return val.constructor.name.toUpperCase();
  }

  // :: STRING|[STRING] -> STRING
  // Generates a STRING for determining if types are equal between values:
  static signature(arg) {
    let argtype = Argbind.of(arg);
    switch(argtype) {
      case "STRING":
        return arg;
      break;
      case "ARRAY":
        return arg.reduce((result, val) => {
          if (Argbind.of(val) === "STRING") {
            result.push(val.toUpperCase());
          }
          return result;
        }, []).join("|");
      default:
        throw new Error(`argbind.js -> Unexpected type "${argtype}" given when determining signature`);
    }
  }

  // :: * -> STRING
  // Returns signature for given value:
  static signatureOf(arg) {
    switch (Argbind.of(arg)) {
      case "ARRAY":
        return arg.map(arg=>{
          return Argbind.of(arg)
        }).join("|")
      default:
        return Argbind.of(arg);
    }
  }

}
