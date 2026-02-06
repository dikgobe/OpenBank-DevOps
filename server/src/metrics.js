const client = require("prom-client");

/**
 * ====================================================
 * DEFAULT NODE METRICS
 * ====================================================
 */
client.collectDefaultMetrics({
  timeout: 10000,
  prefix: "openbank_node_"
});

/**
 * ====================================================
 * BUSINESS METRICS
 * ====================================================
 */
const transactionCounter = new client.Counter({
  name: "openbank_transactions_total",
  help: "Total number of transactions",
  labelNames: ["type", "account_type", "status", "currency"]
});

const accountCreationCounter = new client.Counter({
  name: "openbank_accounts_created_total",
  help: "Total number of accounts created",
  labelNames: ["account_type"]
});

const userRegistrationCounter = new client.Counter({
  name: "openbank_users_registered_total",
  help: "Total number of user registrations",
  labelNames: ["user_type"]
});

const loanApplicationCounter = new client.Counter({
  name: "openbank_loan_applications_total",
  help: "Total number of loan applications",
  labelNames: ["status", "loan_type"]
});

/**
 * ====================================================
 * FINANCIAL METRICS
 * ====================================================
 */
const totalBalanceGauge = new client.Gauge({
  name: "openbank_total_balance",
  help: "Total balance across all accounts",
  labelNames: ["currency"]
});

const averageTransactionValue = new client.Gauge({
  name: "openbank_average_transaction_value",
  help: "Average transaction value",
  labelNames: ["currency"]
});

/**
 * ====================================================
 * SYSTEM / PERFORMANCE METRICS (USED BY server.js)
 * ====================================================
 */
const httpRequestDuration = new client.Histogram({
  name: "openbank_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "endpoint", "status_code", "type"],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5]
});

const apiRequestsCounter = new client.Counter({
  name: "openbank_api_requests_total",
  help: "Total API requests",
  labelNames: ["method", "endpoint", "status_code"]
});

const errorCounter = new client.Counter({
  name: "openbank_errors_total",
  help: "Total number of errors",
  labelNames: ["type", "endpoint", "status_code"]
});

const responseSizeHistogram = new client.Histogram({
  name: "openbank_response_size_bytes",
  help: "Response size in bytes",
  labelNames: ["endpoint"],
  buckets: [100, 500, 1000, 5000, 10000, 50000]
});

const activeUsersGauge = new client.Gauge({
  name: "openbank_active_users",
  help: "Number of active users"
});

const databaseConnectionGauge = new client.Gauge({
  name: "openbank_database_connection_status",
  help: "Database connection status (1 = connected, 0 = disconnected)"
});

/**
 * ====================================================
 * DATABASE PERFORMANCE METRICS
 * ====================================================
 */
const databaseQueryDuration = new client.Histogram({
  name: "openbank_database_query_duration_seconds",
  help: "Database query duration in seconds",
  labelNames: ["operation", "collection"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2]
});

/**
 * ====================================================
 * RATE LIMIT METRICS
 * ====================================================
 */
const rateLimitCounter = new client.Counter({
  name: "openbank_rate_limit_hits_total",
  help: "Total number of rate limit hits",
  labelNames: ["endpoint", "ip_address"]
});

/**
 * ====================================================
 * HELPER FUNCTIONS (USED BY server.js & ROUTES)
 * ====================================================
 */
const incrementTransactionCounter = (
  type,
  accountType,
  status = "completed",
  currency = "ZAR"
) => {
  transactionCounter.inc({
    type,
    account_type: accountType,
    status,
    currency
  });
};

const recordError = (type, endpoint, statusCode = 500) => {
  errorCounter.inc({
    type,
    endpoint,
    status_code: statusCode
  });
};

const getActiveUsersCount = () => {
  try {
    return activeUsersGauge.hashMap
      ? Object.keys(activeUsersGauge.hashMap).length
      : 0;
  } catch {
    return 0;
  }
};

/**
 * ====================================================
 * EXPORTS (CRITICAL)
 * ====================================================
 */
module.exports = {
  client,

  // Business
  transactionCounter,
  accountCreationCounter,
  userRegistrationCounter,
  loanApplicationCounter,

  // Financial
  totalBalanceGauge,
  averageTransactionValue,

  // System / API
  httpRequestDuration,
  apiRequestsCounter,
  errorCounter,
  responseSizeHistogram,
  activeUsersGauge,
  databaseConnectionGauge,

  // DB
  databaseQueryDuration,

  // Rate limit
  rateLimitCounter,

  // Helpers
  incrementTransactionCounter,
  recordError,
  getActiveUsersCount
};