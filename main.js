const fetch = require("node-fetch")
const {GoogleSpreadsheet} = require('google-spreadsheet');
const credentials = require('./credentials.json');
const fs = require('fs');
const axios = require("axios")
const { PerformanceObserver, performance } = require('perf_hooks')

const timer = ms => new Promise(res => setTimeout(res, ms))

async function getData (){
    var t0 = performance.now()
    // Clear all the data from sheet
    const spreadsheetId = '1Awyak298CPEVtC-EnHBYvPgy54lqxWSMOgAXY9SXKXQ'
	const doc = new GoogleSpreadsheet(spreadsheetId); // set spreadsheet id
	await doc.useServiceAccountAuth(credentials);
	await doc.loadInfo();
	const sheet = await doc.sheetsByTitle['GoLeasy']
    await sheet.clear()

    const limit = await axios('https://www.goleasy.de/api/inserate?sort=bester-leasingfaktor&preisanzeige=netto&page=0&limit=50')
    .then(res => res.data.pages)
    console.log(limit)
    
    var number = 1
    var max = 0
    while (max < limit){
        const arr = []
        max = number+20
        for (var page = number; page < max ; page++){
   //         await timer(3000)
            const data = []
            const response = await axios({
 //               host: '<PROXY_HOST>',
 //               port: '<PROXY_PORT>',
                url: `https://www.goleasy.de/api/inserate?sort=bester-leasingfaktor&preisanzeige=netto&page=${page}&limit=50`,
                method: 'get',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                maxContentLength: Infinity,
                maxBodyLength: Infinity})
            .catch(error=> console.log(error))
            for (var i = 0;  i<response.data.docs.length ; i++){
                if (response.data.docs[i].createdAt > '2021-01-01'){
                    data.push(response.data.docs[i])
                }
            }
            arr.push(data) 
        }

    WriteData(arr.flat())
    number += 20
}
    var t1 = performance.now()
    return console.log("The run took " + (t1 - t0)/60000 + " minutes.") 
}

async function WriteData(meta) {
	const spreadsheetId = '1Awyak298CPEVtC-EnHBYvPgy54lqxWSMOgAXY9SXKXQ'
	const doc = new GoogleSpreadsheet(spreadsheetId); // set spreadsheet id
	await doc.useServiceAccountAuth(credentials);
	await doc.loadInfo();
	const sheet = await doc.sheetsByTitle['GoLeasy']
	

    await sheet.setHeaderRow([
        "id" ,
        "createdAt",
    //    "updatedAt" ,
        "title" ,
        "subtitle" ,
        "anbieter" ,
        "karosserie" ,
        "modellId" ,
        "neufahrzeug" ,
        "konfigurierbar",
        "topangebot" ,
        "erstzulassung" ,
        "kilometerstand" ,
        "laufzeit" ,
        "fahrleistung" ,
        "restKilometer" ,
    //    "beschreibung" ,
        "bruttorate" ,
//        "bruttorateFormatted" ,
        "blp" ,
        "nlp" ,
        "leasingfaktor" ,
        "leasinguebernahme" ,
        "gwerte" ,
        //"gwerteQuality" ,
        "anzahlung" ,
        //"mehrkilometer" ,
        //"minderkilometer" ,
        "bereitstellungskosten" ,
        "umweltpraemie" ,
        "privat" ,
        "gewerbe" ,
        "kraftstoff" ,
        "getriebe" ,
        "leistung" ,
         "leistungKw" ,
    //    "leistungInfo" 
         "verbrauchKombiniert" ,
        "verbrauchInnerorts" ,
        "verbrauchAußerorts",
        "co2Kombiniert" ,
        "co2Klasse" ,
        "relevance" ,
        "viewCount" ,
        "sofort" ,
        "lieferzeit" ,
        "lieferzeitWochen" ,
        "umweltbonus" ,
        "inzahlungnahme" ,
        "behinderung" ,
        "isAbo" ,
    //    "includingServices" ,
    //    "updatedImagesAt" ,
        "sortRelevantDate" ,
    //    "sortRelevantDateWithoutTime" ,
    //    "searchRequestRelevantUpdatedAt" ,
    //    "searchRequestRelevantUpdate" ,
        "dealFeedDate" ,
    //    "reviewVideoUrl" ,
        "mongoId" ,
    //  "validationCheck" ,
        "shortId" ,
    //    "impression" ,
    //    "impressionClick" ,
        "dealerId" ,
    //    "farbeExterior" ,
    //    "farbeExteriorRaw" ,
    //    "farbeInterior" ,
    //    "farbeInteriorRaw" ,
         "tueren" ,
    //    "tuerenMax" ,
        "youngDriver" ,
        "modellName" ,
        "markenName" ,
        "hoheNachfrage" ,
        "redirectUrl" ,
    //    "fahrleistung_formatted" ,
    //    "laufzeit_formatted" ,
    //    "co2KlasseLogo" ,
    //    "bereitstellungskosten_formatted" ,
    //    "blp_formatted" ,
    //    "kilometerstand_formatted" ,
        "fahrzeugzustand" ,
    //    "showRedirectAds" ,
        "isNewOffer" 
    //    "exteriorHexColor" */
      ])

    await sheet.addRows(meta)
}; 	

getData();

function convertDataArrayToCSV (fileName, data) {

	const header = Object.keys(data[0])
	let csv = data.map(row => header
		.map(fieldName => row[fieldName] === null ? '' : row[fieldName])
		.join(';'))
	csv.unshift(header.join(';'))
	csv = csv.join('\r\n')
	fs.writeFileSync(fileName, csv)	

}  