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
    let args = Argbind.of(arg) === "ARRAY" ? arg : [arg]; // Always treats bound args as an array
    let signature = Argbind.signature(args);
    let preds = args.map(arg => Argbind.pred);
    this._map[signature] = {
      "preds":preds,
      "fn":fn
    }
    return this;
  }

  // :: (* -> *) -> this
  // Sets function that is applied to value when type is not of any mapped signatures:
  default(fn) {
    this._default = fn;
    return this;
  }

  // :: * -> *
  // Applies arg to match signature, if no signatures are found, then the default function is applied:
  applyTo() {
    let args = Array.from(arguments);
    let signature = Argbind.signatureOf(args);
    if (this._map[signature] === undefined) {
      return this._default.apply(null, arguments);
    }
    // Checks all predicates against arguments, if any fail then default is applied:
    for (let i = 0; i < args.length; i++) {
      console.log(this._map[signature].preds[i].toString());
      if (this._map[signature].preds[i](args[i]) === false) {
        return this._default.apply(null, arguments)
      }
    }
    return this._map[signature].fn.apply(null, arguments);
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

  // :: [STRING|[STRING]|FUNCTION] -> STRING
  // Generates a STRING for determining if types are equal between values:
  static signature(args) {
    return args.map(arg => {
      let argtype = Argbind.of(arg);
      switch (argtype) {
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
    }).join("-");
  }

  // :: [*] -> STRING
  // Returns signature for given value:
  static signatureOf(args) {
    return args.map( arg => {
      let argtype = Argbind.of(arg);
      switch (argtype) {
        case "ARRAY":
          return arg.map(arg=>{
            return Argbind.of(arg);
          }).join("|");
        default:
          return argtype;
      }
    }).join("-");
  }

  // :: * -> * -> BOOL
  // Generates predicate for checking matched signature value:
  // NOTE: This is so we can express constraints as either a a type or multiple types:
  static pred(arg) {
    let argtype = Argbind.of(arg);
    switch (argtype) {
      // Returns TRUE if value of arg is included in array of acceptable types:
      case "ARRAY":
        return x => arg.includes(x);
      // Assumes we are only matching name of type and nothing else:
      default:
        return x => true
    }
  }

}
