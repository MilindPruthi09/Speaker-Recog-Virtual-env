
function addAudioPlayer(blob){	
	var url = URL.createObjectURL(blob);
	var log = document.getElementById('log');

	var audio = document.querySelector('#replay');
	if (audio != null) {audio.parentNode.removeChild(audio);}

	audio = document.createElement('audio');
	audio.setAttribute('id','replay');
	audio.setAttribute('controls','controls');

	var source = document.createElement('source');
	source.src = url;

	audio.appendChild(source);
	log.parentNode.insertBefore(audio, log);
}

// Example phrases
var thingsToRead = [
	'NEC provides IT systems and network systems\n to local governments, medical institutions,\n electric power companies and others,\n while operating branch offices\n throughout Japan and developing business\n closely related to each region.',
	'NEC provides governments, governmental agencies\n and others with social infrastructure,\n such as large-scale mission-critical systems\n and network systems that enable people\n to live with peace of mind and comfort.'
];

// vanilla javascript queystring management
var qs = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));

// Get the Cognitive Services key from the querystring
var key = qs['key'];
var baseApi = qs['endpoint'];

// Speaker Recognition API profile configuration - constructs to make management easier
var Profile = class { constructor (name, profileId) { this.name = name; this.profileId = profileId;}};
var VerificationProfile = class { constructor (name, profileId) { this.name = name; this.profileId = profileId; this.remainingEnrollments = 3}};
var profileIds = [];
var verificationProfile = new VerificationProfile();

(function () {
	// Cross browser sound recording using the web audio API
	navigator.getUserMedia = ( navigator.getUserMedia ||
							navigator.webkitGetUserMedia ||
							navigator.mozGetUserMedia ||
							navigator.msGetUserMedia);

	// Really easy way to dump the console logs to the page
	var old = console.log;
	var logger = document.getElementById('log');
	var isScrolledToBottom = logger.scrollHeight - logger.clientHeight <= logger.scrollTop + 1;
    
	console.log = function () {
		for (var i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] == 'object') {
				logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(arguments[i], undefined, 2) : arguments[i]) + '<br />';
			} else {
				logger.innerHTML += arguments[i] + '<br />';
			}
			if(isScrolledToBottom) logger.scrollTop = logger.scrollHeight - logger.clientHeight;
		}
		old(...arguments);
	}
	console.error = console.log; 
})();
