// @descript - contains tier list A-E that each practice management uses.

module.exports = {
    attributes: {
        practiceManagementID: {
            type: "string", 
            defaultsTo: ""
        }, 
        tierList: {
            type: "array", 
            defaultsTo: []
        }
    }
};