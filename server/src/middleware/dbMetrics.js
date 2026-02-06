const { recordDatabaseQuery } = require("../metrics");

const dbMetricsMiddleware = (req, res, next) => {
  // Store original mongoose methods
  const originalExec = mongoose.Query.prototype.exec;
  const originalSave = mongoose.Model.prototype.save;
  const originalDeleteOne = mongoose.Model.prototype.deleteOne;
  const originalFindOneAndUpdate = mongoose.Model.prototype.findOneAndUpdate;
  
  // Instrument exec() method
  mongoose.Query.prototype.exec = async function() {
    const start = Date.now();
    const modelName = this.model.modelName;
    const operation = this.op || "query";
    
    try {
      const result = await originalExec.apply(this, arguments);
      const duration = (Date.now() - start) / 1000;
      
      // Record metrics
      recordDatabaseQuery(operation, modelName, duration);
      
      return result;
    } catch (error) {
      const duration = (Date.now() - start) / 1000;
      recordDatabaseQuery(`${operation}_error`, modelName, duration);
      throw error;
    }
  };
  
  // Instrument save() method
  mongoose.Model.prototype.save = async function() {
    const start = Date.now();
    const modelName = this.constructor.modelName;
    
    try {
      const result = await originalSave.apply(this, arguments);
      const duration = (Date.now() - start) / 1000;
      
      recordDatabaseQuery("save'", modelName, duration);
      
      return result;
    } catch (error) {
      const duration = (Date.now() - start) / 1000;
      recordDatabaseQuery("save_error", modelName, duration);
      throw error;
    }
  };
  
  // Instrument deleteOne() method
  mongoose.Model.prototype.deleteOne = async function() {
    const start = Date.now();
    const modelName = this.constructor.modelName;
    
    try {
      const result = await originalDeleteOne.apply(this, arguments);
      const duration = (Date.now() - start) / 1000;
      
      recordDatabaseQuery("delete", modelName, duration);
      
      return result;
    } catch (error) {
      const duration = (Date.now() - start) / 1000;
      recordDatabaseQuery("delete_error", modelName, duration);
      throw error;
    }
  };
  
  // Instrument findOneAndUpdate() method
  mongoose.Model.prototype.findOneAndUpdate = async function() {
    const start = Date.now();
    const modelName = this.constructor.modelName;
    
    try {
      const result = await originalFindOneAndUpdate.apply(this, arguments);
      const duration = (Date.now() - start) / 1000;
      
      recordDatabaseQuery("update", modelName, duration);
      
      return result;
    } catch (error) {
      const duration = (Date.now() - start) / 1000;
      recordDatabaseQuery("update_error", modelName, duration);
      throw error;
    }
  };
  
  next();
};

module.exports = dbMetricsMiddleware;