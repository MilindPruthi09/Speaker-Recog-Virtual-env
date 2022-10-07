key = "{Enter API Key}";

function enrollNewProfile() {

	if (document.getElementById("userName").value == "" || document.getElementById("userName").value == null || document.getElementById("emailID").value == "" || document.getElementById("emailID").value == null) {
		if (document.getElementById("userName").value == "" || document.getElementById("userName").value == null) {
			alert("Please enter your name");
			return false;
		}
		if (document.getElementById("emailID").value == "" || document.getElementById("emailID").value == null)
			alert("Please enter your email ID");
		return false;
	}

	var emailid = document.getElementById('emailID').value;
	var count;
	var validEmail;
	//checking for valid email ID.
	$.ajax({
		url: "http://127.0.0.1:5000/validID?emailID=" + emailid,
		async: false,
		success: function (response) {
			var res=response;
			validEmail = res;
		},
		context: document.body
	});
	if(validEmail=="False")
	{
		alert("Please enter a valid email ID.")
		return false;
	}

	//insert ajax for checking unique emailID
	$.ajax({
		url: "http://127.0.0.1:5000/emailID?emailID=" + emailid,
		async: false,
		success: function (response) {
			var res=response;
			count = res;
		},
		context: document.body
	});
	if(count==1)
	{
		alert("Please enter a unique email ID.");
		return false;
	}

	navigator.getUserMedia({
		audio: true
	}, function (stream) {
		//console.log('I\'m listening... just start talking for a few seconds...');
		console.log('Please read the following phrase: \n\n' + thingsToRead[Math.floor(Math.random() * thingsToRead.length)]);
		onMediaSuccess(stream, createProfile, 15);
	}, onMediaError);
}

function createProfile(blob) {

	const createIdentificationProfileEndpoint = `https://westus.api.cognitive.microsoft.com/speaker/identification/v2.0/text-independent/profiles`;

	addAudioPlayer(blob);

	var request = new XMLHttpRequest();
	request.open("POST", createIdentificationProfileEndpoint, true);

	request.setRequestHeader('Content-Type', 'application/json');
	request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

	request.onload = function () {
		console.log('\ncreating profile...');
		var json = JSON.parse(request.responseText);
		//console.log(json);

		var profileId = json.profileId;

		enrollProfileAudio(blob, profileId);
	};

	request.send(JSON.stringify({
		'locale': 'en-us'
	}));
}

function enrollProfileAudio(blob, profileId) {

	const enrollIdentificationProfileEndpoint = "https://westus.api.cognitive.microsoft.com/speaker/identification/v2.0/text-independent/profiles/" + profileId + "/enrollments?ignoreMinLength=true";
	const enrollIdentificationProfileStatusEndpoint = "https://westus.api.cognitive.microsoft.com/speaker/identification/v2.0/text-independent/profiles/" + profileId;


	var request = new XMLHttpRequest();

	request.open("POST", enrollIdentificationProfileEndpoint, true);
	request.setRequestHeader('Ocp-Apim-Subscription-Key', key);
	request.onload = function () {
		console.log('\nenrolling the voice with the created profile...');

		if (request.status == 200 || request.status == 201) {
			var json = JSON.parse(request.responseText);
			//console.log(json);

			const location = enrollIdentificationProfileStatusEndpoint;
			//alert("after location");
			pollForEnrollment(location, profileId);
		} else {
			console.log('Failed to submit for enrollment. Please try again.');
			//console.log(`Failed to submit for enrollment: got a ${request.status} response code.`);
			var json = JSON.parse(request.responseText);
			//console.log(`${json.error.code}: ${json.error.message}`);
		}
	};
	request.send(blob);
}

