module.exports = {
  root: true,
  extends: "airbnb-typescript-prettier",
  plugins: ["import", "prettier"],
  parserOptions: {
    project: "./tsconfig.eslint.json",
  },
  rules: {
    camelcase: [
      1,
      {
        allow: [
          "user_id",
          "statement_id",
          "created_at",
          "updated_at",
          "sender_id",
          "with_statement",
        ],
      },
    ],
    "import/prefer-default-export": 0,
    "no-useless-constructor": 0,
    "class-methods-use-this": 0,
  },
};
