var ug = require("usergrid"),
    cmdr = require("commander"),
    path = require("path"),
    fs = require("fs"),
    request = require("request"),
    prompt = require("prompt");

cmdr
  .version("0.0.1")
  .usage("[options] <file ...>")
  .option("-o --org [orgname]", "Your Apigee.com username", "null")
  .option("-a --app [appname]", "Your Apigee.com appname", "sandbox")
  .option("-i --id [id]", "Your client id")
  .option("-s --secret [secret]", "Your client secret")
  .option("-f --file [filepath]", "Path to a file for uploading")
  .option("-d --data [datapath]", "Path to json file for uploading")
  .parse(process.argv);

//Parsing out arguments

var org = null;
var app = null;
var client_id = null;
var client_secret = null;
var file_path = null;
var data_path = null;
var create_flag = null;

if (cmdr.org) {
  org = cmdr.org;
} 

if(cmdr.app) {
  app = cmdr.app;
}

if(cmdr.id) {
  client_id = cmdr.id;
}

if (cmdr.secret) {
  client_secret = cmdr.secret;
}

if (cmdr.file) {
  file_path = cmdr.file;
}

if (cmdr.data) {
  data_path = cmdr.data;
}

if (cmdr.create) {
  create_flag = cmdr.create;
}

if(org && app) { 
  var client = new ug.client({
    orgName:org,
    appName:app,
    logging:true
  });
} else {
  throw new Error("Improperly Configured");
}

//Let's upload a file to ug.
if (file_path) {
  if(client) {
    fs.readFile(file_path, {encoding:"binary"}, function(err, file_data) {
      if(err) throw err;
      prompt.message = "";
      prompt.start();
      console.log("Assets require an owner. Sign into the app".cyan);
      prompt.get({
        properties: { 
          username:{
            description: "Enter a username".cyan, 
            required:true
          },
          password: {
            description:"Enter a password".cyan,
            hidden:true
          }
        }
      }, 
        function(error, result) {
        if(error) {
          throw error;
        } else {
          client.login(result.username, result.password, function(error, data, user) {

            var basename = path.basename(file_path);
            var entity = {
              "type":"assets",
              "name":basename,
              "owner":user.get("uuid"),
              "path":"/vid/"+basename
            }
            client.createEntity(entity, function(error, data) {
              if(error) {
                throw error
              } else {
                var uuid = data.get("uuid");
                var assetUrl = client.buildAssetURL(uuid);
                request.post({"headers":{"Content-Type":"application/octet-stream"}, "url":assetUrl, "body":file_data.toString()}, function(e, r, body) {
                  if(e) {
                    throw e;
                  } else {
                    console.log("Upload Success");
                  }
                });
              }
            });
          });
        }
      });
    });
  } else {
    throw new Error("Client improperly configured");
  }
}

if(data_path) {
  if(client) {
    prompt.message = "";
    prompt.start();
    prompt.get({ 
      properties: {
        type: {
          description: "Enter a type for uploading data",
          required:true
        }
      }
    }, function(error, result) {
      if(error) {
        throw error;
      } else {
        var data = require(data_path);
        var request_params = {
          endpoint : result.type,
          method: "POST",
          body: data
        };
        client.request(request_params, function(error, response) {
          if(error) {
             throw error;
          } else {
            console.log("Upload success!");
          }
        });
      }
    });

  } else {
    throw new Error("Client improperly configured");
  }
}






