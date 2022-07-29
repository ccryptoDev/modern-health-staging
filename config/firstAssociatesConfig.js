var path = require('path');
module.exports.firstAssociatesConfig = {
    getFirstAssociateConfig: getFirstAssociateConfig,
    getFirstAssociateConfig_FullSpec: getFirstAssociateConfig_FullSpec,
    getFirstAssociateSftpConfig:getFirstAssociateSftpConfig,
};
function getFirstAssociateConfig() {
    const firstAssociateConfig =  {
     csvPath: path.join(process.cwd(), '/firstAssociatesUpload'),
        // sftpServer: "sftp.1stassociates.com",
        sftpServer: "mft.vervent.com",
        sftpUserName: "masset",
        sftpPassword: "M#a$s!",
        // sftpPort: 3235,
        sftpPort: 22,
        sftpRemoteUploadFolder: "Boarding FILES TEST",

        sftpRetries: 5,
        sftpRetryMinTimeout: 2000,
        sftpAlgorithms: {
            serverHostKey: ['ssh-rsa', 'ssh-dss']
        },
        enabled: false
    };

    if( process.env.NODE_ENV === "production" ) {
        firstAssociateConfig.csvPath =  path.join(process.cwd(), '/firstAssociatesUpload');
        firstAssociateConfig.sftpRemoteUploadFolder = "Pre-Boarding for Assignment Sorting";
        firstAssociateConfig.enabled = true;
    }else if(process.env.NODE_ENV === "staging"){
        firstAssociateConfig.enabled = true;
    }else {
        firstAssociateConfig.enabled = false;
    }
    return firstAssociateConfig;
}

// For the files to be uploaded to folder "MHF Full File Spec Export"
function getFirstAssociateConfig_FullSpec() {
    const firstAssociateConfig =  {
        csvPath: path.join(process.cwd(), '/firstAssociatesUpload'),
        // sftpServer: "sftp.1stassociates.com",
        sftpServer: "mft.vervent.com",
        sftpUserName: "masset",
        sftpPassword: "M#a$s!",
        // sftpPort: 3235,
        sftpPort: 22,
        sftpRemoteUploadFolder: "Boarding FILES TEST",

        sftpRetries: 5,
        sftpRetryMinTimeout: 2000,
        sftpAlgorithms: {
            serverHostKey: ['ssh-rsa', 'ssh-dss']
        },
        enabled: false
    };

    if( process.env.NODE_ENV === "production" ) {
        firstAssociateConfig.csvPath =  path.join(process.cwd(), '/firstAssociatesUpload');
        firstAssociateConfig.sftpRemoteUploadFolder = "MHF Full File Spec Export";
        firstAssociateConfig.enabled = true;
    }else if(process.env.NODE_ENV === "staging"){
        firstAssociateConfig.enabled = true;
    }else {
        firstAssociateConfig.enabled = false;
    }
    return firstAssociateConfig;
}

function getFirstAssociateSftpConfig() {
    const firstAssociateConfig = getFirstAssociateConfig();
    return {
        host: firstAssociateConfig.sftpServer,
        port: firstAssociateConfig.sftpPort,
        username: firstAssociateConfig.sftpUserName,
        password: firstAssociateConfig.sftpPassword,
        retries: firstAssociateConfig.sftpRetries,
        retry_minTimeout: firstAssociateConfig.sftpRetryMinTimeout,
        algorithms: firstAssociateConfig.sftpAlgorithms
    }
}
