var ug = require("usergrid"),
    cmdr = require("commander"),
    path = require("path"),
    fs = require("fs"),
    request = require("request");

cmdr
  .version("0.0.1")
  .usage("[options] <file ...>")
  .option("-o --org [orgname]", "Your Apigee.com username", "null")
  .option("-a --app [appname]", "Your Apigee.com appname", "sandbox")
  .option("-i --id [id]", "Your client id")
  .option("-s --secret [secret]", "Your client secret")
  .option("-f --file [filepath]", "Path to a file for uploading")
  .option("-d --data [datapath]", "Path to json file for uploading")
  .option("-c --create [app]", "Create an app alias. This is to save settings")
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
      var basename = path.basename(file_path);
      var entity = {
        "type":"assets",
        "name":basename,
        "owner":"b276e86a-52f1-11e3-9f5e-132cc23a907b",
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
  } else {
    throw new Error("Client improperly configured");
  }
}








