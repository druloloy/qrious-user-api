const aws = require('aws-sdk');

const bucketName = process.env.AWS_S3_BUCKET || 'qrious-files';
const s3 = new aws.S3();

const getFile = async (file, callback) => {
    const params = {
        Bucket: bucketName,
        Key: file.name,
        VersionId: file.versionId,
    };
    await s3.getObject(params).promise().then(callback);
};

module.exports = {
    getFile,
};
