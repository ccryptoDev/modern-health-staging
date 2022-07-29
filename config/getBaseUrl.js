module.exports.getBaseUrl = getBaseUrl();

function getBaseUrl() {
	// TODO: Verify production config
	if( process.env.NODE_ENV === "development" ) {
		return "http://localhost:8300";
	} else if( process.env.NODE_ENV === "staging" ) {
		return "https://modern-health.alchemylms.com";
	} else if( process.env.NODE_ENV === "uat" ) {
		return "https://apply.modernhealthfinance.com";
	} else if( process.env.NODE_ENV === "production" ) {
		return "https://apply.modernhealthfinance.com";
	} else {
		return "https://apply.modernhealthfinance.com";
	}
}
