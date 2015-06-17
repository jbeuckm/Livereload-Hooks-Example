#!/usr/bin/env node

// this plugin replaces arbitrary text in arbitrary files
//
// Look for the string CONFIGURE HERE for areas that need configuration
//

var fs = require('fs');
var path = require('path');
var glob = require("glob");

var rootdir = process.argv[2];


var target = "dev";
if (process.env.TARGET) {
    target = process.env.TARGET;
}

console.log("ENVIRONMENT = \"" + target + "\"");
console.log(rootdir);

if (rootdir) {
    var ourconfigfile = path.join(rootdir, "config", "project.json");
    var configobj = JSON.parse(fs.readFileSync(ourconfigfile, 'utf8'));

    var filestoreplace = configobj.files;

    filestoreplace.forEach(function (val, index, array) {

        var globFilename = path.join(rootdir, val);

        glob(globFilename, {}, function (err, files) {
            if (err) {
                console.error(err);
            } else {

                files.forEach(function (fullfilename) {

                    if (fs.existsSync(fullfilename)) {

                        replaceStringsInFile(fullfilename, configobj.replacements, target);

                    } else {
                        console.log("missing: " + fullfilename);
                    }

                });
            }
        });

    });

} else {
    throw("hook replace_strings must run with rootdir argument");
}


function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}


function replaceStringsInFile(path, replacements, target) {

    var data = fs.readFileSync(path, 'utf8');

    for (var tag in replacements) {

        var val = replacements[tag];

        if (val.hasOwnProperty(target)) {
            
            var regex = escapeRegExp(tag);
            console.log("tag regex = "+regex);
            
            data = data.replace(new RegExp(regex, "g"), val[target]);

        }

    };

    fs.writeFileSync(path, data, 'utf8');
}

