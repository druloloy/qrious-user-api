const s3 = require('../s3/s3');
const panda = require('panda-encryption').Panda;
const aes = require('../helpers/aes');
const FileMetadata = require('../models/FileMetadata.model');
const pandaConfig = {
    key: process.env.ENCRYPTION_KEY,
    seed: process.env.ENCRYPTION_SEED,
};

exports.viewFile = async (req, res, next) => {
    try {
        const { id } = req.query;
        const fileMetadata = await FileMetadata.findById(id).select('+key');
        if (!fileMetadata) {
            next(new Exception('File not found', 400));
        }
        const key = aes.decrypt(fileMetadata.key);
        pandaConfig.key = key;

        const file = {
            name: fileMetadata.fileName,
            versionId: fileMetadata.versionId,
        };

        await s3.getFile(file, async (result, err) => {
            if (err) {
                throw err;
            }
            const decryptedBuffer = await panda.decrypt(
                result.Body,
                pandaConfig
            );
            res.status(200).json({
                success: true,
                buffer: decryptedBuffer,
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.getFile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const fileMetadata = await FileMetadata.findById(id);
        if (!fileMetadata) {
            next(new Exception('File not found', 400));
        }

        return res.status(200).json({
            success: true,
            content: fileMetadata,
        });
    } catch (error) {
        next(error);
    }
};

exports.searchFile = async (req, res, next) => {
    try {
        const { q } = req.query;
        const files = await FileMetadata.find({
            title: { $regex: q, $options: 'i' },
        }).select('+key');

        res.status(200).json({
            success: true,
            content: files,
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};
