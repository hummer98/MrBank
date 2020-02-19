# Mr.Bank

Mr.Bank is an accounting system.
Designed for high security, high availability and high throughput.

- [x] High availability
- [x] High throughput
- [x] High security

## Architecture

__Account__
```
/account/v1/accounts/{uid}
```

```
/account/v1/accounts/{uid}/{currency}/{balances}
```

```
/account/v1/accounts/{uid}/years/{year}/months/{month}/days/{day}/transactions/{transaction}
```

__AccountConfiguration__
```
/account/v1/accountConfigurations/{uid}
```

__Bank__
```
/account/v1/banks/{uid}
```

```
/account/v1/banks/{uid}/{currency}/{shard}
```

```
/account/v1/banks/{uid}/years/{year}/months/{month}/days/{day}/transactions/{transaction}
```

__BankConfiguration__
```
/account/v1/bankConfigurations/{uid}
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
