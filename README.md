# node-pipedrive

[![Build](https://travis-ci.org/bookbottles/node-pipedrive.svg)](https://travis-ci.org/bookbottles/node-pipedrive)


Summary
=======
A node.js library for communicating with [Pipedrive's](http://www.pipedrive.com/) REST API.

You can install via Github through npm:

	npm install bookbottles/node-pipedrive --save

This is not published on npm yet.

# Example

```javascript
var pipeClient = require('node-pipedrive')('my_api_key');

pipeClient
    .saveDeal('My New Deal')
    .then(function(id) {
        console.log('Create deal with ID: ' + id);
    }, function(error) {
        console.error('Encountered error: ' + error);
    });
```
