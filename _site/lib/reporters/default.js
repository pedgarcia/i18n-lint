/**
 * i18n-lint default reporter
 *
 * Copyright (c) 2014 James Warwood
 * Licensed under the MIT license.
 */
'use strict';

module.exports = {
  reporter: function(errors) {
    if (!errors.length) {
      return;
    }

    var chalk = require('chalk');

    var lastLine = -1;

    /**
     * Return a new string composed of `str`, repeated by `times`, e.g.
     *
     *  ```
     *  strRepeat('*', 5);
     *  // --> '*****'
     *  ```
     *
     * @param {String} str    The string to repeat
     * @param {Number} times  The number of times to repeat `str`
     *
     * @return {String} `str`, repeated `times` times
     */
    function strRepeat(str, times) {
      return new Array(times + 1).join(str);
    }

    /**
     * Print an error, with the appropriate formatting.
     *
     * @param {Object} error  The error details object
     */
    function showError(error) {
      if (typeof error.evidence === 'string') {
        error.evidence = new RegExp(error.evidence.replace(/^\/|\/$/g, ''));
      }
      var matches = error.scope.match(error.evidence),
        highlighted = error.scope.slice(
            error.character, error.character + matches[0].length
        );

      // Write line number with 5 spaces of padding
      process.stdout.write(
        strRepeat(' ', 5 - error.line.toString().length) + ' ' +
        ((lastLine !== error.line) ? error.line : chalk.italic.dim(error.line)) + ' | '
      );
      lastLine = error.line;

      // Highlight offending text
      matches.slice(1).forEach(function(match) {
        highlighted = highlighted.replace(match, chalk.bgRed.yellow(match));
      });

      error.scope = error.scope.slice(0, error.character) + highlighted +
          error.scope.slice(error.character + matches[0].length);

      process.stdout.write(chalk.white(
        error.scope.replace(/\n|\r/g, '\n' + strRepeat(' ', 9)) + '\n'
      ));

      /* Write error message on next line, at appropriate column (accounting for
       * padding at beginning of line)
       */
      var whitespace = strRepeat(' ', 9);
      whitespace += error.scope.slice(0, error.character).replace(/[^\s]/g, ' ');
      whitespace = whitespace.replace(/\s+(\n|\r)/g, strRepeat(' ', 9));

      process.stdout.write(whitespace + '^ ' + error.reason + '\n');
    }

    // Print file name
    process.stdout.write(chalk.bold('\n  ' + errors[0].file + '\n'));

    errors.map(function(error) {
      return error.error;
    }).forEach(showError);
  }
};