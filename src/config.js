module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'production',
  // DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres@localhost/notepad-capstone',
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://jilcypkbhwdxcc:46de34f8a534d9f569c73cd663dbb1640523a70623a128fd8fcb150710a60b23@ec2-34-202-54-225.compute-1.amazonaws.com:5432/dfkt8hfrgffhkg',
  JWT_SECRET: process.env.JWT_SECRET || 'dog'
} //what is the rule in which we convert the password into its encrypted form
//encrypt JW token with 'dog' -- encryption key
