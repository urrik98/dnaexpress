var db = require('./../db_schema.js');

var Recommendation = db.Model.extend({
    tableName: 'recommendations',
    hasTimestamp: false,
    event: function () {
      return this.belongsTo("Event");
    }
});

module.exports = Recommendation;
