# Mr.Bank

Mr.Bank is an accounting system.

- [x] High availability
- [x] High throughput
- [x] High security

## Architecture

__Account__
```
/account/v1/accounts/{uid}
```

__AccountConfiguration__
```
/account/v1/accountConfigurations/{uid}
```

__Balance__
```
/account/v1/balances/{uid}/years/{year}/months/{month}/days/{day}/transactions/{transaction}
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
