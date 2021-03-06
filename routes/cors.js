const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = [
    'http://localhost:3000',
    'http://localhost:8080',
    'https://localhost:3443',
    'http://152.228.217.119:27017'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);