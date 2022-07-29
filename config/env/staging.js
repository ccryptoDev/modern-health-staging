/**
 * Staging environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {
	port: 8200,
	isSandbox: true,
	isTwilioEnabled: true,
    sandGridApiKey: "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",
};
