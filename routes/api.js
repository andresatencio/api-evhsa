var moment = require('moment');
var request = require('request');
var idGeo = "dd540f1f-44ac-4929-a4e8-777a5d9b66b3";
var key = "n9tNJicGUqLc6KbDzeGoVNoDcNC70rjEgrXrKM8a";
var CryptoJS = require('../lib/crypto');
// Datos de ejemplo
// id linea 2562
// id calle 25 DE MAYO
module.exports = function (app) {
	
	app.get("/api/lineas", function (req, res) {
		consulta("ObtenerLineas", null, function (err, data) {
			if (err)
				return res.json({"Error": "Feo"})
			return res.json(200, data)
		})
	})

	app.get("/api/:linea/calles", function (req, res) {
		consulta("ObtenerCalles", req.params.linea,function (err, data) {
			if (err)
				return res.json({"Error": "Feo"})
			return res.json(200, data)
		})
	})

	app.get("/api/:linea/:calle/intersecciones", function (req, res) {
		consulta("ObtenerEntreCalles", {linea: req.params.linea, calle: req.params.calle}, function (err, data) {
			if (err)
				return res.json({"Error": "Feo"})
			return res.json(200, data)
		})
	})

	app.get("/api/:linea/:calle/:inter/paradas", function (req, res) {
		consulta("ObtenerParadas", {linea: req.params.linea, calle: req.params.calle, inter: req.params.inter}, function (err, data) {
			if (err)
				return res.json({"Error": "Feo"})
			return res.json(200, data)
		})
	})

	app.get("/api/:parada/:linea/cuandollega", function (req, res) {
		consulta("CalcularMobile", {parada: req.params.parada, linea: req.params.linea}, function (err, data) {
			if (err)
				return res.json({"Error": "Feo"})
			return res.json(200, data)
		})
	})
}

function consulta (metodo, arg, cb) {
	consultas[metodo](arg, function (err, data) {
		if (err)
			return new Error();
		request.get({url:"http://ws_geosolution.geosolution.com.ar/mobile_test/Mobile/" + metodo + "?jsoncallback=loquesea", form: data}, 
			function(err, resp, body) {
				var parensRegex = /(^\(|\);?\s*$)/;
				var functionRegex = /^[a-z\d_]*\(/i;
					var javascript = body.toString();
					var jsonString = javascript.replace(functionRegex, "").replace(parensRegex, "");
					var json = JSON.parse(jsonString);
					return cb(null, json);
				})
	})
}

function lineasEvhsa(arg, cb) {
	var day = moment();
	var dayToSend = day.format("YYYY-MM-DDTHH:mm:ss");
	var mensaje = day.format('YYYYMMDDHHmmss');
	var hashBuild = CryptoJS.HmacMD5(mensaje, key).toString(CryptoJS.enc.Base64);
	var postData = {localidad:"6",id:idGeo,hash:hashBuild,fecha:dayToSend};
	return cb(null, postData);
}

function calles(linea, cb) {
	var day = moment();
	var dayToSend = day.format("YYYY-MM-DDTHH:mm:ss");
	var mensaje = day.format('YYYYMMDDHHmmss');
	var hashBuild = CryptoJS.HmacMD5(mensaje, key).toString(CryptoJS.enc.Base64);
	var postData = {linea:linea,id:idGeo,hash:hashBuild,fecha:dayToSend};
	return cb(null, postData)
}

function intersecciones(arg, cb) {
	var day = moment();
	var dayToSend = day.format("YYYY-MM-DDTHH:mm:ss");
	var mensaje = day.format('YYYYMMDDHHmmss');
	var hashBuild = CryptoJS.HmacMD5(mensaje, key).toString(CryptoJS.enc.Base64);
	var postData = {linea:arg.linea,calle:arg.calle,id:idGeo,hash:hashBuild,fecha:dayToSend};
	return cb(null, postData)
}

function paradas(arg, cb) {
	var day = moment();
	var dayToSend = day.format("YYYY-MM-DDTHH:mm:ss");
	var mensaje = day.format('YYYYMMDDHHmmss');
	var hashBuild = CryptoJS.HmacMD5(mensaje, key).toString(CryptoJS.enc.Base64);
	var postData = {linea:arg.linea,calle:arg.calle,entreCalle:arg.inter,id:idGeo,hash:hashBuild,fecha:dayToSend};
	return cb(null, postData)
}

function cuandoLlega(arg, cb) {
	var day = moment();
	var dayToSend = day.format("YYYY-MM-DDTHH:mm:ss");
	var mensaje = arg.linea + arg.parada + day.format('YYYYMMDDHHmmss');
	var hashBuild = CryptoJS.HmacMD5(mensaje, key).toString(CryptoJS.enc.Base64);
	var postData = {parada:arg.parada,linea:arg.linea,id:idGeo,hash:hashBuild,fecha:dayToSend};
	return cb(null, postData)
}

var consultas = {
	ObtenerLineas : lineasEvhsa,
	ObtenerCalles : calles,
	ObtenerEntreCalles: intersecciones,
	ObtenerParadas: paradas,
	CalcularMobile: cuandoLlega
};

// Linea 501 parada Urquiza y Alberdi
// api/N0067/2562/cuandollega