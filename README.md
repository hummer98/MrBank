# MrBank


## Architecture

```
/banks/{bank}/branches/{branch}/years/{year}/months/{month}/days/{day}/transactions/{transaction}
```

```
/banks/{bank}/branches/{branch}/accounts/{account}
```

### Transfer

Account  <->  Account

POST `/v1/accounts/{account}`

### Deposit

Account  ->  Bank/Branch

POST `/v1/banks/{bank}/branches/{branch}`

### Withdraw

Bank/Branch  ->  Account

POST `/v1/banks/{bank}/branches/{branch}`
