 const genID = generateUniqueID(); // genID.uid
 export {genID}

function generateUniqueID() {
    /*
      To generate a unique ID
      https://talk.observablehq.com/t/what-does-dom-uid-xxx-do/4015
      https://github.com/observablehq/stdlib/blob/master/src/dom/uid.js

      If you call fn.uid() once you get an object containing as property id the string "O-1". Call it again to get “O-2”.
      If you pass in a string it will be part of the unique identifier. e.g. call fn.uid('foo') the third time and you get the string "O-foo-3".
      */
    let count = 0;

    function uid(name) {
      function Id(id) {
        this.id = id;
        this.href = new URL(`#${id}`, location) + "";
      }

      Id.prototype.toString = function () {
        return "url(" + this.href + ")";
      };

      return new Id("O-" + (name == null ? "" : name + "-") + ++count);
    }

    return {
      uid: uid,
    };
  }
