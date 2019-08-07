/*
Option to toggle console messages and formatting

https://www.codebyamir.com/blog/suppressing-console-log-messages-in-production
https://stackoverflow.com/questions/7505623/colors-in-javascript-console/42551926#42551926
https://stackoverflow.com/questions/957537/how-can-i-display-a-javascript-object
*/
const debug = false;

function log(message, style = ["blue", "white"]) {
  if (debug) {
    if (typeof message === "string") {
      switch (style) {
        case "success":
          style = ["Green", "none"];
          break;
        case "info":
          style = ["DodgerBlue", "none"];
          break;
        case "error":
          style = ["Red", "none"];
          break;
        case "warning":
          style = ["Orange", "none"];
          break;
        default:
          style = style;
      }

      // below only works for strings
      console.log(
        "%c%s",
        `color: ${style[0]}; background: ${style[1]}`,
        message
      );
    } else {
      // for anything other than strings
      console.log(message);
    }
  }
}
