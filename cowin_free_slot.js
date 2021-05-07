// Copy below and run the below js in inspect console of cowin website.

// curl -X GET "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=294&date=05-05-2021"
// curl -X POST "https://cdn-api.co-vin.in/api/v2/auth/public/generateOTP" -H  "accept: application/json" -H  "Content-Type: application/json" -d "{\"mobile\":\"$number\"}"

var districtArr = ["294"]
var pincodeArr = ["560011", "560030", "560066", "560078", "560017", "560003"];
var dateArr = ["08-05-2021", "09-05-2021"];
var mobileArr = ["9876543210"]
var sleepInterval = 5000;
var otpTimer = 180000;
var minAge = 18;

var attempt = 1;
var found = 0;

const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function genOTP()
{
    for (i=0;i < mobileArr.length; i++) {
		var params = JSON.stringify({ mobile: mobileArr[0] });
	    var xmlHttp = new XMLHttpRequest();
		console.log("Sending OTP request for mobile", mobileArr[0]);
        xmlHttp.open( "POST", "https://cdn-api.co-vin.in/api/v2/auth/public/generateOTP", false ); // false for synchronous request
    	xmlHttp.setRequestHeader('accept', 'application/json');
	    xmlHttp.setRequestHeader('Content-type', 'application/json');
        xmlHttp.send( params );
		try {
		  txn_id = JSON.parse(xmlHttp.responseText)
		} catch(e) {
		  continue;
		}
		console.log("OTP request transaction id is ",txn_id.txnId);
	}
}


async function fetchByPincode() {
	found = 0;
    console.log("fetchByPincode attempt: ", attempt++);
    
    for (i=0;i < pincodeArr.length; i++) {
      for (j=0; j < dateArr.length; j++) {
        url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByPin?pincode="+pincodeArr[i]+"&date="+dateArr[j];
        await sleepNow(sleepInterval);
        a = httpGet(url);
        try {
          a = JSON.parse(a)
        } catch(e) {
          continue;
        }
        for (c in a.centers) {
        for (s in a.centers[c].sessions) {
              if (a.centers[c].sessions[s].min_age_limit == minAge && a.centers[c].sessions[s].available_capacity > 0) {
                console.log("Free slot available at", a.centers[c].pincode, a.centers[c].name, a.centers[c].sessions[s].available_capacity);
				found = 1;
              }
          }
        }
      }
    }
	
	if (found > 0)
	{
		genOTP();
		//Sleep for 3 mins for new OTP
		await sleepNow(180000);
	}

    await sleepNow(sleepInterval);
    fetchByPincode();
}

async function fetchByDistrict() {
	found = 0;
    console.log("attempt: ", attempt++);
    
    for (i=0;i < districtArr.length; i++) {
      for (j=0; j < dateArr.length; j++) {
	    url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id="+districtArr[i]+"&date="+dateArr[j];
        await sleepNow(sleepInterval);
        a = httpGet(url);
        try {
          a = JSON.parse(a)
        } catch(e) {
          continue;
        }
        for (c in a.centers) {
        for (s in a.centers[c].sessions) {
              if (a.centers[c].sessions[s].min_age_limit == minAge && a.centers[c].sessions[s].available_capacity > 0) {
                console.log("Free slot available at", a.centers[c].pincode, a.centers[c].name, a.centers[c].sessions[s].available_capacity);
				found = 1;
              }
          }
        }
      }
    }
	
	if (found > 0)
	{
		genOTP();
		//Sleep for 3 mins for new OTP
		await sleepNow(otpTimer);
	}

    await sleepNow(sleepInterval);
    fetchByPincode();
}

console.log('Fetch by pincode here...');
//fetchByPincode();

console.log('Fetch by district id here...');
fetchByDistrict();