function pollForEnrollment(location, profileId) {

	var enrolledInterval;

	enrolledInterval = setInterval(function () {
		var request = new XMLHttpRequest();
		request.open("GET", location, true);
		request.setRequestHeader('Ocp-Apim-Subscription-Key', key);
		request.onload = function () {
			//console.log('getting status');
			var json = JSON.parse(request.responseText);
			//console.log(json);

			if (json.enrollmentStatus == 'Enrolled') {
				
				clearInterval(enrolledInterval);
				console.log('\nenrollment complete!');

				
				var uname = document.getElementById('userName').value;
				var emailid = document.getElementById('emailID').value;
				
				$.ajax({
					url: "http://127.0.0.1:5000/insertID?profileID=" + profileId + "&uname=" + uname + "&emailid=" + emailid,
					context: document.body
				});
			} else {
				// keep polling
				console.log('\nNot done yet..');
			}
		};

		request.send();
	}, 1000);
}

function startListeningForIdentification() {
	if (document.getElementById("emailID").value == "" || document.getElementById("emailID").value == null) {
		alert("Please enter your email ID");
		return false;
	}

	var emailid = document.getElementById('emailID').value;
	var count;
	var validEmail;
	//checking for valid email ID.
	$.ajax({
		url: "http://127.0.0.1:5000/validID?emailID=" + emailid,
		async: false,
		success: function (response) {
			var res=response;
			validEmail = res;
		},
		context: document.body
	});
	if(validEmail=="False")
	{
		alert("Please enter a valid email ID.")
		return false;
	}

	$.ajax({
		url: "http://127.0.0.1:5000/emailID?emailID=" + emailid,
		async: false,
		success: function (response) {
			var res=response;
			count = res;
		},
		context: document.body
	});
	if(count==0)
	{
		alert("The email ID is not enrolled. Please first enroll with your email ID.");
		return false;
	}

	//alert("listening");
	var name;
	var profileID;
	$.ajax({
		url: "http://127.0.0.1:5000/fetchID?emailID=" + document.getElementById('emailID').value,
		async: false,
		success: function (response) {
			var res = response;
			var arr = res.split(",");
			name = arr[1];
			profileID = arr[0];
		},

		context: document.body
	});


	profileIds.push(new Profile(name, profileID));
	//alert("speaker-recognition-api-demo-identification ++ startListeningForIdentification() called profileId length"+profileIds.length);

	if (profileIds.length > 0) {
		//console.log('I\'m listening... just start talking for a few seconds...');
		console.log('\nPlease read the following phrase: \n\n' + thingsToRead[Math.floor(Math.random() * thingsToRead.length)]);
		navigator.getUserMedia({
			audio: true
		}, function (stream) {
			onMediaSuccess(stream, identifyProfile, 10)
		}, onMediaError);
	} else {
		console.log('\nNo profiles enrolled yet! Click the other button...');
	}
}

function identifyProfile(blob) {

	var Ids = profileIds.map(x => x.profileId).join();

	const identifyProfileEndpoint = "https://westus.api.cognitive.microsoft.com/speaker/identification/v2.0/text-independent/profiles/identifySingleSpeaker?profileIds=" + Ids + "&ignoreMinLength=true";

	addAudioPlayer(blob);


	var request = new XMLHttpRequest();
	
	request.open("POST", identifyProfileEndpoint, true);
	request.setRequestHeader('Ocp-Apim-Subscription-Key', key);
	request.onload = function () {
		//console.log('identifying profile');
		var json = JSON.parse(request.responseText);
		//console.log(json);

		let acceptStyles=[
			"color:green"
		].join(";");

		let rejectStyles=[
			"color:red"
		].join(";");

		if (request.status == 200) {
			var speaker = profileIds.filter(function (p) {
				return p.profileId == json.identifiedProfile.profileId
			});

			if (speaker != null && speaker.length > 0) {
				console.log('\nThe person speaking is verified successfully.✅');
				//console.log('MATCH FOUND ... I think ' + speaker[0].name + ' was talking');
			} else {
				console.log('\nThe person speaking is not verified. Please try again.❌');	
			}
		} else {
			console.log(`Failed to submit for identification: got a ${request.status} response code.`);
			console.log(`${json.error.code}: ${json.error.message}`);
		}
	};

	request.send(blob);
}