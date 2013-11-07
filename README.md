# rework-macro

Macros implementation for rework, allows you to define macros right in CSS
source:

    @macro colored-position {
      position: $1;
      border: 1px solid $2;
    }

    .block {
      colored-position: absolute red;
    }

Will expand into:

    .block {
      position: absolute;
      border: 1px solid red;
    }

Macro body can expand other macros but recursive expansion isn't allowed.

Other random limitations:

  * macros with no arguments are not allowed — consider turning them into classes
    and use [rework-inherit](https://github.com/reworkcss/rework-inherit)
    instead.

  * macros with more than 9 arguments are not allowed... for no reason,
    consider forking this repo and fixing this.

## Installation

    % npm install rework-macro

## Usage with [xcss](https://github.com/andreypopp/xcss)

    % npm install -g xcss
    % xcss -t rework-macro ./src.css > transformed.css

## Usage with [rework](https://github.com/visionmedia/rework)

    var rework  = require('rework');
    var macro   = require('rework-macro');

    var transformed = rework(src).use(macro).toString();
