const mongoose = require('mongoose');

const Admin = mongoose.Schema(
    {
        inst_id: {
            type: String,
            required: true,
        },
        // roles can be master and worker
        role: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        recovery_phrase: {
            type: Array,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Admin', Admin);
